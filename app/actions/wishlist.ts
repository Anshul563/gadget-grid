"use server";

import { db } from "@/db";
import { wishlists, products } from "@/db/schema";
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

export async function toggleWishlist(productId: number) {
  const userId = await getSessionUser();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Check if already in wishlist
  const existing = await db
    .select()
    .from(wishlists)
    .where(
      and(eq(wishlists.userId, userId), eq(wishlists.productId, productId))
    )
    .limit(1);

  if (existing.length > 0) {
    // Remove
    await db.delete(wishlists).where(eq(wishlists.id, existing[0].id));

    revalidatePath("/wishlist");
    revalidatePath("/");
    return { isWishlisted: false, message: "Removed from wishlist" };
  } else {
    // Add
    await db.insert(wishlists).values({
      userId,
      productId,
    });

    revalidatePath("/wishlist");
    revalidatePath("/");
    return { isWishlisted: true, message: "Added to wishlist" };
  }
}

export async function getWishlist() {
  const userId = await getSessionUser();
  if (!userId) {
    return [];
  }

  const data = await db
    .select({
      wishlistId: wishlists.id,
      product: products,
    })
    .from(wishlists)
    .innerJoin(products, eq(wishlists.productId, products.id))
    .where(eq(wishlists.userId, userId))
    .orderBy(desc(wishlists.createdAt));

  // Transform to match your ProductCard interface
  return data.map((item) => {
    // Reuse the same transform logic you used in get-products.ts if possible
    // Simplified inline transform here:
    return {
      ...item.product,
      price: parseFloat(item.product.price), // ensure number
      // Add other necessary transformations
      image: Array.isArray(item.product.images)
        ? item.product.images[0]
        : "/images/placeholder.png",
    };
  });
}

export async function checkWishlistStatus(productId: number) {
  const userId = await getSessionUser();
  if (!userId) {
    return false;
  }

  const existing = await db
    .select()
    .from(wishlists)
    .where(
      and(eq(wishlists.userId, userId), eq(wishlists.productId, productId))
    )
    .limit(1);

  return existing.length > 0;
}
