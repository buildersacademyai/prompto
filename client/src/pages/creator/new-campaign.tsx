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
  Users, 
  Calendar, 
  Target, 
  ArrowRight,
  Upload,
  X,
  Image as ImageIcon,
  Wallet
} from "lucide-react";
import Header from "@/components/layout/header";
import { Influencer } from "@shared/schema";
import { Link, useLocation } from "wouter";
import InfluencerCard from "@/components/influencer-card";
import { Separator } from "@/components/ui/separator";

// Form schema
const campaignFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  budget: z.number().min(100, "Minimum budget is $100"),
  startDate: z.date().refine(date => date >= new Date(), "Start date must be in the future"),
  endDate: z.date().refine(date => date >= new Date(), "End date must be in the future"),
  targetAudience: z.string().min(1, "Target audience is required"),
  contentType: z.string().min(1, "Content type is required"),
  platform: z.string().min(1, "Platform is required"),
  influencerIds: z.array(z.number()).optional()
});

type CampaignFormValues = z.infer<typeof campaignFormSchema>;

export default function NewCampaignPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [selectedInfluencers, setSelectedInfluencers] = useState<number[]>([]);
  const [campaignImage, setCampaignImage] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  // Check wallet balance
  const { data: walletInfo } = useQuery({
    queryKey: ["/api/creator/wallet"],
  });

  // Get recommended influencers
  const { data: influencers = [], isLoading: isLoadingInfluencers } = useQuery<Influencer[]>({
    queryKey: ["/api/creator/influencers/recommended"],
  });

  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      title: "",
      description: "",
      budget: 500,
      startDate: new Date(Date.now() + 86400000), // Tomorrow
      endDate: new Date(Date.now() + 86400000 * 30), // 30 days from now
      targetAudience: "",
      contentType: "",
      platform: "",
      influencerIds: []
    }
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (data: CampaignFormValues & { image?: string }) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'influencerIds') {
          formData.append(key, JSON.stringify(value));
        } else if (key === 'startDate' || key === 'endDate') {
          formData.append(key, value.toISOString());
        } else {
          formData.append(key, String(value));
        }
      });
      const res = await fetch('/api/creator/campaigns', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/creator/campaigns"] });
      toast({
        title: "Campaign created",
        description: "Your campaign has been created successfully.",
      });
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

  const onSubmit = (data: CampaignFormValues) => {
    // Add selected influencers and image to form data
    const campaignData = {
      ...data,
      influencerIds: selectedInfluencers,
      image: campaignImage
    };
    createCampaignMutation.mutate(campaignData);
  };

  const toggleInfluencer = (influencerId: number) => {
    if (selectedInfluencers.includes(influencerId)) {
      setSelectedInfluencers(selectedInfluencers.filter(id => id !== influencerId));
    } else {
      setSelectedInfluencers([...selectedInfluencers, influencerId]);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCampaignImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setCampaignImage(null);
  };

  const nextStep = () => {
    if (step === 1) {
      // Validate first step fields
      const result = form.trigger(["title", "description", "budget", "startDate", "endDate"]);
      if (result) {
        setStep(2);
      }
    }
  };

  const prevStep = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const insufficientFunds = form.watch("budget") > (walletInfo?.balance || 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-7xl mx-auto px-4 pt-24 pb-10">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Create New Campaign</h1>
              <p className="text-muted-foreground mt-1">
                Launch a new advertising campaign with influencers
              </p>
            </div>
            <Link href="/creator/campaigns">
              <Button variant="outline">
                Cancel
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 1 ? 'bg-primary text-white' : 'bg-primary/20 text-primary'}`}>
                1
              </div>
              <div className={`h-1 w-24 ${step === 1 ? 'bg-primary/20' : 'bg-primary'}`}></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 2 ? 'bg-primary text-white' : 'bg-primary/20 text-primary'}`}>
                2
              </div>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {step === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Campaign Details</CardTitle>
                    <CardDescription>
                      Enter the basic information about your campaign
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="startDate"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Start Date</FormLabel>
                                <DatePicker date={field.value} setDate={field.onChange} />
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
                                <DatePicker date={field.value} setDate={field.onChange} />
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="space-y-3">
                          <FormLabel>Campaign Image</FormLabel>
                          {campaignImage ? (
                            <div className="relative rounded-md overflow-hidden">
                              <img 
                                src={campaignImage} 
                                alt="Campaign" 
                                className="w-full h-48 object-cover" 
                              />
                              <Button 
                                type="button"
                                variant="destructive" 
                                size="icon" 
                                className="absolute top-2 right-2" 
                                onClick={removeImage}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="border-2 border-dashed border-border rounded-md p-6 text-center">
                              <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground mb-2">Upload a campaign image</p>
                              <label htmlFor="campaign-image">
                                <Button type="button" variant="outline" className="gap-2">
                                  <Upload className="h-4 w-4" />
                                  Upload Image
                                </Button>
                                <input 
                                  type="file" 
                                  id="campaign-image" 
                                  className="sr-only" 
                                  accept="image/*" 
                                  onChange={handleImageUpload}
                                />
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => navigate("/creator/campaigns")}>
                      Cancel
                    </Button>
                    <Button type="button" onClick={nextStep} className="gap-2" disabled={insufficientFunds}>
                      Next Step
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              )}

              {step === 2 && (
                <>
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Campaign Settings</CardTitle>
                      <CardDescription>
                        Define your campaign targeting and content requirements
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                          control={form.control}
                          name="targetAudience"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Target Audience</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select audience" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="millennials">Millennials (25-40)</SelectItem>
                                  <SelectItem value="genZ">Gen Z (18-24)</SelectItem>
                                  <SelectItem value="parents">Parents</SelectItem>
                                  <SelectItem value="professionals">Professionals</SelectItem>
                                  <SelectItem value="students">Students</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="contentType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Content Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select content type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="post">Social Post</SelectItem>
                                  <SelectItem value="video">Video</SelectItem>
                                  <SelectItem value="story">Story</SelectItem>
                                  <SelectItem value="reel">Reel/Short</SelectItem>
                                  <SelectItem value="review">Product Review</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="platform"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Platform</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select platform" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="instagram">Instagram</SelectItem>
                                  <SelectItem value="tiktok">TikTok</SelectItem>
                                  <SelectItem value="youtube">YouTube</SelectItem>
                                  <SelectItem value="discord">Discord</SelectItem>
                                  <SelectItem value="multiple">Multiple Platforms</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Select Influencers</CardTitle>
                      <CardDescription>
                        Choose influencers to promote your campaign
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingInfluencers ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {[...Array(3)].map((_, i) => (
                            <Card key={i} className="w-full h-[350px] animate-pulse bg-primary/5" />
                          ))}
                        </div>
                      ) : influencers.length === 0 ? (
                        <div className="text-center py-10">
                          <p className="text-muted-foreground mb-4">No recommended influencers found</p>
                          <Button variant="outline">
                            Browse All Influencers
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between mb-4">
                            <div className="text-sm text-muted-foreground">
                              Selected: {selectedInfluencers.length} influencers
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setSelectedInfluencers([])}>
                              Clear All
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {influencers.map((influencer) => (
                              <div 
                                key={influencer.id} 
                                className={`border rounded-lg cursor-pointer transition-all ${selectedInfluencers.includes(influencer.id) ? 'border-primary bg-primary/5' : 'border-border'}`}
                                onClick={() => toggleInfluencer(influencer.id)}
                              >
                                <InfluencerCard influencer={influencer} />
                                <div className="p-4 border-t">
                                  <Button 
                                    type="button"
                                    variant={selectedInfluencers.includes(influencer.id) ? "default" : "outline"}
                                    size="sm"
                                    className="w-full"
                                  >
                                    {selectedInfluencers.includes(influencer.id) ? "Selected" : "Select Influencer"}
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button type="button" variant="outline" onClick={prevStep}>
                        Previous Step
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createCampaignMutation.isPending || selectedInfluencers.length === 0 || insufficientFunds}
                      >
                        {createCampaignMutation.isPending ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                        ) : null}
                        Create Campaign
                      </Button>
                    </CardFooter>
                  </Card>
                </>
              )}
            </form>
          </Form>
        </div>
      </main>
    </div>
  );
}