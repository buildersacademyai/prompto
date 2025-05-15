import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import WalletConnectButton from "@/components/WalletConnectButton";
import logoImage from "@/assets/logo.png";
import { 
  WalletIcon, 
  UserIcon, 
  Menu, 
  User2Icon, 
  ChevronDownIcon, 
  LogOutIcon, 
  PlusIcon,
  MegaphoneIcon, 
  SparklesIcon, 
  UsersIcon, 
  BarChart3Icon
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logoutMutation } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  const userRole = user?.role || 'creator';

  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  // Removed role switching functionality - users need separate accounts for each role

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

  return (
    <header className="bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <div className="flex items-center gap-2 cursor-pointer">
                  <img src={logoImage} alt="Prompto Logo" className="h-24 w-auto" />
                  
                </div>
              </Link>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            
            <div className="ml-4 flex items-center">
              {user && (
                <WalletConnectButton 
                  walletAddress={user?.wallet?.walletAddress || null}
                />
              )}
              
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-10 w-10 rounded-full ml-2 p-0 relative">
                      <Avatar className="h-9 w-9 border-2 border-border">
                        {user.profileImage && <AvatarImage src={user.profileImage} alt={user.username || 'User'} />}
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {user.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Indicator dot showing user role */}
                      <div className={cn(
                        "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background",
                        userRole === 'creator' ? "bg-primary" : "bg-accent"
                      )} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user.username}</p>
                        <p className="text-xs text-muted-foreground">
                          {userRole === 'creator' ? 'Creator mode' : 'Influencer mode'}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {/* Role switching removed - users need separate accounts for each role */}
                    <DropdownMenuItem 
                      asChild
                      className="cursor-pointer"
                    >
                      <Link href={userRole === 'creator' ? '/creator/campaigns' : '/influencer/campaigns'}>
                        <div className="flex items-center w-full">
                          <MegaphoneIcon className="mr-2 h-4 w-4" />
                          <span>Campaigns</span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      asChild
                      className="cursor-pointer"
                    >
                      <Link href={userRole === 'creator' ? '/creator/ai-generator' : '/influencer/content'}>
                        <div className="flex items-center w-full">
                          <SparklesIcon className="mr-2 h-4 w-4" />
                          <span>{userRole === 'creator' ? 'AI Generator' : 'Content Creation'}</span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      asChild
                      className="cursor-pointer"
                    >
                      <Link href={userRole === 'creator' ? '/creator/influencers' : '/influencer/creators'}>
                        <div className="flex items-center w-full">
                          <UsersIcon className="mr-2 h-4 w-4" />
                          <span>{userRole === 'creator' ? 'Influencers' : 'Creators'}</span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      asChild
                      className="cursor-pointer"
                    >
                      <Link href={userRole === 'creator' ? '/creator/analytics' : '/influencer/analytics'}>
                        <div className="flex items-center w-full">
                          <BarChart3Icon className="mr-2 h-4 w-4" />
                          <span>Analytics</span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      asChild
                      className="cursor-pointer"
                    >
                      <Link href={userRole === 'creator' ? '/creator/payments' : '/influencer/payments'}>
                        <div className="flex items-center w-full">
                          <WalletIcon className="mr-2 h-4 w-4" />
                          <span>Payments</span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="flex justify-between cursor-pointer">
                      <div className="flex items-center">
                        <WalletIcon className="mr-2 h-4 w-4" />
                        <span>Balance: {user?.wallet?.balance?.toFixed(2) || "0.00"} USDC</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => fundWalletMutation.mutate(100)}
                      disabled={fundWalletMutation.isPending}
                      className="cursor-pointer"
                    >
                      <PlusIcon className="mr-2 h-4 w-4" />
                      <span>Fund Wallet</span>
                      {fundWalletMutation.isPending && (
                        <div className="ml-auto h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="text-destructive focus:text-destructive cursor-pointer"
                    >
                      <LogOutIcon className="mr-2 h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/auth">
                  <Button className="ml-3 bg-primary hover:bg-primary/90 text-white rounded-full flex items-center">
                    <UserIcon className="mr-1.5 h-4 w-4" />
                    <span>Sign In</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
          
          <div className="flex items-center md:hidden">
            <Link href="/" className="mr-2">
              <img src={logoImage} alt="Prompto Logo" className="h-8 w-auto" />
            </Link>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-background p-0">
                <nav className="flex flex-col p-4">
                  <Link href={userRole === 'creator' ? '/creator' : '/influencer'}>
                    <span 
                      className={`px-3 py-2 text-${(location === '/creator' || location === '/influencer') ? 'white' : 'gray-300'} hover:text-white font-medium block cursor-pointer`}
                      onClick={() => setIsOpen(false)}
                    >
                      Dashboard
                    </span>
                  </Link>
                  
                  {userRole === 'creator' && (
                    <Link href="/influencers">
                      <span 
                        className={`px-3 py-2 text-${location === '/influencers' ? 'white' : 'gray-300'} hover:text-white font-medium block cursor-pointer`}
                        onClick={() => setIsOpen(false)}
                      >
                        Discover Influencers
                      </span>
                    </Link>
                  )}
                  
                  {userRole === 'influencer' && (
                    <Link href="/campaigns">
                      <span 
                        className={`px-3 py-2 text-${location === '/campaigns' ? 'white' : 'gray-300'} hover:text-white font-medium block cursor-pointer`}
                        onClick={() => setIsOpen(false)}
                      >
                        Discover Campaigns
                      </span>
                    </Link>
                  )}
                  
                  <div className="border-t border-border mt-2 pt-2 space-y-2">
                    {user ? (
                      <>
                        <div className="flex items-center mb-4 p-1">
                          <div className="relative">
                            <Avatar className="h-10 w-10 border-2 border-border">
                              {user.profileImage && <AvatarImage src={user.profileImage} alt={user.username || 'User'} />}
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {user.username?.charAt(0).toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className={cn(
                              "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background",
                              userRole === 'creator' ? "bg-primary" : "bg-accent"
                            )} />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium">{user.username}</p>
                            <p className="text-xs text-muted-foreground">
                              {userRole === 'creator' ? 'Creator' : 'Influencer'} mode
                            </p>
                          </div>
                        </div>
                        
                        {/* Role switching removed - users need separate accounts for each role */}
                        
                        <div className="flex items-center justify-between px-3 py-2">
                          <div className="flex items-center">
                            <WalletIcon className="mr-1.5 h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{user?.wallet?.balance?.toFixed(2) || "0.00"} USDC</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="bg-secondary text-background hover:bg-secondary/90"
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
                        
                        <Button 
                          variant="default" 
                          className="w-full bg-primary hover:bg-primary/90 text-white"
                          onClick={() => {
                            handleLogout();
                            setIsOpen(false);
                          }}
                        >
                          <LogOutIcon className="mr-1.5 h-4 w-4" />
                          <span>Sign Out</span>
                        </Button>
                      </>
                    ) : (
                      <>
                        <WalletConnectButton 
                          walletAddress={null}
                          className="w-full"
                          onClick={() => setIsOpen(false)}
                        />
                        
                        <Link href="/auth">
                          <Button 
                            className="w-full bg-primary hover:bg-primary/90 text-white"
                            onClick={() => setIsOpen(false)}
                          >
                            <UserIcon className="mr-1.5 h-4 w-4" />
                            <span>Sign In</span>
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
