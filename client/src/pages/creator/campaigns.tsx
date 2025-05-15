import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search, Filter, PlusCircle } from "lucide-react";
import { Campaign } from "@shared/schema";
import CampaignCard from "@/components/campaign-card";
import Header from "@/components/layout/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";

export default function CreatorCampaignsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const { data: campaigns = [], isLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/creator/campaigns"],
    onError: (error: Error) => {
      toast({
        title: "Error fetching campaigns",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const pauseCampaignMutation = useMutation({
    mutationFn: async (campaignId: number) => {
      const res = await apiRequest("POST", `/api/creator/campaigns/${campaignId}/pause`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/creator/campaigns"] });
      toast({
        title: "Campaign paused",
        description: "Your campaign has been paused successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to pause campaign",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredCampaigns = campaigns.filter(campaign => {
    // Filter by search query
    const matchesSearch = campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by status
    const matchesStatus = 
      activeTab === "all" ? true :
      activeTab === "active" ? (campaign.status === "active") :
      activeTab === "paused" ? (campaign.status === "paused") :
      activeTab === "completed" ? (campaign.status === "completed") : true;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-7xl mx-auto px-4 pt-24 pb-10">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
              <p className="text-muted-foreground mt-1">
                Manage your advertising campaigns
              </p>
            </div>
            <Link href="/creator/new-campaign">
              <Button className="gap-1.5">
                <PlusCircle className="h-4 w-4" />
                New Campaign
              </Button>
            </Link>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="shrink-0">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 md:w-[400px]">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="paused">Paused</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            <Separator className="my-4" />
            <TabsContent value="all" className="mt-0">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="w-full h-[300px] animate-pulse bg-primary/5" />
                  ))}
                </div>
              ) : filteredCampaigns.length === 0 ? (
                <Card className="w-full">
                  <CardContent className="flex flex-col items-center justify-center py-10">
                    <p className="text-muted-foreground text-center mb-4">No campaigns found</p>
                    <Link href="/creator/new-campaign">
                      <Button>Create a Campaign</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCampaigns.map((campaign) => (
                    <CampaignCard 
                      key={campaign.id} 
                      campaign={campaign} 
                      onPause={() => pauseCampaignMutation.mutate(campaign.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            {/* Other tab contents are identical, React will handle which one to display based on the active tab */}
          </Tabs>
        </div>
      </main>
    </div>
  );
}