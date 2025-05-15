import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Trash2, 
  Link as LinkIcon, 
  Edit2, 
  Check, 
  X, 
  Instagram, 
  Youtube, 
  Settings, 
  RefreshCw,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";
import { SiDiscord, SiTiktok } from "react-icons/si";
import Header from "@/components/layout/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { SocialAccount, SocialPlatform } from "@shared/schema";

export default function InfluencerAccountsPage() {
  const { toast } = useToast();
  const [newAccountUrl, setNewAccountUrl] = useState("");
  const [newAccountUsername, setNewAccountUsername] = useState("");
  const [newAccountPlatform, setNewAccountPlatform] = useState<SocialPlatform>("instagram");
  const [editingAccount, setEditingAccount] = useState<number | null>(null);
  const [editAccountUrl, setEditAccountUrl] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  const { data: accounts = [], isLoading } = useQuery<SocialAccount[]>({
    queryKey: ["/api/influencer/social-accounts"],
    retry: false,
  });

  const addAccountMutation = useMutation({
    mutationFn: async (account: { platform: SocialPlatform; username: string; url: string }) => {
      const res = await apiRequest("POST", "/api/influencer/social-accounts", account);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/influencer/social-accounts"] });
      setNewAccountUrl("");
      setNewAccountUsername("");
      toast({
        title: "Account added",
        description: "Your social media account has been added successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add account",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateAccountMutation = useMutation({
    mutationFn: async ({ id, url }: { id: number; url: string }) => {
      const res = await apiRequest("PATCH", `/api/influencer/social-accounts/${id}`, { url });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/influencer/social-accounts"] });
      setEditingAccount(null);
      toast({
        title: "Account updated",
        description: "Your social media account has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update account",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeAccountMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/influencer/social-accounts/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/influencer/social-accounts"] });
      setShowDeleteConfirm(null);
      toast({
        title: "Account removed",
        description: "Your social media account has been removed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove account",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const syncAccountMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/influencer/social-accounts/${id}/sync`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/influencer/social-accounts"] });
      toast({
        title: "Account synced",
        description: "Your social media account has been synced successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to sync account",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddAccount = () => {
    if (!newAccountUsername.trim()) {
      toast({
        title: "Username required",
        description: "Please enter a valid username.",
        variant: "destructive",
      });
      return;
    }
    if (!newAccountUrl.trim()) {
      toast({
        title: "URL required",
        description: "Please enter a valid URL.",
        variant: "destructive",
      });
      return;
    }
    
    addAccountMutation.mutate({
      platform: newAccountPlatform,
      username: newAccountUsername,
      url: newAccountUrl,
    });
  };

  const startEditing = (account: SocialAccount) => {
    setEditingAccount(account.id);
    setEditAccountUrl(account.url);
  };

  const cancelEditing = () => {
    setEditingAccount(null);
  };

  const saveEditing = (id: number) => {
    if (!editAccountUrl.trim()) {
      toast({
        title: "URL required",
        description: "Please enter a valid URL.",
        variant: "destructive",
      });
      return;
    }
    
    updateAccountMutation.mutate({
      id,
      url: editAccountUrl,
    });
  };

  const confirmDelete = (id: number) => {
    setShowDeleteConfirm(id);
  };

  const handleDelete = (id: number) => {
    removeAccountMutation.mutate(id);
  };

  const handleSync = (id: number) => {
    syncAccountMutation.mutate(id);
  };

  const renderPlatformIcon = (platform: SocialPlatform) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="h-4 w-4 text-pink-500" />;
      case 'tiktok':
        return <SiTiktok className="h-4 w-4 text-cyan-500" />;
      case 'youtube':
        return <Youtube className="h-4 w-4 text-red-500" />;
      case 'discord':
        return <SiDiscord className="h-4 w-4 text-indigo-500" />;
      default:
        return <LinkIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-7xl mx-auto px-4 pt-24 pb-10">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Social Accounts</h1>
              <p className="text-muted-foreground mt-1">
                Connect and manage your social media accounts
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Connected Accounts</CardTitle>
              <CardDescription>
                Your social media accounts connected to the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 w-full animate-pulse bg-primary/5 rounded-md" />
                  ))}
                </div>
              ) : accounts.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LinkIcon className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground mb-4">
                    You haven't connected any social accounts yet
                  </p>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                    Connect your social media accounts to participate in campaigns and track your content performance
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {accounts.map((account) => (
                    <div key={account.id} className="border rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2 rounded-full">
                            {renderPlatformIcon(account.platform)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">@{account.username}</h3>
                              <Badge 
                                variant={account.verified ? "default" : "outline"}
                                className={!account.verified ? "text-muted-foreground" : ""}
                              >
                                {account.verified ? "Verified" : "Unverified"}
                              </Badge>
                            </div>
                            {editingAccount === account.id ? (
                              <div className="flex items-center gap-2 mt-1">
                                <Input 
                                  value={editAccountUrl}
                                  onChange={(e) => setEditAccountUrl(e.target.value)}
                                  className="h-8 text-sm"
                                />
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-green-500"
                                  onClick={() => saveEditing(account.id)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-destructive"
                                  onClick={cancelEditing}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <a 
                                href={account.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-sm text-primary hover:underline"
                              >
                                {account.url}
                              </a>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-auto">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-1"
                            onClick={() => handleSync(account.id)}
                            disabled={syncAccountMutation.isPending}
                          >
                            {syncAccountMutation.isPending ? (
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <RefreshCw className="h-3.5 w-3.5" />
                            )}
                            Sync
                          </Button>
                          
                          {editingAccount !== account.id && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="gap-1"
                              onClick={() => startEditing(account)}
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                              Edit
                            </Button>
                          )}
                          
                          <AlertDialog open={showDeleteConfirm === account.id} onOpenChange={(open) => !open && setShowDeleteConfirm(null)}>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="gap-1 border-destructive/20 text-destructive hover:bg-destructive/10"
                                onClick={() => confirmDelete(account.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Remove
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will remove your {account.platform} account from the platform. 
                                  This account will no longer be eligible for campaigns.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(account.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  {removeAccountMutation.isPending ? (
                                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                                  ) : null}
                                  Remove Account
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      
                      {account.stats && (
                        <div className="grid grid-cols-3 gap-4 mt-4 bg-muted/50 p-3 rounded-lg">
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Followers</p>
                            <p className="font-medium">{account.stats.followers.toLocaleString()}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Avg. Engagement</p>
                            <p className="font-medium">{account.stats.engagement.toLocaleString()}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Engagement Rate</p>
                            <p className="font-medium">{account.stats.engagementRate.toFixed(1)}%</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add New Account</CardTitle>
              <CardDescription>
                Connect a new social media account to your profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Platform</label>
                  <div className="grid grid-cols-4 gap-2">
                    <Button
                      type="button"
                      variant={newAccountPlatform === 'instagram' ? 'default' : 'outline'}
                      size="sm"
                      className="w-full px-2 py-1 h-auto"
                      onClick={() => setNewAccountPlatform('instagram')}
                    >
                      <Instagram className="h-4 w-4 mr-2 text-pink-500" />
                      <span className="sr-only md:not-sr-only md:text-xs">Instagram</span>
                    </Button>
                    <Button
                      type="button"
                      variant={newAccountPlatform === 'tiktok' ? 'default' : 'outline'}
                      size="sm"
                      className="w-full px-2 py-1 h-auto"
                      onClick={() => setNewAccountPlatform('tiktok')}
                    >
                      <SiTiktok className="h-4 w-4 mr-2 text-cyan-500" />
                      <span className="sr-only md:not-sr-only md:text-xs">TikTok</span>
                    </Button>
                    <Button
                      type="button"
                      variant={newAccountPlatform === 'youtube' ? 'default' : 'outline'}
                      size="sm"
                      className="w-full px-2 py-1 h-auto"
                      onClick={() => setNewAccountPlatform('youtube')}
                    >
                      <Youtube className="h-4 w-4 mr-2 text-red-500" />
                      <span className="sr-only md:not-sr-only md:text-xs">YouTube</span>
                    </Button>
                    <Button
                      type="button"
                      variant={newAccountPlatform === 'discord' ? 'default' : 'outline'}
                      size="sm"
                      className="w-full px-2 py-1 h-auto"
                      onClick={() => setNewAccountPlatform('discord')}
                    >
                      <SiDiscord className="h-4 w-4 mr-2 text-indigo-500" />
                      <span className="sr-only md:not-sr-only md:text-xs">Discord</span>
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Profile URL</label>
                  <Input
                    placeholder={`https://${newAccountPlatform}.com/yourusername`}
                    value={newAccountUrl}
                    onChange={(e) => setNewAccountUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Username</label>
                  <Input
                    placeholder="username"
                    value={newAccountUsername}
                    onChange={(e) => setNewAccountUsername(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" />
                Your data is secure and only used for verification
              </div>
              <Button 
                onClick={handleAddAccount}
                disabled={addAccountMutation.isPending}
                className="gap-1.5"
              >
                {addAccountMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Add Account
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>
                Manage how your account data is shared with campaigns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium">Follower Count Visibility</h3>
                    <Badge>Recommended: On</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Allow creators to see your follower count when browsing influencers
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium">Performance Analytics</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Share content performance analytics with campaign creators
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium">Public Profile</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Make your profile discoverable to all creators on the platform
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}