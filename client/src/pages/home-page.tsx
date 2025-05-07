import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
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
import AnimatedText from "@/components/AnimatedText";
import AnimatedButton from "@/components/AnimatedButton";
import FeatureCard from "@/components/FeatureCard";
import HomeScene from "@/components/3d/HomeScene";

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
      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 backdrop-blur-md bg-background/80">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div 
              className="flex items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link href="/" className="flex items-center">
                <motion.img 
                  src="/src/assets/logo.png" 
                  alt="Prompto Logo" 
                  className="h-20" 
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                />
              </Link>
            </motion.div>
            
            {/* Navigation Links & Button */}
            <motion.div 
              className="flex items-center space-x-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {[
                { href: "/whitepaper", label: "Whitepaper" },
                { href: "/about", label: "About Us" }
              ].map((link, i) => (
                <motion.div
                  key={i}
                  className="hidden md:inline-block"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * i + 0.3 }}
                  whileHover={{ y: -2 }}
                >
                  <Link 
                    href={link.href} 
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                whileHover={{ scale: 1.05 }}
              >
                <AnimatedButton 
                  text="Get Started" 
                  href="/auth" 
                  className="bg-primary hover:bg-primary/90 font-medium text-white"
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative overflow-hidden min-h-screen">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/10 z-0" />
        <div 
          className="absolute inset-0 opacity-20 z-0" 
          style={{ 
            backgroundImage: "radial-gradient(circle at 25px 25px, rgba(153, 69, 255, 0.15) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(0, 255, 163, 0.1) 2%, transparent 0%)",
            backgroundSize: "100px 100px" 
          }} 
        />
        
        <div className="container relative z-10 pt-24 mx-auto px-4 flex flex-col h-screen">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-grow items-center">
            <div className="flex flex-col justify-center">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-2"
              >
                <span className="text-sm md:text-base font-semibold inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary">
                  <Sparkles className="h-4 w-4 mr-2" /> Revolutionizing Influencer Marketing
                </span>
              </motion.div>
              
              <AnimatedText 
                text="Prompto: Connect, Create, Convert" 
                className="text-5xl md:text-6xl font-display font-bold mb-6" 
              />
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <p className="text-lg md:text-xl mb-8 text-muted-foreground pr-0 lg:pr-8">
                  The decentralized advertising platform connecting Creators and Influencers with 
                  <span className="text-gradient font-medium"> AI-powered content generation </span> 
                  and 
                  <span className="text-gradient font-medium"> blockchain payment processing</span>
                </p>
              </motion.div>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
              >
                <AnimatedButton 
                  text="Get Started" 
                  href="/auth" 
                  className="bg-primary hover:bg-primary/90 font-medium text-white"
                />
                <AnimatedButton 
                  text="Explore Features" 
                  href="#features" 
                  variant="outline" 
                  className="font-medium"
                />
              </motion.div>
            </div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2 }}
              className="hidden lg:block relative"
            >
              {/* 3D scene using pure Three.js */}
              <div className="relative">
                {/* Main 3D scene */}
                <HomeScene />
                
                {/* Overlay text with glowing effect */}
                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                  <motion.div
                    className="relative text-center px-6 py-8 rounded-xl bg-black/30 backdrop-blur-sm border border-primary/20 shadow-glow"
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                  >
                    <motion.div 
                      className="absolute -top-10 -left-10 w-20 h-20 bg-primary/10 rounded-full blur-2xl"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3]
                      }}
                      transition={{ 
                        duration: 4, 
                        repeat: Infinity,
                        ease: "easeInOut" 
                      }}
                    />
                    
                    <motion.div 
                      className="absolute -bottom-10 -right-10 w-20 h-20 bg-accent/10 rounded-full blur-2xl"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3]
                      }}
                      transition={{ 
                        duration: 4, 
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2
                      }}
                    />
                    
                    <motion.p 
                      className="text-2xl md:text-3xl font-medium text-gradient mb-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8, duration: 1 }}
                    >
                      Powered by AI & Blockchain
                    </motion.p>
                    
                    <motion.div
                      className="text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.2, duration: 1 }}
                    >
                      <p className="text-lg text-muted-foreground">
                        Connecting creators with influencers 
                        <span className="text-primary"> seamlessly</span> &
                        <span className="text-accent"> securely</span>
                      </p>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex justify-center pb-8"
          >
            <a href="#features" className="animate-bounce flex flex-col items-center text-muted-foreground hover:text-primary transition-colors">
              <span className="mb-2 text-sm">Discover More</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6">
                <path d="M12 5L12 19M12 19L19 12M12 19L5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </motion.div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-b from-background to-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-sm md:text-base font-semibold inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4 mr-2" /> Powerful Platform
              </span>
            </motion.div>
            
            <AnimatedText 
              text="Platform Features" 
              className="text-3xl md:text-4xl font-display font-bold mt-4 mb-4" 
              delay={0.1}
            />
            
            <motion.p 
              className="text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Prompto combines AI technology with blockchain security to revolutionize influencer marketing
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard 
                key={index}
                title={feature.title}
                description={feature.description}
                icon={feature.icon.type}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 relative">
        {/* Background pattern */}
        <div 
          className="absolute inset-0 opacity-5 z-0" 
          style={{ 
            backgroundImage: "linear-gradient(to right, rgba(153, 69, 255, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(153, 69, 255, 0.2) 1px, transparent 1px)",
            backgroundSize: "40px 40px" 
          }} 
        />
        
        <div className="container relative z-10 mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-sm md:text-base font-semibold inline-flex items-center px-3 py-1 rounded-full bg-accent/10 text-accent">
                <Zap className="h-4 w-4 mr-2" /> Simple Process
              </span>
            </motion.div>
            
            <AnimatedText 
              text="How Prompto Works" 
              className="text-3xl md:text-4xl font-display font-bold mt-4 mb-4" 
              delay={0.1}
            />
            
            <motion.p 
              className="text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Our streamlined process creates value for both content creators and influencers
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>
              <div className="bg-card/50 backdrop-blur-sm border border-primary/20 rounded-xl p-8 shadow-glow relative">
                <div className="flex gap-4 mb-6">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</div>
                  <h3 className="text-xl font-display font-medium">For Creators</h3>
                </div>
                <ul className="space-y-4 text-muted-foreground">
                  {[
                    "Generate AI-powered ad content optimized for various platforms",
                    "Launch campaigns with escrow funding for security",
                    "Connect with relevant influencers based on audience match",
                    "Track performance and ROI in real-time dashboard"
                  ].map((item, i) => (
                    <motion.li 
                      key={i}
                      className="flex items-start"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.1 * i + 0.3 }}
                    >
                      <ChevronRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5 mr-2" />
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-accent/10 rounded-full blur-2xl"></div>
              <div className="bg-card/50 backdrop-blur-sm border border-accent/20 rounded-xl p-8 shadow-glow-green relative">
                <div className="flex gap-4 mb-6">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold">2</div>
                  <h3 className="text-xl font-display font-medium">For Influencers</h3>
                </div>
                <ul className="space-y-4 text-muted-foreground">
                  {[
                    "Connect social media accounts to showcase audience demographics",
                    "Browse and join relevant campaigns that match your brand",
                    "Share campaign content and earn based on verified engagement",
                    "Get paid instantly via Stripe or crypto once terms are met"
                  ].map((item, i) => (
                    <motion.li 
                      key={i}
                      className="flex items-start"
                      initial={{ opacity: 0, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.1 * i + 0.3 }}
                    >
                      <ChevronRight className="h-5 w-5 text-accent flex-shrink-0 mt-0.5 mr-2" />
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-card to-background z-0" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl opacity-70"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-accent/20 rounded-full blur-3xl opacity-70"></div>
        
        <div className="container relative z-10 mx-auto px-4">
          <motion.div 
            className="max-w-3xl mx-auto text-center p-10 rounded-2xl border border-primary/20 bg-card/50 backdrop-blur-md shadow-glow"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <AnimatedText 
              text="Ready to revolutionize your advertising?" 
              className="text-3xl md:text-4xl font-display font-bold mb-6" 
            />
            
            <motion.p 
              className="text-lg text-muted-foreground mb-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              Join Prompto today and experience the future of decentralized influencer marketing
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <AnimatedButton 
                text="Create Your Account" 
                href="/auth" 
                className="bg-primary hover:bg-primary/90 font-medium text-white px-8"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-background">
        <div className="container mx-auto px-4">
          <motion.div 
            className="flex flex-col md:flex-row justify-between items-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="mb-6 md:mb-0"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Link href="/">
                <img src="/src/assets/logo.png" alt="Prompto Logo" className="h-8 mb-2" />
              </Link>
              <p className="text-sm text-muted-foreground">The decentralized advertising platform</p>
            </motion.div>
            
            <div className="flex gap-8">
              {[
                { href: "/auth", label: "Log In" },
                { href: "#features", label: "Features" },
                { href: "/whitepaper", label: "Whitepaper" },
                { href: "/about", label: "About Us" }
              ].map((link, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 5 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.1 * i }}
                  whileHover={{ y: -2 }}
                >
                  <Link 
                    href={link.href} 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              
              <motion.span 
                className="text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                © {new Date().getFullYear()} Prompto
              </motion.span>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
