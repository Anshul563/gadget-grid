"use server";

import { db } from "@/db";
import { banners } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Zod Schema for validation
const bannerSchema = z.object({
  title: z.string().min(1, "Title is required"),
  imageUrl: z.string().url("Must be a valid URL"),
  link: z.string().optional(),
  sortOrder: z.coerce.number().optional(),
  startDate: z.string().optional().nullable(), // Receive as string from form
  endDate: z.string().optional().nullable(),
});

export async function createBanner(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const validated = bannerSchema.parse(rawData);

  await db.insert(banners).values({
    title: validated.title,
    imageUrl: validated.imageUrl,
    link: validated.link || null,
    sortOrder: validated.sortOrder || 0,
    startDate: validated.startDate ? new Date(validated.startDate) : null,
    endDate: validated.endDate ? new Date(validated.endDate) : null,
  });

  revalidatePath("/admin/banners");
}

export async function deleteBanner(id: number) {
  await db.delete(banners).where(eq(banners.id, id));
  revalidatePath("/admin/banners");
}

export async function toggleBannerStatus(id: number, currentStatus: boolean) {
  await db.update(banners).set({ isActive: !currentStatus }).where(eq(banners.id, id));
  revalidatePath("/admin/banners");
}