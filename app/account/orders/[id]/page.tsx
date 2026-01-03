import { db } from "@/db";
import { orders, orderItems, products } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MapPin, CreditCard, Package } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function getSessionUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user?.id;
}

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const userId = await getSessionUser();
    if (!userId) {
      return redirect("/login");
    }
  const { id } = await params;
  const orderId = parseInt(id);

  if (isNaN(orderId)) notFound();

  // 1. Fetch Order
  const order = await db.query.orders.findFirst({
    where: and(eq(orders.id, orderId), eq(orders.userId, userId)),
  });

  if (!order) notFound();

  // 2. Fetch Items (Manual Join to get Product details)
  const items = await db.select({
      id: orderItems.id,
      quantity: orderItems.quantity,
      price: orderItems.price,
      productName: products.name,
      productImage: products.images,
      productSlug: products.slug,
    })
    .from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, orderId));

  const formatPrice = (amount: number | string) => 
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(amount));

  return (
    <div className="container py-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/orders"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            Order #{order.id}
            <Badge variant={order.status === "delivered" ? "default" : "secondary"} className="capitalize">
              {order.status}
            </Badge>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Placed on {new Date(order.createdAt!).toLocaleDateString()} at {new Date(order.createdAt!).toLocaleTimeString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Items */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Items ({items.length})</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              {items.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded border bg-muted">
                      <Image
                        src={Array.isArray(item.productImage) ? item.productImage[0] : "/placeholder.png"}
                        alt={item.productName}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium line-clamp-1">{item.productName}</h4>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatPrice(item.price)}</p>
                    <p className="text-xs text-muted-foreground">
                       Total: {formatPrice(Number(item.price) * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Summary */}
        <div className="space-y-6">
            
          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p className="font-medium">{order.shippingAddress.name}</p>
              <p className="text-muted-foreground">{order.shippingAddress.street}</p>
              <p className="text-muted-foreground">
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
              </p>
              <p className="text-muted-foreground mt-2">Phone: {order.shippingAddress.mobile}</p>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
               <div className="flex justify-between">
                  <span className="text-muted-foreground">Method</span>
                  <span className="font-medium uppercase">{order.paymentMethod}</span>
               </div>
               <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Status</span>
                  <Badge variant="outline" className="capitalize">{order.paymentStatus}</Badge>
               </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-green-600">-{formatPrice(order.discountAmount || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatPrice(order.finalAmount)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}