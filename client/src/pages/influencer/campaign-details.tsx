import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Campaign } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeftIcon, CalendarIcon, DollarSignIcon, UsersIcon, TagIcon, CheckIcon } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

export default function CampaignDetails() {
  const { id } = useParams();
  const { toast } = useToast();

  const { data: campaign, isLoading } = useQuery<Campaign>({
    queryKey: [`/api/campaigns/${id}`],
  });

  const joinCampaignMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/campaigns/${id}/join`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/influencer/campaigns"] });
      toast({
        title: "Campaign Joined!",
        description: "You have successfully joined this campaign.",
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded mb-4"></div>
            <div className="h-64 bg-muted rounded mb-6"></div>
            <div className="space-y-4">
              <div className="h-6 bg-muted rounded"></div>
              <div className="h-6 bg-muted rounded"></div>
              <div className="h-6 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Campaign Not Found</h1>
          <p className="text-muted-foreground mb-6">The campaign you're looking for doesn't exist or has been removed.</p>
          <Link href="/influencer/marketplace">
            <Button>
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back to Marketplace
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const budgetPercentage = (campaign.budget?.spent / (campaign.budget?.total || 1)) * 100 || 0;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/influencer/marketplace">
            <Button variant="ghost" className="mb-4">
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back to Marketplace
            </Button>
          </Link>
          <Badge 
            className={`${
              campaign.status === 'active' ? 'bg-green-500' : 
              campaign.status === 'paused' ? 'bg-yellow-500' : 
              'bg-gray-500'
            } text-white`}
          >
            {campaign.status}
          </Badge>
        </div>

        {/* Main Campaign Image */}
        <Card className="overflow-hidden">
          <div className="h-64 relative">
            <img 
              src={campaign.imageUrl || "https://placehold.co/800x300/1E1E1E/9945FF?text=Campaign+Image"} 
              alt={campaign.title} 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "https://placehold.co/800x300/1E1E1E/9945FF?text=Campaign+Image";
              }}
            />
          </div>
        </Card>

        {/* Campaign Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{campaign.title}</CardTitle>
                <CardDescription className="text-base">
                  {campaign.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <TagIcon className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="outline">{campaign.category}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Budget Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSignIcon className="h-5 w-5" />
                  Budget Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Budget Used</span>
                      <span>{Math.round(budgetPercentage)}%</span>
                    </div>
                    <div className="w-full bg-background rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${budgetPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Budget</p>
                      <p className="font-semibold text-lg">{formatCurrency(campaign.budget?.total || 0)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Spent</p>
                      <p className="font-semibold text-lg">{formatCurrency(campaign.budget?.spent || 0)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Campaign Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground text-sm">Start Date</p>
                    <p className="font-medium">{format(new Date(campaign.startDate), "MMM d, yyyy")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">End Date</p>
                    <p className="font-medium">
                      {campaign.endDate ? format(new Date(campaign.endDate), "MMM d, yyyy") : "Ongoing"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Join Campaign */}
            <Card>
              <CardHeader>
                <CardTitle>Join This Campaign</CardTitle>
                <CardDescription>
                  Participate in this campaign and start earning rewards for your engagement.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => joinCampaignMutation.mutate()}
                  disabled={joinCampaignMutation.isPending}
                >
                  <CheckIcon className="mr-2 h-4 w-4" />
                  {joinCampaignMutation.isPending ? "Joining..." : "Join Campaign"}
                </Button>
              </CardContent>
            </Card>

            {/* Participating Influencers */}
            {campaign.influencers && campaign.influencers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UsersIcon className="h-5 w-5" />
                    Participants ({campaign.influencers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {campaign.influencers.slice(0, 5).map((influencer, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div 
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                            influencer.color === 'primary' ? 'bg-primary text-white' : 
                            influencer.color === 'secondary' ? 'bg-secondary text-background' : 
                            influencer.color === 'accent' ? 'bg-accent text-background' : 
                            'bg-muted text-foreground'
                          }`}
                        >
                          {influencer.initials}
                        </div>
                        <span className="text-sm">{influencer.name}</span>
                      </div>
                    ))}
                    {campaign.influencers.length > 5 && (
                      <p className="text-xs text-muted-foreground">
                        +{campaign.influencers.length - 5} more participants
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Campaign Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Engagement Rate</span>
                  <span className="font-medium">{((campaign.engagementRate || 0) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium">{campaign.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="outline">{campaign.status}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}