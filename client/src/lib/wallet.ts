import { apiRequest } from "./queryClient";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";

// Solana connection
export const connection = new Connection(clusterApiUrl("devnet"));

// Check if Phantom wallet is available
export function isPhantomInstalled(): boolean {
  const phantom = window?.phantom?.solana;
  return !!phantom?.isPhantom;
}

// Connect to Phantom wallet
export async function connectPhantomWallet() {
  try {
    if (!isPhantomInstalled()) {
      throw new Error("Phantom wallet is not installed");
    }

    const provider = window.phantom?.solana;
    if (!provider) {
      throw new Error("Phantom provider not found");
    }
    const response = await provider.connect();
    const publicKey = response.publicKey.toString();
    
    // Also register the wallet with our backend
    const apiResponse = await apiRequest("POST", "/api/wallet/connect", {
      walletAddress: publicKey
    });
    
    return {
      publicKey,
      ...await apiResponse.json()
    };
  } catch (error) {
    console.error("Error connecting Phantom wallet:", error);
    throw error;
  }
}

// Connect wallet (legacy method)
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
