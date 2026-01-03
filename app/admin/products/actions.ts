"use server";

import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Helper for slugs
function makeSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
}

export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = formData.get("price") as string;
  const salePrice = formData.get("salePrice") as string;
  const stock = formData.get("stock") as string;
  const subcategoryId = formData.get("subcategoryId") as string;
  const categoryStr = formData.get("category") as string; // Just for reference if needed

  // Handling Images: We expect a comma-separated string of URLs from the frontend
  const imagesString = formData.get("images") as string;
  const images = imagesString ? imagesString.split(",") : [];

  const isFeatured = formData.get("isFeatured") === "on";

  await db.insert(products).values({
    name,
    slug: makeSlug(name) + "-" + Date.now(), // Ensure unique slug
    description,
    price: price, // Drizzle handles decimal conversion string->decimal
    salePrice: salePrice || null,
    stock: parseInt(stock),
    subcategoryId: parseInt(subcategoryId),
    images: images, // Save array of URLs
    isFeatured,
  });

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function deleteProduct(id: number) {
  try {
    await db.delete(products).where(eq(products.id, id));
    revalidatePath("/admin/products");
  } catch (error) {
    console.error("Failed to delete product:", error);
  }
}

export async function updateProduct(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = formData.get("price") as string;
  const salePrice = formData.get("salePrice") as string;
  const stock = formData.get("stock") as string;
  const subcategoryId = formData.get("subcategoryId") as string;

  // Handle Images
  const imagesString = formData.get("images") as string;
  const images = imagesString ? imagesString.split(",") : [];

  const isFeatured = formData.get("isFeatured") === "on";

  await db
    .update(products)
    .set({
      name,
      description,
      price: price,
      salePrice: salePrice || null,
      stock: parseInt(stock),
      subcategoryId: parseInt(subcategoryId),
      images: images,
      isFeatured,
      updatedAt: new Date(), // Update timestamp
    })
    .where(eq(products.id, id));

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  redirect("/admin/products");
}
