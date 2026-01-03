import { db } from "@/db";
import { products, categories, subcategories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  // Await params in Next.js 15
  const { id } = await params;
  const productId = parseInt(id);

  if (isNaN(productId)) return notFound();

  // 1. Fetch Product
  const product = await db.query.products.findFirst({
    where: eq(products.id, productId),
    with: {
        // We need subcategory to find the parent category
        subcategory: true 
    }
  });

  if (!product) return notFound();

  // 2. Fetch Dropdown Data
  const allCategories = await db.select().from(categories);
  const allSubcategories = await db.select().from(subcategories);

  // 3. Prepare Initial Data
  // We need to pass the categoryId manually because it lives on the Subcategory, not the Product
  const initialData = {
    ...product,
    categoryId: product.subcategory?.categoryId, 
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
        <p className="text-muted-foreground">Update product details and inventory.</p>
      </div>
      
      <div className="border rounded-lg p-6 bg-card">
         <ProductForm 
            categories={allCategories} 
            subcategories={allSubcategories}
            initialData={initialData}
         />
      </div>
    </div>
  );
}