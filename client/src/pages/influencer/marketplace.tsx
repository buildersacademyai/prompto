import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchIcon, FilterIcon, TrendingUpIcon, UsersIcon, DollarSignIcon, MegaphoneIcon } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Campaign } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";
import CampaignCard from "@/components/campaign-card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function InfluencerMarketplacePage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Fetch all available campaigns from creators
  const { data: campaigns = [], isLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/marketplace/campaigns"],
  });

  // Join campaign mutation
  const joinCampaignMutation = useMutation({
    mutationFn: async (campaignId: number) => {
      const res = await apiRequest("POST", `/api/campaigns/${campaignId}/join`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace/campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/influencer/campaigns"] });
      toast({
        title: "Success!",
        description: "You've successfully joined the campaign. Check your campaigns page for details.",
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

  // Filter and sort campaigns
  const filteredCampaigns = campaigns
    .filter(campaign => {
      const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "all" || campaign.category === categoryFilter;
      return matchesSearch && matchesCategory && campaign.status === 'active';
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "budget-high":
          return (b.budget?.total || 0) - (a.budget?.total || 0);
        case "budget-low":
          return (a.budget?.total || 0) - (b.budget?.total || 0);
        case "engagement":
          return (b.engagementRate || 0) - (a.engagementRate || 0);
        case "newest":
        default:
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });

  // Get unique categories for filter
  const categories = Array.from(new Set(campaigns.map(c => c.category)));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 pt-20">
        <div className="max-w-7xl mx-auto p-6">
          {/* Page header */}
          <div className="mb-8">
            <h1 className="font-bold text-3xl mb-2">Campaign Marketplace</h1>
            <p className="text-muted-foreground">
              Discover and join exciting campaigns from creators worldwide
            </p>
          </div>

          {/* Search and filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="lg:w-48">
                <div className="flex items-center">
                  <FilterIcon className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Category" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="lg:w-48">
                <div className="flex items-center">
                  <TrendingUpIcon className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Sort by" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="budget-high">Highest Budget</SelectItem>
                <SelectItem value="budget-low">Lowest Budget</SelectItem>
                <SelectItem value="engagement">Best Engagement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <MegaphoneIcon className="mr-2 h-4 w-4 text-primary" />
                  Active Campaigns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{campaigns.filter(c => c.status === 'active').length}</div>
                <p className="text-xs text-muted-foreground">Available to join</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <DollarSignIcon className="mr-2 h-4 w-4 text-accent" />
                  Total Budget
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(campaigns.reduce((sum, c) => sum + (c.budget?.total || 0), 0))}
                </div>
                <p className="text-xs text-muted-foreground">Across all campaigns</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <UsersIcon className="mr-2 h-4 w-4 text-secondary" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{categories.length}</div>
                <p className="text-xs text-muted-foreground">Different niches</p>
              </CardContent>
            </Card>
          </div>

          {/* Campaign grid */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {filteredCampaigns.length} Campaign{filteredCampaigns.length !== 1 ? 's' : ''} Found
              </h2>
              {searchTerm && (
                <Button variant="outline" onClick={() => setSearchTerm("")}>
                  Clear Search
                </Button>
              )}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-full"></div>
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-8 bg-muted rounded w-1/3 mt-4"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredCampaigns.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredCampaigns.map((campaign) => (
                  <CampaignCard 
                    key={campaign.id} 
                    campaign={campaign} 
                    influencerView={true}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <CardHeader>
                  <CardTitle>No campaigns found</CardTitle>
                  <CardDescription>
                    {searchTerm 
                      ? `No campaigns match your search for "${searchTerm}"`
                      : "There are no active campaigns available at the moment."
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {searchTerm && (
                    <Button variant="outline" onClick={() => setSearchTerm("")}>
                      Clear Search
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}