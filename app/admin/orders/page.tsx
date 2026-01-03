import { db } from "@/db";
import { orders, orderItems, products, user } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Printer } from "lucide-react";
import { format } from "date-fns";
import { OrderStatusSelect } from "@/components/admin/order-status-select";

export default async function AdminOrdersPage() {
  // 1. Fetch Orders with Relations
  // Note: If using Drizzle Query API, this is cleaner. 
  // If not, we use manual joins. Assuming relations are set up in schema.ts:
  const allOrders = await db.query.orders.findMany({
    with: {
      user: true,
      items: {
        with: {
          product: true,
        },
      },
    },
    orderBy: [desc(orders.createdAt)],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Manage customer orders and shipments.</p>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">#{order.id}</TableCell>
                
                {/* Customer Info */}
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{order.user?.name || "Guest"}</span>
                    <span className="text-xs text-muted-foreground">{order.user?.email}</span>
                  </div>
                </TableCell>
                
                {/* Date */}
                <TableCell>
                  {order.createdAt ? format(new Date(order.createdAt), "MMM d, yyyy") : "-"}
                </TableCell>
                
                {/* Total */}
                <TableCell>₹{order.finalAmount}</TableCell>
                
                {/* Status Dropdown */}
                <TableCell>
                  <OrderStatusSelect orderId={order.id} currentStatus={order.status || "pending"} />
                </TableCell>
                
                {/* Actions: View Details / Print */}
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {/* View Details Dialog */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" title="View Details">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Order Details #{order.id}</DialogTitle>
                        </DialogHeader>
                        
                        <div className="grid gap-6 py-4">
                           {/* Shipping Info */}
                           <div className="grid grid-cols-2 gap-4 text-sm border p-4 rounded-md bg-muted/20">
                              <div>
                                <p className="font-semibold mb-1">Shipping Address</p>
                                <p>{order.shippingAddress?.street}</p>
                                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                                <p>{order.shippingAddress?.zip}</p>
                                <p className="mt-1 text-muted-foreground">Phone: {order.shippingAddress?.phone}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold mb-1">Payment Info</p>
                                <p>Razorpay ID: <span className="font-mono text-xs">{order.paymentId}</span></p>
                                <p>Total Paid: ₹{order.finalAmount}</p>
                              </div>
                           </div>

                           {/* Order Items List */}
                           <div className="space-y-4">
                              <h4 className="font-medium">Items Ordered</h4>
                              <div className="border rounded-md divide-y">
                                {order.items.map((item) => (
                                  <div key={item.id} className="flex justify-between p-3 text-sm">
                                     <div className="flex gap-4">
                                        <div className="font-medium">
                                          {item.quantity}x
                                        </div>
                                        <div>
                                          <p className="font-medium">{item.product.name}</p>
                                          <p className="text-muted-foreground text-xs">Unit Price: ₹{item.price}</p>
                                        </div>
                                     </div>
                                     <div className="font-medium">
                                        ₹{(Number(item.price) * item.quantity).toFixed(2)}
                                     </div>
                                  </div>
                                ))}
                              </div>
                           </div>
                        </div>
                        
                        <div className="flex justify-end">
                           <Button variant="outline" onClick={() => window.print()}>
                              <Printer className="mr-2 h-4 w-4" /> Print Invoice
                           </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {allOrders.length === 0 && (
           <div className="p-8 text-center text-muted-foreground">
              No orders found yet.
           </div>
        )}
      </div>
    </div>
  );
}