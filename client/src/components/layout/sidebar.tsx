import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { 
  LayoutDashboardIcon, 
  MegaphoneIcon, 
  SparklesIcon, 
  UsersIcon, 
  BarChart3Icon, 
  WalletIcon, 
  User2Icon,
  PlusIcon
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  userRole: 'creator' | 'influencer';
}

export default function Sidebar({ activeTab, userRole }: SidebarProps) {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  const switchRoleMutation = useMutation({
    mutationFn: async () => {
      const newRole = userRole === 'creator' ? 'influencer' : 'creator';
      const res = await apiRequest("POST", "/api/user/switch-role", { role: newRole });
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      // Redirect to the appropriate dashboard
      const newPath = data.role === 'creator' ? '/creator' : '/influencer';
      setLocation(newPath);
      
      toast({
        title: "Role switched",
        description: `You are now in ${data.role} mode.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error switching role",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const fundWalletMutation = useMutation({
    mutationFn: async (amount: number) => {
      const res = await apiRequest("POST", "/api/wallet/fund", { amount });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Wallet funded",
        description: "Your wallet has been funded successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Funding failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Navigation items based on role
  const navItems = [
    {
      name: "Dashboard",
      icon: <LayoutDashboardIcon className="text-xl mr-3" />,
      path: userRole === 'creator' ? '/creator' : '/influencer',
      active: activeTab === 'dashboard'
    },
    {
      name: "Campaigns",
      icon: <MegaphoneIcon className="text-xl mr-3" />,
      path: userRole === 'creator' ? '/creator/campaigns' : '/influencer/campaigns',
      active: activeTab === 'campaigns'
    },
    {
      name: userRole === 'creator' ? "AI Generator" : "Content Creation",
      icon: <SparklesIcon className="text-xl mr-3" />,
      path: userRole === 'creator' ? '/creator/ai-generator' : '/influencer/content',
      active: activeTab === 'ai-generator' || activeTab === 'content'
    },
    {
      name: userRole === 'creator' ? "Influencers" : "Creators",
      icon: <UsersIcon className="text-xl mr-3" />,
      path: userRole === 'creator' ? '/creator/influencers' : '/influencer/creators',
      active: activeTab === 'influencers' || activeTab === 'creators'
    },
    {
      name: "Analytics",
      icon: <BarChart3Icon className="text-xl mr-3" />,
      path: userRole === 'creator' ? '/creator/analytics' : '/influencer/analytics',
      active: activeTab === 'analytics'
    },
    {
      name: "Payments",
      icon: <WalletIcon className="text-xl mr-3" />,
      path: userRole === 'creator' ? '/creator/payments' : '/influencer/payments',
      active: activeTab === 'payments'
    }
  ];

  return (
    <aside className="bg-background border-r border-border hidden lg:block">
      <div className="h-full flex flex-col">
        <div className="px-4 py-6">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center">
              {user?.profileImage ? (
                <img 
                  src={user.profileImage} 
                  alt={user?.username || "User"} 
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <User2Icon className="text-xl text-muted-foreground" />
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{user?.username || "Guest User"}</p>
              <p className="text-xs text-muted-foreground">
                Switch to{' '}
                <button 
                  className="text-accent hover:underline"
                  onClick={() => switchRoleMutation.mutate()}
                  disabled={switchRoleMutation.isPending}
                >
                  {userRole === 'creator' ? 'Influencer' : 'Creator'} mode
                </button>
              </p>
            </div>
          </div>
          
          <nav className="space-y-1">
            {navItems.map((item, index) => (
              <Link key={index} href={item.path}>
                <a className={cn(
                  "flex items-center px-3 py-2.5 rounded-lg group",
                  item.active 
                    ? "bg-primary bg-opacity-10 text-primary" 
                    : "text-muted-foreground hover:text-foreground hover:bg-card"
                )}>
                  {item.icon}
                  <span className={item.active ? "font-medium" : ""}>{item.name}</span>
                </a>
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="mt-auto p-4 border-t border-border">
          <div className="gradient-border p-4">
            <h4 className="font-medium text-sm mb-2">Your Balance</h4>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-bold font-display">
                  {user?.wallet?.balance?.toFixed(2) || "0.00"} USDC
                </p>
                <p className="text-xs text-muted-foreground">
                  ≈ ${user?.wallet?.usdBalance?.toFixed(2) || "0.00"} USD
                </p>
              </div>
              <Button 
                className="bg-secondary text-background hover:bg-secondary/90 rounded-lg px-3 py-1.5 text-sm font-medium"
                onClick={() => fundWalletMutation.mutate(100)}
                disabled={fundWalletMutation.isPending}
              >
                {fundWalletMutation.isPending ? (
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-background border-t-transparent mr-1" />
                ) : (
                  <PlusIcon className="h-3 w-3 mr-1" />
                )}
                Fund
              </Button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
