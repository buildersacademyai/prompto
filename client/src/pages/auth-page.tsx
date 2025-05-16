import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertUserSchema } from "@shared/schema";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { signInWithGoogle } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { connectPhantomWallet, isPhantomInstalled } from "@/lib/wallet";

// SVG icons for social login
const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
  </svg>
);

const WalletIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>
  </svg>
);

// Enhanced schemas with validation
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = insertUserSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  email: z.string().email("Please enter a valid email"),
  role: z.enum(["creator", "influencer"])
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation, isLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const [authMethod, setAuthMethod] = useState<"email" | "social">("email");
  const [signingIn, setSigningIn] = useState(false);
  const { toast } = useToast();
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (user && !isLoading) {
      const redirectPath = user.role === 'creator' ? '/creator' : '/influencer';
      setLocation(redirectPath);
    }
  }, [user, isLoading, setLocation]);

  // Create form instances
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      role: "creator"
    }
  });
  

  // Handle form submissions
  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    const { confirmPassword, ...registrationData } = data;
    registerMutation.mutate(registrationData);
  };

  // We already have a redirect above, so we can remove this duplicate useEffect

  const isPending = loginMutation.isPending || registerMutation.isPending || isLoading;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex flex-1">
        {/* Left Column - Auth Forms */}
        <div className="w-full lg:w-1/2 px-4 py-12 flex items-center justify-center">
          <div className="auth-gradient-bg rounded-xl w-full max-w-md p-6 shadow-xl">
            <div className="mb-6 text-center">
              <img src="/src/assets/logo.png" alt="Prompto" className="h-20 mx-auto mb-3" />
              <p className="text-muted-foreground">Connect to the decentralized advertising platform</p>
            </div>

            {authMethod === "email" ? (
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isPending}>
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Sign In
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
                <TabsContent value="register">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Choose a username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="you@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>I am a</FormLabel>
                            <div className="flex space-x-4">
                              <Label className={`flex-1 p-3 border rounded-md cursor-pointer text-center ${field.value === 'creator' ? 'border-primary bg-primary/10' : 'border-border'}`}>
                                <input
                                  type="radio"
                                  className="sr-only"
                                  value="creator"
                                  checked={field.value === 'creator'}
                                  onChange={() => field.onChange('creator')}
                                />
                                Creator
                              </Label>
                              <Label className={`flex-1 p-3 border rounded-md cursor-pointer text-center ${field.value === 'influencer' ? 'border-primary bg-primary/10' : 'border-border'}`}>
                                <input
                                  type="radio"
                                  className="sr-only"
                                  value="influencer"
                                  checked={field.value === 'influencer'}
                                  onChange={() => field.onChange('influencer')}
                                />
                                Influencer
                              </Label>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Note: This choice is permanent. You will need to create a separate account to use the other role.</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isPending}>
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Create Account
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full bg-white text-background hover:bg-gray-100 font-medium transition flex items-center justify-center" 
                  onClick={async () => {
                    try {
                      setSigningIn(true);
                      console.log("Starting Google sign-in process");
                      const result = await signInWithGoogle();
                      console.log("Google sign-in result:", result);
                      
                      if (result.success && result.user) {
                        // Handle successful sign-in
                        // Now we need to create or get user in our backend
                        const idToken = await result.user.getIdToken();
                        const userEmail = result.user.email || '';
                        const userDisplayName = result.user.displayName || '';
                        
                        console.log("Sending auth data to server:", { email: userEmail, displayName: userDisplayName });
                        const response = await fetch('/api/auth/google', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({ 
                            idToken,
                            email: userEmail,
                            displayName: userDisplayName
                          }),
                        });
                        
                        console.log("Google authentication response status:", response.status);
                        
                        if (response.ok) {
                          const data = await response.json();
                          console.log("Google authentication server response:", data);
                          
                          if (data.success) {
                            console.log("Authentication successful, redirecting to dashboard");
                            // The session is already established on the server
                            // We can just refresh the auth state
                            window.location.href = data.user.role === 'creator' ? '/creator' : '/influencer';
                          } else {
                            console.error("Authentication response success flag is false");
                            toast({
                              title: "Authentication failed",
                              description: "Could not authenticate with Google. Please try again.",
                              variant: "destructive",
                            });
                          }
                        } else {
                          console.error("Authentication response not OK:", response.status);
                          const errorText = await response.text();
                          console.error("Error response:", errorText);
                          
                          toast({
                            title: "Authentication failed",
                            description: "Could not authenticate with Google. Please try again.",
                            variant: "destructive",
                          });
                        }
                      } else if (result.error) {
                        toast({
                          title: "Authentication failed",
                          description: result.error,
                          variant: "destructive",
                        });
                      }
                    } catch (error) {
                      toast({
                        title: "Authentication failed",
                        description: "An unexpected error occurred. Please try again.",
                        variant: "destructive",
                      });
                    } finally {
                      setSigningIn(false);
                    }
                  }}
                  disabled={signingIn || isPending}
                >
                  {signingIn ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
                  <span className="ml-2">Continue with Google</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full bg-card hover:bg-card/80 font-medium transition flex items-center justify-center"
                  disabled={signingIn || !isPhantomInstalled()}
                  onClick={async () => {
                    try {
                      setSigningIn(true);
                      const response = await connectPhantomWallet();
                      
                      // We successfully connected the wallet, now redirect to dashboard
                      if (response) {
                        toast({
                          title: "Wallet connected",
                          description: "Your wallet has been successfully connected.",
                        });
                        setLocation("/");
                      }
                    } catch (error) {
                      console.error("Failed to connect wallet:", error);
                      toast({
                        title: "Wallet connection failed",
                        description: error instanceof Error ? error.message : "Failed to connect wallet. Please try again.",
                        variant: "destructive",
                      });
                    } finally {
                      setSigningIn(false);
                    }
                  }}
                >
                  {signingIn ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <WalletIcon />}
                  <span className="ml-2">
                    {isPhantomInstalled() ? "Connect Wallet" : "Phantom Wallet Not Found"}
                  </span>
                </Button>
              </div>
            )}

            <div className="relative flex items-center my-6">
              <div className="flex-grow border-t border-border"></div>
              <span className="flex-shrink mx-4 text-muted-foreground">or</span>
              <div className="flex-grow border-t border-border"></div>
            </div>

            <Button 
              variant="ghost" 
              className="w-full" 
              onClick={() => setAuthMethod(authMethod === "email" ? "social" : "email")}
            >
              {authMethod === "email" ? "Continue with social" : "Continue with email"}
            </Button>
          </div>
        </div>

        {/* Right Column - Hero Section */}
        <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary to-accent items-center justify-center">
          <div className="max-w-md text-center p-8">
            <h2 className="text-4xl font-bold text-white mb-6">Revolutionize Your Advertising with AI & Blockchain</h2>
            <p className="text-white/80 text-lg mb-8">
              Connect creators with influencers through a decentralized platform powered by AI-generated content and secure blockchain payments.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                <h3 className="font-semibold text-white text-lg mb-2">For Creators</h3>
                <p className="text-white/80">Generate AI ads, launch campaigns with escrow funding</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                <h3 className="font-semibold text-white text-lg mb-2">For Influencers</h3>
                <p className="text-white/80">Connect social accounts, share ads, earn on engagement</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
