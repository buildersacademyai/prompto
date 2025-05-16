import { Campaign, Influencer } from "@shared/schema";
import { SavedAd } from "@/components/ai-generator-new";
import { v4 as uuidv4 } from "uuid";

// Helper to create date strings for different time periods
const createDateString = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

// Sample Hashtags for Generated Ads
const fashionHashtags = ['#Fashion', '#Style', '#Trendy', '#OOTD', '#Sustainable'];
const techHashtags = ['#Tech', '#Innovation', '#SmartLiving', '#IoT', '#EnergyEfficient'];
const foodHashtags = ['#FoodLovers', '#Delicious', '#HealthyEating', '#OrganicFood', '#ChefApproved'];
const travelHashtags = ['#TravelGoals', '#Adventure', '#Wanderlust', '#Explore', '#Views'];
const fitnessHashtags = ['#FitnessGoals', '#HealthyLifestyle', '#Workout', '#GymLife', '#Motivation'];

// Generated Ads Data
export const mockGeneratedAds: SavedAd[] = [
  {
    id: uuidv4(),
    title: "Summer Fashion Collection",
    prompt: "Create a vibrant summer fashion collection ad for young adults featuring sustainable materials.",
    generatedText: "Introducing our eco-conscious Summer Collection. Made with 100% sustainable materials, this vibrant lineup gives you style without compromise. Perfect for the eco-conscious trendsetter looking to make a statement while making a difference.",
    imageUrl: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b",
    date: createDateString(5),
    hashtags: fashionHashtags.slice(0, 3),
  },
  {
    id: uuidv4(),
    title: "Smart Home Ecosystem",
    prompt: "Generate an ad for smart home devices that emphasize energy efficiency and ease of use.",
    generatedText: "Transform your living space with our Smart Home ecosystem. Control everything with a tap, save on energy bills, and enjoy the comfort of true automation. Your future home is here today.",
    imageUrl: "https://images.unsplash.com/photo-1558002038-648415d93022",
    date: createDateString(8),
    hashtags: techHashtags.slice(0, 3),
  },
  {
    id: uuidv4(),
    title: "Organic Food Delivery",
    prompt: "Create an ad for a weekly organic food delivery subscription service focusing on farm-to-table freshness.",
    generatedText: "Experience farm-to-table perfection with our weekly organic food delivery. Locally sourced, always fresh, and delivered straight to your door. Taste the difference that organic makes with every bite.",
    imageUrl: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce",
    date: createDateString(12),
    hashtags: foodHashtags.slice(0, 3),
  },
  {
    id: uuidv4(),
    title: "Adventure Travel Package",
    prompt: "Create an ad for an adventure travel package to mountainous regions with emphasis on nature and sustainability.",
    generatedText: "Embark on the adventure of a lifetime with our eco-conscious mountain expeditions. Breathtaking views, thrilling activities, and sustainable travel practices that protect the beautiful destinations you'll explore.",
    imageUrl: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606",
    date: createDateString(15),
    hashtags: travelHashtags.slice(0, 3),
  },
  {
    id: uuidv4(),
    title: "Fitness Tracker Pro",
    prompt: "Create an ad for a premium fitness tracker with advanced health monitoring features.",
    generatedText: "Meet your fitness goals with the new Tracker Pro. Advanced health monitoring, personalized coaching, and sleek design make this the ultimate companion for your wellness journey. Track, improve, achieve.",
    imageUrl: "https://images.unsplash.com/photo-1510771463146-e89e6e86560e",
    date: createDateString(20),
    hashtags: fitnessHashtags.slice(0, 3),
  }
];

