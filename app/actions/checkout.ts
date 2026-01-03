"use server";

import { db } from "@/db";
import { orders, orderItems, carts, cartItems, products, addresses } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

async function getSessionUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user?.id;
}

export async function placeOrder(formData: FormData) {
  const userId = await getSessionUser();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  const paymentMethod = formData.get("paymentMethod") as string || "cod";
  
  // 1. Get Cart ID
  const cookieStore = await cookies();
  const sessionCartId = cookieStore.get("cart_session")?.value;
  if (!sessionCartId) throw new Error("No cart session found");

  // 2. Fetch Cart & Items
  const cart = await db.select().from(carts).where(eq(carts.sessionCartId, sessionCartId)).limit(1);
  if (cart.length === 0) throw new Error("Cart is empty");

  const items = await db.select({
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      price: products.price,
      salePrice: products.salePrice, // Assuming you added this to products
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.cartId, cart[0].id));

  if (items.length === 0) throw new Error("Cart is empty");

  // 3. Calculate Financials
  // We calculate this on the server to prevent client-side manipulation
  const subtotal = items.reduce((sum, item) => {
    const price = item.salePrice ? parseFloat(item.salePrice) : parseFloat(item.price);
    return sum + (price * item.quantity);
  }, 0);
  
  // Discount Logic (You can expand this later for coupon codes)
  const discountAmount = 0; 
  const finalAmount = subtotal - discountAmount;

  // 4. Get Selected Address for Snapshot
  // We fetch the address *data* to store it permanently in the order JSON
  const activeAddress = await db.select()
    .from(addresses)
    .where(and(eq(addresses.userId, userId), eq(addresses.isSelected, true)))
    .limit(1);

  if (activeAddress.length === 0) throw new Error("No delivery address selected");

  const addressData = activeAddress[0];

  // 5. Transaction: Create Order -> Move Items -> Clear Cart
  const orderId = await db.transaction(async (tx) => {
    
    // A. Create Order
    const [newOrder] = await tx.insert(orders).values({
      userId,
      status: "pending", // Matches your Enum
      paymentStatus: "pending", // Matches your Enum
      paymentMethod,
      
      // Financials (Converted to strings for Decimal type)
      totalAmount: subtotal.toFixed(2),
      discountAmount: discountAmount.toFixed(2),
      finalAmount: finalAmount.toFixed(2),
      
      // Address Snapshot (JSONB)
      shippingAddress: {
        name: addressData.name, // Ensure your address table has this column
        mobile: addressData.mobile,
        street: addressData.address, // mapping 'address' col to 'street' field
        city: addressData.city,
        state: addressData.state,
        pincode: addressData.pincode,
        // phone: ... add if needed
      },
    }).returning({ id: orders.id });

    // B. Create Order Items
    for (const item of items) {
      const price = item.salePrice ? item.salePrice : item.price;
      
      await tx.insert(orderItems).values({
        orderId: newOrder.id,
        productId: item.productId!,
        quantity: item.quantity,
        price: price.toString(), // Store price at time of purchase
      });
    }

    // C. Clear Cart
    await tx.delete(cartItems).where(eq(cartItems.cartId, cart[0].id));
    
    return newOrder.id;
  });

  redirect(`/checkout/success/${orderId}`);
}