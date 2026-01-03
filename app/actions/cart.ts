"use server";

import { db } from "@/db";
import { carts, cartItems, products } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function getSessionUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user?.id;
}

// Helper: Get or Create Cart ID
async function getCartId() {
  const cookieStore = await cookies();
  const sessionCartId = cookieStore.get("cart_session")?.value;

  if (sessionCartId) {
    // Check if it exists in DB
    const cart = await db
      .select()
      .from(carts)
      .where(eq(carts.sessionCartId, sessionCartId))
      .limit(1);
    if (cart.length > 0) return cart[0].id;
  }

  // Create new cart if none exists
  const newSessionId = crypto.randomUUID();
  const userId = await getSessionUser();

  const newCart = await db
    .insert(carts)
    .values({
      sessionCartId: newSessionId,
      userId: userId || null,
    })
    .returning({ id: carts.id });

  // Set cookie
  cookieStore.set("cart_session", newSessionId);
  return newCart[0].id;
}

export async function addToCart(productId: number, quantity: number = 1) {
  const cartId = await getCartId();

  // Check if item already exists in cart
  const existingItem = await db
    .select()
    .from(cartItems)
    .where(
      and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId))
    )
    .limit(1);

  if (existingItem.length > 0) {
    // Update quantity
    await db
      .update(cartItems)
      .set({ quantity: existingItem[0].quantity + quantity })
      .where(eq(cartItems.id, existingItem[0].id));
  } else {
    // Add new item
    await db.insert(cartItems).values({
      cartId,
      productId,
      quantity,
    });
  }

  revalidatePath("/");
}

export async function getCart() {
  const cookieStore = await cookies();
  const sessionCartId = cookieStore.get("cart_session")?.value;
  if (!sessionCartId) return [];

  const cart = await db
    .select()
    .from(carts)
    .where(eq(carts.sessionCartId, sessionCartId))
    .limit(1);
  if (cart.length === 0) return [];

  // Fetch items with product details
  const items = await db
    .select({
      id: cartItems.id,
      quantity: cartItems.quantity,
      product: products,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.cartId, cart[0].id));

  return items;
}

export async function removeFromCart(itemId: number) {
  await db.delete(cartItems).where(eq(cartItems.id, itemId));
  revalidatePath("/");
}
