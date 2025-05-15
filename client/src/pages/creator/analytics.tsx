import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, LineChart, BarChart, TrendingUp, DollarSign, Users, Zap } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/layout/header";
import StatsCard from "@/components/stats-card";
import { Line, Bar, Pie } from "recharts";
import { formatCurrency, formatPercentage } from "@/lib/utils";

// Sample chart data
const campaignPerformanceData = [
  { date: "Jan", impressions: 4000, clicks: 2400, conversions: 240 },
  { date: "Feb", impressions: 3000, clicks: 1398, conversions: 210 },
  { date: "Mar", impressions: 2000, clicks: 9800, conversions: 290 },
  { date: "Apr", impressions: 2780, clicks: 3908, conversions: 200 },
  { date: "May", impressions: 1890, clicks: 4800, conversions: 218 },
  { date: "Jun", impressions: 2390, clicks: 3800, conversions: 250 },
  { date: "Jul", impressions: 3490, clicks: 4300, conversions: 230 },
];

const budgetData = [
  { name: "Campaign A", value: 4000 },
  { name: "Campaign B", value: 3000 },
  { name: "Campaign C", value: 2000 },
  { name: "Campaign D", value: 2780 },
  { name: "Campaign E", value: 1890 },
];

const influencerPerformanceData = [
  { name: "Influencer A", engagement: 4000 },
  { name: "Influencer B", engagement: 3000 },
  { name: "Influencer C", engagement: 2000 },
  { name: "Influencer D", engagement: 2780 },
  { name: "Influencer E", engagement: 1890 },
];

export default function CreatorAnalyticsPage() {
  const { toast } = useToast();
  const [timeframe, setTimeframe] = useState("30d");

  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/creator/stats", timeframe],
    onError: (error: Error) => {
      toast({
        title: "Error fetching analytics",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Use mock data if API data is not available yet
  const analytics = stats || {
    spent: 5460.50,
    spentChange: 12.5,
    campaigns: 8,
    campaignsChange: 33.3,
    engagement: 246000,
    engagementChange: 8.7,
    impressions: 982500,
    clicks: 49230,
    conversions: 8925,
    ctr: 5.01,
    conversionRate: 18.13,
    roi: 2.4,
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
                Track and analyze your advertising performance
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
              title="Total Spent"
              value={analytics.spent}
              change={analytics.spentChange}
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
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
              <CardDescription>
                Track impressions, clicks, and conversions over time
              </CardDescription>
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
                  <p className="text-sm text-muted-foreground">Impressions</p>
                  <p className="text-2xl font-semibold">{analytics.impressions.toLocaleString()}</p>
                </div>
                <div className="bg-primary/5 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Clicks</p>
                  <p className="text-2xl font-semibold">{analytics.clicks.toLocaleString()}</p>
                </div>
                <div className="bg-primary/5 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">CTR</p>
                  <p className="text-2xl font-semibold">{analytics.ctr}%</p>
                </div>
                <div className="bg-primary/5 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">ROI</p>
                  <p className="text-2xl font-semibold">{analytics.roi}x</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Budget Allocation</CardTitle>
                <CardDescription>
                  How your budget is distributed across campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {/* Here you would typically insert a Pie chart from recharts */}
                  <div className="text-center text-muted-foreground h-full flex items-center justify-center">
                    Budget distribution chart will be displayed here
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Influencer Performance</CardTitle>
                <CardDescription>
                  Engagement metrics by influencer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {/* Here you would typically insert a Bar chart from recharts */}
                  <div className="text-center text-muted-foreground h-full flex items-center justify-center">
                    Influencer performance chart will be displayed here
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}