import { db } from "@/db";
import { orders, orderItems, products } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Package, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

async function getSessionUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user?.id;
}

export default async function OrdersPage() {
    const userId = await getSessionUser();
    if (!userId) {
      return redirect("/login");
    }
  // Fetch orders with items
  const userOrders = await db.query.orders.findMany({
    where: eq(orders.userId, userId),
    orderBy: [desc(orders.createdAt)],
    with: {
      // Assuming you set up relations in schema.ts, otherwise manual join needed
      // If no relations, use the manual query below *
    }
  });

  // * Manual Query Fallback (Use this if you haven't set up Drizzle Relations)
  const allOrders = await db.select().from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));

  return (
    <div className="container py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      <div className="space-y-6">
        {allOrders.length === 0 ? (
           <div className="text-center py-12 border rounded-lg bg-gray-50">
             <Package className="h-12 w-12 mx-auto text-gray-300 mb-3"/>
             <h3 className="text-lg font-medium">No orders yet</h3>
             <Button asChild className="mt-4" variant="outline"><Link href="/">Start Shopping</Link></Button>
           </div>
        ) : (
          allOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="bg-muted/30 flex flex-row items-center justify-between py-4">
                <div className="flex flex-col gap-1">
                  <CardTitle className="text-base">
                    Order <span className="font-mono text-muted-foreground">#{order.id}</span>
                  </CardTitle>
                  <span className="text-xs text-muted-foreground">
                    {new Date(order.createdAt!).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={order.status === "delivered" ? "default" : "secondary"} className="capitalize">
                    {order.status}
                  </Badge>
                  <span className="font-bold">
                    {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(parseFloat(order.finalAmount))}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                 {/* To show images here, you would need to fetch orderItems 
                    for this specific order ID. 
                    For performance, usually we just show a "View Details" button.
                 */}
                 <div className="flex items-center justify-between">
                    <div className="text-sm">
                        <p className="font-medium">Shipping To:</p>
                        <p className="text-muted-foreground">
                          {order.shippingAddress.name}, {order.shippingAddress.city}
                        </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/account/orders/${order.id}`}>
                            View Details <ChevronRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                 </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}