import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/get-products";
import { ProductImages } from "@/components/products/product-images";
import { FeaturedProducts } from "@/components/home/featured-products";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Star, ShoppingCart, Heart, Truck, ShieldCheck, RefreshCw } from "lucide-react";
import { products } from "@/db/schema";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  
  if (!product) {
    return { title: "Product Not Found" };
  }

  return {
    title: `${product.name} | MyStore`,
    description: product.name,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(Number(product.id));

  // Format currency helper
  const formatPrice = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <main className="min-h-screen py-10 bg-gray-50/30">
      <div className="container px-4 mx-auto">
        {/* Breadcrumb (Simple Text) */}
        <div className="mb-6 text-sm text-muted-foreground">
          <a href="/" className="hover:text-primary">Home</a> /{" "}
          <a href="/products" className="hover:text-primary">Products</a> /{" "}
          <span className="text-foreground font-medium">{product.name}</span>
        </div>

        {/* --- Main Product Layout --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* Left Column: Images */}
          <ProductImages 
            images={product.image ? [product.image] : []} // Pass array of images (Update this if your transformProduct returns an array)
            title={product.name} 
          />

          {/* Right Column: Info */}
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {product.name}
              </h1>
              <div className="mt-3 flex items-center gap-4">
                <div className="flex items-center gap-0.5 text-amber-500">
                  <Star className="h-5 w-5 fill-current" />
                  <span className="font-semibold text-foreground ml-1">{product.rating}</span>
                </div>
                <Separator orientation="vertical" className="h-5" />
                <span className="text-sm text-muted-foreground">
                  {product.salesCount} sold
                </span>
                <Separator orientation="vertical" className="h-5" />
                <span className="text-sm text-green-600 font-medium">In Stock</span>
              </div>
            </div>

            <div className="flex items-end gap-3">
              <span className="text-4xl font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              {product.oldPrice && (
                <div className="flex flex-col mb-1">
                  <span className="text-lg text-muted-foreground line-through decoration-red-500/50">
                    {formatPrice(product.oldPrice)}
                  </span>
                </div>
              )}
              {product.discount > 0 && (
                <Badge className="mb-2 bg-red-600 text-white hover:bg-red-700">
                  {product.discount}% OFF
                </Badge>
              )}
            </div>

            <p className="text-base text-muted-foreground leading-relaxed">
              {/* Fallback description if DB is empty */}
              {product.description || "Experience premium quality with this meticulously crafted product. Designed for durability and performance, it meets all your daily needs with style and efficiency."}
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <Button size="lg" className="flex-1 gap-2 text-base h-12">
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </Button>
              <Button size="lg" variant="secondary" className="gap-2 text-base h-12">
                <Heart className="w-5 h-5" />
                Wishlist
              </Button>
            </div>

            {/* Service Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Truck className="w-5 h-5 text-primary" />
                <span>Free Delivery</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className="w-5 h-5 text-primary" />
                <span>30 Days Return</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span>2 Year Warranty</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- Related Products Section --- */}
        <Separator className="my-12" />
        <FeaturedProducts
          title="Related Products"
          link="/products"
          products={relatedProducts}
        />
      </div>
    </main>
  );
}