import { apiRequest } from "./queryClient";

// Connect wallet
export async function connectWallet(walletAddress: string) {
  try {
    const response = await apiRequest("POST", "/api/wallet/connect", {
      walletAddress
    });
    
    return await response.json();
  } catch (error) {
    console.error("Error connecting wallet:", error);
    throw error;
  }
}

// Fund wallet
export async function fundWallet(amount: number) {
  try {
    const response = await apiRequest("POST", "/api/wallet/fund", {
      amount
    });
    
    return await response.json();
  } catch (error) {
    console.error("Error funding wallet:", error);
    throw error;
  }
}

// Withdraw funds
export async function withdrawFunds(amount: number, destination: string) {
  try {
    const response = await apiRequest("POST", "/api/wallet/withdraw", {
      amount,
      destination
    });
    
    return await response.json();
  } catch (error) {
    console.error("Error withdrawing funds:", error);
    throw error;
  }
}

// Get transaction history
export async function getTransactionHistory() {
  try {
    const response = await apiRequest("GET", "/api/wallet/transactions");
    
    return await response.json();
  } catch (error) {
    console.error("Error getting transaction history:", error);
    throw error;
  }
}

// Create an escrow for a campaign
export async function createEscrow(campaignId: number, amount: number) {
  try {
    const response = await apiRequest("POST", "/api/wallet/escrow", {
      campaignId,
      amount
    });
    
    return await response.json();
  } catch (error) {
    console.error("Error creating escrow:", error);
    throw error;
  }
}

// Release funds from escrow
export async function releaseEscrow(escrowId: number) {
  try {
    const response = await apiRequest("POST", `/api/wallet/escrow/${escrowId}/release`);
    
    return await response.json();
  } catch (error) {
    console.error("Error releasing escrow:", error);
    throw error;
  }
}
