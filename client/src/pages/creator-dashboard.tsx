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
import { useState } from "react";

export default function CreatorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [campaignSort, setCampaignSort] = useState("performance");
  const [adFilter, setAdFilter] = useState("newest");
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
                
                <div className="space-y-4">
                  {/* Generated Ad Item 1 */}
                  <div className="bg-background rounded-lg p-4 border border-border">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-xs text-muted-foreground">
                        Saved on May 10, 2024
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <CopyIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <ImageIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      <p className="mb-1">Introducing our eco-conscious Summer Collection. Made with 100% sustainable materials, this vibrant lineup gives you style without compromise. #SummerEthics #EcoFashion #Sustainable</p>
                    </div>
                  </div>
                  
                  {/* Generated Ad Item 2 */}
                  <div className="bg-background rounded-lg p-4 border border-border">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-xs text-muted-foreground">
                        Saved on April 28, 2024
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <CopyIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <ImageIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      <p className="mb-1">Elevate your skincare routine with our new organic face serum. Packed with natural ingredients that nourish and revitalize your skin. #skincare #organic #beauty</p>
                    </div>
                  </div>
                  
                  {/* Generated Ad Item 3 */}
                  <div className="bg-background rounded-lg p-4 border border-border">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-xs text-muted-foreground">
                        Saved on April 15, 2024
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <CopyIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <ImageIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      <p className="mb-1">Transform your living space with our Smart Home ecosystem. Control everything with a tap, save on energy bills, and enjoy the comfort of true automation. Your future home is here today. #SmartLiving #EnergyEfficient #HomeTech</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
