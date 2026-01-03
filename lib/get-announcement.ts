import { db } from "@/db";
import { announcements } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function getActiveAnnouncement() {
  // Fetches the most recent ACTIVE announcement
  const data = await db
    .select()
    .from(announcements)
    .where(eq(announcements.isActive, true))
    .orderBy(desc(announcements.createdAt))
    .limit(1);

  return data[0] || null;
}