// Campaigns Data
export const mockCampaigns: Campaign[] = [
  {
    id: 1,
    creatorId: 2,
    title: "Summer Fashion Collection",
    description: "Promoting our new sustainable summer fashion line targeting eco-conscious consumers",
    status: "active",
    budget: {
      total: 5000,
      spent: 2750
    },
    goal: "brand_awareness",
    targetAudience: "young_adults",
    startDate: new Date(new Date().setDate(new Date().getDate() - 10)),
    endDate: new Date(new Date().setDate(new Date().getDate() + 20)),
    platforms: ["instagram", "tiktok"],
    createdAt: new Date(new Date().setDate(new Date().getDate() - 15)),
    updatedAt: new Date(),
    influencers: [
      { 
        initials: "JD", 
        name: "Jane Doe", 
        color: "bg-purple-500" 
      },
      { 
        initials: "MS", 
        name: "Mark Smith", 
        color: "bg-green-500" 
      }
    ],
    metrics: {
      impressions: 145000,
      engagement: 12500,
      clicks: 8700,
      conversions: 350
    }
  },
  {
    id: 2,
    creatorId: 2,
    title: "Smart Home Innovation",
    description: "Highlighting our latest smart home devices with focus on energy efficiency",
    status: "active",
    budget: {
      total: 7500,
      spent: 3200
    },
    goal: "sales",
    targetAudience: "homeowners",
    startDate: new Date(new Date().setDate(new Date().getDate() - 5)),
    endDate: new Date(new Date().setDate(new Date().getDate() + 25)),
    platforms: ["youtube", "instagram"],
    createdAt: new Date(new Date().setDate(new Date().getDate() - 8)),
    updatedAt: new Date(),
    influencers: [
      { 
        initials: "AR", 
        name: "Alex Rodriguez", 
        color: "bg-blue-500" 
      }
    ],
    metrics: {
      impressions: 98000,
      engagement: 8500,
      clicks: 6200,
      conversions: 420
    }
  },
  {
    id: 3,
    creatorId: 2,
    title: "Organic Food Subscription",
    description: "Promoting our weekly organic food delivery service with farm-to-table freshness",
    status: "scheduled",
    budget: {
      total: 4000,
      spent: 0
    },
    goal: "leads",
    targetAudience: "health_conscious",
    startDate: new Date(new Date().setDate(new Date().getDate() + 5)),
    endDate: new Date(new Date().setDate(new Date().getDate() + 35)),
    platforms: ["instagram", "facebook"],
    createdAt: new Date(new Date().setDate(new Date().getDate() - 3)),
    updatedAt: new Date(),
    influencers: [],
    metrics: {
      impressions: 0,
      engagement: 0,
      clicks: 0,
      conversions: 0
    }
  },
  {
    id: 4,
    creatorId: 2,
    title: "Fitness Challenge",
    description: "30-day fitness challenge campaign promoting our new workout app and equipment",
    status: "completed",
    budget: {
      total: 6000,
      spent: 6000
    },
    goal: "app_downloads",
    targetAudience: "fitness_enthusiasts",
    startDate: new Date(new Date().setDate(new Date().getDate() - 40)),
    endDate: new Date(new Date().setDate(new Date().getDate() - 10)),
    platforms: ["instagram", "youtube", "tiktok"],
    createdAt: new Date(new Date().setDate(new Date().getDate() - 45)),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 10)),
    influencers: [
      { 
        initials: "FG", 
        name: "Fitness Guru", 
        color: "bg-red-500" 
      },
      { 
        initials: "WP", 
        name: "Wellness Pro", 
        color: "bg-yellow-500" 
      },
      { 
        initials: "HC", 
        name: "Health Coach", 
        color: "bg-teal-500" 
      }
    ],
    metrics: {
      impressions: 320000,
      engagement: 45000,
      clicks: 28000,
      conversions: 15000
    }
  },
  {
    id: 5,
    creatorId: 2,
    title: "Travel Experience",
    description: "Adventure travel package promotion with eco-tourism focus",
    status: "paused",
    budget: {
      total: 8000,
      spent: 2800
    },
    goal: "bookings",
    targetAudience: "adventure_seekers",
    startDate: new Date(new Date().setDate(new Date().getDate() - 15)),
    endDate: new Date(new Date().setDate(new Date().getDate() + 15)),
    platforms: ["instagram", "youtube"],
    createdAt: new Date(new Date().setDate(new Date().getDate() - 20)),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 2)),
    influencers: [
      { 
        initials: "TB", 
        name: "Travel Blogger", 
        color: "bg-indigo-500" 
      }
    ],
    metrics: {
      impressions: 110000,
      engagement: 18000,
      clicks: 9500,
      conversions: 320
    }
  }
];

