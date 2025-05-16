import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { 
  PlusIcon, 
  CreditCard, 
  ArrowUpIcon, 
  SparklesIcon, 
  SearchIcon, 
  MoreVerticalIcon,
  CopyIcon,
  ImageIcon,
  PencilIcon,
  TrashIcon
} from "lucide-react";
import { Link } from "wouter";
import StatsCard from "@/components/stats-card";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import CampaignCard from "@/components/campaign-card";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Campaign } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { SavedAd } from "@/components/ai-generator-new";
import { mockGeneratedAds, mockCampaigns, mockInfluencers, creatorAnalyticsData, loadSampleData } from "@/data/mock-data";

export default function CreatorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [campaignSort, setCampaignSort] = useState("performance");
  const [adFilter, setAdFilter] = useState("newest");
  const [searchTerm, setSearchTerm] = useState("");
  const [savedAds, setSavedAds] = useState<SavedAd[]>([]);
  
  // Load saved ads from localStorage
  useEffect(() => {
    // Initialize with sample data
    loadSampleData();
    
    // Then load from localStorage
    const storedAds = localStorage.getItem('savedAds');
    if (storedAds) {
      try {
        setSavedAds(JSON.parse(storedAds));
      } catch (error) {
        console.error('Failed to parse saved ads from localStorage', error);
      }
    }
  }, []);
  
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
    enabled: !mockCampaigns, // Only fetch if we don't have mock data
  });
  
  // Use mock campaigns data if API data is not available
  const displayCampaigns = campaigns || mockCampaigns;

  // No need to fetch influencers since we don't display them anymore
  const [adSort, setAdSort] = useState("newest");

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
  
  // Use mock stats if the API data is not available
  const displayStats = stats || {
    totalSpend: creatorAnalyticsData.overall.spent,
    activeCampaigns: creatorAnalyticsData.overall.campaigns,
    totalEngagement: creatorAnalyticsData.overall.engagement,
    spendChange: creatorAnalyticsData.overall.spentChange,
    campaignsChange: creatorAnalyticsData.overall.campaignsChange,
    engagementChange: creatorAnalyticsData.overall.engagementChange
  };

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
                ) : displayCampaigns && displayCampaigns.length > 0 ? (
                  displayCampaigns.map((campaign) => (
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
            
            {/* Generated Ads */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-xl">Generated Ads</h2>
                <Button variant="ghost" className="text-accent hover:text-accent/90" asChild>
                  <Link href="/creator/ai-generator">
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Generate New
                  </Link>
                </Button>
              </div>
              
              <div className="bg-card rounded-xl p-6 shadow-md">
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex-grow">
                    <div className="relative">
                      <Input 
                        type="text" 
                        placeholder="Search generated ads..." 
                        className="w-full bg-background border-border pl-10" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Select value={adFilter} onValueChange={setAdFilter}>
                      <SelectTrigger className="bg-background border-border w-36">
                        <SelectValue placeholder="Sort By" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {savedAds.length === 0 ? (
                    <div className="col-span-2 bg-background rounded-xl p-8 text-center border border-border">
                      <div className="mx-auto w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mb-4">
                        <SparklesIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">No Generated Ads</h3>
                      <p className="text-muted-foreground text-sm mb-4">You haven't generated any ads yet. Create your first AI-powered ad to get started.</p>
                      <Button className="bg-primary hover:bg-primary/90 text-white" asChild>
                        <Link href="/creator/ai-generator">
                          <SparklesIcon className="mr-2 h-4 w-4" />
                          Generate Ad
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    savedAds
                      .filter(ad => searchTerm === "" || 
                        ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        ad.generatedText.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        ad.prompt.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .sort((a, b) => {
                        if (adFilter === "newest") {
                          return new Date(b.date).getTime() - new Date(a.date).getTime();
                        } else {
                          return new Date(a.date).getTime() - new Date(b.date).getTime();
                        }
                      })
                      .map((ad) => (
                        <div key={ad.id} className="bg-background rounded-lg p-5 border border-border">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-medium text-lg">{ad.title}</h3>
                              <div className="text-xs text-muted-foreground mt-1">
                                Created: {ad.date}
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVerticalIcon className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                  navigator.clipboard.writeText(ad.generatedText);
                                  toast({
                                    title: "Copied to clipboard",
                                    description: "Ad text has been copied to your clipboard."
                                  });
                                }}>
                                  <CopyIcon className="mr-2 h-4 w-4" />
                                  Copy Text
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <ImageIcon className="mr-2 h-4 w-4" />
                                  Download Image
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <PencilIcon className="mr-2 h-4 w-4" />
                                  Edit & Regenerate
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  // Delete ad from localStorage
                                  const storedAds = localStorage.getItem('savedAds');
                                  if (storedAds) {
                                    try {
                                      const parsedAds: SavedAd[] = JSON.parse(storedAds);
                                      const filteredAds = parsedAds.filter(savedAd => savedAd.id !== ad.id);
                                      localStorage.setItem('savedAds', JSON.stringify(filteredAds));
                                      setSavedAds(filteredAds);
                                      toast({
                                        title: "Ad deleted",
                                        description: "The ad has been removed from your saved ads."
                                      });
                                    } catch (error) {
                                      console.error('Failed to delete ad', error);
                                    }
                                  }
                                }}>
                                  <TrashIcon className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          
                          <div className="flex flex-col md:flex-row gap-4">
                            <div className="md:w-1/2">
                              <div className="relative aspect-square bg-muted rounded-md overflow-hidden">
                                <img 
                                  src={ad.imageUrl} 
                                  alt={ad.title} 
                                  className="object-cover w-full h-full"
                                  onError={(e) => {
                                    e.currentTarget.src = "https://placehold.co/400x400/1E1E1E/9945FF?text=Ad+Image";
                                  }}
                                />
                              </div>
                            </div>
                            <div className="md:w-1/2">
                              <div className="text-sm mb-3">
                                <span className="font-medium">Prompt:</span>
                                <p className="text-muted-foreground mt-1">{ad.prompt}</p>
                              </div>
                              <div className="text-sm mb-4">
                                <span className="font-medium">Generated Text:</span>
                                <p className="text-muted-foreground mt-1 line-clamp-4">{ad.generatedText}</p>
                              </div>
                              <div className="flex flex-wrap gap-1 mb-3">
                                {ad.hashtags.map((tag, index) => (
                                  <Badge key={index} variant="outline" className="bg-background/50 text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                              <Button size="sm" className="w-full bg-primary hover:bg-primary/90" asChild>
                                <Link href="/creator/new-campaign">
                                  Create Campaign
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
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
