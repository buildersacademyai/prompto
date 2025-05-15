import { useState } from "react";
import Header from "@/components/layout/header";
import AIGenerator from "@/components/ai-generator-new";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, History, Save, Copy, Share, MessageSquarePlus } from "lucide-react";

export default function AIGeneratorPage() {
  const [savedContent, setSavedContent] = useState<
    Array<{ id: string; content: string; date: string }>
  >([
    {
      id: "1",
      content: "Introducing our innovative eco-friendly water bottle, designed with sustainable materials and perfect for your active lifestyle. #ecofriendly #sustainable #fitness",
      date: "May 10, 2025",
    },
    {
      id: "2",
      content: "Elevate your skincare routine with our new organic face serum. Packed with natural ingredients that nourish and revitalize your skin. #skincare #organic #beauty",
      date: "April 28, 2025",
    },
  ]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-7xl mx-auto px-4 pt-24 pb-10">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">AI Content Generator</h1>
              <p className="text-muted-foreground mt-1">
                Create engaging content for your campaigns using AI
              </p>
            </div>
          </div>

          <Tabs defaultValue="generator" className="w-full">
            <TabsList className="grid grid-cols-2 w-[400px]">
              <TabsTrigger value="generator" className="flex items-center gap-2">
                <MessageSquarePlus className="h-4 w-4" />
                New Content
              </TabsTrigger>
              <TabsTrigger value="saved" className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Saved Content
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="generator" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Generate New Ad Content</CardTitle>
                      <CardDescription>
                        Use our AI to create engaging ad copy and campaign content
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <AIGenerator className="mt-4" />
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
                  <CardTitle>Saved Content</CardTitle>
                  <CardDescription>
                    Previously generated and saved content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {savedContent.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground mb-4">You haven't saved any content yet</p>
                      <Button variant="outline">
                        Generate New Content
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {savedContent.map((item) => (
                        <div key={item.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start mb-3">
                            <p className="text-sm text-muted-foreground">Saved on {item.date}</p>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="icon">
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Share className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm">{item.content}</p>
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