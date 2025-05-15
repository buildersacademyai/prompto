import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { generateAdContent, analyzeContentSentiment, generateHashtags, optimizeContent } from "./openai";
// Import hash function to reuse in Google auth
import { hashPassword } from "./auth";
import { randomBytes } from "crypto";
import Stripe from "stripe";

// Initialize Stripe if the secret key is available
const stripeClient = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" as any })
  : null;

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
  
  // Google Authentication endpoint
  app.post("/api/auth/google", async (req, res) => {
    try {
      console.log("Google auth endpoint called with body:", req.body);
      const { idToken, email, displayName } = req.body;

      if (!idToken || !email) {
        console.error("Missing required parameters for Google auth");
        return res.status(400).json({ error: "Missing required authentication parameters" });
      }

      // Normally we would verify the ID token with Firebase Admin
      // For demo purposes, we'll trust the token and email provided by the client
      // In production, you should verify the token with Firebase Admin
      
      // Check if user exists in our system
      console.log("Looking up user by email:", email);
      let user = await storage.getUserByEmail(email);
      console.log("User lookup result:", user ? "User found" : "User not found");
      
      if (!user) {
        // Create new user
        const username = email.split('@')[0] + Math.floor(Math.random() * 10000);
        const tempPassword = randomBytes(16).toString('hex');
        
        // Use imported hashPassword from auth.ts
        const hashedPassword = await hashPassword(tempPassword);
        
        console.log("Creating new user with username:", username);
        user = await storage.createUser({
          username,
          email,
          password: hashedPassword,
          profileImage: null,
          role: "creator", // Default role
        });
        console.log("New user created:", user.id);
      }
      
      // Log the user in manually - this establishes the session
      console.log("Logging in user with passport:", user.id);
      req.login(user, (err) => {
        if (err) {
          console.error("Google auth login error:", err);
          return res.status(500).json({ error: "Failed to log in after Google authentication" });
        }
        
        console.log("Login successful, session established");
        // Return user info with successful session - client doesn't need to call login again
        return res.status(200).json({
          success: true,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
          }
        });
      });
    } catch (error) {
      console.error("Google auth error:", error);
      return res.status(500).json({ error: "Authentication failed" });
    }
  });

  // Creator routes
  app.get("/api/creator/stats", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const stats = await storage.getCreatorStats(req.user.id);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Influencer routes
  app.get("/api/influencer/stats", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const stats = await storage.getInfluencerStats(req.user.id);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/influencer/social-accounts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const accounts = await storage.getSocialAccounts(req.user.id);
      res.json(accounts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Campaign routes
  app.get("/api/campaigns", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const campaigns = await storage.getCampaigns(req.user.id);
      res.json(campaigns);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/influencer/campaigns", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const campaigns = await storage.getAvailableCampaigns(req.user.id);
      res.json(campaigns);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/campaigns/:id/pause", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const campaignId = parseInt(req.params.id);
      const campaign = await storage.pauseCampaign(campaignId, req.user.id);
      res.json(campaign);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/influencer/campaigns/:id/join", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const campaignId = parseInt(req.params.id);
      const result = await storage.joinCampaign(campaignId, req.user.id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Influencer discovery
  app.get("/api/influencers", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const influencers = await storage.getInfluencers();
      res.json(influencers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/influencers/:id/connect", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const influencerId = parseInt(req.params.id);
      const result = await storage.connectWithInfluencer(influencerId, req.user.id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // AI routes
  app.post("/api/ai/generate-ad", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { description, audience, type } = req.body;
      const content = await generateAdContent(description, audience, type);
      res.json(content);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/ai/analyze-content", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { content } = req.body;
      const analysis = await analyzeContentSentiment(content);
      res.json(analysis);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/ai/generate-hashtags", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { content, count } = req.body;
      const hashtags = await generateHashtags(content, count);
      res.json(hashtags);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/ai/optimize-content", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { content, platform, goals } = req.body;
      const optimized = await optimizeContent(content, platform, goals);
      res.json(optimized);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Wallet routes
  app.post("/api/wallet/connect", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { walletAddress } = req.body;
      const result = await storage.connectWallet(req.user.id, walletAddress);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/wallet/fund", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { amount } = req.body;
      const result = await storage.fundWallet(req.user.id, amount);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/wallet/withdraw", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { amount, destination } = req.body;
      const result = await storage.withdrawFunds(req.user.id, amount, destination);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/wallet/transactions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const transactions = await storage.getTransactions(req.user.id);
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", async (req, res) => {
    if (!stripeClient) {
      return res.status(500).json({ message: "Stripe is not configured" });
    }
    
    try {
      const { amount } = req.body;
      const paymentIntent = await stripeClient.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
