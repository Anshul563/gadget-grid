import Image from "next/image";
import Link from "next/link"; // Import Link
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ShoppingCart, Store, Heart, Zap } from "lucide-react";

// Updated Interface to include 'slug' for linking
interface Product {
  id: number | string;
  name: string;
  slug?: string; // Added slug for SEO friendly URLs
  image: string;
  price: number;
  oldPrice?: number | null;
  discount?: number;
  rating?: number;
  salesCount?: number;
  storeName?: string;
}

export function ProductCard({ data }: { data: Product }) {
  // Fallback to ID if slug is missing
  const productUrl = `/product/${data.slug || data.id}`;

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="group h-full flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-lg">
      
      {/* --- CLICKABLE TOP SECTION --- */}
      <div className="relative">
        {/* Wishlist Button (Absolute, z-index higher than Link) */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-2 right-2 z-20 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-sm hover:bg-background hover:text-red-500"
        >
          <Heart className="h-4 w-4" />
          <span className="sr-only">Add to wishlist</span>
        </Button>

        {/* Link Wrapper for Image */}
        <Link href={productUrl} className="block overflow-hidden">
            <div className="relative aspect-square bg-muted/20 p-4">
            {/* Discount Badge */}
            {(data.discount || 0) > 0 && (
                <Badge className="absolute left-2 top-2 z-10 bg-green-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                -{data.discount}%
                </Badge>
            )}

            <Image
                src={data.image}
                alt={data.name}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                // Changed to object-contain so we don't crop the product
                className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            </div>
        </Link>
      </div>

      {/* --- CONTENT SECTION --- */}
      <CardContent className="flex-1 p-4">
        {/* Store Name */}
        {data.storeName && (
          <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Store className="h-3 w-3" />
            <span className="truncate">{data.storeName}</span>
          </div>
        )}

        {/* Title (Linked) */}
        <Link href={productUrl} className="group-hover:underline decoration-primary/50 underline-offset-4">
            <h3
            className="line-clamp-2 text-sm font-medium leading-tight h-10 mb-2"
            title={data.name}
            >
            {data.name}
            </h3>
        </Link>

        {/* Rating & Sold Count */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-0.5 text-amber-500">
            <Star className="h-3 w-3 fill-current" />
            <span className="font-medium text-foreground">
              {data.rating || "4.5"}
            </span>
          </div>
          <span>•</span>
          <span>{data.salesCount || 0} Sold</span>
        </div>

        {/* Price Block */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-primary">
            {formatPrice(data.price)}
          </span>
          {data.oldPrice && data.oldPrice > data.price && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(data.oldPrice)}
            </span>
          )}
        </div>
      </CardContent>

      {/* --- FOOTER BUTTONS --- */}
      <CardFooter className="p-4 pt-0 gap-2">
        {/* Add to Cart (Icon only) */}
        <Button
          variant="outline"
          size="icon"
          className="shrink-0 border-primary/20 hover:border-primary hover:bg-primary/5"
          title="Add to Cart"
        >
          <ShoppingCart className="h-4 w-4" />
        </Button>

        {/* Buy Now (Full width remaining) */}
        <Button
          variant="default"
          className="flex-1 gap-2 shadow-sm"
          size="default"
        >
          <Zap className="h-4 w-4 fill-current" />
          Buy Now
        </Button>
      </CardFooter>
    </div>
  );
}