import { db } from "@/db";
import { categories, subcategories } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { CategoryDialog } from "@/components/admin/category-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, FolderTree } from "lucide-react";
import { deleteCategory, deleteSubcategory } from "./actions";

export default async function CategoriesPage() {
  // 1. Fetch Categories WITH Subcategories
  // Since Drizzle 'with' queries require setup in schema relations, 
  // we will do a manual join or two queries for simplicity if relations aren't perfect yet.
  
  // Method: Fetch all categories, fetch all subcategories, map them in JS.
  const allCategories = await db.select().from(categories);
  const allSubcategories = await db.select().from(subcategories);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
           <p className="text-muted-foreground">Manage your product hierarchy</p>
        </div>
        <CategoryDialog /> {/* The "Add Main Category" button */}
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {allCategories.map((cat) => {
          // Filter subcategories for this parent
          const subs = allSubcategories.filter((s) => s.categoryId === cat.id);

          return (
            <Card key={cat.id} className="relative group">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-md text-primary">
                             <FolderTree className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">{cat.name}</CardTitle>
                            <p className="text-xs text-muted-foreground font-normal">/{cat.slug}</p>
                        </div>
                    </div>
                    {/* Delete Main Category Button */}
                    <form action={deleteCategory.bind(null, cat.id)}>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                    {/* Subcategory List */}
                    <div className="flex flex-wrap gap-2">
                        {subs.length > 0 ? (
                            subs.map((sub) => (
                                <Badge key={sub.id} variant="secondary" className="flex items-center gap-1 pr-1">
                                    {sub.name}
                                    {/* Delete Subcategory (Tiny X) */}
                                    <form action={deleteSubcategory.bind(null, sub.id)}>
                                        <button className="ml-1 hover:bg-destructive hover:text-white rounded-full p-0.5 transition-colors">
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </form>
                                </Badge>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground italic">No subcategories</p>
                        )}
                    </div>
                    
                    {/* Add Subcategory Button */}
                    <div className="pt-2 border-t mt-4">
                        <CategoryDialog parentId={cat.id} triggerLabel="Add Subcategory" />
                    </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {/* Empty State if no categories */}
        {allCategories.length === 0 && (
            <div className="col-span-full flex h-40 items-center justify-center rounded-md border border-dashed text-muted-foreground">
                No categories found. Create one to get started.
            </div>
        )}
      </div>
    </div>
  );
}