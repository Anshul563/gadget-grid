import { getWishlist } from "@/app/actions/wishlist";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default async function WishlistPage() {
  const wishlistItems = await getWishlist();

  return (
    <div className="container mx-auto px-4 py-8 min-h-[70vh]">
      <div className="flex items-center gap-2 mb-8">
        <Heart className="w-6 h-6 text-red-500 fill-current" />
        <h1 className="text-3xl font-bold tracking-tight">My Wishlist</h1>
        <span className="ml-2 text-muted-foreground text-sm bg-muted px-2 py-1 rounded-full">
          {wishlistItems.length} Items
        </span>
      </div>

      {wishlistItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistItems.map((product) => (
             // @ts-ignore - Ignore exact type mismatch for demo
            <div key={product.id} className="h-full">
              <ProductCard data={product} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="bg-muted/30 p-6 rounded-full">
            <Heart className="w-12 h-12 text-muted-foreground/30" />
          </div>
          <h2 className="text-xl font-semibold">Your wishlist is empty</h2>
          <p className="text-muted-foreground max-w-sm">
            Save items you love here to buy them later.
          </p>
          <Button asChild className="mt-4">
            <Link href="/products">
              <ShoppingBag className="mr-2 h-4 w-4" /> Start Shopping
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}