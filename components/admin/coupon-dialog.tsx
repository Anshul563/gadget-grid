"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCoupon } from "@/app/admin/coupons/actions";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";

export function CouponDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setIsLoading(true);
    const result = await createCoupon(formData);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Coupon created successfully");
      setOpen(false);
    }
    setIsLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create Coupon
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Coupon</DialogTitle>
        </DialogHeader>
        <form action={onSubmit} className="grid gap-4 py-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Coupon Code</Label>
              <Input id="code" name="code" placeholder="SUMMER20" required className="uppercase" />
            </div>
            <div className="space-y-2">
              <Label>Discount Type</Label>
              <Select name="discountType" defaultValue="percent">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value">Discount Value</Label>
              <Input id="value" name="discountValue" type="number" placeholder="20" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="min">Min Spend (Optional)</Label>
              <Input id="min" name="minOrderAmount" type="number" placeholder="499" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max">Max Discount (Optional for %)</Label>
            <Input id="max" name="maxDiscountAmount" type="number" placeholder="e.g. Upto 200" />
            <p className="text-[10px] text-muted-foreground">Useful for limiting big % discounts.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expires">Expires On</Label>
              <Input id="expires" name="expiresAt" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="limit">Usage Limit</Label>
              <Input id="limit" name="usageLimit" type="number" placeholder="100" />
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="mt-2">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Coupon
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}