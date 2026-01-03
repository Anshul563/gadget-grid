"use client";

import Link from "next/link";
import { useRef } from "react";
import {
  Headphones,
  Smartphone,
  Watch,
  Laptop,
  Camera,
  Gamepad2,
  Speaker,
  Monitor,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const categories = [
  { title: "Headphones", slug: "headphone", icon: Headphones },
  { title: "Smartphones", slug: "smartphone", icon: Smartphone },
  { title: "Smart Watches", slug: "smart-watch", icon: Watch },
  { title: "Laptops", slug: "laptop", icon: Laptop },
  { title: "Cameras", slug: "camera", icon: Camera },
  { title: "Gaming", slug: "gaming", icon: Gamepad2 },
  { title: "Speakers", slug: "speakers", icon: Speaker },
  { title: "Monitors", slug: "monitor", icon: Monitor },
];

export function Categories() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = current.clientWidth;
      current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-8 bg-background border-b">
      <div className="container px-4 mx-auto relative group">
        <div
          ref={scrollRef}
          className="flex space-x-12 overflow-x-auto scroll-smooth no-scrollbar px-4"
        >
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="shrink-0 flex flex-col items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
            >
              <category.icon className="w-10 h-10" strokeWidth={1} />
              <span className="font-medium text-sm text-center">
                {category.title}
              </span>
            </Link>
          ))}
        </div>
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm p-1 rounded-full border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hidden md:block"
        >
          <ChevronLeft className="w-6 h-6 text-muted-foreground" />
        </button>
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm p-1 rounded-full border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hidden md:block"
        >
          <ChevronRight className="w-6 h-6 text-muted-foreground" />
        </button>
      </div>
    </section>
  );
}