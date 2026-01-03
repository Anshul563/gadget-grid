"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, signUp } from "@/lib/auth-client"; // Better-Auth Client
import { toast } from "sonner"; // For notifications
import { Loader2 } from "lucide-react"; // Loading spinner
import { useRouter } from "next/navigation";

export function AuthDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // 1. Handle Google Login
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signIn.social({
      provider: "google",
      callbackURL: "/", // Redirect to home after login
    });
    // Note: Google redirects, so we don't need to setIsLoading(false) usually
  };

  // 2. Handle Email Login (Works for Admin & User)
  const handleEmailSignIn = async () => {
    setIsLoading(true);
    const { error } = await signIn.email({
      email,
      password,
    });

    if (error) {
      toast.error(error.message || "Invalid credentials");
      setIsLoading(false);
    } else {
      toast.success("Welcome back!");
      setIsOpen(false); // Close dialog
      router.refresh(); // Refresh page to update Navbar state
    }
  };

  // 3. Handle Registration (Sign Up)
  const handleSignUp = async () => {
    setIsLoading(true);
    const { error } = await signUp.email({
      email,
      password,
      name,
    });

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
    } else {
      toast.success("Account created! You are now logged in.");
      setIsOpen(false);
      router.refresh();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Login / Sign Up</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Welcome to GadgetGrid</DialogTitle>
          <DialogDescription>
            Sign in to access your cart, orders, and exclusive offers.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          {/* LOGIN TAB */}
          <TabsContent value="login" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="m@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <Button className="w-full" onClick={handleEmailSignIn} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In with Email
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>
          </TabsContent>

          {/* REGISTER TAB */}
          <TabsContent value="register" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                placeholder="John Doe" 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-email">Email</Label>
              <Input 
                id="reg-email" 
                type="email" 
                placeholder="m@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-password">Password</Label>
              <Input 
                id="reg-password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={handleSignUp} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}