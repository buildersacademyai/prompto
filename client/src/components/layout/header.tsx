import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { WalletIcon, UserIcon, Menu, User2Icon, ChevronDownIcon, LogOutIcon, PlusIcon } from "lucide-react";
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

  return (
    <header className="bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <div className="font-display font-bold text-2xl gradient-text cursor-pointer">
                  DecentralAds
                </div>
              </Link>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/creator">
              <span className={`text-${location === '/creator' ? 'white' : 'gray-300'} hover:text-white px-3 py-2 text-sm font-medium cursor-pointer`}>
                Create Campaign
              </span>
            </Link>
            <Link href="/influencer">
              <span className={`text-${location === '/influencer' ? 'white' : 'gray-300'} hover:text-white px-3 py-2 text-sm font-medium cursor-pointer`}>
                Discover
              </span>
            </Link>
            <a href="#" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium">
              Docs
            </a>
            
            <div className="ml-4 flex items-center">
              <Button 
                variant="outline" 
                className="border-primary hover:bg-primary hover:text-white text-primary rounded-full flex items-center"
              >
                <WalletIcon className="mr-1.5 h-4 w-4" />
                <span>Connect Wallet</span>
              </Button>
              
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
                    <DropdownMenuItem 
                      onClick={() => switchRoleMutation.mutate()}
                      disabled={switchRoleMutation.isPending}
                      className="cursor-pointer"
                    >
                      <User2Icon className="mr-2 h-4 w-4" />
                      <span>Switch to {userRole === 'creator' ? 'Influencer' : 'Creator'} mode</span>
                      {switchRoleMutation.isPending && (
                        <div className="ml-auto h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      )}
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
          
          <div className="flex md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-background p-0">
                <nav className="flex flex-col p-4">
                  <Link href="/creator">
                    <a 
                      className={`px-3 py-2 text-${location === '/creator' ? 'white' : 'gray-300'} hover:text-white font-medium`}
                      onClick={() => setIsOpen(false)}
                    >
                      Create Campaign
                    </a>
                  </Link>
                  <Link href="/influencer">
                    <a 
                      className={`px-3 py-2 text-${location === '/influencer' ? 'white' : 'gray-300'} hover:text-white font-medium`}
                      onClick={() => setIsOpen(false)}
                    >
                      Discover
                    </a>
                  </Link>
                  <a href="#" className="px-3 py-2 text-gray-300 hover:text-white font-medium">
                    Docs
                  </a>
                  
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
                        
                        <Button 
                          variant="outline" 
                          className="w-full justify-between"
                          onClick={() => switchRoleMutation.mutate()}
                          disabled={switchRoleMutation.isPending}
                        >
                          <div className="flex items-center">
                            <User2Icon className="mr-1.5 h-4 w-4" />
                            <span>Switch to {userRole === 'creator' ? 'Influencer' : 'Creator'}</span>
                          </div>
                          {switchRoleMutation.isPending && (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          )}
                        </Button>
                        
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
                        <Button 
                          variant="outline" 
                          className="w-full border-primary hover:bg-primary hover:text-white text-primary"
                          onClick={() => setIsOpen(false)}
                        >
                          <WalletIcon className="mr-1.5 h-4 w-4" />
                          <span>Connect Wallet</span>
                        </Button>
                        
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
