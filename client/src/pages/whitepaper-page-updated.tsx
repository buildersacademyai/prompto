import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Download, Share2, Check } from "lucide-react";

export default function WhitepaperPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 backdrop-blur-md bg-background/80">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <img src="/logo.svg" alt="Prompto Logo" className="h-10" />
              </Link>
            </div>
            
            {/* Navigation Links & Button */}
            <div className="flex items-center space-x-6">
              <Link href="/whitepaper" className="hidden md:inline-block text-foreground transition-colors border-b-2 border-primary">
                Whitepaper
              </Link>
              <Link href="/about" className="hidden md:inline-block text-muted-foreground hover:text-foreground transition-colors">
                About Us
              </Link>
              <Button asChild size="sm" className="font-medium">
                <Link href="/auth">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 pt-32 pb-16">
        <div className="max-w-4xl mx-auto">
          <Button asChild variant="ghost" size="sm" className="mb-6">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <h1 className="text-4xl font-display font-bold">Prompto Whitepaper</h1>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
          
          <div className="bg-card p-8 rounded-lg border border-border mb-8">
            <div className="flex gap-4 items-center mb-6">
              <div className="bg-primary/10 p-3 rounded-full">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-medium">Prompto: A Decentralized Advertising Platform</h2>
                <p className="text-muted-foreground">Version 1.0 - May 2023</p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Abstract: This whitepaper outlines the technical architecture and economic model of Prompto, a next-generation, AI-powered, blockchain-secured advertising platform that connects brands with influencers.</p>
              <p>Authors: Prompto Team</p>
              <p>Last updated: May 16, 2023</p>
            </div>
          </div>
          
          <div className="prose prose-invert max-w-none">
            <h2>Introduction</h2>
            <p>Prompto is a next-generation, AI-powered, blockchain-secured advertising platform that connects brands (creators) with influencers in a decentralized, transparent, and performance-based ecosystem. Built on the Solana blockchain, Prompto ensures fast, secure, and low-cost interactions between advertisers and content promoters.</p>

            <h2>Key Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8 not-prose">
              <div className="bg-card/30 p-6 rounded-lg border border-border">
                <h3 className="text-xl font-semibold mb-4 text-primary">For Influencers</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Sign up with Google or email</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Secure wallet connection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Personalized dashboard with engagement analytics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Connect social accounts (Instagram, TikTok)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Real-time reward estimation</span>
                  </li>
                </ul>
              </div>

              <div className="bg-card/30 p-6 rounded-lg border border-border">
                <h3 className="text-xl font-semibold mb-4 text-accent">For Creators (Advertisers)</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Intuitive ad generation (2 free on signup)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>AI-powered ad copy creation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Manage, list/unlist ad campaigns</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Escrow-based payment system</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Campaign analytics dashboard</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Purchase credits via card or crypto</span>
                  </li>
                </ul>
              </div>
            </div>

            <h2>Blockchain Integration (Solana)</h2>
            <p>Prompto leverages Solana's high-speed, low-cost blockchain technology to provide:</p>
            <ul>
              <li>Wallet-based identity and payments</li>
              <li>Escrow smart contracts that hold ad budgets securely</li>
              <li>Automatic release of funds upon completion of campaign criteria</li>
              <li>Refund to creator if influencer fails to meet requirements</li>
            </ul>

            <h2>Prompto Reward Engine — "PFEM" (Prompto Fair Engagement Model)</h2>
            
            <h3>Objective</h3>
            <p>To ensure fair, transparent, and performance-driven reward distribution to influencers who promote ads on TikTok and Instagram using both on-chain and off-chain data.</p>

            <h3>Reward Formula</h3>
            <div className="bg-primary/10 p-4 rounded-md border border-primary/20 my-4 font-mono text-sm">
              TotalReward = Base × PlatformWeight × (ReachFactor + EngagementFactor + PerformanceFactor) × DurationMultiplier + Bonus
            </div>

            <h3>Formula Breakdown</h3>
            
            <div className="overflow-x-auto my-6">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2 px-4 text-left">Factor</th>
                    <th className="py-2 px-4 text-left">Definition</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="py-2 px-4 font-medium">Base</td>
                    <td className="py-2 px-4">Base rate per engagement point. Dynamically adjustable per campaign. (e.g., $0.01)</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 px-4 font-medium">PlatformWeight</td>
                    <td className="py-2 px-4">Adjusts reward based on platform influence. (e.g., TikTok = 1.2, Instagram = 1.0)</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 px-4 font-medium">ReachFactor</td>
                    <td className="py-2 px-4">log10(Followers + 1) — logarithmic normalization to avoid over-rewarding massive accounts.</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 px-4 font-medium">EngagementFactor</td>
                    <td className="py-2 px-4">Average interaction rate across posts, normalized. (Likes + Comments + Shares) / Views × 10</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 px-4 font-medium">PerformanceFactor</td>
                    <td className="py-2 px-4">Actual ad post performance. (Post Views / Followers) × CTR × 0.5</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 px-4 font-medium">DurationMultiplier</td>
                    <td className="py-2 px-4">Campaign duration booster. 1 + (Campaign Days / 30)</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 px-4 font-medium">Bonus</td>
                    <td className="py-2 px-4">Additional rewards for early sharing, verified creators, or high-quality content</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3>Example: TikTok 15-Day Campaign</h3>
            <div className="bg-card/30 p-4 rounded-md border border-border my-4">
              <ul className="list-none space-y-1">
                <li><strong>Followers:</strong> 25,000</li>
                <li><strong>Avg Engagement Rate:</strong> 8%</li>
                <li><strong>Views:</strong> 30,000</li>
                <li><strong>Clicks:</strong> 600 (2%)</li>
                <li><strong>Duration:</strong> 15 days</li>
              </ul>
              
              <div className="mt-4 pt-4 border-t border-border font-mono text-sm">
                <p>ReachFactor = log10(25000) ≈ 4.40</p>
                <p>EngagementFactor = 0.08 × 10 = 0.8</p>
                <p>PerformanceFactor = (30000 / 25000) × 0.02 × 0.5 = 0.012</p>
                <p>DurationMultiplier = 1.5</p>
                <p>TotalReward = 0.01 × 1.2 × (4.40 + 0.8 + 0.012) × 1.5 ≈ $0.094</p>
              </div>
            </div>

            <h2>Revenue Model</h2>
            <ul>
              <li><strong>Credit Purchase:</strong> Users buy credits via fiat or crypto</li>
              <li><strong>Subscription Tiers:</strong> For advanced analytics, AI credits, faster payouts</li>
              <li><strong>Escrow Fees:</strong> Small percentage fee held on transactions</li>
              <li><strong>Sponsored Ads:</strong> Premium placement in Prompto feed</li>
              <li><strong>Analytics API Access:</strong> Paid access to campaign data for external brands</li>
            </ul>

            <h2>AI Use Cases</h2>
            <ul>
              <li>AI ad copy generation</li>
              <li>Dynamic reward prediction engine</li>
              <li>Engagement analysis via NLP/vision on social posts</li>
            </ul>

            <h2>Roadmap</h2>
            <div className="space-y-4 my-6 not-prose">
              <div className="bg-card/30 p-4 rounded-md border border-primary/20">
                <h3 className="text-primary font-medium">Phase 1: MVP</h3>
                <p>Login, Ad Generation, Wallet Integration, Analytics Dashboard</p>
              </div>
              <div className="bg-card/30 p-4 rounded-md border border-primary/20">
                <h3 className="text-primary font-medium">Phase 2: Platform Expansion</h3>
                <p>Social Media Integration, AI Enhancements, Smart Contract Expansion (Escrow conditions, dispute resolution, audit logs)</p>
              </div>
              <div className="bg-card/30 p-4 rounded-md border border-primary/20">
                <h3 className="text-primary font-medium">Phase 3: Ecosystem Development</h3>
                <p>DAO Governance, Marketplace, Reputation System</p>
              </div>
              <div className="bg-card/30 p-4 rounded-md border border-primary/20">
                <h3 className="text-primary font-medium">Phase 4: Global Scaling</h3>
                <p>Multichain Support, Public Launch</p>
              </div>
            </div>

            <h2>Security & Compliance</h2>
            <ul>
              <li>Smart contract audits</li>
              <li>OAuth 2.0 + Wallet authentication</li>
              <li>End-to-end encryption for media & user data</li>
            </ul>

            <h2>Contact</h2>
            <p><strong>Website:</strong> <a href="https://prompto.ad" className="text-primary hover:underline">https://prompto.ad</a></p>
            <p><strong>Twitter:</strong> <a href="https://twitter.com/promptoplatform" className="text-primary hover:underline">@promptoplatform</a></p>
            <p><strong>Email:</strong> <a href="mailto:team@prompto.ad" className="text-primary hover:underline">team@prompto.ad</a></p>

            <div className="text-center my-12 opacity-50">
              <FileText className="h-12 w-12 mx-auto mb-4" />
              <p className="italic">This document is for informational purposes only and does not constitute financial or investment advice.</p>
            </div>
          </div>
          
          <div className="mt-12 flex justify-center">
            <Button asChild size="lg" className="font-medium">
              <Link href="/auth">Join the Prompto Ecosystem</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}