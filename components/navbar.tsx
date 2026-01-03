"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react"; // Added useState, useEffect
import {
  ShoppingCart,
  Menu,
  Search,
  LogOut,
  User as UserIcon,
  Package,
  Heart,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession, signOut } from "@/lib/auth-client";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { useTheme } from "next-themes";

// --- LOCATION INTEGRATION ---
import { LocationDialog } from "@/components/layout/location-dialog"; // Import the Dialog
import { getActiveAddress } from "@/app/actions/address"; // Import Server Action
import { CartSheet } from "./cart/cart-sheet";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { setTheme, theme } = useTheme();
  
  // State for the Location Label
  const [activeCity, setActiveCity] = useState<string | undefined>(undefined);

  // Fetch active address on mount
  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const address = await getActiveAddress();
        if (address) {
          setActiveCity(`${address.city}, ${address.pincode}`);
        }
      } catch (error) {
        console.error("Failed to load address label", error);
      }
    };
    fetchAddress();
  }, []);

  if (pathname.startsWith("/admin")) {
    return null;
  }

  const cartCount = 0;

  const routes = [
    { href: "/products", label: "All Products" },
    { href: "/category/headphones", label: "Headphones" },
    { href: "/category/powerbanks", label: "Powerbanks" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        {/* ------------------------------------------------------ */}
        {/* 1. MOBILE MENU (Sheet) */}
        {/* ------------------------------------------------------ */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetTitle className="mb-4 text-lg font-bold">
              GadgetGrid
            </SheetTitle>
            <nav className="flex flex-col gap-4">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  {route.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        {/* ------------------------------------------------------ */}
        {/* 2. LOGO & DESKTOP NAV */}
        {/* ------------------------------------------------------ */}
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight">GadgetGrid</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={`transition-colors hover:text-foreground/80 ${
                  pathname === route.href
                    ? "text-foreground"
                    : "text-foreground/60"
                }`}
              >
                {route.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* ------------------------------------------------------ */}
        {/* 3. SEARCH & ACTIONS */}
        {/* ------------------------------------------------------ */}
        <div className="flex flex-1 items-center justify-end space-x-6">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search gadgets..."
                className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
              />
            </div>
          </div>

          {/* --- REPLACED STATIC BUTTON WITH LOCATION DIALOG --- */}
          <LocationDialog currentCity={activeCity} />
          {/* ------------------------------------------------- */}

          {/* Cart Button */}
          <CartSheet />

          {/* User Menu vs Login Dialog */}
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={session.user.image || ""}
                      alt={session.user.name}
                    />
                    <AvatarFallback>
                      {session.user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {session.user.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {session.user.role === "admin" && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer">
                        <Package className="mr-2 h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}

                <DropdownMenuItem asChild>
                  <Link href="/account" className="cursor-pointer">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>My Account</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/orders" className="cursor-pointer">
                    <Package className="mr-2 h-4 w-4" />
                    <span>My Orders</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/wishlist" className="cursor-pointer">
                    <Heart className="mr-2 h-4 w-4" />
                    <span>Wishlist</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <Button
                  variant="outline"
                  size="icon"
                  className="w-full justify-start border-0 px-2"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 mr-2" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 mr-2" />
                  <span>Toggle theme</span>
                </Button>

                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <AuthDialog />
          )}
        </div>
      </div>
    </header>
  );
}