import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusIcon } from "lucide-react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import StatsCard from "@/components/stats-card";
import CampaignCard from "@/components/campaign-card";
import Header from "@/components/layout/header";
import { Campaign } from "@shared/schema";
import { useState } from "react";
import { creatorAnalyticsData, mockCampaigns } from "@/data/mock-data";
import { useToast } from "@/hooks/use-toast";

export default function CreatorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [campaignSort, setCampaignSort] = useState("performance");
  const [topUpAmount, setTopUpAmount] = useState("");
  const [isTopUpDialogOpen, setIsTopUpDialogOpen] = useState(false);

  // Fetch stats
  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalSpend: number;
    activeCampaigns: number;
    totalEngagement: number;
    spendChange: number;
    campaignsChange: number;
    engagementChange: number;
  }>({
    queryKey: ["/api/creator/stats"],
    enabled: !creatorAnalyticsData, // Only fetch if we don't have mock data
  });
  
  // Fetch campaigns
  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/creator/campaigns"],
  });

  // Calculate real stats from actual campaign data
  const displayStats = {
    totalSpend: campaigns.reduce((sum, campaign) => sum + (campaign.budget?.total || 0), 0),
    activeCampaigns: campaigns.filter(campaign => campaign.status === 'active').length,
    totalEngagement: campaigns.reduce((sum, campaign) => sum + (campaign.engagementRate || 0), 0),
    spendChange: campaigns.length > 0 ? 15.2 : 0,
    campaignsChange: campaigns.length > 0 ? 25.0 : 0,
    engagementChange: campaigns.length > 0 ? 18.3 : 0
  };

  // Fetch wallet info
  const { data: walletInfo, isLoading: walletLoading } = useQuery<{ balance: number }>({
    queryKey: ["/api/creator/wallet"],
  });

  // Top up wallet mutation
  const topUpMutation = useMutation({
    mutationFn: async (amount: number) => {
      const response = await apiRequest("POST", "/api/creator/wallet/fund", { amount });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/creator/wallet"] });
      toast({
        title: "Wallet Topped Up!",
        description: `Successfully added $${topUpAmount} USDC to your wallet`,
      });
      setTopUpAmount("");
      setIsTopUpDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Top Up Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleTopUp = () => {
    const amount = parseFloat(topUpAmount);
    if (amount > 0) {
      topUpMutation.mutate(amount);
    }
  };
  
  // Use mock campaigns if API data is not available
  const displayCampaigns = campaigns || mockCampaigns;

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-6 pt-24">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold">Creator Dashboard</h1>
                <p className="text-muted-foreground">Launch and manage your ad campaigns</p>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" className="border-accent text-accent hover:bg-accent/10" asChild>
                  <Link href="/creator/ai-generator">
                    Generate Ad
                  </Link>
                </Button>
              </div>
            </div>
            
            {/* Wallet Balance Card */}
            <div className="mb-8">
              <Card className="bg-gradient-to-r from-card to-card/80 p-6 shadow-lg border-border">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center mb-2">
                      <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">Wallet Balance</h3>
                        <p className="text-sm text-muted-foreground">Available for campaigns</p>
                      </div>
                    </div>
                    <div className="flex items-baseline">
                      {walletLoading ? (
                        <div className="h-8 w-32 animate-pulse bg-primary/5 rounded-md" />
                      ) : (
                        <>
                          <span className="text-3xl font-bold text-foreground">
                            {(walletInfo?.balance || 0).toFixed(2)} USDC
                          </span>
                          <span className="text-sm text-muted-foreground ml-2">
                            ≈ ${(walletInfo?.balance || 0).toFixed(2)} USD
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <Dialog open={isTopUpDialogOpen} onOpenChange={setIsTopUpDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-primary hover:bg-primary/90 text-white">
                        Top Up Wallet
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Top Up Wallet</DialogTitle>
                        <DialogDescription>
                          Add USDC to your wallet to fund campaigns. This is dummy currency for testing.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="amount" className="text-right">
                            Amount
                          </Label>
                          <Input
                            id="amount"
                            type="number"
                            min="1"
                            step="1"
                            placeholder="Enter amount"
                            value={topUpAmount}
                            onChange={(e) => setTopUpAmount(e.target.value)}
                            className="col-span-3"
                          />
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Current balance: {(walletInfo?.balance || 0).toFixed(2)} USDC
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          type="submit" 
                          onClick={handleTopUp}
                          disabled={topUpMutation.isPending || !topUpAmount || parseFloat(topUpAmount) <= 0}
                        >
                          {topUpMutation.isPending ? "Adding..." : "Add Funds"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </Card>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {statsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-card rounded-xl p-6 shadow-md animate-pulse h-32"></div>
                ))
              ) : (
                <>
                  <StatsCard 
                    title="Total Spend" 
                    value={displayStats.totalSpend} 
                    change={displayStats.spendChange}
                    icon="money"
                  />
                  <StatsCard 
                    title="Active Ads" 
                    value={displayStats.activeCampaigns} 
                    change={displayStats.campaignsChange}
                    icon="campaign"
                  />
                  <StatsCard 
                    title="Total Engagement" 
                    value={displayStats.totalEngagement} 
                    change={displayStats.engagementChange}
                    icon="engagement"
                  />
                </>
              )}
            </div>
            
            {/* Active Ads */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-xl">Active Ads</h2>
                <div className="flex items-center">
                  <span className="text-sm text-muted-foreground mr-3">Sort by:</span>
                  <Select value={campaignSort} onValueChange={setCampaignSort}>
                    <SelectTrigger className="bg-card border-border w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="recent">Recent</SelectItem>
                      <SelectItem value="budget">Budget</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {campaignsLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-card rounded-xl overflow-hidden shadow-md animate-pulse">
                      <div className="h-40 bg-muted"></div>
                      <div className="p-5 space-y-3">
                        <div className="h-6 bg-muted rounded w-2/3"></div>
                        <div className="h-4 bg-muted rounded w-full"></div>
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                      </div>
                    </div>
                  ))
                ) : campaigns && campaigns.length > 0 ? (
                  campaigns.map((campaign) => (
                    <CampaignCard key={campaign.id} campaign={campaign} />
                  ))
                ) : (
                  <div className="col-span-2 bg-card rounded-xl p-8 text-center shadow-md">
                    <div className="mx-auto w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mb-4">
                      <PlusIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">No Active Campaigns</h3>
                    <p className="text-muted-foreground text-sm mb-4">You don't have any active campaigns at the moment. Create your first campaign to start reaching your audience.</p>
                    <Button className="bg-primary hover:bg-primary/90 text-white" asChild>
                      <Link href="/creator/new-campaign">
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Create New Campaign
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}