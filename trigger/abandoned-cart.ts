import { schedules } from "@trigger.dev/sdk/v3";
import { db } from "@/db"; // Ensure this path matches your db export
import { carts, user } from "@/db/schema";
import { lt, and, eq, isNotNull } from "drizzle-orm";
import { sendEmail } from "@/lib/email"; // We will create this helper next

export const abandonedCartTask = schedules.task({
  id: "check-abandoned-carts",
  // 1. CRON Expression: Run at minute 0 of every hour (e.g., 1:00, 2:00...)
  cron: "0 * * * *", 
  run: async (payload, { ctx }) => {
    console.log("🕵️ Checking for abandoned carts...");

    // 2. Logic: Find carts updated > 1 hour ago that haven't been emailed yet
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const abandonedCarts = await db
      .select({
        cartId: carts.id,
        userEmail: user.email,
        userName: user.name,
      })
      .from(carts)
      .innerJoin(user, eq(carts.userId, user.id))
      .where(
        and(
          lt(carts.updatedAt, oneHourAgo),
          eq(carts.reminderSent, false),
          isNotNull(carts.items) 
        )
      );

    console.log(`Found ${abandonedCarts.length} abandoned carts.`);

    // 3. Send Emails
    for (const cart of abandonedCarts) {
      // Wrap in try/catch so one failure doesn't stop the whole loop
      try {
        await sendEmail({
          to: cart.userEmail,
          subject: "⚡ You left something in your GadgetGrid cart!",
          html: `<p>Hey ${cart.userName}, items in your cart are selling out fast!</p>`,
        });

        // 4. Update DB so we don't spam them
        await db
          .update(carts)
          .set({ reminderSent: true })
          .where(eq(carts.id, cart.cartId));
          
        console.log(`✅ Email sent to ${cart.userEmail}`);
      } catch (err) {
        console.error(`❌ Failed to send to ${cart.userEmail}`, err);
      }
    }
  },
});