"use server";

import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateOrderStatus(orderId: number, newStatus: string) {
  // Cast string to the enum type specific to your schema if strict strictness is needed, 
  // but for update queries, passing the string works if it matches the enum values.
  
  await db.update(orders)
    .set({ status: newStatus as "pending" | "processing" | "shipped" | "delivered" | "cancelled" })
    .where(eq(orders.id, orderId));

  revalidatePath("/admin/orders");
}