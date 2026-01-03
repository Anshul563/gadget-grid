import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar"; // Import the Navbar we just made
import { Toaster } from "@/components/ui/sonner"; // For notifications
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GadgetGrid | Premium Electronics",
  description: "Your one-stop shop for Headphones, Powerbanks, and Gadgets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar />
            <main className="min-h-screen bg-background">
              {children}
            </main>
            <Toaster />
        </ThemeProvider> {/* This handles pop-up notifications */}
      </body>
    </html>
  );
}