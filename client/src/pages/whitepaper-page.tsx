import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Download, Share2 } from "lucide-react";

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
                <img src="/src/assets/logo.png" alt="Prompto Logo" className="h-10" />
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
          
          <div className="flex items-center justify-between mb-8">
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
              <p>Abstract: This whitepaper outlines the technical architecture and economic model of Prompto, a decentralized advertising platform connecting content creators and influencers.</p>
              <p>Authors: Prompto Team</p>
              <p>36 pages - Last updated: May 7, 2023</p>
            </div>
          </div>
          
          <div className="prose prose-invert max-w-none">
            <h2>Abstract</h2>
            <p>
              The digital advertising industry faces significant challenges related to transparency, fraud, intermediary costs, and data privacy. This whitepaper introduces Prompto, a decentralized platform leveraging blockchain technology and artificial intelligence to create a more efficient, transparent, and equitable advertising ecosystem for content creators and influencers.
            </p>
            
            <h2>1. Introduction</h2>
            <p>
              The digital advertising market continues to grow rapidly, with influencer marketing becoming an increasingly important channel. However, the industry faces several critical challenges:
            </p>
            <ul>
              <li>Lack of transparency in campaign performance reporting</li>
              <li>High fees charged by intermediaries</li>
              <li>Payment delays and disputes</li>
              <li>Fraud and fake engagement</li>
              <li>Content quality and consistency issues</li>
            </ul>
            <p>
              Prompto addresses these challenges through a decentralized platform that connects content creators directly with influencers, facilitated by blockchain-based payment systems and AI-powered content generation.
            </p>
            
            <h2>2. Technical Architecture</h2>
            <h3>2.1 Blockchain Implementation</h3>
            <p>
              Prompto utilizes a hybrid blockchain architecture, combining the security and transparency of public chains with the efficiency of layer-2 solutions for handling high transaction volumes.
            </p>
            
            <h3>2.2 Smart Contracts</h3>
            <p>
              The platform implements several key smart contracts:
            </p>
            <ul>
              <li><strong>Campaign Contract:</strong> Defines campaign parameters, funding, and completion criteria</li>
              <li><strong>Escrow Contract:</strong> Manages secure fund holding and release based on predefined conditions</li>
              <li><strong>Verification Contract:</strong> Validates engagement metrics through oracle integrations</li>
              <li><strong>Reputation Contract:</strong> Maintains on-chain reputation scores for platform participants</li>
            </ul>
            
            <h3>2.3 AI Content Generation</h3>
            <p>
              Prompto leverages advanced language models to assist creators in generating optimized advertising content. The AI system:
            </p>
            <ul>
              <li>Analyzes creator inputs and brand guidelines</li>
              <li>Generates platform-specific content variations</li>
              <li>Optimizes content based on historical performance data</li>
              <li>Provides engagement predictions and improvement suggestions</li>
            </ul>
            
            <h2>3. Economic Model</h2>
            <h3>3.1 Token Utility</h3>
            <p>
              The platform's native token (PMPT) serves multiple functions:
            </p>
            <ul>
              <li>Transaction fees and campaign funding</li>
              <li>Platform governance participation</li>
              <li>Staking for reputation and premium features</li>
              <li>Rewards for network contributions and engagement verification</li>
            </ul>
            
            <h3>3.2 Fee Structure</h3>
            <p>
              Prompto implements a transparent fee structure significantly lower than traditional platforms:
            </p>
            <ul>
              <li>Base platform fee: 5% of campaign value</li>
              <li>Discounted fees for PMPT stakers and high-volume users</li>
              <li>Optional priority features for additional fees</li>
              <li>No hidden or additional charges</li>
            </ul>
            
            <h2>4. Governance</h2>
            <p>
              Prompto implements a decentralized governance system allowing stakeholders to influence platform development through:
            </p>
            <ul>
              <li>Proposal submission and voting</li>
              <li>Parameter adjustments</li>
              <li>Feature prioritization</li>
              <li>Revenue allocation for development and ecosystem growth</li>
            </ul>
            
            <h2>5. Roadmap</h2>
            <p>
              The development and deployment of Prompto will proceed according to the following timeline:
            </p>
            <ul>
              <li><strong>Q2 2023:</strong> Initial platform launch with core features</li>
              <li><strong>Q3 2023:</strong> Integration of AI content generation capabilities</li>
              <li><strong>Q4 2023:</strong> Implementation of token economics and staking</li>
              <li><strong>Q1 2024:</strong> Governance system deployment</li>
              <li><strong>Q2 2024:</strong> Expansion to additional social platforms and content types</li>
            </ul>
            
            <h2>6. Conclusion</h2>
            <p>
              Prompto represents a significant advancement in digital advertising, addressing key industry challenges through blockchain technology and artificial intelligence. By creating a more transparent, efficient, and equitable ecosystem, Prompto aims to transform how creators and influencers collaborate in the digital advertising space.
            </p>
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