"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { usePathname } from "next/navigation";

// Pass data via props so we can fetch on server
interface AnnouncementProps {
  data: {
    message: string;
    link: string | null;
    backgroundColor: string | null;
    textColor: string | null;
  } | null;
}

export function AnnouncementBar({ data }: AnnouncementProps) {
  const [isVisible, setIsVisible] = useState(true);
  const pathname = usePathname();

  if (!data || !isVisible) return null;

  if (pathname.startsWith("/admin")) {
    return null;
  }

  const bg = data.backgroundColor || "#000000";
  const color = data.textColor || "#ffffff";

  return (
    <div 
      className="relative w-full py-2.5 px-4 text-center text-sm font-medium transition-colors"
      style={{ backgroundColor: bg, color: color }}
    >
      <div className="container mx-auto flex items-center justify-center relative">
        {data.link ? (
          <Link href={data.link} className="hover:underline underline-offset-4">
            {data.message}
          </Link>
        ) : (
          <span>{data.message}</span>
        )}

        {/* Close Button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-1 opacity-80 hover:opacity-100 transition-opacity"
          aria-label="Close announcement"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}