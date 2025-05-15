import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Wallet, ArrowRightLeft, DollarSign, ArrowUpRight, CreditCard, Download } from "lucide-react";
import { Transaction } from "@shared/schema";
import Header from "@/components/layout/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export default function InfluencerPaymentsPage() {
  const { toast } = useToast();
  const [withdrawAmount, setWithdrawAmount] = useState(100);
  const [walletAddress, setWalletAddress] = useState("");

  const { data: walletInfo, isLoading: isLoadingWallet } = useQuery({
    queryKey: ["/api/influencer/wallet"],
    retry: false,
  });

  const { data: transactions = [], isLoading: isLoadingTransactions } = useQuery<Transaction[]>({
    queryKey: ["/api/influencer/transactions"],
    retry: false,
  });

  const { data: earnings = [], isLoading: isLoadingEarnings } = useQuery<any[]>({
    queryKey: ["/api/influencer/earnings"],
    retry: false,
  });

  const withdrawFundsMutation = useMutation({
    mutationFn: async ({ amount, destination }: { amount: number; destination: string }) => {
      const res = await apiRequest("POST", "/api/influencer/wallet/withdraw", { amount, destination });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/influencer/wallet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/influencer/transactions"] });
      toast({
        title: "Withdrawal initiated",
        description: `Successfully withdrew ${formatCurrency(withdrawAmount)}.`,
      });
      setWithdrawAmount(100);
      setWalletAddress("");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to withdraw funds",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleWithdraw = () => {
    if (!walletAddress) {
      toast({
        title: "Wallet address required",
        description: "Please enter a valid wallet address.",
        variant: "destructive",
      });
      return;
    }
    if (withdrawAmount < 10) {
      toast({
        title: "Invalid amount",
        description: "Minimum withdrawal amount is $10.",
        variant: "destructive",
      });
      return;
    }
    if (walletInfo && withdrawAmount > walletInfo.balance) {
      toast({
        title: "Insufficient funds",
        description: "You don't have enough funds to withdraw this amount.",
        variant: "destructive",
      });
      return;
    }
    withdrawFundsMutation.mutate({ amount: withdrawAmount, destination: walletAddress });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-7xl mx-auto px-4 pt-24 pb-10">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
              <p className="text-muted-foreground mt-1">
                Manage your earnings and withdrawals
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">Wallet Balance</CardTitle>
                <CardDescription>Your current available earnings</CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                {isLoadingWallet ? (
                  <div className="h-10 w-32 animate-pulse bg-primary/5 rounded-md" />
                ) : (
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">{formatCurrency(walletInfo?.balance || 0)}</span>
                    <span className="text-muted-foreground">USDC</span>
                  </div>
                )}
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5" />
                    Earning rate: ~{formatCurrency(walletInfo?.earningRate || 0)}/mo
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center border-t pt-4">
                <div className="text-sm text-muted-foreground">Updated just now</div>
                <Button variant="ghost" size="sm" className="gap-1">
                  <ArrowRightLeft className="h-4 w-4" />
                  Refresh
                </Button>
              </CardFooter>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Withdraw Funds</CardTitle>
                <CardDescription>
                  Withdraw your earnings to your wallet
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium leading-none">Amount (USDC)</label>
                    <span className="text-sm text-muted-foreground">
                      Available: {walletInfo ? formatCurrency(walletInfo.balance) : '--'}
                    </span>
                  </div>
                  <Input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                    min={10}
                    max={walletInfo?.balance || 0}
                    placeholder="Enter amount"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Destination Wallet Address</label>
                  <Input
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="Enter wallet address"
                  />
                </div>
                <div className="flex items-center gap-2 text-sm p-2 bg-primary/5 rounded-md">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Withdrawals are processed within 24 hours</p>
                </div>
                <Button 
                  className="w-full gap-2 mt-2" 
                  onClick={handleWithdraw}
                  disabled={withdrawFundsMutation.isPending || !walletInfo?.balance}
                >
                  {withdrawFundsMutation.isPending ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4" />
                  )}
                  Withdraw Funds
                </Button>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="earnings" className="w-full">
            <TabsList className="grid grid-cols-2 w-[300px]">
              <TabsTrigger value="earnings">Earnings</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
            </TabsList>
            <Separator className="my-4" />
            
            <TabsContent value="earnings" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Earnings</CardTitle>
                  <CardDescription>Your earnings from each campaign</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingEarnings ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-20 w-full animate-pulse bg-primary/5 rounded-md" />
                      ))}
                    </div>
                  ) : earnings.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No earnings found</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {earnings.map((earning) => (
                        <div key={earning.id} className="flex flex-col md:flex-row justify-between border-b pb-4">
                          <div className="space-y-1">
                            <h3 className="font-medium">{earning.campaignTitle}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Campaign by: {earning.creatorName}</span>
                              <span>Platform: {earning.platform}</span>
                            </div>
                          </div>
                          <div className="mt-2 md:mt-0 md:text-right">
                            <div className="font-semibold text-lg">
                              {formatCurrency(earning.amount)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {earning.posts} posts • {formatCurrency(earning.amount / earning.posts)} per post
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full gap-1.5">
                    <Download className="h-4 w-4" />
                    Download Earnings Report
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="transactions" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>Your withdrawal and payment history</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingTransactions ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 w-full animate-pulse bg-primary/5 rounded-md" />
                      ))}
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No transactions found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {transactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${transaction.type === 'payment' ? 'bg-green-500/10' : 'bg-primary/10'}`}>
                              {transaction.type === 'payment' ? (
                                <DollarSign className="h-4 w-4 text-green-500" />
                              ) : (
                                <ArrowUpRight className="h-4 w-4 text-primary" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">
                                {transaction.type === 'payment' 
                                  ? 'Campaign Payment' 
                                  : 'Withdrawal'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(transaction.createdAt || 0).toLocaleDateString()} • 
                                {transaction.status}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-medium ${transaction.type === 'payment' ? 'text-green-500' : 'text-primary'}`}>
                              {transaction.type === 'payment' ? '+' : '-'}{formatCurrency(transaction.amount)}
                            </p>
                            {transaction.description && (
                              <p className="text-sm text-muted-foreground">
                                {transaction.description}
                              </p>
                            )}
                          </div>
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