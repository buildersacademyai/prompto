import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { connectPhantomWallet, disconnectPhantomWallet, isPhantomInstalled } from "@/lib/wallet";
import { WalletIcon } from "lucide-react";
import { useState } from "react";

interface WalletConnectButtonProps {
  walletAddress?: string | null;
  className?: string;
}

export default function WalletConnectButton({ walletAddress, className }: WalletConnectButtonProps) {
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleWalletOperation = async () => {
    try {
      setIsConnecting(true);
      
      if (walletAddress) {
        // Disconnect wallet
        await disconnectPhantomWallet();
        toast({
          title: "Wallet disconnected",
          description: "Your wallet has been successfully disconnected.",
        });
      } else {
        // Connect wallet
        if (!isPhantomInstalled()) {
          toast({
            title: "Phantom wallet not found",
            description: "Please install the Phantom wallet extension to connect your wallet.",
            variant: "destructive",
          });
          return;
        }
        
        await connectPhantomWallet();
        toast({
          title: "Wallet connected",
          description: "Your wallet has been successfully connected.",
        });
      }
      
      // Reload to refresh wallet status
      // This is a quick solution; in a production app, you'd use React Query invalidation
      window.location.reload();
    } catch (error) {
      console.error("Wallet operation failed:", error);
      toast({
        title: "Wallet operation failed",
        description: error instanceof Error ? error.message : "Failed to process wallet operation.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      className={`border-primary hover:bg-primary hover:text-white text-primary rounded-full flex items-center ${className}`}
      onClick={handleWalletOperation}
      disabled={isConnecting}
    >
      {isConnecting ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-1.5" />
      ) : (
        <WalletIcon className="mr-1.5 h-4 w-4" />
      )}
      <span>
        {walletAddress 
          ? `${walletAddress.substring(0, 4)}...${walletAddress.substring(walletAddress.length - 4)}` 
          : "Connect Wallet"}
      </span>
    </Button>
  );
}