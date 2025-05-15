import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Wallet, ArrowRightLeft, Clock, DollarSign, CreditCard, Plus, ArrowUpRight } from "lucide-react";
import { Transaction } from "@shared/schema";
import Header from "@/components/layout/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatCompactNumber } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export default function CreatorPaymentsPage() {
  const { toast } = useToast();
  const [amount, setAmount] = useState(100);
  const [withdrawAmount, setWithdrawAmount] = useState(100);
  const [recipient, setRecipient] = useState("");

  const { data: walletInfo, isLoading: isLoadingWallet } = useQuery({
    queryKey: ["/api/creator/wallet"],
    retry: false,
  });

  const { data: transactions = [], isLoading: isLoadingTransactions } = useQuery<Transaction[]>({
    queryKey: ["/api/creator/transactions"],
    retry: false,
  });

  const fundWalletMutation = useMutation({
    mutationFn: async (amount: number) => {
      const res = await apiRequest("POST", "/api/creator/wallet/fund", { amount });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/creator/wallet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/creator/transactions"] });
      toast({
        title: "Wallet funded",
        description: `Successfully added ${formatCurrency(amount)} to your wallet.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to fund wallet",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const withdrawFundsMutation = useMutation({
    mutationFn: async ({ amount, destination }: { amount: number; destination: string }) => {
      const res = await apiRequest("POST", "/api/creator/wallet/withdraw", { amount, destination });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/creator/wallet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/creator/transactions"] });
      toast({
        title: "Withdrawal initiated",
        description: `Successfully withdrew ${formatCurrency(withdrawAmount)}.`,
      });
      setWithdrawAmount(100);
      setRecipient("");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to withdraw funds",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFundWallet = () => {
    if (amount < 10) {
      toast({
        title: "Invalid amount",
        description: "Minimum funding amount is $10.",
        variant: "destructive",
      });
      return;
    }
    fundWalletMutation.mutate(amount);
  };

  const handleWithdraw = () => {
    if (!recipient) {
      toast({
        title: "Recipient required",
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
    withdrawFundsMutation.mutate({ amount: withdrawAmount, destination: recipient });
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
                Manage your campaign funds and transactions
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">Wallet Balance</CardTitle>
                <CardDescription>Your current available funds</CardDescription>
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
                <CardTitle>Fund Management</CardTitle>
                <CardDescription>Add or withdraw funds from your wallet</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="add" className="w-full">
                  <TabsList className="grid grid-cols-2 mb-4">
                    <TabsTrigger value="add">Add Funds</TabsTrigger>
                    <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
                  </TabsList>
                  <TabsContent value="add" className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium leading-none">Amount (USDC)</label>
                        <span className="text-sm text-muted-foreground">Min: $10</span>
                      </div>
                      <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        min={10}
                        placeholder="Enter amount"
                      />
                    </div>
                    <Select defaultValue="card">
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="card">Credit/Debit Card</SelectItem>
                        <SelectItem value="crypto">Crypto Wallet</SelectItem>
                        <SelectItem value="bank">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      className="w-full gap-2" 
                      onClick={handleFundWallet}
                      disabled={fundWalletMutation.isPending}
                    >
                      {fundWalletMutation.isPending ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      Add Funds
                    </Button>
                  </TabsContent>
                  <TabsContent value="withdraw" className="space-y-4">
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
                      <label className="text-sm font-medium leading-none">Recipient Wallet Address</label>
                      <Input
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        placeholder="Enter wallet address"
                      />
                    </div>
                    <Button 
                      className="w-full gap-2" 
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
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Your recent transactions and payment history</CardDescription>
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
                        <div className={`p-2 rounded-full ${transaction.type === 'deposit' ? 'bg-green-500/10' : 'bg-primary/10'}`}>
                          {transaction.type === 'deposit' ? (
                            <Plus className="h-4 w-4 text-green-500" />
                          ) : transaction.type === 'withdrawal' ? (
                            <ArrowUpRight className="h-4 w-4 text-primary" />
                          ) : (
                            <ArrowRightLeft className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {transaction.type === 'deposit' 
                              ? 'Wallet Funding' 
                              : transaction.type === 'withdrawal' 
                                ? 'Withdrawal' 
                                : 'Campaign Payment'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.timestamp).toLocaleDateString()} • 
                            {transaction.status}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${transaction.type === 'deposit' ? 'text-green-500' : 'text-primary'}`}>
                          {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Balance: {formatCurrency(transaction.balanceAfter)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}