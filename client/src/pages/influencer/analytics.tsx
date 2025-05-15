import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, LineChart, TrendingUp, DollarSign, Users, Zap, Eye, MousePointerClick, Heart } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/layout/header";
import StatsCard from "@/components/stats-card";
import { formatCurrency, formatPercentage } from "@/lib/utils";

export default function InfluencerAnalyticsPage() {
  const { toast } = useToast();
  const [timeframe, setTimeframe] = useState("30d");
  const [platform, setPlatform] = useState("all");

  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/influencer/stats", timeframe, platform],
    retry: false,
  });

  // Use mock data if API data is not available yet
  const analytics = stats || {
    earnings: 870.50,
    earningsChange: 21.5,
    campaigns: 3,
    campaignsChange: 50.0,
    engagement: 84250,
    engagementChange: 12.3,
    impressions: 312800,
    clicks: 7820,
    followers: 28400,
    followersGrowth: 310,
    contentCount: 15,
    performanceByPlatform: [
      { platform: 'instagram', impressions: 185400, engagement: 45200, clicks: 3950 },
      { platform: 'tiktok', impressions: 127400, engagement: 39050, clicks: 3870 },
    ],
    topPerformingContent: [
      { id: 1, platform: 'instagram', type: 'post', impressions: 32400, engagement: 8400, campaign: 'Summer Collection' },
      { id: 2, platform: 'tiktok', type: 'video', impressions: 28700, engagement: 9200, campaign: 'Product Launch' },
      { id: 3, platform: 'instagram', type: 'story', impressions: 21500, engagement: 4800, campaign: 'Summer Collection' },
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-7xl mx-auto px-4 pt-24 pb-10">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
              <p className="text-muted-foreground mt-1">
                Track your campaign performance and audience engagement
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Calendar className="h-4 w-4" />
                Date Range
              </Button>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="3m">Last 3 months</SelectItem>
                  <SelectItem value="6m">Last 6 months</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard
              title="Total Earnings"
              value={analytics.earnings}
              change={analytics.earningsChange}
              icon="money"
              valuePrefix="$"
            />
            <StatsCard
              title="Active Campaigns"
              value={analytics.campaigns}
              change={analytics.campaignsChange}
              icon="campaign"
            />
            <StatsCard
              title="Total Engagement"
              value={analytics.engagement}
              change={analytics.engagementChange}
              icon="engagement"
            />
          </div>

          {/* Performance Metrics */}
          <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
              <div>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                  Key metrics across all your campaigns
                </CardDescription>
              </div>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="discord">Discord</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="w-full h-[300px] animate-pulse bg-primary/5 rounded-md" />
              ) : (
                <div className="h-[300px]">
                  {/* Here you would typically insert a Line chart from recharts */}
                  <div className="text-center text-muted-foreground h-full flex items-center justify-center">
                    Interactive chart will be displayed here
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-primary/5 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Impressions</p>
                  </div>
                  <p className="text-2xl font-semibold">{analytics.impressions.toLocaleString()}</p>
                </div>
                <div className="bg-primary/5 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Clicks</p>
                  </div>
                  <p className="text-2xl font-semibold">{analytics.clicks.toLocaleString()}</p>
                </div>
                <div className="bg-primary/5 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Heart className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Engagement</p>
                  </div>
                  <p className="text-2xl font-semibold">{analytics.engagement.toLocaleString()}</p>
                </div>
                <div className="bg-primary/5 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Followers</p>
                  </div>
                  <p className="text-2xl font-semibold">
                    {analytics.followers.toLocaleString()}
                    <span className="text-sm text-green-500 ml-2">+{analytics.followersGrowth}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance by Platform</CardTitle>
                <CardDescription>
                  How your content performs across different platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {analytics.performanceByPlatform.map((platform, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-medium capitalize">{platform.platform}</h3>
                        <span className="text-xs text-muted-foreground">
                          {(platform.engagement / platform.impressions * 100).toFixed(1)}% engagement
                        </span>
                      </div>
                      <div className="bg-muted h-2 rounded-full">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${(platform.engagement / platform.impressions * 100)}%` }}
                        />
                      </div>
                      <div className="flex gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Impressions:</span>{' '}
                          <span>{platform.impressions.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Engagement:</span>{' '}
                          <span>{platform.engagement.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Clicks:</span>{' '}
                          <span>{platform.clicks.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Content</CardTitle>
                <CardDescription>
                  Your most engaging content pieces
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topPerformingContent.map((content, index) => (
                    <div key={content.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`capitalize font-medium 
                              ${content.platform === 'instagram' ? 'text-pink-500' : 
                               content.platform === 'tiktok' ? 'text-cyan-500' : 'text-muted-foreground'}`}>
                              {content.platform}
                            </span>
                            <span className="text-sm text-muted-foreground capitalize">
                              {content.type}
                            </span>
                          </div>
                          <p className="text-sm mt-1">{content.campaign}</p>
                        </div>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          #{index + 1} Top Content
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <div className="bg-primary/5 p-2 rounded text-center">
                          <p className="text-xs text-muted-foreground">Impressions</p>
                          <p className="font-medium">{content.impressions.toLocaleString()}</p>
                        </div>
                        <div className="bg-primary/5 p-2 rounded text-center">
                          <p className="text-xs text-muted-foreground">Engagement</p>
                          <p className="font-medium">{content.engagement.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}