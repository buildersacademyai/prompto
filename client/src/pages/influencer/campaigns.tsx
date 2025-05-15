import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search, Filter, Trending, ArrowUpRight } from "lucide-react";
import { Campaign } from "@shared/schema";
import CampaignCard from "@/components/campaign-card";
import Header from "@/components/layout/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function InfluencerCampaignsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("available");
  const [sortBy, setSortBy] = useState("budget");

  const { data: myCampaigns = [], isLoading: isLoadingMyCampaigns } = useQuery<Campaign[]>({
    queryKey: ["/api/influencer/campaigns"],
    retry: false,
  });

  const { data: availableCampaigns = [], isLoading: isLoadingAvailable } = useQuery<Campaign[]>({
    queryKey: ["/api/influencer/campaigns/available"],
    retry: false,
  });

  const joinCampaignMutation = useMutation({
    mutationFn: async (campaignId: number) => {
      const res = await apiRequest("POST", `/api/influencer/campaigns/${campaignId}/join`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/influencer/campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/influencer/campaigns/available"] });
      toast({
        title: "Campaign joined",
        description: "You've successfully joined this campaign.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to join campaign",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredCampaigns = (activeTab === "available" ? availableCampaigns : myCampaigns).filter(campaign => {
    return (
      campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }).sort((a, b) => {
    switch (sortBy) {
      case "budget":
        return (b.budget?.total || 0) - (a.budget?.total || 0);
      case "date":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "engagement":
        return (b.engagementRate || 0) - (a.engagementRate || 0);
      default:
        return 0;
    }
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
                Browse and manage your advertising campaigns
              </p>
            </div>
          </div>

          <Tabs defaultValue="available" className="w-full" onValueChange={setActiveTab}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <TabsList className="md:w-[300px]">
                <TabsTrigger value="available" className="flex-1">Available</TabsTrigger>
                <TabsTrigger value="joined" className="flex-1">My Campaigns</TabsTrigger>
              </TabsList>
              
              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <div className="relative w-full md:w-[280px]">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search campaigns..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="budget">Highest Budget</SelectItem>
                      <SelectItem value="date">Newest First</SelectItem>
                      <SelectItem value="engagement">Engagement Rate</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <Separator className="my-4" />
            
            <TabsContent value="available" className="mt-0">
              {isLoadingAvailable ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="w-full h-[350px] animate-pulse bg-primary/5" />
                  ))}
                </div>
              ) : filteredCampaigns.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-10">
                    <p className="text-muted-foreground text-center mb-4">
                      No available campaigns match your criteria
                    </p>
                    <div className="flex gap-4">
                      <Button variant="outline" onClick={() => setSearchQuery("")}>
                        Clear Search
                      </Button>
                      <Button onClick={() => setActiveTab("joined")}>
                        View My Campaigns
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCampaigns.map((campaign) => (
                    <Card key={campaign.id} className="flex flex-col h-full">
                      <CampaignCard 
                        campaign={campaign} 
                        influencerView={true}
                      />
                      <CardFooter className="mt-auto pt-4">
                        <Button 
                          className="w-full gap-2" 
                          onClick={() => joinCampaignMutation.mutate(campaign.id)}
                          disabled={joinCampaignMutation.isPending}
                        >
                          {joinCampaignMutation.isPending ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4" />
                          )}
                          Join Campaign
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="joined" className="mt-0">
              {isLoadingMyCampaigns ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="w-full h-[350px] animate-pulse bg-primary/5" />
                  ))}
                </div>
              ) : filteredCampaigns.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-10">
                    <p className="text-muted-foreground text-center mb-4">
                      You haven't joined any campaigns yet
                    </p>
                    <Button onClick={() => setActiveTab("available")}>
                      Browse Available Campaigns
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCampaigns.map((campaign) => (
                    <Card key={campaign.id} className="flex flex-col h-full">
                      <CampaignCard 
                        campaign={campaign} 
                        influencerView={true}
                      />
                      <CardFooter className="mt-auto pt-4 flex justify-between">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Status: </span>
                          <span className="font-medium capitalize">{campaign.status}</span>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}