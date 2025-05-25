import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("creator"), // creator or influencer
  profileImage: text("profile_image"),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert and Select schemas for users
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Wallet schema
export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  balance: doublePrecision("balance").notNull().default(0),
  usdBalance: doublePrecision("usd_balance").notNull().default(0),
  walletAddress: text("wallet_address"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Transaction schema
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // deposit, withdrawal, payment, wallet_connected, etc.
  amount: doublePrecision("amount").notNull(),
  destination: text("destination"),
  status: text("status").notNull(), // pending, completed, failed
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Campaign schema
export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  status: text("status").notNull().default("active"), // active, paused, completed
  category: text("category").notNull(), // crypto, nft, defi, etc.
  budget: jsonb("budget").notNull(), // { total: number, spent: number }
  engagementRate: doublePrecision("engagement_rate").notNull().default(0),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Campaign-Influencer join table
export const campaignInfluencers = pgTable("campaign_influencers", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull().references(() => campaigns.id),
  influencerId: integer("influencer_id").notNull().references(() => users.id),
  status: text("status").notNull(), // pending, approved, rejected
  performance: jsonb("performance"), // { impressions, clicks, engagement, etc. }
  earnings: doublePrecision("earnings").default(0),
  joinedAt: timestamp("joined_at").notNull(),
});

// Influencer schema
export const influencers = pgTable("influencers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  username: text("username").notNull(),
  profileImageUrl: text("profile_image_url").notNull(),
  bannerUrl: text("banner_url").notNull(),
  verified: boolean("verified").default(false),
  engagementRate: doublePrecision("engagement_rate").notNull(),
  tags: text("tags").array().notNull(),
  socialStats: jsonb("social_stats").notNull(), // Array of { platform, followers }
  createdAt: timestamp("created_at").defaultNow(),
});

// Social Account schema
export const socialAccounts = pgTable("social_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  platform: text("platform").notNull(), // twitter, instagram, tiktok, etc.
  username: text("username").notNull(),
  displayName: text("display_name").notNull(),
  followers: integer("followers").notNull(),
  engagementRate: doublePrecision("engagement_rate").notNull(),
  verified: boolean("verified").default(false),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Generated ads schema
export const generatedAds = pgTable("generated_ads", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  prompt: text("prompt").notNull(),
  generatedText: text("generated_text").notNull(),
  imageUrl: text("image_url").notNull(),
  hashtags: jsonb("hashtags").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  wallets: many(wallets),
  campaigns: many(campaigns),
  socialAccounts: many(socialAccounts),
  generatedAds: many(generatedAds),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  creator: one(users, {
    fields: [campaigns.creatorId],
    references: [users.id],
  }),
  campaignInfluencers: many(campaignInfluencers),
}));

export const campaignInfluencersRelations = relations(campaignInfluencers, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [campaignInfluencers.campaignId],
    references: [campaigns.id],
  }),
  influencer: one(users, {
    fields: [campaignInfluencers.influencerId],
    references: [users.id],
  }),
}));

// Type definitions
export type User = typeof users.$inferSelect & {
  wallet?: Wallet;
};
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Wallet = typeof wallets.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;

export type Campaign = typeof campaigns.$inferSelect & {
  budget: {
    total: number;
    spent: number;
  };
  influencers?: Array<{
    initials: string;
    name: string;
    color: string;
  }>;
};

export type Influencer = typeof influencers.$inferSelect & {
  socialStats: Array<{
    platform: SocialPlatform;
    followers: number;
  }>;
};

export type SocialPlatform = 'twitter' | 'instagram' | 'tiktok' | 'youtube' | 'discord';

export type SocialAccount = typeof socialAccounts.$inferSelect;

export type GeneratedAd = typeof generatedAds.$inferSelect;
export type InsertGeneratedAd = typeof generatedAds.$inferInsert;
