import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { WalletIcon, UserIcon, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

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
              <a className={`text-${location === '/creator' ? 'white' : 'gray-300'} hover:text-white px-3 py-2 text-sm font-medium`}>
                Create Campaign
              </a>
            </Link>
            <Link href="/influencer">
              <a className={`text-${location === '/influencer' ? 'white' : 'gray-300'} hover:text-white px-3 py-2 text-sm font-medium`}>
                Discover
              </a>
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
                <Button 
                  variant="default" 
                  className="ml-3 bg-primary hover:bg-primary/90 text-white rounded-full flex items-center"
                  onClick={handleLogout}
                >
                  <UserIcon className="mr-1.5 h-4 w-4" />
                  <span>Sign Out</span>
                </Button>
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
                    <Button 
                      variant="outline" 
                      className="w-full border-primary hover:bg-primary hover:text-white text-primary"
                      onClick={() => setIsOpen(false)}
                    >
                      <WalletIcon className="mr-1.5 h-4 w-4" />
                      <span>Connect Wallet</span>
                    </Button>
                    
                    {user ? (
                      <Button 
                        variant="default" 
                        className="w-full bg-primary hover:bg-primary/90 text-white"
                        onClick={() => {
                          handleLogout();
                          setIsOpen(false);
                        }}
                      >
                        <UserIcon className="mr-1.5 h-4 w-4" />
                        <span>Sign Out</span>
                      </Button>
                    ) : (
                      <Link href="/auth">
                        <Button 
                          className="w-full bg-primary hover:bg-primary/90 text-white"
                          onClick={() => setIsOpen(false)}
                        >
                          <UserIcon className="mr-1.5 h-4 w-4" />
                          <span>Sign In</span>
                        </Button>
                      </Link>
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
