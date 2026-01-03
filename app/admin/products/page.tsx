import Link from "next/link";
import Image from "next/image";
import { db } from "@/db";
import { products, subcategories, categories } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { deleteProduct } from "./actions";

export default async function AdminProductsPage() {
  // 1. Fetch Products with their Subcategory & Category info
  // We perform a join to get the names instead of just IDs
  const allProducts = await db
    .select({
      id: products.id,
      name: products.name,
      price: products.price,
      salePrice: products.salePrice,
      stock: products.stock,
      images: products.images,
      isFeatured: products.isFeatured,
      subcategoryName: subcategories.name,
      categoryName: categories.name,
    })
    .from(products)
    .leftJoin(subcategories, eq(products.subcategoryId, subcategories.id))
    .leftJoin(categories, eq(subcategories.categoryId, categories.id))
    .orderBy(desc(products.createdAt));

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your inventory ({allProducts.length} items)
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </Link>
      </div>

      {/* Products Table */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allProducts.map((product) => (
              <TableRow key={product.id}>
                {/* Image Thumbnail */}
                <TableCell>
                  <div className="relative h-12 w-12 overflow-hidden rounded-md border bg-muted">
                    {product.images && product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                        No Img
                      </div>
                    )}
                  </div>
                </TableCell>
                
                {/* Product Name */}
                <TableCell className="font-medium">
                  {product.name.slice(0, 20)}...
                  {product.isFeatured && (
                    <Badge variant="outline" className="ml-2 border-yellow-500 text-yellow-600">
                      Featured
                    </Badge>
                  )}
                </TableCell>
                
                {/* Category Breadcrumb */}
                <TableCell className="text-muted-foreground">
                  {product.categoryName} <span className="text-xs">/</span> {product.subcategoryName}
                </TableCell>
                
                {/* Price */}
                <TableCell>₹{product.salePrice}</TableCell>
                
                {/* Stock Status */}
                <TableCell>
                  <Badge variant={product.stock > 0 ? "outline" : "destructive"}>
                    {product.stock} in stock
                  </Badge>
                </TableCell>
                
                {/* Active Status (Placeholder logic) */}
                <TableCell>
                    <Badge variant="secondary" className="text-green-600 bg-green-50">Active</Badge>
                </TableCell>

                {/* Actions Dropdown */}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                         {/* Link to Edit Page (We can build this later) */}
                         <Link href={`/admin/products/${product.id}`} className="cursor-pointer">
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                         </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        {/* Server Action Form for Delete */}
                        <form action={deleteProduct.bind(null, product.id)} className="w-full">
                           <button className="flex w-full items-center text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                           </button>
                        </form>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {/* Empty State */}
        {allProducts.length === 0 && (
            <div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
                <p>No products found.</p>
                <Link href="/admin/products/new" className="text-primary hover:underline text-sm mt-2">
                    Create your first product
                </Link>
            </div>
        )}
      </div>
    </div>
  );
}