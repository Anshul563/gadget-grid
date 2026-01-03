import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar"; // Import the Navbar we just made
import { Toaster } from "@/components/ui/sonner"; // For notifications
import { ThemeProvider } from "@/components/theme-provider";
import { getActiveAnnouncement } from "@/lib/get-announcement";
import { AnnouncementBar } from "@/components/layout/announcement-bar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GadgetGrid | Premium Electronics",
  description: "Your one-stop shop for Headphones, Powerbanks, and Gadgets.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const announcement = await getActiveAnnouncement();
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AnnouncementBar data={announcement} />
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