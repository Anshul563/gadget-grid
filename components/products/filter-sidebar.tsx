"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function FilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initial states from URL or defaults
  const [priceRange, setPriceRange] = useState([
    Number(searchParams.get("minPrice")) || 0,
    Number(searchParams.get("maxPrice")) || 50000,
  ]);

  // Handle Price Change (Debounced URL update could be added for performance)
  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
  };

  // Apply Filters Button
  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("minPrice", priceRange[0].toString());
    params.set("maxPrice", priceRange[1].toString());
    // Reset page to 1 on filter change
    params.set("page", "1");
    
    router.push(`/products?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("/products");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Filters</h3>
        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-500 h-auto p-0 hover:bg-transparent hover:text-red-600">
          Clear All
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={["price", "availability"]}>
        {/* Price Filter */}
        <AccordionItem value="price">
          <AccordionTrigger>Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <Slider
                defaultValue={[0, 50000]}
                value={priceRange}
                max={100000}
                step={1000}
                onValueChange={handlePriceChange}
                className="my-4"
              />
              <div className="flex items-center justify-between text-sm">
                <span className="border px-2 py-1 rounded">₹{priceRange[0]}</span>
                <span className="text-muted-foreground">-</span>
                <span className="border px-2 py-1 rounded">₹{priceRange[1]}</span>
              </div>
              <Button onClick={applyFilters} className="w-full h-8 mt-2">Apply Price</Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Availability Filter */}
        <AccordionItem value="availability">
          <AccordionTrigger>Availability</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="in-stock" 
                  checked={searchParams.get("stock") === "true"}
                  onCheckedChange={(checked) => {
                    const params = new URLSearchParams(searchParams.toString());
                    if (checked) params.set("stock", "true");
                    else params.delete("stock");
                    router.push(`/products?${params.toString()}`);
                  }}
                />
                <Label htmlFor="in-stock">In Stock Only</Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}