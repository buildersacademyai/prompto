import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { PlusIcon, Link2Icon, CheckCircle2, AlertCircle, CreditCard, ArrowDownIcon } from "lucide-react";
import StatsCard from "@/components/stats-card";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Campaign, SocialAccount } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import CampaignCard from "@/components/campaign-card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";

export default function InfluencerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [campaignFilter, setCampaignFilter] = useState("all");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  
  // Schema for withdraw validation
  const withdrawSchema = z.object({
    amount: z.number().positive("Amount must be greater than 0")
  });
  
  // Withdraw funds mutation
  const withdrawMutation = useMutation({
    mutationFn: async (data: {amount: number}) => {
      const res = await apiRequest("POST", "/api/wallet/withdraw", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Withdrawal successful",
        description: `${withdrawAmount} USDC has been withdrawn to your connected wallet.`,
      });
      setWithdrawAmount("");
    },
    onError: (error: Error) => {
      toast({
        title: "Withdrawal failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle withdraw submission
  const handleWithdraw = () => {
    try {
      // Validate input
      const amount = parseFloat(withdrawAmount);
      const result = withdrawSchema.parse({ amount });
      
      // Check if user has enough balance
      const userBalance = user?.wallet?.balance || 0;
      if (amount > userBalance) {
        toast({
          title: "Insufficient balance",
          description: `You only have ${userBalance.toFixed(2)} USDC available for withdrawal.`,
          variant: "destructive",
        });
        return;
      }
      
      // Check if user has a connected wallet
      if (!user?.wallet?.walletAddress) {
        toast({
          title: "No wallet connected",
          description: "Please connect a wallet address in your profile settings first.",
          variant: "destructive",
        });
        return;
      }
      
      // Process withdraw
      withdrawMutation.mutate({ amount });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors[0].message || "Invalid input";
        toast({
          title: "Validation error",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      }
    }
  };

  // Fetch stats
  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalEarnings: number;
    activeCampaigns: number;
    totalEngagement: number;
    earningsChange: number;
    campaignsChange: number;
    engagementChange: number;
  }>({
    queryKey: ["/api/influencer/stats"],
  });

  // Fetch social accounts
  const { data: socialAccounts, isLoading: accountsLoading } = useQuery<SocialAccount[]>({
    queryKey: ["/api/influencer/social-accounts"],
  });

  // Fetch available campaigns
  const { data: campaigns, isLoading: campaignsLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/influencer/campaigns"],
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
                <h1 className="font-bold text-3xl">Influencer Dashboard</h1>
                <p className="text-muted-foreground mt-1">Manage your ad campaigns and earnings</p>
              </div>
              <div className="mt-4 lg:mt-0">
                <Button className="bg-primary hover:bg-primary/90 text-white flex items-center">
                  <Link2Icon className="mr-2 h-4 w-4" />
                  Connect Social Account
                </Button>
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
                    title="Total Earnings" 
                    value={stats.totalEarnings} 
                    change={stats.earningsChange}
                    icon="money"
                    valuePrefix="$"
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
            
            {/* Wallet Withdraw Card */}
            <div className="mb-8">
              <div className="bg-card rounded-xl p-6 shadow-md border border-primary/20 relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
                <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl"></div>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10 mb-6">
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
                </div>
                
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label htmlFor="amount" className="block text-sm font-medium mb-1">
                      Amount (USDC)
                    </label>
                    <Input
                      id="amount"
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="bg-background/50"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      className="bg-primary hover:bg-primary/90 text-white h-10"
                      onClick={handleWithdraw}
                      disabled={withdrawMutation.isPending || !withdrawAmount}
                    >
                      {withdrawMutation.isPending ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4 mr-2" />
                      )}
                      Withdraw to Wallet
                    </Button>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mt-2">
                  Funds will be sent to your connected wallet address: 
                  {user?.wallet?.walletAddress ? (
                    <span className="font-mono ml-2">
                      {user.wallet.walletAddress.substring(0, 6)}...{user.wallet.walletAddress.substring(user.wallet.walletAddress.length - 4)}
                    </span>
                  ) : (
                    <span className="italic ml-2">No wallet connected</span>
                  )}
                </p>
              </div>
            </div>
            
            {/* Connected Social Accounts */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-xl">Connected Accounts</h2>
                <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Add Account
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {accountsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-card rounded-xl p-6 shadow-md animate-pulse h-32"></div>
                  ))
                ) : socialAccounts && socialAccounts.length > 0 ? (
                  socialAccounts.map((account) => (
                    <Card key={account.id} className="bg-card border-border">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-${account.platform}-bg text-${account.platform}-text`}>
                              {account.platform === 'twitter' && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                  <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/>
                                </svg>
                              )}
                              {account.platform === 'instagram' && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                  <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"/>
                                </svg>
                              )}
                              {account.platform === 'tiktok' && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                  <path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3V0Z"/>
                                </svg>
                              )}
                            </div>
                            <div>
                              <CardTitle className="text-base">{account.displayName}</CardTitle>
                              <CardDescription>@{account.username}</CardDescription>
                            </div>
                          </div>
                          {account.verified ? (
                            <Badge variant="secondary" className="bg-secondary/20 text-secondary">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-yellow-500 text-yellow-500 bg-transparent">
                              <AlertCircle className="mr-1 h-3 w-3" />
                              Pending
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm mt-2">
                          <div>
                            <span className="text-muted-foreground">Followers:</span>{' '}
                            <span className="font-medium">{(account.followers || 0).toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Engagement:</span>{' '}
                            <span className="font-medium">{(account.engagementRate || 0).toFixed(1)}%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-3 bg-card rounded-xl p-8 text-center shadow-md">
                    <div className="mx-auto w-16 h-16 bg-background rounded-full flex items-center justify-center mb-4">
                      <Link2Icon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">No Connected Accounts</h3>
                    <p className="text-muted-foreground text-sm mb-4">Connect your social media accounts to start earning from advertising campaigns.</p>
                    <Button className="bg-primary hover:bg-primary/90 text-white">
                      <Link2Icon className="mr-2 h-4 w-4" />
                      Connect Social Account
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Available Campaigns */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-xl">Available Campaigns</h2>
                <Select value={campaignFilter} onValueChange={setCampaignFilter}>
                  <SelectTrigger className="w-36 bg-card border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Campaigns</SelectItem>
                    <SelectItem value="crypto">Crypto</SelectItem>
                    <SelectItem value="nft">NFT</SelectItem>
                    <SelectItem value="defi">DeFi</SelectItem>
                  </SelectContent>
                </Select>
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
                  campaigns
                    .filter(campaign => 
                      campaignFilter === "all" || 
                      campaign.category === campaignFilter
                    )
                    .map((campaign) => (
                      <CampaignCard 
                        key={campaign.id} 
                        campaign={campaign} 
                        influencerView={true} 
                      />
                    ))
                ) : (
                  <div className="col-span-2 bg-card rounded-xl p-8 text-center shadow-md">
                    <h3 className="font-semibold text-lg mb-2">No Available Campaigns</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      There are no campaigns available for your profile at this time. Complete your profile to match with more campaigns.
                    </p>
                    <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                      Complete Your Profile
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
