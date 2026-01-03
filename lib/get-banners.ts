import { db } from "@/db";
import { banners } from "@/db/schema";
import { and, asc, eq, isNull, or, gte, lte } from "drizzle-orm";

export async function getActiveBanners() {
  const now = new Date();

  return await db.query.banners.findMany({
    where: and(
      eq(banners.isActive, true), // Must be active
      // Logic: (Start is null OR Start <= Now) AND (End is null OR End >= Now)
      and(
        or(isNull(banners.startDate), lte(banners.startDate, now)),
        or(isNull(banners.endDate), gte(banners.endDate, now))
      )
    ),
    orderBy: [asc(banners.sortOrder), asc(banners.createdAt)],
  });
}