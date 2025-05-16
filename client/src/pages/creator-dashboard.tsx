import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { PlusIcon, CreditCard, ArrowUpIcon, SparklesIcon } from "lucide-react";
import { Link } from "wouter";
import StatsCard from "@/components/stats-card";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import CampaignCard from "@/components/campaign-card";
import InfluencerCard from "@/components/influencer-card";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Campaign, Influencer } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function CreatorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [campaignSort, setCampaignSort] = useState("performance");
  const [influencerFilter, setInfluencerFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  const fundWalletMutation = useMutation({
    mutationFn: async (amount: number) => {
      const res = await apiRequest("POST", "/api/wallet/fund", { amount });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Wallet funded",
        description: "Your wallet has been funded successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Funding failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Fetch campaigns
  const { data: campaigns, isLoading: campaignsLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
  });

  // Fetch influencers
  const { data: influencers, isLoading: influencersLoading } = useQuery<Influencer[]>({
    queryKey: ["/api/influencers"],
  });

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
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-sidebar pt-20">
        
        
        <div className="bg-background overflow-auto">
          <div className="max-w-6xl mx-auto p-6">
            {/* Dashboard header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
              <div>
                <h1 className="font-bold text-3xl">Creator Dashboard</h1>
                <p className="text-muted-foreground mt-1">Launch and manage your ad campaigns</p>
              </div>
              <div className="mt-4 lg:mt-0 flex space-x-2">
                <Button className="bg-primary hover:bg-primary/90 text-white flex items-center" asChild>
                  <Link href="/creator/new-campaign">
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Create New Campaign
                  </Link>
                </Button>
                <Button variant="outline" className="flex items-center" asChild>
                  <Link href="/creator/ai-generator">
                    <SparklesIcon className="mr-2 h-4 w-4" />
                    Generate Ad
                  </Link>
                </Button>
              </div>
            </div>
            
            {/* Wallet Balance Card */}
            <div className="mb-6">
              <div className="bg-card rounded-xl p-6 shadow-md border border-primary/20 relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
                <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl"></div>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10">
                  <div className="flex items-center mb-4 md:mb-0">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mr-4">
                      <CreditCard className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-foreground">Wallet Balance</h3>
                      <div className="flex items-baseline">
                        <p className="text-2xl font-bold font-display">
                          {user?.wallet?.balance?.toFixed(2) || "0.00"} USDC
                        </p>
                        <p className="text-sm ml-2 text-muted-foreground">
                          ≈ ${user?.wallet?.usdBalance?.toFixed(2) || "0.00"} USD
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    className="bg-primary hover:bg-primary/90 text-white"
                    onClick={() => fundWalletMutation.mutate(100)}
                    disabled={fundWalletMutation.isPending}
                  >
                    {fundWalletMutation.isPending ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                    ) : (
                      <ArrowUpIcon className="h-4 w-4 mr-2" />
                    )}
                    Top Up Wallet
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {statsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-card rounded-xl p-6 shadow-md animate-pulse h-32"></div>
                ))
              ) : stats ? (
                <>
                  <StatsCard 
                    title="Total Spend" 
                    value={stats.totalSpend} 
                    change={stats.spendChange}
                    icon="money"
                  />
                  <StatsCard 
                    title="Active Campaigns" 
                    value={stats.activeCampaigns} 
                    change={stats.campaignsChange}
                    icon="campaign"
                  />
                  <StatsCard 
                    title="Total Engagement" 
                    value={stats.totalEngagement} 
                    change={stats.engagementChange}
                    icon="engagement"
                  />
                </>
              ) : (
                <div className="col-span-3 text-center p-6 bg-card rounded-xl">Failed to load stats</div>
              )}
            </div>
            
            {/* Active Campaigns */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-xl">Active Campaigns</h2>
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
                    <div className="mx-auto w-16 h-16 bg-background rounded-full flex items-center justify-center mb-4">
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
            
            {/* Influencer Marketplace */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-xl">Discover Influencers</h2>
                <Button variant="ghost" className="text-accent hover:text-accent/90">
                  View All
                </Button>
              </div>
              
              <div className="bg-card rounded-xl p-6 shadow-md">
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex-grow">
                    <div className="relative">
                      <Input 
                        type="text" 
                        placeholder="Search by name, category, or tags..." 
                        className="w-full bg-background border-border pl-10" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Select value={influencerFilter} onValueChange={setInfluencerFilter}>
                      <SelectTrigger className="bg-background border-border w-36">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="crypto">Crypto</SelectItem>
                        <SelectItem value="nft">NFT</SelectItem>
                        <SelectItem value="defi">DeFi</SelectItem>
                        <SelectItem value="web3">Web3</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" className="bg-background border-border">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-4 w-4" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {influencersLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="bg-background rounded-xl overflow-hidden border border-border animate-pulse">
                        <div className="h-24 bg-muted"></div>
                        <div className="p-5 space-y-3 pt-12">
                          <div className="h-6 bg-muted rounded w-1/2"></div>
                          <div className="h-4 bg-muted rounded w-2/3"></div>
                          <div className="h-4 bg-muted rounded w-full"></div>
                        </div>
                      </div>
                    ))
                  ) : influencers && influencers.length > 0 ? (
                    influencers
                      .filter(influencer => 
                        influencerFilter === "all" || 
                        influencer.tags.includes(influencerFilter)
                      )
                      .filter(influencer => 
                        searchTerm === "" || 
                        influencer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        influencer.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        influencer.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
                      )
                      .slice(0, 3)
                      .map((influencer) => (
                        <InfluencerCard key={influencer.id} influencer={influencer} />
                      ))
                  ) : (
                    <div className="col-span-3 bg-background rounded-xl p-8 text-center border border-border">
                      <h3 className="font-semibold text-lg mb-2">No Influencers Found</h3>
                      <p className="text-muted-foreground text-sm">Try adjusting your search or filter criteria.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
