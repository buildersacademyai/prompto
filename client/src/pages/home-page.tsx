import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  Sparkles, 
  Users, 
  Wallet, 
  TrendingUp, 
  Shield, 
  Zap, 
  ChevronRight, 
  PanelRight, 
  PanelLeft,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirect to appropriate dashboard based on user role
    if (user) {
      if (user.role === "influencer") {
        setLocation("/influencer");
      } else {
        setLocation("/creator");
      }
    }
  }, [user, setLocation]);

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const features = [
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "AI-Powered Ad Generation",
      description: "Create engaging ad content with GPT-4 technology tailored to your brand and target audience"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Influencer Marketplace",
      description: "Connect with relevant influencers across multiple social platforms in one centralized hub"
    },
    {
      icon: <Wallet className="h-6 w-6" />,
      title: "Secure Escrow Payments",
      description: "Fund campaigns with confidence using secure blockchain escrow for transparent transactions"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Performance Analytics",
      description: "Track engagement, conversion, and ROI with real-time data visualization dashboards"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Verified Engagement",
      description: "Ensure authentic engagement with our proprietary verification system"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Dual Payment Options",
      description: "Choose between traditional (Stripe) or crypto (USDC) payment methods for maximum flexibility"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/10 z-0" />
        <div 
          className="absolute inset-0 opacity-20 z-0" 
          style={{ 
            backgroundImage: "radial-gradient(circle at 25px 25px, rgba(153, 69, 255, 0.15) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(0, 255, 163, 0.1) 2%, transparent 0%)",
            backgroundSize: "100px 100px" 
          }} 
        />
        
        <div className="container relative z-10 pt-32 pb-20 md:pt-40 md:pb-32 mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-display font-bold mb-6 gradient-text">
              Prompto
            </h1>
            <p className="text-lg md:text-xl mb-8 text-muted-foreground max-w-2xl mx-auto">
              The decentralized advertising platform connecting Creators and Influencers with AI-powered content generation and blockchain payment processing
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="font-medium">
                <Link href="/auth">Get Started <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="font-medium">
                <Link href="#features">Explore Features</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Platform Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Prompto combines AI technology with blockchain security to revolutionize influencer marketing
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
                <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mb-4 text-primary">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-display font-medium mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">How Prompto Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our streamlined process creates value for both content creators and influencers
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</div>
                  <div>
                    <h3 className="text-xl font-display font-medium mb-2">For Creators</h3>
                    <ul className="space-y-4 text-muted-foreground">
                      <li className="flex items-start">
                        <ChevronRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5 mr-2" />
                        <span>Generate AI-powered ad content optimized for various platforms</span>
                      </li>
                      <li className="flex items-start">
                        <ChevronRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5 mr-2" />
                        <span>Launch campaigns with escrow funding for security</span>
                      </li>
                      <li className="flex items-start">
                        <ChevronRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5 mr-2" />
                        <span>Connect with relevant influencers based on audience match</span>
                      </li>
                      <li className="flex items-start">
                        <ChevronRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5 mr-2" />
                        <span>Track performance and ROI in real-time dashboard</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold">2</div>
                  <div>
                    <h3 className="text-xl font-display font-medium mb-2">For Influencers</h3>
                    <ul className="space-y-4 text-muted-foreground">
                      <li className="flex items-start">
                        <ChevronRight className="h-5 w-5 text-accent flex-shrink-0 mt-0.5 mr-2" />
                        <span>Connect social media accounts to showcase audience demographics</span>
                      </li>
                      <li className="flex items-start">
                        <ChevronRight className="h-5 w-5 text-accent flex-shrink-0 mt-0.5 mr-2" />
                        <span>Browse and join relevant campaigns that match your brand</span>
                      </li>
                      <li className="flex items-start">
                        <ChevronRight className="h-5 w-5 text-accent flex-shrink-0 mt-0.5 mr-2" />
                        <span>Share campaign content and earn based on verified engagement</span>
                      </li>
                      <li className="flex items-start">
                        <ChevronRight className="h-5 w-5 text-accent flex-shrink-0 mt-0.5 mr-2" />
                        <span>Get paid instantly via Stripe or crypto once terms are met</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">Ready to revolutionize your advertising?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join Prompto today and experience the future of decentralized influencer marketing
            </p>
            <Button asChild size="lg" className="font-medium">
              <Link href="/auth">Create Your Account <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-display font-bold gradient-text">Prompto</h2>
              <p className="text-sm text-muted-foreground mt-2">The decentralized advertising platform</p>
            </div>
            <div className="flex gap-8">
              <Link href="/auth" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Log In
              </Link>
              <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <span className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Prompto
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
