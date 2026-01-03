import { db } from "@/db";
import { products } from "@/db/schema";
import { desc, eq, and, gt, lte, gte, asc, type SQL, ne } from "drizzle-orm";

// 1. Define the interface for filters
export type ProductFilterParams = {
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort?: string;
};

// 2. Helper to Transform DB Result -> UI Component
// This keeps your code DRY (Don't Repeat Yourself)
function transformProduct(item: typeof products.$inferSelect) {
  // Parse Decimal strings to numbers
  const basePrice = parseFloat(item.price);
  const salePrice = item.salePrice ? parseFloat(item.salePrice) : null;

  // Determine "Current" price (what user pays) and "Old" price (MSRP)
  const currentPrice = salePrice || basePrice;
  const oldPrice = salePrice ? basePrice : null;

  // Calculate Discount %
  let discount = 0;
  if (oldPrice && oldPrice > currentPrice) {
    discount = Math.round(((oldPrice - currentPrice) / oldPrice) * 100);
  }

  // Handle Images
  // Ensure we get an array, even if DB returns null
  const allImages =
    item.images && Array.isArray(item.images) && item.images.length > 0
      ? item.images
      : ["/images/placeholder.png"];

  // Primary image for cards is the first one
  const primaryImage = allImages[0];

  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    price: currentPrice,
    oldPrice: oldPrice,
    discount: discount,
    image: primaryImage, // For Product Card (string)
    images: allImages, // For Product Page Gallery (string[])
    rating: 4.5, // Default hardcoded for now
    salesCount: 0, // Default hardcoded for now
    description: item.description,
  };
}

// --- Fetcher Functions ---

export async function getNewArrivals() {
  const data = await db
    .select()
    .from(products)
    // Filter: Active AND marked as "New Arrival"
    .where(and(eq(products.isActive, true), eq(products.isNewArrival, true)))
    .orderBy(desc(products.createdAt))
    .limit(10);

  return data.map(transformProduct);
}

export async function getAllProducts(params: ProductFilterParams) {
  const conditions = [eq(products.isActive, true)];

  // Apply Price Filters
  if (params.minPrice !== undefined) {
    conditions.push(gte(products.price, params.minPrice.toString()));
  }

  if (params.maxPrice !== undefined) {
    conditions.push(lte(products.price, params.maxPrice.toString()));
  }

  // Apply Stock Filter
  if (params.inStock) {
    conditions.push(gte(products.stock, 1));
  }

  // Determine Sorting Order
  let orderBySQL: SQL<unknown> | undefined;

  if (params.sort === "price_asc") {
    orderBySQL = asc(products.price);
  } else if (params.sort === "price_desc") {
    orderBySQL = desc(products.price);
  } else {
    orderBySQL = desc(products.createdAt); // Default: Newest
  }

  // Pass it into the query chain
  const data = await db
    .select()
    .from(products)
    .where(and(...conditions))
    .orderBy(orderBySQL);

  return data.map(transformProduct);
}

export async function getProductBySlug(slug: string) {
  const data = await db
    .select()
    .from(products)
    .where(and(eq(products.isActive, true), eq(products.slug, slug)))
    .limit(1);

  if (data.length === 0) return null;

  return transformProduct(data[0]);
}

export async function getRelatedProducts(currentProductId: number) {
  // Simple "Related" logic: Fetch 4 active products that aren't the current one
  const data = await db
    .select()
    .from(products)
    .where(and(eq(products.isActive, true), ne(products.id, currentProductId)))
    .orderBy(desc(products.createdAt))
    .limit(4);

  return data.map(transformProduct);
}
