"use client";

import { useState } from "react";
import { createProduct, updateProduct } from "@/app/admin/products/actions"; // Import updateProduct
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UploadDropzone } from "@/lib/uploadthing";
import { X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

// Types for props
interface Category {
  id: number;
  name: string;
}
interface Subcategory {
  id: number;
  name: string;
  categoryId: number;
}

// 1. Define the shape of data for editing
interface ProductData {
  id: number;
  name: string;
  description: string | null;
  price: string; // Decimal comes as string from DB usually
  salePrice: string | null;
  stock: number;
  subcategoryId: number | null;
  categoryId?: number; // Needed to pre-select main category
  images: string[] | null;
  isFeatured: boolean | null;
}

interface ProductFormProps {
  categories: Category[];
  subcategories: Subcategory[];
  initialData?: ProductData | null; // Optional prop
}

export function ProductForm({ categories, subcategories, initialData }: ProductFormProps) {
  // 2. Initialize state with existing data if available
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialData?.categoryId?.toString() || ""
  );
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  
  // Filter subcategories based on selected main category
  const filteredSubs = subcategories.filter(s => s.categoryId.toString() === selectedCategory);

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // 3. Dynamic Action: Choose Create or Update based on initialData
  // .bind(null, id) passes the ID as the first argument to updateProduct
  const formAction = initialData 
    ? updateProduct.bind(null, initialData.id) 
    : createProduct;

  return (
    <form action={formAction} className="space-y-8 max-w-3xl">
      
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Product Name</Label>
          <Input 
            name="name" 
            defaultValue={initialData?.name} 
            placeholder="Sony WH-1000XM5" 
            required 
          />
        </div>
        
        <div className="space-y-2">
          <Label>Stock (Inventory)</Label>
          <Input 
            name="stock" 
            type="number" 
            defaultValue={initialData?.stock} 
            placeholder="50" 
            required 
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Price (₹)</Label>
          <Input 
            name="price" 
            type="number" 
            step="0.01" 
            defaultValue={initialData?.price} 
            placeholder="29999" 
            required 
          />
        </div>
        <div className="space-y-2">
          <Label>Sale Price (Optional)</Label>
          <Input 
            name="salePrice" 
            type="number" 
            step="0.01" 
            defaultValue={initialData?.salePrice || ""} 
            placeholder="24999" 
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
           <Label>Category</Label>
           <Select 
             onValueChange={setSelectedCategory} 
             name="category" 
             value={selectedCategory} // Controlled value so it updates correctly
             required
           >
             <SelectTrigger>
               <SelectValue placeholder="Select Category" />
             </SelectTrigger>
             <SelectContent>
               {categories.map(c => (
                 <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
               ))}
             </SelectContent>
           </Select>
        </div>

        <div className="space-y-2">
           <Label>Subcategory</Label>
           <Select 
             name="subcategoryId" 
             disabled={!selectedCategory} 
             defaultValue={initialData?.subcategoryId?.toString()} 
             required
           >
             <SelectTrigger>
               <SelectValue placeholder="Select Subcategory" />
             </SelectTrigger>
             <SelectContent>
               {filteredSubs.map(s => (
                 <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
               ))}
             </SelectContent>
           </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea 
            name="description" 
            defaultValue={initialData?.description || ""} 
            placeholder="Product details..." 
            className="h-32" 
        />
      </div>

      {/* IMAGE UPLOAD SECTION */}
      <div className="space-y-2">
        <Label>Product Images (Max 4)</Label>
        
        {/* Hidden input to send image URLs to Server Action */}
        <input type="hidden" name="images" value={images.join(",")} />

        {images.length < 4 && (
          <UploadDropzone
            endpoint="imageUploader"
            onClientUploadComplete={(res) => {
              if (res) {
                const newUrls = res.map(file => file.url);
                setImages([...images, ...newUrls]);
                toast.success("Images uploaded!");
              }
            }}
            onUploadError={(error: Error) => {
              toast.error(`Error: ${error.message}`);
            }}
            config={{ mode: "auto" }}
          />
        )}

        {/* Image Previews */}
        <div className="flex gap-4 mt-4 flex-wrap">
          {images.map((url, index) => (
            <div key={url} className="relative h-24 w-24 border rounded-md overflow-hidden group">
              <Image src={url} alt="Product" fill className="object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch 
            id="featured" 
            name="isFeatured" 
            defaultChecked={initialData?.isFeatured === true} 
        />
        <Label htmlFor="featured">Feature this product on Homepage?</Label>
      </div>

      <Button type="submit" className="w-full" size="lg">
        {initialData ? "Update Product" : "Create Product"}
      </Button>
    </form>
  );
}