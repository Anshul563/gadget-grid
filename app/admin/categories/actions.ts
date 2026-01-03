"use server";

import { db } from "@/db";
import { categories, subcategories } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

// Helper to make slugs (e.g. "Gaming Headphones" -> "gaming-headphones")
function makeSlug(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// 1. Create Main Category
export async function createCategory(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!name) return { error: "Name is required" };

  await db.insert(categories).values({
    name,
    slug: makeSlug(name),
    description,
    isActive: true,
  });

  revalidatePath("/admin/categories");
  return { success: true };
}

// 2. Create Subcategory
export async function createSubcategory(
  categoryId: number,
  formData: FormData
) {
  const name = formData.get("name") as string;

  if (!name) return { error: "Name is required" };

  await db.insert(subcategories).values({
    name,
    slug: makeSlug(name),
    categoryId,
    isActive: true,
  });

  revalidatePath("/admin/categories");
  return { success: true };
}

// 3. Delete Category
export async function deleteCategory(id: number) {
  try {
    // Note: This might fail if products are linked (foreign key constraint).
    // In a real app, you should check for products first.
    await db.delete(categories).where(eq(categories.id, id));
    revalidatePath("/admin/categories");
  } catch (error) {
    console.error("Failed to delete category:", error);
  }
}

// 4. Delete Subcategory
export async function deleteSubcategory(id: number) {
  await db.delete(subcategories).where(eq(subcategories.id, id));
  revalidatePath("/admin/categories");
}
