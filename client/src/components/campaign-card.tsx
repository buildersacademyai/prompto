import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Campaign } from "@shared/schema";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { PauseIcon, MoreVerticalIcon, CheckIcon } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface CampaignCardProps {
  campaign: Campaign;
  influencerView?: boolean;
}

export default function CampaignCard({ campaign, influencerView = false }: CampaignCardProps) {
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  
  // Calculate progress percentages
  const budgetPercentage = (campaign.budget?.spent / (campaign.budget?.total || 1)) * 100 || 0;
  const engagementPercentage = (campaign.engagementRate || 0) * 10; // Scale for progress bar, default to 0 if undefined
  
  const pauseCampaignMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/campaigns/${campaign.id}/pause`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "Campaign paused",
        description: "The campaign has been paused successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const joinCampaignMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/influencer/campaigns/${campaign.id}/join`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/influencer/campaigns"] });
      toast({
        title: "Success",
        description: "You have joined the campaign successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Card 
      className="bg-card overflow-hidden shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="h-40 relative">
        <img 
          src={campaign.imageUrl} 
          alt={campaign.title} 
          className="w-full h-full object-cover"
        />
        <Badge 
          className={`absolute top-3 right-3 bg-secondary text-background text-xs font-medium px-2 py-1 rounded-full`}
        >
          {campaign.status}
        </Badge>
      </div>
      
      <div className="p-5">
        <h3 className="font-semibold text-lg mb-1">{campaign.title}</h3>
        <p className="text-muted-foreground text-sm mb-3">{campaign.description}</p>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-muted-foreground">Budget Spent</p>
            <p className="font-medium">
              {formatCurrency(campaign.budget?.spent || 0)} / {formatCurrency(campaign.budget?.total || 0)}
            </p>
            <div className="w-full bg-background rounded-full h-1.5 mt-1">
              <div 
                className="bg-primary h-1.5 rounded-full" 
                style={{ width: `${budgetPercentage}%` }}
              ></div>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Engagement Rate</p>
            <p className="font-medium">{formatPercentage(campaign.engagementRate || 0)}</p>
            <div className="w-full bg-background rounded-full h-1.5 mt-1">
              <div 
                className="bg-secondary h-1.5 rounded-full" 
                style={{ width: `${engagementPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex -space-x-2">
            {campaign.influencers?.slice(0, 3).map((influencer, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs border-2 border-card ${
                      influencer.color === 'primary' ? 'bg-primary text-white' : 
                      influencer.color === 'secondary' ? 'bg-secondary text-background' : 
                      influencer.color === 'accent' ? 'bg-accent text-background' : 
                      'bg-card text-foreground'
                    }`}
                  >
                    {influencer.initials}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{influencer.name}</p>
                </TooltipContent>
              </Tooltip>
            ))}
            {campaign.influencers && campaign.influencers.length > 3 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-8 h-8 rounded-full bg-card flex items-center justify-center text-xs border-2 border-card">
                    +{campaign.influencers.length - 3}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{campaign.influencers.length - 3} more influencers</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          {influencerView ? (
            <Button 
              className="bg-primary hover:bg-primary/90 text-white text-sm"
              onClick={() => joinCampaignMutation.mutate()}
              disabled={joinCampaignMutation.isPending}
            >
              {joinCampaignMutation.isPending ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>Join</>
              )}
            </Button>
          ) : (
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon"
                className="text-muted-foreground hover:text-foreground mr-1"
                onClick={() => pauseCampaignMutation.mutate()}
                disabled={pauseCampaignMutation.isPending}
              >
                <PauseIcon className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <MoreVerticalIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>View Details</DropdownMenuItem>
                  <DropdownMenuItem>Edit Campaign</DropdownMenuItem>
                  <DropdownMenuItem>View Analytics</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
