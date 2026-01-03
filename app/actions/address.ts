"use server";

import { db } from "@/db";
import { addresses } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function getSessionUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user?.id;
}

export async function addAddress(formData: FormData) {
  const userId = await getSessionUser();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Extract all fields
  const label = formData.get("label") as string;
  const name = formData.get("name") as string;
  const mobile = formData.get("mobile") as string;
  const altPhone = formData.get("altPhone") as string;
  const address = formData.get("address") as string;
  const landmark = formData.get("landmark") as string;
  const city = formData.get("city") as string;
  const state = formData.get("state") as string;
  const pincode = formData.get("pincode") as string;

  // Check if this is the first address to make it default
  const existing = await db
    .select()
    .from(addresses)
    .where(eq(addresses.userId, userId));
  const isSelected = existing.length === 0;

  await db.insert(addresses).values({
    userId,
    label,
    name,
    mobile,
    altPhone: altPhone || null,
    address,
    landmark: landmark || null,
    city,
    state,
    pincode,
    isSelected,
  });

  revalidatePath("/");
}

export async function selectAddress(addressId: number) {
  const userId = await getSessionUser();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // 1. Unselect all addresses for this user
    await db
      .update(addresses)
      .set({ isSelected: false })
      .where(eq(addresses.userId, userId));

    // 2. Select the specific address
    await db
      .update(addresses)
      .set({ isSelected: true })
      .where(and(eq(addresses.userId, userId), eq(addresses.id, addressId)));

    revalidatePath("/");
  } catch (error) {
    console.error("Failed to select address:", error);
    throw new Error("Failed to update selected address.");
  }
}

export async function getUserAddresses() {
  const userId = await getSessionUser();
  if (!userId) {
    return [];
  }

  const data = await db
    .select()
    .from(addresses)
    .where(eq(addresses.userId, userId))
    .orderBy(desc(addresses.createdAt)); // Most recent first

  return data;
}

// Helper: Get the currently active address (Useful for Navbar display)
export async function getActiveAddress() {
  const userId = await getSessionUser();
  if (!userId) {
    return null;
  }

  const data = await db
    .select()
    .from(addresses)
    .where(and(eq(addresses.userId, userId), eq(addresses.isSelected, true)))
    .limit(1);

  return data[0] || null;
}
// ... keep selectAddress, getUserAddresses, getActiveAddress the same ...
