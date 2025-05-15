import { 
  users, 
  campaigns, 
  influencers, 
  socialAccounts, 
  wallets, 
  transactions,
  campaignInfluencers,
  type User, 
  type InsertUser, 
  type Campaign, 
  type Influencer,
  type SocialAccount,
  type Wallet,
  type Transaction
} from "@shared/schema";
import session from "express-session";
import { eq, and, ne } from "drizzle-orm";
import createMemoryStore from "memorystore";
import { db } from "./db";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserRole(userId: number, role: string): Promise<User>;
  
  // Session store
  sessionStore: any; // Express session store
  
  // Stats operations
  getCreatorStats(userId: number): Promise<any>;
  getInfluencerStats(userId: number): Promise<any>;
  
  // Campaign operations
  getCampaigns(userId: number): Promise<Campaign[]>;
  getAvailableCampaigns(userId: number): Promise<Campaign[]>;
  pauseCampaign(campaignId: number, userId: number): Promise<Campaign>;
  joinCampaign(campaignId: number, userId: number): Promise<any>;
  
  // Social account operations
  getSocialAccounts(userId: number): Promise<SocialAccount[]>;
  
  // Influencer operations
  getInfluencers(): Promise<Influencer[]>;
  connectWithInfluencer(influencerId: number, userId: number): Promise<any>;
  
  // Wallet operations
  connectWallet(userId: number, walletAddress: string): Promise<any>;
  fundWallet(userId: number, amount: number): Promise<any>;
  withdrawFunds(userId: number, amount: number, destination: string): Promise<any>;
  getTransactions(userId: number): Promise<Transaction[]>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any; // Express session store

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    
    if (user) {
      const wallet = await this.getUserWallet(id);
      return { ...user, wallet };
    }
    
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    
    if (user) {
      const wallet = await this.getUserWallet(user.id);
      return { ...user, wallet };
    }
    
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    
    if (user) {
      const wallet = await this.getUserWallet(user.id);
      return { ...user, wallet };
    }
    
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    
    // Create a wallet for the new user
    const wallet = await this.createWallet(user.id);
    
    return { ...user, wallet };
  }

  async updateUserRole(userId: number, role: string): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ role })
      .where(eq(users.id, userId))
      .returning();
    
    const wallet = await this.getUserWallet(userId);
    
    return { ...updatedUser, wallet };
  }

  // Stats operations
  async getCreatorStats(userId: number): Promise<any> {
    // For now, return mock stats data
    return {
      totalSpend: 2451.80,
      activeCampaigns: 8,
      totalEngagement: 168492,
      spendChange: 12.5,
      campaignsChange: 2,
      engagementChange: 8.3
    };
  }

  async getInfluencerStats(userId: number): Promise<any> {
    // For now, return mock stats data
    return {
      totalEarnings: 1850.25,
      activeCampaigns: 5,
      totalEngagement: 92741,
      earningsChange: 15.7,
      campaignsChange: 1,
      engagementChange: 9.2
    };
  }

  // Campaign operations
  async getCampaigns(userId: number): Promise<Campaign[]> {
    const campaignsList = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.creatorId, userId));
    
    return campaignsList;
  }

  async getAvailableCampaigns(userId: number): Promise<Campaign[]> {
    // Get campaigns not created by the current user and not already joined
    const availableCampaigns = await db
      .select()
      .from(campaigns)
      .where(
        and(
          ne(campaigns.creatorId, userId),
          eq(campaigns.status, 'active')
        )
      );
    
    return availableCampaigns;
  }

  async pauseCampaign(campaignId: number, userId: number): Promise<Campaign> {
    const [campaign] = await db
      .update(campaigns)
      .set({ status: 'paused' })
      .where(
        and(
          eq(campaigns.id, campaignId),
          eq(campaigns.creatorId, userId)
        )
      )
      .returning();
    
    if (!campaign) {
      throw new Error("Campaign not found or you don't have permission to pause it");
    }
    
    return campaign;
  }

  async joinCampaign(campaignId: number, userId: number): Promise<any> {
    // Check if the user has already joined this campaign
    const [existing] = await db
      .select()
      .from(campaignInfluencers)
      .where(
        and(
          eq(campaignInfluencers.campaignId, campaignId),
          eq(campaignInfluencers.influencerId, userId)
        )
      );
    
    if (existing) {
      throw new Error("You have already joined this campaign");
    }
    
    // Join the campaign
    const [joined] = await db
      .insert(campaignInfluencers)
      .values({
        campaignId,
        influencerId: userId,
        status: 'pending',
        joinedAt: new Date()
      })
      .returning();
    
    return joined;
  }

  // Social account operations
  async getSocialAccounts(userId: number): Promise<SocialAccount[]> {
    const accounts = await db
      .select()
      .from(socialAccounts)
      .where(eq(socialAccounts.userId, userId));
    
    return accounts;
  }

  // Influencer operations
  async getInfluencers(): Promise<Influencer[]> {
    const influencersList = await db
      .select()
      .from(influencers);
    
    return influencersList;
  }

  async connectWithInfluencer(influencerId: number, userId: number): Promise<any> {
    // Check if the influencer exists
    const [influencer] = await db
      .select()
      .from(influencers)
      .where(eq(influencers.id, influencerId));
    
    if (!influencer) {
      throw new Error("Influencer not found");
    }
    
    // Return success message
    return { success: true, message: "Connection request sent" };
  }

  // Wallet operations
  private async getUserWallet(userId: number): Promise<Wallet | undefined> {
    const [wallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, userId));
    
    return wallet;
  }

  private async createWallet(userId: number): Promise<Wallet> {
    const [wallet] = await db
      .insert(wallets)
      .values({
        userId,
        balance: 0,
        usdBalance: 0,
        walletAddress: null
      })
      .returning();
    
    return wallet;
  }

  async connectWallet(userId: number, walletAddress: string): Promise<any> {
    // Check if wallet exists
    let wallet = await this.getUserWallet(userId);
    
    if (!wallet) {
      // Create wallet if it doesn't exist
      wallet = await this.createWallet(userId);
    }
    
    // Update wallet with address
    const [updatedWallet] = await db
      .update(wallets)
      .set({ walletAddress })
      .where(eq(wallets.userId, userId))
      .returning();
    
    // Record transaction for wallet connection
    await db
      .insert(transactions)
      .values({
        userId,
        type: 'wallet_connected',
        amount: 0,
        status: 'completed',
        createdAt: new Date(),
        description: `Connected wallet: ${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`
      });
    
    return updatedWallet;
  }

  async fundWallet(userId: number, amount: number): Promise<any> {
    // Get current wallet
    const [wallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, userId));
    
    if (!wallet) {
      throw new Error("Wallet not found");
    }
    
    // Update wallet balance
    const [updatedWallet] = await db
      .update(wallets)
      .set({ 
        balance: wallet.balance + amount,
        usdBalance: wallet.usdBalance + amount
      })
      .where(eq(wallets.userId, userId))
      .returning();
    
    // Record transaction
    await db
      .insert(transactions)
      .values({
        userId,
        type: 'deposit',
        amount,
        status: 'completed',
        createdAt: new Date()
      });
    
    return updatedWallet;
  }

  async withdrawFunds(userId: number, amount: number, destination: string): Promise<any> {
    // Get current wallet
    const [wallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, userId));
    
    if (!wallet) {
      throw new Error("Wallet not found");
    }
    
    if (wallet.balance < amount) {
      throw new Error("Insufficient funds");
    }
    
    // Update wallet balance
    const [updatedWallet] = await db
      .update(wallets)
      .set({ 
        balance: wallet.balance - amount,
        usdBalance: wallet.usdBalance - amount
      })
      .where(eq(wallets.userId, userId))
      .returning();
    
    // Record transaction
    await db
      .insert(transactions)
      .values({
        userId,
        type: 'withdrawal',
        amount,
        destination,
        status: 'completed',
        createdAt: new Date()
      });
    
    return updatedWallet;
  }

  async getTransactions(userId: number): Promise<Transaction[]> {
    const userTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId));
    
    return userTransactions;
  }
}

export const storage = new DatabaseStorage();
