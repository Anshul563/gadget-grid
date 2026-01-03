"use client";

import Link from "next/link";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useRef } from "react";

// Define the type based on your schema
type Banner = {
  id: number;
  title: string;
  imageUrl: string;
  link: string | null;
};

interface BannerCarouselProps {
  data: Banner[];
}

export function BannerCarousel({ data }: BannerCarouselProps) {
  // 1. Setup Autoplay Plugin (Slides every 4 seconds)
  const plugin = useRef(Autoplay({ delay: 4000, stopOnInteraction: true }));

  if (!data || data.length === 0) return null;

  return (
    <div className="w-full bg-background relative group">
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
        opts={{
          loop: true,
        }}
      >
        <CarouselContent>
          {data.map((banner) => (
            <CarouselItem key={banner.id} className="relative w-full">
              {/* Container Logic:
                 - Mobile: Height is fixed (e.g., 300px) or aspect-square to ensure visibility.
                 - Desktop: Aspect ratio 3.2/1 (3240x537)
              */}
              <div className="relative w-full overflow-hidden">
                <Wrapper link={banner.link}>
                  {/* Using standard <img> for simplicity with external URLs.
                      If using Next/Image, you need to configure domains in next.config.js 
                   */}
                  <div className="w-full">
                    <img
                      src={banner.imageUrl}
                      alt={banner.title}
                      className="w-full h-auto"
                      loading="eager"
                    />
                  </div>

                  {/* Optional: Gradient Overlay for text readability if you add text later */}
                  {/* <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" /> */}
                </Wrapper>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Navigation Arrows - hidden on mobile, visible on hover for desktop */}
        <CarouselPrevious className="left-4 hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity" />
        <CarouselNext className="right-4 hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity" />
      </Carousel>
    </div>
  );
}

// Helper to wrap image in Link if one exists
function Wrapper({
  link,
  children,
}: {
  link: string | null;
  children: React.ReactNode;
}) {
  if (link) {
    return (
      <Link href={link} className="block w-full h-full cursor-pointer">
        {children}
      </Link>
    );
  }
  return <div className="block w-full h-full">{children}</div>;
}
