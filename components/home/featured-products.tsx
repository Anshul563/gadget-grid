"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ProductCard } from "@/components/product-card";

// Ensure this matches the Product interface in your ProductCard component
interface Product {
  id: number | string;
  name: string;
  image: string;
  price: number;
  oldPrice?: number | null;
  discount?: number;
  rating?: number;
  salesCount?: number;
  storeName?: string;
}

interface FeaturedProductsProps {
  title: string;
  link: string;
  products: Product[];
}

export function FeaturedProducts({ title, link, products }: FeaturedProductsProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-12 bg-background">
      <div className="container px-4 mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="hidden md:flex gap-1 text-primary hover:text-primary/80 hover:bg-transparent px-0">
              <Link href={link}>
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Carousel Section */}
        <div className="relative">
          <Carousel
            opts={{
              align: "start",
              loop: false,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {products.map((product) => (
                <CarouselItem 
                  key={product.id} 
                  className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                >
                  <div className="h-full py-2"> {/* Added py-2 to prevent shadow clipping */}
                    <ProductCard data={product} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            {/* Navigation Buttons */}
            {/* Placed absolutely but visible only on md+ screens */}
            <div className="hidden md:block">
              <CarouselPrevious className="absolute -left-4 top-1/2 -translate-y-1/2 h-8 w-8 lg:h-10 lg:w-10 border-border bg-background/80 backdrop-blur-sm" />
              <CarouselNext className="absolute -right-4 top-1/2 -translate-y-1/2 h-8 w-8 lg:h-10 lg:w-10 border-border bg-background/80 backdrop-blur-sm" />
            </div>
          </Carousel>
        </div>

        {/* Mobile View All Button */}
        <div className="md:hidden flex justify-center mt-6">
           <Button variant="outline" asChild className="w-full border-primary/20">
              <Link href={link}>
                View All Products
              </Link>
           </Button>
        </div>

      </div>
    </section>
  );
}