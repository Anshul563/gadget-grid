import { FilterSidebar } from "@/components/products/filter-sidebar";
import { ProductCard } from "@/components/product-card";
import { getAllProducts } from "@/lib/get-products";
import { SlidersHorizontal } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SortSelect } from "@/components/products/sort-select";

// Update the type to match Next.js 15+ async searchParams requirements if needed
// For Next 14/15 standard pages:
type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams; // Await params in newer Next.js versions

  const minPrice = params.minPrice ? Number(params.minPrice) : 0;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : 100000;
  const inStock = params.stock === "true";
  const sort = typeof params.sort === "string" ? params.sort : "newest";

  const products = await getAllProducts({
    minPrice,
    maxPrice,
    inStock,
    sort,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Products</h1>
          <p className="text-muted-foreground mt-1">
            Showing {products.length} results
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Filter Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="md:hidden">
                <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="mt-6">
                <FilterSidebar />
              </div>
            </SheetContent>
          </Sheet>

          {/* Sort Dropdown */}
          <div className="w-[180px]">
            <SortSelect defaultValue={sort} />
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-20">
            <FilterSidebar />
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product.id} className="h-full">
                  <ProductCard data={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground text-lg">
                No products found matching your filters.
              </p>
              <Button variant="link" className="mt-2" asChild>
                <a href="/products">Clear Filters</a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
