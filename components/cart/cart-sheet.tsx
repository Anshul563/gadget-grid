"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2, Loader2, Plus, Minus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { getCart, removeFromCart } from "@/app/actions/cart";
import { toast } from "sonner"; // Optional: for notifications

export function CartSheet() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch cart when sheet opens
  useEffect(() => {
    if (isOpen) {
      refreshCart();
    }
  }, [isOpen]);

  const refreshCart = async () => {
    setIsLoading(true);
    const cartData = await getCart();
    setItems(cartData);
    setIsLoading(false);
  };

  const handleDelete = async (id: number) => {
    await removeFromCart(id);
    refreshCart(); // Refresh local state
    toast.success("Item removed");
  };

  // Calculate Total
  const total = items.reduce((sum, item) => {
    const price = parseFloat(item.product.salePrice || item.product.price);
    return sum + price * item.quantity;
  }, 0);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(p);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-6 w-6" />
          {items.length > 0 && (
            <span className="absolute right-1 top-1 flex h-3 w-3 items-center justify-center rounded-full bg-primary text-[8px] text-primary-foreground sm:hidden">
              {items.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="px-1">
          <SheetTitle>My Cart ({items.length})</SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center space-y-2">
            <ShoppingCart className="h-12 w-12 text-muted-foreground/50" />
            <span className="text-lg font-medium text-muted-foreground">
              Your cart is empty
            </span>
            <Button variant="link" onClick={() => setIsOpen(false)}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 pr-6">
              <div className="space-y-4 pt-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative h-20 w-20 overflow-hidden rounded-md border bg-muted/50">
                      {/* Handle Image Array safely */}
                      <Image
                        src={
                          Array.isArray(item.product.images) &&
                          item.product.images[0]
                            ? item.product.images[0]
                            : "/images/placeholder.png"
                        }
                        alt={item.product.name}
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="grid gap-1">
                        <h3 className="font-medium leading-none line-clamp-1">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {formatPrice(
                            parseFloat(
                              item.product.salePrice || item.product.price
                            )
                          )}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">
                            Qty: {item.quantity}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="pr-6 pt-4 space-y-4 mb-4">
              <Separator />
              <div className="flex items-center justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              <SheetTrigger asChild>
                <a href="/checkout" onClick={() => setIsOpen(false)}>
                  <Button className="w-full" size="lg">
                    Checkout
                  </Button>
                </a>
              </SheetTrigger>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
