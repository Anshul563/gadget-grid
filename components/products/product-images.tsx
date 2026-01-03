"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductImagesProps {
  images: string[];
  title: string;
}

export function ProductImages({ images, title }: ProductImagesProps) {
  // Use first image or placeholder
  const safeImages = images.length > 0 ? images : ["/images/placeholder.png"];
  const [activeImage, setActiveImage] = useState(safeImages[0]);

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden rounded-xl border bg-muted/20">
        <Image
          src={activeImage}
          alt={title}
          fill
          className="object-cover p-4 transition-all duration-300 hover:scale-105"
          priority
        />
      </div>

      {/* Thumbnails */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {safeImages.map((image, index) => (
          <button
            key={index}
            onClick={() => setActiveImage(image)}
            className={cn(
              "relative aspect-square w-20 shrink-0 overflow-hidden rounded-md border bg-muted/20 transition-all hover:opacity-100",
              activeImage === image
                ? "ring-2 ring-primary ring-offset-2 opacity-100"
                : "opacity-60 hover:ring-2 hover:ring-primary/50 hover:ring-offset-1"
            )}
          >
            <Image
              src={image}
              alt={`${title} view ${index + 1}`}
              fill
              className="object-cover p-2"
            />
          </button>
        ))}
      </div>
    </div>
  );
}