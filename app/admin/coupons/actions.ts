"use server";

import { db } from "@/db";
import { coupons } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// 1. Create Coupon
export async function createCoupon(formData: FormData) {
  const code = formData.get("code") as string;
  const discountType = formData.get("discountType") as "percent" | "fixed";
  const discountValue = formData.get("discountValue") as string;
  const minOrderAmount = formData.get("minOrderAmount") as string;
  const maxDiscountAmount = formData.get("maxDiscountAmount") as string;
  const expiresAt = formData.get("expiresAt") as string;
  const limit = formData.get("usageLimit") as string;

  if (!code || !discountValue) return { error: "Code and Value required" };

  try {
    await db.insert(coupons).values({
      code: code.toUpperCase().trim(),
      discountType,
      value: parseInt(discountValue),
      minOrderValue: minOrderAmount ? parseInt(minOrderAmount) : 0,
      // maxDiscountAmount is not in the schema currently
      // maxDiscountAmount: maxDiscountAmount ? parseInt(maxDiscountAmount) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      usageLimit: limit ? parseInt(limit) : null,
      isActive: true,
    });

    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Coupon code likely already exists." };
  }
}

// 2. Delete Coupon
export async function deleteCoupon(id: number) {
  await db.delete(coupons).where(eq(coupons.id, id));
  revalidatePath("/admin/coupons");
}

// 3. Toggle Active Status
export async function toggleCouponStatus(id: number, currentStatus: boolean) {
  await db
    .update(coupons)
    .set({ isActive: !currentStatus })
    .where(eq(coupons.id, id));
  revalidatePath("/admin/coupons");
}
