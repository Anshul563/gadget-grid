"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleWishlist, checkWishlistStatus } from "@/app/actions/wishlist";
import { toast } from "sonner";

interface WishlistButtonProps {
  productId: number;
  className?: string;
}

export function WishlistButton({ productId, className }: WishlistButtonProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check initial status on mount
  useEffect(() => {
    checkWishlistStatus(productId).then(setIsWishlisted);
  }, [productId]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to product page
    e.stopPropagation();

    setIsLoading(true);
    try {
      const result = await toggleWishlist(productId);
      setIsWishlisted(result.isWishlisted);
      toast.success(result.message);
    } catch (error) {
      toast.error("Failed to update wishlist");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("rounded-full bg-white/30 backdrop-blur-xs hover:text-red-600 transition-colors", className)}
      onClick={handleToggle}
      disabled={isLoading}
    >
      <Heart
        className={cn("h-5 w-5 transition-all", {
          "fill-red-600 text-red-600": isWishlisted,
          "text-muted-foreground": !isWishlisted,
        })}
      />
      <span className="sr-only">Add to wishlist</span>
    </Button>
  );
}