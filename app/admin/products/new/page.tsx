import { db } from "@/db";
import { categories, subcategories } from "@/db/schema";
import { ProductForm } from "@/components/admin/product-form";

export default async function AddProductPage() {
  // Fetch data for dropdowns
  const allCategories = await db.select().from(categories);
  const allSubcategories = await db.select().from(subcategories);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
        <p className="text-muted-foreground">Fill in the details below.</p>
      </div>
      
      <div className="border rounded-lg p-6 bg-card">
         <ProductForm 
            categories={allCategories} 
            subcategories={allSubcategories} 
         />
      </div>
    </div>
  );
}