// Influencers Data
export const mockInfluencers: Influencer[] = [
  {
    id: 1,
    username: "fashionista",
    email: "fashion@example.com",
    profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
    bio: "Fashion and lifestyle content creator with a focus on sustainable styles and ethical brands",
    name: "Sophie Styles",
    verified: true,
    followers: 250000,
    engagement: 4.8,
    location: "New York, USA",
    tags: ["fashion", "sustainable", "lifestyle"],
    createdAt: new Date(new Date().setMonth(new Date().getMonth() - 10)),
    socialStats: [
      { platform: "instagram", followers: 175000 },
      { platform: "tiktok", followers: 120000 },
      { platform: "youtube", followers: 80000 }
    ],
    metrics: {
      reachAvg: 80000,
      engagementRate: 4.8,
      conversionRate: 2.3,
      completionRate: 98,
      responseTime: 8,
      averageRate: 1200
    }
  },
  {
    id: 2,
    username: "techguru",
    email: "tech@example.com",
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    bio: "Tech influencer reviewing the latest gadgets and smart home technology with honest, in-depth analysis",
    name: "Alex Tech",
    verified: true,
    followers: 320000,
    engagement: 3.9,
    location: "San Francisco, USA",
    tags: ["tech", "gadgets", "reviews", "smart home"],
    createdAt: new Date(new Date().setMonth(new Date().getMonth() - 15)),
    socialStats: [
      { platform: "youtube", followers: 250000 },
      { platform: "instagram", followers: 120000 },
      { platform: "tiktok", followers: 95000 }
    ],
    metrics: {
      reachAvg: 150000,
      engagementRate: 3.9,
      conversionRate: 3.5,
      completionRate: 95,
      responseTime: 12,
      averageRate: 2000
    }
  },
  {
    id: 3,
    username: "foodie",
    email: "food@example.com",
    profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    bio: "Food enthusiast and home chef sharing authentic recipes, restaurant reviews, and cooking tips",
    name: "Maria Culinary",
    verified: true,
    followers: 180000,
    engagement: 5.2,
    location: "Chicago, USA",
    tags: ["food", "cooking", "recipes", "restaurant"],
    createdAt: new Date(new Date().setMonth(new Date().getMonth() - 8)),
    socialStats: [
      { platform: "instagram", followers: 150000 },
      { platform: "youtube", followers: 85000 },
      { platform: "tiktok", followers: 120000 }
    ],
    metrics: {
      reachAvg: 75000,
      engagementRate: 5.2,
      conversionRate: 2.8,
      completionRate: 99,
      responseTime: 6,
      averageRate: 1500
    }
  },
  {
    id: 4,
    username: "fitnesscoach",
    email: "fitness@example.com",
    profileImage: "https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?w=400&h=400&fit=crop",
    bio: "Certified fitness trainer sharing workout routines, nutrition advice, and wellness tips for a balanced lifestyle",
    name: "Mark Fitness",
    verified: true,
    followers: 420000,
    engagement: 4.5,
    location: "Los Angeles, USA",
    tags: ["fitness", "workout", "nutrition", "wellness"],
    createdAt: new Date(new Date().setMonth(new Date().getMonth() - 18)).toISOString(),
    socialStats: [
      { platform: "instagram", followers: 290000 },
      { platform: "youtube", followers: 320000 },
      { platform: "tiktok", followers: 250000 }
    ],
    metrics: {
      reachAvg: 200000,
      engagementRate: 4.5,
      conversionRate: 3.2,
      completionRate: 97,
      responseTime: 10,
      averageRate: 2500
    }
  },
  {
    id: 5,
    username: "travelblogger",
    email: "travel@example.com",
    profileImage: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop",
    bio: "Adventure travel blogger exploring hidden gems around the world with a focus on sustainable tourism",
    name: "Jamie Explorer",
    verified: true,
    followers: 290000,
    engagement: 4.2,
    location: "Melbourne, Australia",
    tags: ["travel", "adventure", "sustainable", "photography"],
    createdAt: new Date(new Date().setMonth(new Date().getMonth() - 12)).toISOString(),
    socialStats: [
      { platform: "instagram", followers: 240000 },
      { platform: "youtube", followers: 180000 },
      { platform: "tiktok", followers: 130000 }
    ],
    metrics: {
      reachAvg: 120000,
      engagementRate: 4.2,
      conversionRate: 2.1,
      completionRate: 96,
      responseTime: 14,
      averageRate: 1800
    }
  }
];

