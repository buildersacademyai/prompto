import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Send, 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  Copy, 
  Check, 
  RefreshCw,
  BarChart,
  Tag,
  Share,
  Save,
  MessageCircle
} from "lucide-react";
import { Campaign } from "@shared/schema";
import Header from "@/components/layout/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { generateHashtags, optimizeContent, analyzeContentPerformance } from "@/lib/openai";

export default function InfluencerContentPage() {
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviewUrls, setMediaPreviewUrls] = useState<string[]>([]);
  const [campaignId, setCampaignId] = useState<string>("");
  const [platform, setPlatform] = useState<string>("instagram");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [isGeneratingHashtags, setIsGeneratingHashtags] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [contentMetrics, setContentMetrics] = useState<any>(null);

  const { data: campaigns = [] } = useQuery<Campaign[]>({
    queryKey: ["/api/influencer/campaigns"],
  });

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      if (mediaFiles.length + newFiles.length > 4) {
        toast({
          title: "Too many files",
          description: "You can upload a maximum of 4 media files.",
          variant: "destructive",
        });
        return;
      }
      
      setMediaFiles([...mediaFiles, ...newFiles]);
      
      // Create preview URLs
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      setMediaPreviewUrls([...mediaPreviewUrls, ...newPreviewUrls]);
    }
  };

  const removeMedia = (index: number) => {
    const updatedFiles = [...mediaFiles];
    const updatedPreviewUrls = [...mediaPreviewUrls];
    
    // Release the object URL to avoid memory leaks
    URL.revokeObjectURL(updatedPreviewUrls[index]);
    
    updatedFiles.splice(index, 1);
    updatedPreviewUrls.splice(index, 1);
    
    setMediaFiles(updatedFiles);
    setMediaPreviewUrls(updatedPreviewUrls);
  };

  const copyContent = () => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: "Content copied to clipboard successfully.",
    });
  };

  const clearContent = () => {
    setContent("");
    setMediaFiles([]);
    setMediaPreviewUrls([]);
    setHashtags([]);
  };

  const generateHashtagsForContent = async () => {
    if (!content) {
      toast({
        title: "Content required",
        description: "Please write some content before generating hashtags.",
        variant: "destructive",
      });
      return;
    }
    
    setIsGeneratingHashtags(true);
    try {
      const tags = await generateHashtags(content, 8);
      setHashtags(tags || []);
      toast({
        title: "Hashtags generated",
        description: "Relevant hashtags have been generated for your content.",
      });
    } catch (error) {
      toast({
        title: "Failed to generate hashtags",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingHashtags(false);
    }
  };

  const optimizeContentForPlatform = async () => {
    if (!content) {
      toast({
        title: "Content required",
        description: "Please write some content to optimize.",
        variant: "destructive",
      });
      return;
    }
    
    setIsOptimizing(true);
    try {
      const result = await optimizeContent(content, platform);
      if (result?.content) {
        setContent(result.content);
        toast({
          title: "Content optimized",
          description: `Content has been optimized for ${platform}.`,
        });
      }
    } catch (error) {
      toast({
        title: "Optimization failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const analyzeContent = async () => {
    if (!content) {
      toast({
        title: "Content required",
        description: "Please write some content to analyze.",
        variant: "destructive",
      });
      return;
    }
    
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeContentPerformance(content);
      setContentMetrics(analysis);
      toast({
        title: "Content analyzed",
        description: "Your content has been analyzed for performance metrics.",
      });
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveContent = () => {
    if (!content) {
      toast({
        title: "Content required",
        description: "Please write some content to save.",
        variant: "destructive",
      });
      return;
    }
    
    // Here you would typically save to the API
    toast({
      title: "Content saved",
      description: "Your content has been saved as a draft.",
    });
  };

  const shareContent = () => {
    if (!content) {
      toast({
        title: "Content required",
        description: "Please write some content to share.",
        variant: "destructive",
      });
      return;
    }
    
    // This would be replaced with actual sharing functionality
    toast({
      title: "Ready to share",
      description: "Your content is ready to be shared to your social platforms.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-7xl mx-auto px-4 pt-24 pb-10">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Content Creation</h1>
              <p className="text-muted-foreground mt-1">
                Create, optimize, and share campaign content
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create Content</CardTitle>
                  <CardDescription>
                    Write content for your selected campaign and platform
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Campaign</label>
                      <Select value={campaignId} onValueChange={setCampaignId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a campaign" />
                        </SelectTrigger>
                        <SelectContent>
                          {campaigns.map((campaign) => (
                            <SelectItem key={campaign.id} value={campaign.id.toString()}>
                              {campaign.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Platform</label>
                      <Select value={platform} onValueChange={setPlatform}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="tiktok">TikTok</SelectItem>
                          <SelectItem value="youtube">YouTube</SelectItem>
                          <SelectItem value="discord">Discord</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Content</label>
                    <Textarea
                      placeholder="Write your content here..."
                      className="min-h-[120px]"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Media</label>
                      <p className="text-xs text-muted-foreground">
                        {mediaFiles.length}/4 files
                      </p>
                    </div>
                    {mediaPreviewUrls.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {mediaPreviewUrls.map((url, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={url} 
                              alt={`Preview ${index}`} 
                              className="h-32 w-full object-cover rounded-md border border-border" 
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeMedia(index)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-border rounded-md p-6 text-center">
                        <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Drag and drop or click to upload media
                        </p>
                        <label htmlFor="media-upload">
                          <Button type="button" variant="outline" className="gap-2">
                            <Upload className="h-4 w-4" />
                            Upload Media
                          </Button>
                          <input 
                            type="file" 
                            id="media-upload" 
                            multiple 
                            className="sr-only" 
                            accept="image/*,video/*" 
                            onChange={handleMediaUpload}
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Hashtags</label>
                      <Button 
                        type="button" 
                        variant="link" 
                        size="sm" 
                        className="px-0 h-auto text-primary"
                        onClick={generateHashtagsForContent}
                        disabled={isGeneratingHashtags}
                      >
                        {isGeneratingHashtags ? (
                          <>
                            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Tag className="h-3 w-3 mr-1" />
                            Generate Hashtags
                          </>
                        )}
                      </Button>
                    </div>
                    {hashtags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {hashtags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        Generate or add custom hashtags for your content
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex-col space-y-4">
                  <div className="flex flex-wrap gap-2 w-full">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="gap-1"
                      onClick={copyContent}
                    >
                      <Copy className="h-4 w-4" />
                      Copy
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="gap-1 text-destructive border-destructive/20 hover:bg-destructive/10"
                      onClick={clearContent}
                    >
                      <Trash2 className="h-4 w-4" />
                      Clear
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="gap-1 ml-auto"
                      onClick={optimizeContentForPlatform}
                      disabled={isOptimizing}
                    >
                      {isOptimizing ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      Optimize for {platform}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="gap-1"
                      onClick={analyzeContent}
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <BarChart className="h-4 w-4" />
                      )}
                      Analyze
                    </Button>
                  </div>
                  <Separator />
                  <div className="flex justify-between w-full">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={saveContent}
                      className="gap-1"
                    >
                      <Save className="h-4 w-4" />
                      Save Draft
                    </Button>
                    <Button 
                      type="button" 
                      onClick={shareContent}
                      className="gap-1"
                    >
                      <Share className="h-4 w-4" />
                      Share Content
                    </Button>
                  </div>
                </CardFooter>
              </Card>

              {contentMetrics && (
                <Card>
                  <CardHeader>
                    <CardTitle>Content Analysis</CardTitle>
                    <CardDescription>
                      AI-powered analysis of your content performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-primary/10 p-4 rounded-lg text-center">
                        <p className="text-sm text-muted-foreground mb-1">Sentiment</p>
                        <p className="text-2xl font-semibold">
                          {contentMetrics.sentiment.toFixed(1)}/10
                        </p>
                      </div>
                      <div className="bg-primary/10 p-4 rounded-lg text-center">
                        <p className="text-sm text-muted-foreground mb-1">Engagement</p>
                        <p className="text-2xl font-semibold">
                          {contentMetrics.engagement.toFixed(1)}/10
                        </p>
                      </div>
                      <div className="bg-primary/10 p-4 rounded-lg text-center">
                        <p className="text-sm text-muted-foreground mb-1">Overall Score</p>
                        <p className="text-2xl font-semibold">
                          {((contentMetrics.sentiment + contentMetrics.engagement) / 2).toFixed(1)}/10
                        </p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-2">Suggestions</h3>
                      <ul className="space-y-2">
                        {contentMetrics.suggestions.map((suggestion: string, index: number) => (
                          <li key={index} className="flex gap-2">
                            <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Guidelines</CardTitle>
                  <CardDescription>
                    Requirements for the selected campaign
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {campaignId ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium mb-1">Campaign Brief</h3>
                        <p className="text-sm text-muted-foreground">
                          {campaigns.find(c => c.id.toString() === campaignId)?.description || 
                            "No description available"}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium mb-1">Key Messaging</h3>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                          <li>Highlight the eco-friendly aspects of the product</li>
                          <li>Emphasize sustainable practices</li>
                          <li>Showcase the product in daily use</li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium mb-1">Do's and Don'ts</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-green-500 mb-1">Do's</p>
                            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                              <li>Show product in use</li>
                              <li>Tag the brand</li>
                              <li>Use provided hashtags</li>
                            </ul>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-destructive mb-1">Don'ts</p>
                            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                              <li>Mention competitors</li>
                              <li>Use misleading claims</li>
                              <li>Post without approval</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <MessageCircle className="h-10 w-10 mx-auto mb-2 opacity-20" />
                      <p>Select a campaign to view guidelines</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Content Ideas</CardTitle>
                  <CardDescription>
                    Inspiration for your campaign content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-primary/5 rounded-lg">
                      <p className="text-sm">
                        "Show how the product fits into your daily routine with a morning unboxing video"
                      </p>
                    </div>
                    <div className="p-3 bg-primary/5 rounded-lg">
                      <p className="text-sm">
                        "Create a before/after comparison demonstrating the product benefits"
                      </p>
                    </div>
                    <div className="p-3 bg-primary/5 rounded-lg">
                      <p className="text-sm">
                        "Share a personal story about why you connect with the brand's mission"
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}