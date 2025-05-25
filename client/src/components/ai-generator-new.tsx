import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { RefreshCcwIcon, CopyIcon, WandSparkles, UploadIcon, XIcon, BookmarkIcon, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { v4 as uuidv4 } from "uuid";

interface AIGeneratorProps {
  className?: string;
}

interface GeneratedContent {
  text: string;
  generatedImageUrl: string;
  suggestedMedia: Array<{
    url: string;
    alt: string;
  }>;
}

export interface SavedAd {
  id: string;
  title: string;
  prompt: string;
  generatedText: string;
  imageUrl: string;
  date: string;
  hashtags: string[];
}

export default function AIGenerator({ className, onSave }: AIGeneratorProps & { onSave?: (ad: SavedAd) => void }) {
  const { toast } = useToast();
  const [adTitle, setAdTitle] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateMutation = useMutation({
    mutationFn: async () => {
      // Create a FormData object to send files
      const formData = new FormData();
      formData.append("title", adTitle);
      formData.append("description", productDescription);
      
      // Append each file to the FormData
      uploadedImages.forEach((image) => {
        formData.append('image', image);
      });
      
      const res = await fetch("/api/ai/generate-ad", {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to generate content");
      }
      
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      
      // Limit to 5 images maximum
      const totalFiles = [...uploadedImages, ...newFiles];
      if (totalFiles.length > 5) {
        toast({
          title: "Too many images",
          description: "You can upload a maximum of 5 images.",
          variant: "destructive",
        });
        return;
      }
      
      // Create preview URLs for the new images
      const newImageUrls = newFiles.map(file => URL.createObjectURL(file));
      
      setUploadedImages([...uploadedImages, ...newFiles]);
      setImagePreviewUrls([...imagePreviewUrls, ...newImageUrls]);
    }
    
    // Reset the file input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const handleRemoveImage = (index: number) => {
    // Remove the image and its preview URL
    const newImages = [...uploadedImages];
    const newPreviewUrls = [...imagePreviewUrls];
    
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(newPreviewUrls[index]);
    
    newImages.splice(index, 1);
    newPreviewUrls.splice(index, 1);
    
    setUploadedImages(newImages);
    setImagePreviewUrls(newPreviewUrls);
  };

  const handleOpenFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

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
  
  const handleSaveAd = () => {
    if (!generatedContent) return;
    
    // Extract hashtags from generated text
    const hashtags: string[] = [];
    generatedContent.text.split(' ').forEach(word => {
      if (word.startsWith('#')) {
        hashtags.push(word);
      }
    });
    
    const adData: SavedAd = {
      id: uuidv4(),
      title: adTitle || "Untitled Ad",
      prompt: productDescription,
      generatedText: generatedContent.text,
      imageUrl: generatedContent.suggestedMedia.length > 0 
        ? generatedContent.suggestedMedia[0].url 
        : imagePreviewUrls.length > 0 
          ? imagePreviewUrls[0] 
          : "https://images.unsplash.com/photo-1523381210434-271e8be1f52b",
      date: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      hashtags
    };
    
    // Call onSave with the saved ad data
    if (onSave) {
      onSave(adData);
    }
    
    toast({
      title: "Ad saved successfully",
      description: "You can view your saved ad in the dashboard.",
    });
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
            <label className="block text-sm font-medium mb-2">Ad Title</label>
            <Input
              placeholder="Enter a title for your ad..."
              className="w-full bg-background border border-border rounded-lg mb-4"
              value={adTitle}
              onChange={(e) => setAdTitle(e.target.value)}
            />
            
            <label className="block text-sm font-medium mb-2">Ad Description</label>
            <Textarea 
              placeholder="Describe your product or service..."
              className="w-full bg-background border border-border rounded-lg p-3 h-40 focus-visible:ring-1 focus-visible:ring-primary resize-none"
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
            />
            
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Upload Images (Optional)</label>
              <div className="bg-background border border-dashed border-border rounded-lg p-4">
                {/* Hidden file input */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  multiple 
                  onChange={handleFileChange}
                />
                
                {/* Image previews */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {imagePreviewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={url} 
                        alt={`Uploaded image ${index + 1}`} 
                        className="w-16 h-16 object-cover rounded-md border border-border"
                        onError={(e) => {
                          e.currentTarget.src = "https://placehold.co/400x400/1E1E1E/9945FF?text=Image+Error";
                        }}
                      />
                      <button
                        type="button"
                        className="absolute -top-2 -right-2 bg-background border border-border rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <XIcon className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                  
                  {/* Upload button */}
                  {uploadedImages.length < 5 && (
                    <button
                      type="button"
                      onClick={handleOpenFileDialog}
                      className="w-16 h-16 flex flex-col items-center justify-center border border-dashed border-border rounded-md bg-background/50 hover:bg-background/80 transition-colors"
                    >
                      <UploadIcon className="h-5 w-5 text-muted-foreground mb-1" />
                      <span className="text-xs text-muted-foreground">Add</span>
                    </button>
                  )}
                </div>
                
                {/* Help text */}
                <p className="text-xs text-muted-foreground">
                  Upload up to 5 images to enhance your AI-generated content. 
                  {uploadedImages.length > 0 
                    ? ` (${uploadedImages.length}/5 uploaded)`
                    : ' Images will be analyzed for better ad recommendations.'}
                </p>
              </div>
            </div>
            
            <Button 
              className="mt-4 w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white"
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending || !productDescription}
            >
              {generateMutation.isPending ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
              ) : (
                <WandSparkles className="mr-2 h-4 w-4" />
              )}
              Generate Ad
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
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={handleSaveAd}
                  disabled={!generatedContent}
                >
                  <BookmarkIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {generatedContent ? (
              <div>
                {/* Featured Generated Image */}
                {generatedContent.generatedImageUrl ? (
                  <div className="mb-6">
                    <div className="relative">
                      <img 
                        src={generatedContent.generatedImageUrl} 
                        alt={adTitle || "Generated Ad"}
                        className="w-full h-auto max-h-[400px] object-contain rounded-lg border border-border"
                      />
                      <div className="absolute top-3 right-3">
                        <div className="bg-primary/90 text-primary-foreground px-2 py-1 rounded-full text-xs font-medium">
                          AI Generated
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 h-64 bg-muted/50 rounded-lg border border-dashed border-border flex items-center justify-center">
                    <p className="text-muted-foreground text-sm">No image generated</p>
                  </div>
                )}
                

              </div>
            ) : generateMutation.isPending ? (
              <div className="flex flex-col items-center justify-center h-[240px]">
                <div className="relative">
                  <svg className="w-16 h-16" viewBox="0 0 36 36">
                    <path
                      d="m18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray="60, 100"
                      strokeDashoffset="0"
                      strokeLinecap="round"
                      className="animate-spin text-primary"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <p className="text-muted-foreground text-sm mt-4">Generating your ad image...</p>
                <p className="text-muted-foreground text-xs mt-1">This may take 15-20 seconds</p>
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