// Creator Analytics Data
export const creatorAnalyticsData = {
  // Daily analytics for the last 30 days
  daily: {
    impressions: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(new Date().setDate(new Date().getDate() - (29 - i))).toISOString().split('T')[0],
      value: Math.floor(Math.random() * 5000) + 2000
    })),
    clicks: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(new Date().setDate(new Date().getDate() - (29 - i))).toISOString().split('T')[0],
      value: Math.floor(Math.random() * 1000) + 500
    })),
    conversions: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(new Date().setDate(new Date().getDate() - (29 - i))).toISOString().split('T')[0],
      value: Math.floor(Math.random() * 100) + 20
    })),
    spend: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(new Date().setDate(new Date().getDate() - (29 - i))).toISOString().split('T')[0],
      value: Math.floor(Math.random() * 500) + 100
    }))
  },
  
  // Overall stats
  overall: {
    spent: 12500.75,
    spentChange: 8.4,
    campaigns: 5,
    campaignsChange: 25.0,
    engagement: 84250,
    engagementChange: 15.3,
    impressions: 673000,
    clicks: 52400,
    ctr: 7.78,
    roi: 165.2
  },
  
  // Top performing campaigns
  topCampaigns: [
    {
      id: 4,
      title: "Fitness Challenge",
      impressions: 320000,
      engagement: 45000,
      conversions: 15000,
      roi: 250.8
    },
    {
      id: 1,
      title: "Summer Fashion Collection",
      impressions: 145000,
      engagement: 12500,
      conversions: 350,
      roi: 127.3
    },
    {
      id: 5,
      title: "Travel Experience",
      impressions: 110000,
      engagement: 18000,
      conversions: 320,
      roi: 114.3
    }
  ],
  
  // Top performing influencers
  topInfluencers: [
    {
      id: 4,
      name: "Mark Fitness",
      campaigns: 1,
      impressions: 200000,
      engagementRate: 4.5,
      conversions: 15000
    },
    {
      id: 2,
      name: "Alex Tech",
      campaigns: 1,
      impressions: 150000,
      engagementRate: 3.9,
      conversions: 420
    },
    {
      id: 1,
      name: "Sophie Styles",
      campaigns: 1,
      impressions: 80000,
      engagementRate: 4.8,
      conversions: 350
    }
  ]
};

// Influencer Analytics Data
export const influencerAnalyticsData = {
  // Daily analytics for the last 30 days
  daily: {
    impressions: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(new Date().setDate(new Date().getDate() - (29 - i))).toISOString().split('T')[0],
      value: Math.floor(Math.random() * 4000) + 1000
    })),
    engagement: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(new Date().setDate(new Date().getDate() - (29 - i))).toISOString().split('T')[0],
      value: Math.floor(Math.random() * 800) + 200
    })),
    earnings: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(new Date().setDate(new Date().getDate() - (29 - i))).toISOString().split('T')[0],
      value: Math.floor(Math.random() * 400) + 50
    }))
  },
  
  // Overall stats
  overall: {
    earnings: 8750.50,
    earningsChange: 12.5,
    campaigns: 3,
    campaignsChange: 50.0,
    engagement: 38000,
    engagementRate: 4.6,
    engagementChange: 8.2,
    impressions: 450000,
    clicks: 25000,
    conversionRate: 2.8
  },
  
  // Campaign performance
  campaignPerformance: [
    {
      id: 4,
      title: "Fitness Challenge",
      creator: "FitGear Inc.",
      impressions: 200000,
      engagement: 25000,
      earnings: 2500,
      status: "completed"
    },
    {
      id: 1,
      title: "Summer Fashion Collection",
      creator: "EcoStyle",
      impressions: 150000,
      engagement: 8000,
      earnings: 1800,
      status: "active"
    },
    {
      id: 2,
      title: "Smart Home Innovation",
      creator: "TechLife",
      impressions: 100000,
      engagement: 5000,
      earnings: 1200,
      status: "active"
    }
  ],
  
  // Top performing content
  topContent: [
    {
      id: 1,
      platform: "instagram",
      type: "post",
      description: "Product showcase with lifestyle integration",
      impressions: 85000,
      engagement: 12000,
      engagementRate: 14.1
    },
    {
      id: 2,
      platform: "youtube",
      type: "video",
      description: "In-depth product review and tutorial",
      impressions: 120000,
      engagement: 15000,
      engagementRate: 12.5
    },
    {
      id: 3,
      platform: "tiktok",
      type: "short",
      description: "Creative product use case demonstration",
      impressions: 95000,
      engagement: 11000,
      engagementRate: 11.6
    }
  ]
};

// Load sample data to localStorage
export function loadSampleData() {
  // Only set if localStorage doesn't already have saved ads
  if (!localStorage.getItem('savedAds')) {
    localStorage.setItem('savedAds', JSON.stringify(mockGeneratedAds));
  }
}