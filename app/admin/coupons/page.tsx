import { db } from "@/db";
import { coupons } from "@/db/schema";
import { desc } from "drizzle-orm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, TicketPercent } from "lucide-react";
import { format } from "date-fns";
import { CouponDialog } from "@/components/admin/coupon-dialog";
import { deleteCoupon, toggleCouponStatus } from "./actions";

export default async function AdminCouponsPage() {
  const allCoupons = await db.select().from(coupons).orderBy(desc(coupons.createdAt));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coupons</h1>
          <p className="text-muted-foreground">Create discounts and promotional codes.</p>
        </div>
        <CouponDialog />
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Constraints</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allCoupons.map((coupon) => (
              <TableRow key={coupon.id}>
                <TableCell>
                  <div className="flex items-center gap-2 font-mono font-bold text-primary">
                    <TicketPercent className="h-4 w-4" />
                    {coupon.code}
                  </div>
                </TableCell>
                
                <TableCell>
                  {/* Fixed: Checked against "PERCENTAGE" and used coupon.value */}
                  {coupon.discountType === "PERCENTAGE" 
                    ? <span className="text-green-600 font-medium">{coupon.value}% Off</span>
                    : <span className="text-green-600 font-medium">₹{coupon.value} Flat Off</span>
                  }
                  {/* Removed maxDiscountAmount as it is not in your schema */}
                </TableCell>
                
                <TableCell className="text-sm">
                  {/* Fixed: used coupon.minOrderValue (with nullish coalescing just in case) */}
                  {(coupon.minOrderValue || 0) > 0 
                    ? `Min spend: ₹${coupon.minOrderValue}` 
                    : "No min spend"}
                  <div className="text-xs text-muted-foreground">
                    {coupon.usageLimit ? `${coupon.usageLimit} total uses` : "Unlimited uses"}
                  </div>
                </TableCell>
                
                <TableCell>
                  {coupon.expiresAt 
                    ? format(new Date(coupon.expiresAt), "MMM d, yyyy") 
                    : <Badge variant="outline">No Expiry</Badge>}
                </TableCell>
                
                <TableCell>
                  {/* Passed correct boolean field */}
                  <form action={toggleCouponStatus.bind(null, coupon.id, !!coupon.isActive)}>
                    <button type="submit" className="cursor-pointer">
                        <Badge variant={coupon.isActive ? "default" : "secondary"}>
                            {coupon.isActive ? "Active" : "Disabled"}
                        </Badge>
                    </button>
                  </form>
                </TableCell>
                
                <TableCell className="text-right">
                  <form action={deleteCoupon.bind(null, coupon.id)}>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {allCoupons.length === 0 && (
          <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
            <TicketPercent className="h-10 w-10 opacity-20" />
            <p>No active coupons found.</p>
          </div>
        )}
      </div>
    </div>
  );
}