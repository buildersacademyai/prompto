import { useState, useEffect } from "react";
import Header from "@/components/layout/header";
import AIGenerator from "@/components/ai-generator-new";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, History, Save, Copy, Share, MessageSquarePlus, MoreVerticalIcon, TrashIcon, PencilIcon, ImageIcon, Link2Icon } from "lucide-react";
import { SavedAd } from "@/components/ai-generator-new";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { mockGeneratedAds, loadSampleData } from "@/data/mock-data";

export default function AIGeneratorPage() {
  const { toast } = useToast();
  const [savedAds, setSavedAds] = useState<SavedAd[]>([]);
  
  // Load saved ads from localStorage on component mount
  useEffect(() => {
    // Initialize with sample data if needed
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
  
  // Save ads to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('savedAds', JSON.stringify(savedAds));
  }, [savedAds]);
  
  // Handle saving a new ad
  const handleSaveAd = (newAd: SavedAd) => {
    setSavedAds(prevAds => [newAd, ...prevAds]);
  };
  
  // Handle deleting an ad
  const handleDeleteAd = (adId: string) => {
    setSavedAds(prevAds => prevAds.filter(ad => ad.id !== adId));
    toast({
      title: "Ad deleted",
      description: "The ad has been removed from your saved ads."
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-7xl mx-auto px-4 pt-24 pb-10">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Ads Generator</h1>
              <p className="text-muted-foreground mt-1">
                Create engaging ads for your campaigns using AI
              </p>
            </div>
          </div>

          <Tabs defaultValue="generator" className="w-full">
            <TabsList className="grid grid-cols-2 w-[400px]">
              <TabsTrigger value="generator" className="flex items-center gap-2">
                <MessageSquarePlus className="h-4 w-4" />
                New Ad
              </TabsTrigger>
              <TabsTrigger value="saved" className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Saved Ads
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="generator" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    
                    <CardContent>
                      <AIGenerator className="mt-4" onSave={handleSaveAd} />
                    </CardContent>
                  </Card>
                </div>
                
                <div className="lg:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle>Tips for Better Results</CardTitle>
                      <CardDescription>
                        How to get the most out of the AI generator
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-3">
                        <div className="bg-primary/10 p-2 rounded-full h-fit">
                          <Lightbulb className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Be specific about your product</p>
                          <p className="text-sm text-muted-foreground">
                            Include details about features, benefits, and unique selling points.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="bg-primary/10 p-2 rounded-full h-fit">
                          <Lightbulb className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Describe your target audience</p>
                          <p className="text-sm text-muted-foreground">
                            Specify demographics, interests, and pain points of your ideal customers.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="bg-primary/10 p-2 rounded-full h-fit">
                          <Lightbulb className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Upload relevant images</p>
                          <p className="text-sm text-muted-foreground">
                            Include product photos to help the AI understand your offering better.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="bg-primary/10 p-2 rounded-full h-fit">
                          <Lightbulb className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Specify tone and style</p>
                          <p className="text-sm text-muted-foreground">
                            Indicate whether you want formal, casual, humorous, or serious content.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="saved" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Saved Ads</CardTitle>
                  <CardDescription>
                    Your previously generated and saved ad content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {savedAds.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground mb-4">You haven't saved any ads yet</p>
                      <Button variant="outline" onClick={() => document.querySelector('[data-value="generator"]')?.click()}>
                        Generate New Ad
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {savedAds.map((ad) => (
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
                                  <Copy className="mr-2 h-4 w-4" />
                                  Copy Text
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <ImageIcon className="mr-2 h-4 w-4" />
                                  Download Image
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteAd(ad.id)}>
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
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}