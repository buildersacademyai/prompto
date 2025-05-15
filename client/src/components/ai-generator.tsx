import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { RefreshCcwIcon, CopyIcon, WandSparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface AIGeneratorProps {
  className?: string;
}

interface GeneratedContent {
  text: string;
  suggestedMedia: Array<{
    url: string;
    alt: string;
  }>;
}

export default function AIGenerator({ className }: AIGeneratorProps) {
  const { toast } = useToast();
  const [productDescription, setProductDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [adType, setAdType] = useState("");
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/ai/generate-ad", {
        description: productDescription,
        audience: targetAudience,
        type: adType
      });
      return await res.json();
    },
    onSuccess: (data: GeneratedContent) => {
      setGeneratedContent(data);
      toast({
        title: "Content generated",
        description: "Your AI-generated ad content is ready!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCopyContent = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent.text);
      toast({
        title: "Copied to clipboard",
        description: "Content has been copied to your clipboard.",
      });
    }
  };

  const handleRegenerateContent = () => {
    generateMutation.mutate();
  };

  return (
    <Card className={`bg-card shadow-md ${className}`}>
      <CardHeader className="pb-0 border-b border-border">
        <CardTitle>AI Ad Generator</CardTitle>
        <CardDescription>Create compelling ad copy with Prompto technology</CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Product Description</label>
            <Textarea 
              placeholder="Describe your product or service..."
              className="w-full bg-background border border-border rounded-lg p-3 h-40 focus-visible:ring-1 focus-visible:ring-primary resize-none"
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
            />
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-2">Target Audience</label>
                <Select value={targetAudience} onValueChange={setTargetAudience}>
                  <SelectTrigger className="w-full bg-background border border-border">
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="crypto-enthusiasts">Crypto Enthusiasts</SelectItem>
                    <SelectItem value="defi-users">DeFi Users</SelectItem>
                    <SelectItem value="nft-collectors">NFT Collectors</SelectItem>
                    <SelectItem value="web3-developers">Web3 Developers</SelectItem>
                    <SelectItem value="general">General Audience</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Ad Type</label>
                <Select value={adType} onValueChange={setAdType}>
                  <SelectTrigger className="w-full bg-background border border-border">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="twitter">Twitter Post</SelectItem>
                    <SelectItem value="instagram">Instagram Caption</SelectItem>
                    <SelectItem value="banner">Display Banner</SelectItem>
                    <SelectItem value="website">Website Copy</SelectItem>
                    <SelectItem value="newsletter">Newsletter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              className="mt-4 w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white"
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending || !productDescription || !targetAudience || !adType}
            >
              {generateMutation.isPending ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
              ) : (
                <WandSparkles className="mr-2 h-4 w-4" />
              )}
              Generate Ad Content
            </Button>
          </div>
          
          <div className="bg-background rounded-lg p-4 border border-border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Generated Content</h3>
              <div className="flex space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={handleRegenerateContent}
                  disabled={generateMutation.isPending || !generatedContent}
                >
                  <RefreshCcwIcon className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={handleCopyContent}
                  disabled={!generatedContent}
                >
                  <CopyIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {generatedContent ? (
              <div>
                <div className="space-y-3 whitespace-pre-line">
                  {generatedContent.text.split('\n').map((paragraph, index) => (
                    <p key={index}>
                      {paragraph.split(' ').map((word, wordIndex) => {
                        if (word.startsWith('#')) {
                          return (
                            <Badge key={wordIndex} variant="outline" className="bg-transparent text-accent mr-1">
                              {word}
                            </Badge>
                          );
                        }
                        return <span key={wordIndex}>{word} </span>;
                      })}
                    </p>
                  ))}
                </div>
                
                {generatedContent.suggestedMedia && generatedContent.suggestedMedia.length > 0 && (
                  <div className="mt-6 border-t border-border pt-4">
                    <h4 className="text-sm font-medium mb-2">Suggested Media</h4>
                    <div className="flex space-x-3 overflow-x-auto pb-2">
                      {generatedContent.suggestedMedia.map((media, index) => (
                        <img 
                          key={index}
                          src={media.url} 
                          alt={media.alt} 
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : generateMutation.isPending ? (
              <div className="flex flex-col items-center justify-center h-[240px]">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
                <p className="text-muted-foreground text-sm">Generating creative content...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center h-[240px] text-muted-foreground">
                <WandSparkles className="h-12 w-12 mb-4 opacity-20" />
                <p>Fill in the details and click "Generate" to create ad content with AI.</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
