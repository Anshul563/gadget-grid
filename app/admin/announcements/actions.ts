"use server";

import { db } from "@/db";
import { announcements } from "@/db/schema";
import { eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createAnnouncement(formData: FormData) {
  const message = formData.get("message") as string;
  const link = formData.get("link") as string;
  const backgroundColor = formData.get("backgroundColor") as string;
  const textColor = formData.get("textColor") as string;

  // 1. Optional: Deactivate all other announcements so only the new one is active
  // This prevents multiple bars from stacking up on the frontend
  await db.update(announcements).set({ isActive: false }).where(ne(announcements.id, 0));

  // 2. Insert the new announcement
  await db.insert(announcements).values({
    message,
    link: link || null, // Handle empty string as null
    backgroundColor: backgroundColor || "#000000",
    textColor: textColor || "#ffffff",
    isActive: true, // Auto-activate the new one
  });

  // 3. Revalidate paths so changes show up immediately
  revalidatePath("/"); // Update the homepage
  revalidatePath("/admin/announcements"); // Update the admin list
}

export async function deleteAnnouncement(id: number) {
  await db.delete(announcements).where(eq(announcements.id, id));
  
  revalidatePath("/");
  revalidatePath("/admin/announcements");
}

export async function toggleAnnouncement(id: number, currentStatus: boolean) {
  const newStatus = !currentStatus;

  // If we are turning one ON, we might want to turn others OFF (optional but cleaner)
  if (newStatus === true) {
     await db.update(announcements).set({ isActive: false }).where(ne(announcements.id, id));
  }

  await db
    .update(announcements)
    .set({ isActive: newStatus })
    .where(eq(announcements.id, id));

  revalidatePath("/");
  revalidatePath("/admin/announcements");
}