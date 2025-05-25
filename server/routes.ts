import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { generateAdContent, analyzeContentSentiment, generateHashtags, optimizeContent } from "./openai";
// Import hash function to reuse in Google auth
import { hashPassword } from "./auth";
import { randomBytes } from "crypto";
import Stripe from "stripe";
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// We don't need to declare the files interface because it's already included
// in the @types/express package

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
      const { idToken, email, displayName, role } = req.body;

      if (!idToken || !email) {
        console.error("Missing required parameters for Google auth");
        return res.status(400).json({ error: "Missing required authentication parameters" });
      }

      if (!role || !['creator', 'influencer'].includes(role)) {
        console.error("Invalid or missing role parameter");
        return res.status(400).json({ error: "Valid role (creator or influencer) is required" });
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
        
        console.log("Creating new user with username:", username, "and role:", role);
        user = await storage.createUser({
          username,
          email,
          password: hashedPassword,
          profileImage: null,
          role: role, // Use the role provided by client
        });
        console.log("New user created:", user.id, "with role:", user.role);
      } else {
        // User exists but may have different role than requested
        console.log("Existing user role:", user.role, "Requested role:", role);
        if (user.role !== role) {
          console.log("Updating existing user role from", user.role, "to", role);
          user = await storage.updateUserRole(user.id, role);
          console.log("User role updated:", user.id, "new role:", user.role);
        } else {
          console.log("User already has the requested role, no update needed");
        }
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
      // Added mock stats to help frontend development
      const stats = {
        earnings: 1250.75,
        campaigns: 5,
        engagementRate: 3.8,
        earningsChange: 15.7,
        campaignsChange: 1,
        engagementChange: 9.2
      };
      res.json(stats);
    } catch (error: any) {
      console.error("Error getting creator stats:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Influencer routes
  app.get("/api/influencer/stats", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Added mock stats to help frontend development
      const stats = {
        earnings: 870.50,
        campaigns: 3,
        engagementRate: 4.2,
        earningsChange: 12.3,
        campaignsChange: 1,
        engagementChange: 7.8
      };
      res.json(stats);
    } catch (error: any) {
      console.error("Error getting influencer stats:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/influencer/social-accounts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Mock social accounts for frontend development
      const accounts = [
        {
          id: 1,
          userId: req.user.id,
          platform: 'twitter',
          handle: '@influencer1',
          followers: 12500,
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          userId: req.user.id,
          platform: 'instagram',
          handle: 'influencer.official',
          followers: 28700,
          createdAt: new Date().toISOString()
        },
        {
          id: 3,
          userId: req.user.id,
          platform: 'tiktok',
          handle: '@influencer.tiktok',
          followers: 45200,
          createdAt: new Date().toISOString()
        }
      ];
      res.json(accounts);
    } catch (error: any) {
      console.error("Error getting social accounts:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Campaign routes
  app.get("/api/campaigns", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Mock campaigns for frontend development
      const campaigns = [
        {
          id: 1,
          creatorId: req.user.id,
          title: "Summer Fashion Collection",
          description: "Promote our new summer collection with creative posts",
          budget: 1500,
          payPerPost: 150,
          requirements: "1 post, 2 stories, lifestyle photos with products",
          status: "active",
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          creatorId: req.user.id,
          title: "Fitness App Launch",
          description: "Help us promote our new fitness tracking application",
          budget: 2000,
          payPerPost: 200,
          requirements: "2 workout videos using the app, honest review",
          status: "active",
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
          createdAt: new Date().toISOString()
        }
      ];
      res.json(campaigns);
    } catch (error: any) {
      console.error("Error getting campaigns:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/influencer/campaigns", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Mock available campaigns for frontend development
      const campaigns = [
        {
          id: 3,
          creatorId: 1, // Another user
          title: "Natural Skincare Promotion",
          description: "Looking for influencers to promote our organic skincare line",
          budget: 2500,
          payPerPost: 250,
          requirements: "3 Instagram posts showing before/after results",
          status: "active",
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days from now
          createdAt: new Date().toISOString()
        },
        {
          id: 4,
          creatorId: 2, // Another user
          title: "Eco-Friendly Product Launch",
          description: "Help us spread the word about our sustainable household items",
          budget: 1800,
          payPerPost: 180,
          requirements: "2 posts showcasing product use, mention eco benefits",
          status: "active",
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days from now
          createdAt: new Date().toISOString()
        },
        {
          id: 5,
          creatorId: 3, // Another user
          title: "Mobile Game Promotion",
          description: "Seeking influencers to play and review our new mobile game",
          budget: 3000,
          payPerPost: 300,
          requirements: "Gameplay video, honest review, link in bio",
          status: "active",
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
          createdAt: new Date().toISOString()
        }
      ];
      res.json(campaigns);
    } catch (error: any) {
      console.error("Error getting available campaigns:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/campaigns/:id/pause", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const campaignId = parseInt(req.params.id);
      
      // Mock pause campaign functionality
      const campaign = {
        id: campaignId,
        creatorId: req.user.id,
        title: "Summer Fashion Collection",
        description: "Promote our new summer collection with creative posts",
        budget: 1500,
        payPerPost: 150,
        requirements: "1 post, 2 stories, lifestyle photos with products",
        status: "paused", // Status changed to paused
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      };
      
      res.json(campaign);
    } catch (error: any) {
      console.error("Error pausing campaign:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/influencer/campaigns/:id/join", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const campaignId = parseInt(req.params.id);
      
      // Mock join campaign functionality
      const result = {
        success: true,
        message: "Successfully joined campaign",
        campaignId: campaignId,
        influencerId: req.user.id,
        joinedAt: new Date().toISOString()
      };
      
      res.json(result);
    } catch (error: any) {
      console.error("Error joining campaign:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Influencer discovery
  app.get("/api/influencers", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Mock influencers data for frontend development
      const influencers = [
        {
          id: 1,
          username: "fashionista",
          email: "fashion@example.com",
          role: "influencer",
          profileImage: "https://picsum.photos/id/64/200/200",
          bio: "Fashion and lifestyle content creator with 5+ years experience",
          socialStats: {
            followers: 35000,
            engagement: 4.8
          },
          categories: ["fashion", "lifestyle", "beauty"],
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          username: "techreview",
          email: "tech@example.com",
          role: "influencer",
          profileImage: "https://picsum.photos/id/65/200/200",
          bio: "Tech reviewer and gaming enthusiast. Latest gadgets and honest reviews",
          socialStats: {
            followers: 42000,
            engagement: 3.9
          },
          categories: ["technology", "gaming", "electronics"],
          createdAt: new Date().toISOString()
        },
        {
          id: 3,
          username: "foodie_adventures",
          email: "food@example.com",
          role: "influencer",
          profileImage: "https://picsum.photos/id/66/200/200",
          bio: "Food blogger sharing recipes and restaurant reviews",
          socialStats: {
            followers: 28000,
            engagement: 5.2
          },
          categories: ["food", "cooking", "restaurants"],
          createdAt: new Date().toISOString()
        }
      ];
      res.json(influencers);
    } catch (error: any) {
      console.error("Error getting influencers:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/influencers/:id/connect", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const influencerId = parseInt(req.params.id);
      
      // Mock connect with influencer functionality
      const result = {
        success: true,
        message: "Successfully connected with influencer",
        creatorId: req.user.id,
        influencerId: influencerId,
        connectedAt: new Date().toISOString(),
        status: "pending"
      };
      
      res.json(result);
    } catch (error: any) {
      console.error("Error connecting with influencer:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // AI routes with file upload support
  
  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  const multerStorage = multer.diskStorage({
    destination: function (req: Request, file: Express.Multer.File, cb) {
      cb(null, uploadsDir);
    },
    filename: function (req: Request, file: Express.Multer.File, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
  
  const upload = multer({ 
    storage: multerStorage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
      files: 5 // Maximum 5 files
    },
    fileFilter: function (req: Request, file: Express.Multer.File, cb) {
      // Accept images only
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        cb(null, false);
        return;
      }
      cb(null, true);
    }
  });
  
  app.post("/api/ai/generate-ad", upload.array('image', 5), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { title, description } = req.body;
      const userId = req.user!.id;
      
      console.log('🚀 Starting ad generation for user:', userId, 'with title:', title);
      
      if (!description) {
        return res.status(400).json({ message: "Product description is required" });
      }
      
      // Get the uploaded file paths if any
      const files = req.files as Express.Multer.File[];
      const uploadedFiles = files ? files.map(file => file.path) : [];
      
      console.log('📁 Uploaded files count:', uploadedFiles.length);
      
      // Call OpenAI with the title, description and image paths
      console.log('🤖 Calling OpenAI API for content generation...');
      const content = await generateAdContent(description, uploadedFiles, title);
      console.log('✅ OpenAI generation successful, image URL:', content.generatedImageUrl ? 'Generated' : 'None');
      
      // Save the generated ad to database
      const adData = {
        userId: userId,
        title: title || 'Untitled Ad',
        prompt: description,
        generatedText: content.text,
        imageUrl: content.generatedImageUrl,
        hashtags: []
      };
      
      console.log('💾 Saving ad to database...');
      const savedAd = await storage.saveGeneratedAd(adData);
      console.log('🎉 Ad saved successfully with ID:', savedAd.id);
      
      // Clean up the uploaded files after processing
      uploadedFiles.forEach(filePath => {
        fs.unlink(filePath, (err: NodeJS.ErrnoException | null) => {
          if (err) console.error(`Failed to delete file ${filePath}:`, err);
        });
      });
      
      res.json({
        ...content,
        id: savedAd.id,
        saved: true
      });
    } catch (error: any) {
      console.error('❌ Error in ad generation:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Get saved generated ads
  app.get("/api/ai/generated-ads", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user!.id;
      console.log('📋 Fetching saved ads for user:', userId);
      
      const savedAds = await storage.getGeneratedAds(userId);
      console.log('📊 Retrieved', savedAds.length, 'saved ads');
      
      res.json(savedAds);
    } catch (error: any) {
      console.error('❌ Error fetching saved ads:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Delete a generated ad
  app.delete("/api/ai/generated-ads/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const userId = req.user!.id;
    const adId = parseInt(req.params.id);
    
    console.log('🗑️ DELETE REQUEST RECEIVED - Ad ID:', adId, 'User ID:', userId);
    
    if (isNaN(adId)) {
      console.log('❌ Invalid ad ID provided');
      return res.status(400).json({ message: "Invalid ad ID" });
    }
    
    try {
      // Import required modules
      const { db } = require("./db");
      const { generatedAds } = require("@shared/schema");
      const { eq, and } = require("drizzle-orm");
      
      console.log('🔧 Executing database delete operation...');
      
      // Execute the delete operation
      const result = await db
        .delete(generatedAds)
        .where(and(eq(generatedAds.id, adId), eq(generatedAds.userId, userId)))
        .returning();
      
      console.log('📊 Database delete completed. Rows affected:', result.length);
      
      if (result.length > 0) {
        console.log('✅ Ad successfully deleted from database');
        res.json({ message: "Ad deleted successfully" });
      } else {
        console.log('❌ No rows deleted - ad not found or unauthorized');
        res.status(404).json({ message: "Ad not found or unauthorized" });
      }
    } catch (error) {
      console.error('❌ Error in delete operation:', error);
      res.status(500).json({ message: "Internal server error" });
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
  app.get("/api/creator/wallet", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const walletInfo = await storage.getUserWallet(req.user.id);
      res.json({ balance: walletInfo?.balance || 0 });
    } catch (error: any) {
      console.error("Error getting wallet info:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/creator/wallet/fund", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { amount } = req.body;
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      const result = await storage.fundWallet(req.user.id, amount);
      res.json(result);
    } catch (error: any) {
      console.error("Error funding wallet:", error);
      res.status(500).json({ message: error.message });
    }
  });

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
  
  app.post("/api/wallet/disconnect", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Use the specific disconnect wallet method 
      const result = await storage.disconnectWallet(req.user.id);
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
