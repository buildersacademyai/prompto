import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { DatePicker } from "@/components/ui/date-picker";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue
} from "@/components/ui/select";
import { 
  DollarSign, 
  X,
  Image as ImageIcon,
  Wallet
} from "lucide-react";
import Header from "@/components/layout/header";
import { Link, useLocation } from "wouter";

// Simplified form schema - only essential campaign details
const campaignFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  budget: z.number().min(100, "Minimum budget is $100"),
  startDate: z.date().refine(date => date >= new Date(), "Start date must be in the future"),
  endDate: z.date().refine(date => date >= new Date(), "End date must be in the future")
});

type CampaignFormValues = z.infer<typeof campaignFormSchema>;

export default function NewCampaignPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [campaignImage, setCampaignImage] = useState<string | null>(null);
  const [selectedAdId, setSelectedAdId] = useState<string | null>(null);

  // Check wallet balance
  const { data: walletInfo } = useQuery({
    queryKey: ["/api/creator/wallet"],
  });

  // Get saved ads for campaign image selection
  const { data: savedAds = [] } = useQuery({
    queryKey: ["/api/ai/generated-ads"],
  });

  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      title: "",
      description: "",
      budget: 500,
      startDate: new Date(Date.now() + 86400000), // Tomorrow
      endDate: new Date(Date.now() + 86400000 * 30) // 30 days from now
    }
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (data: CampaignFormValues & { image?: string }) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'startDate' || key === 'endDate') {
          formData.append(key, (value as Date).toISOString());
        } else {
          formData.append(key, String(value));
        }
      });
      
      if (data.image) {
        formData.append('image', data.image);
      }
      
      const res = await apiRequest("POST", "/api/creator/campaigns", formData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Campaign created successfully!",
        description: "Your campaign is now live and visible to influencers.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/creator/campaigns"] });
      navigate("/creator/campaigns");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create campaign",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: CampaignFormValues) => {
    const campaignData = {
      ...data,
      image: campaignImage,
    };

    createCampaignMutation.mutate(campaignData);
  };

  const handleAdSelection = (adId: string) => {
    setSelectedAdId(adId);
    const selectedAd = (savedAds as any[]).find((ad: any) => ad.id.toString() === adId);
    if (selectedAd) {
      setCampaignImage(selectedAd.imageUrl);
    }
  };

  const removeImage = () => {
    setCampaignImage(null);
    setSelectedAdId(null);
  };

  const insufficientFunds = form.watch("budget") > (walletInfo?.balance || 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-4xl mx-auto px-4 pt-24 pb-10">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Create New Campaign</h1>
              <p className="text-muted-foreground mt-1">
                Launch a new advertising campaign
              </p>
            </div>
            <Link href="/creator/campaigns">
              <Button variant="outline">
                Cancel
              </Button>
            </Link>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Details</CardTitle>
                  <CardDescription>
                    Enter the basic information about your campaign
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Campaign Title</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Summer Product Launch" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Campaign Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe the goals and details of your campaign..." 
                                className="min-h-[120px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="budget"
                        render={({ field: { value, onChange, ...field } }) => (
                          <FormItem>
                            <FormLabel>Campaign Budget (USDC)</FormLabel>
                            <div className="flex items-center gap-4">
                              <div className="relative flex-1">
                                <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                  type="number" 
                                  min={100} 
                                  className="pl-8" 
                                  value={value} 
                                  onChange={(e) => onChange(parseFloat(e.target.value))} 
                                  {...field}
                                />
                              </div>
                              <div className="w-32 flex-shrink-0">
                                <div className="flex items-center gap-2 text-sm">
                                  <Wallet className="h-4 w-4 text-muted-foreground" />
                                  <span>Balance:</span>
                                  <span className={insufficientFunds ? "text-destructive font-medium" : ""}>${walletInfo?.balance || 0}</span>
                                </div>
                              </div>
                            </div>
                            {insufficientFunds && (
                              <p className="text-destructive text-sm mt-1">
                                Insufficient funds. Please add more to your wallet or reduce your budget.
                              </p>
                            )}
                            <FormDescription>
                              Slide to adjust your budget. Minimum $100.
                            </FormDescription>
                            <Slider 
                              value={[value]} 
                              min={100} 
                              max={5000} 
                              step={100}
                              onValueChange={(values) => onChange(values[0])}
                              className="mt-2"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Start Date</FormLabel>
                            <DatePicker 
                              date={field.value} 
                              setDate={field.onChange} 
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>End Date</FormLabel>
                            <DatePicker 
                              date={field.value} 
                              setDate={field.onChange} 
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Image selection from saved ads */}
                      <div className="space-y-3">
                        <FormLabel>Campaign Image (Optional)</FormLabel>
                        <div className="border-2 border-dashed border-border rounded-lg p-4">
                          {campaignImage ? (
                            <div className="relative">
                              <img 
                                src={campaignImage} 
                                alt="Campaign" 
                                className="w-full h-40 object-cover rounded-lg"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={removeImage}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="text-center space-y-2">
                              <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">Select from your saved ads</p>
                              <Select onValueChange={handleAdSelection} value={selectedAdId || ""}>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Choose a saved ad" />
                                </SelectTrigger>
                                <SelectContent>
                                  {(savedAds as any[]).map((ad: any) => (
                                    <SelectItem key={ad.id} value={ad.id.toString()}>
                                      {ad.title || `Ad ${ad.id}`}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={createCampaignMutation.isPending || insufficientFunds}
                  >
                    {createCampaignMutation.isPending ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                    ) : null}
                    Create Campaign
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </div>
      </main>
    </div>
  );
}