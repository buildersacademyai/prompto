import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 backdrop-blur-md bg-background/80">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <img src="/src/assets/logo.png" alt="Prompto Logo" className="h-20" />
              </Link>
            </div>
            
            {/* Navigation Links & Button */}
            <div className="flex items-center space-x-6">
              <Link href="/whitepaper" className="hidden md:inline-block text-muted-foreground hover:text-foreground transition-colors">
                Whitepaper
              </Link>
              <Link href="/about" className="hidden md:inline-block text-foreground transition-colors border-b-2 border-primary">
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
        <div className="max-w-3xl mx-auto">
          <Button asChild variant="ghost" size="sm" className="mb-6">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          
          <h1 className="text-4xl font-display font-bold mb-8">About Prompto</h1>
          
          <div className="prose prose-invert max-w-none">
            <p className="text-xl text-muted-foreground mb-8">
              Prompto is a revolutionary decentralized advertising platform that connects content creators with influencers using AI-powered content generation and blockchain technology.
            </p>
            
            <h2>Our Mission</h2>
            <p>
              At Prompto, we believe in empowering creators and influencers to build authentic connections with audiences through transparent, secure, and efficient advertising. Our mission is to democratize digital advertising by removing intermediaries, increasing transparency, and ensuring fair compensation for all participants.
            </p>
            
            <h2>Our Story</h2>
            <p>
              Prompto was founded in 2023 by a team of technology enthusiasts with backgrounds in blockchain development, artificial intelligence, and digital marketing. Frustrated by the inefficiencies and lack of transparency in traditional influencer marketing, our founders envisioned a platform that would leverage the latest technologies to create a more equitable ecosystem.
            </p>
            
            <h2>Our Technology</h2>
            <p>
              Our platform is built on three core technological pillars:
            </p>
            <ul>
              <li>
                <strong>AI-Powered Content Generation:</strong> Utilizing advanced language models to help creators develop engaging ad content optimized for different platforms and audiences.
              </li>
              <li>
                <strong>Blockchain-Based Payments:</strong> Implementing secure escrow systems and smart contracts to ensure transparent and timely payments for all participants.
              </li>
              <li>
                <strong>Engagement Verification:</strong> Developing proprietary algorithms to verify authentic engagement and prevent fraud, ensuring that creators get the results they pay for.
              </li>
            </ul>
            
            <h2>Our Team</h2>
            <p>
              Prompto is led by a diverse team of experts in blockchain technology, artificial intelligence, marketing, and business development. Our leadership brings together decades of combined experience from leading tech companies and startups, united by a shared vision of revolutionizing the advertising industry.
            </p>
            
            <h2>Join Us</h2>
            <p>
              We're committed to building a more transparent, efficient, and equitable advertising ecosystem. Whether you're a content creator looking to maximize your marketing ROI or an influencer seeking fair compensation for your reach, Prompto provides the tools and technology to help you succeed.
            </p>
          </div>
          
          <div className="mt-12 flex justify-center">
            <Button asChild size="lg" className="font-medium">
              <Link href="/auth">Get Started with Prompto</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}