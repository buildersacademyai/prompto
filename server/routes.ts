import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage as dbStorage } from "./storage";
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
      let user = await dbStorage.getUserByEmail(email);
      console.log("User lookup result:", user ? "User found" : "User not found");
      
      if (!user) {
        // Create new user
        const username = email.split('@')[0] + Math.floor(Math.random() * 10000);
        const tempPassword = randomBytes(16).toString('hex');
        
        // Use imported hashPassword from auth.ts
        const hashedPassword = await hashPassword(tempPassword);
        
        console.log("Creating new user with username:", username);
        user = await dbStorage.createUser({
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
      const { description } = req.body;
      
      if (!description) {
        return res.status(400).json({ message: "Product description is required" });
      }
      
      // Get the uploaded file paths if any
      const files = req.files as Express.Multer.File[];
      const uploadedFiles = files ? files.map(file => file.path) : [];
      
      // Call OpenAI with the description and image paths
      const content = await generateAdContent(description, uploadedFiles);
      
      // Clean up the uploaded files after processing
      uploadedFiles.forEach(filePath => {
        fs.unlink(filePath, (err: NodeJS.ErrnoException | null) => {
          if (err) console.error(`Failed to delete file ${filePath}:`, err);
        });
      });
      
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
      const result = await dbStorage.connectWallet(req.user.id, walletAddress);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/wallet/disconnect", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Use the specific disconnect wallet method 
      const result = await dbStorage.disconnectWallet(req.user.id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/wallet/fund", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { amount } = req.body;
      const result = await dbStorage.fundWallet(req.user.id, amount);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/wallet/withdraw", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { amount, destination } = req.body;
      const result = await dbStorage.withdrawFunds(req.user.id, amount, destination);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/wallet/transactions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const transactions = await dbStorage.getTransactions(req.user.id);
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
