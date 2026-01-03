import { db } from "@/db";
import { banners } from "@/db/schema";
import { desc } from "drizzle-orm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, ImageIcon, CalendarClock } from "lucide-react";
import { format, isWithinInterval } from "date-fns";
import { BannerDialog } from "@/components/admin/banner-dialog";
import { deleteBanner, toggleBannerStatus } from "./actions";
import { useTheme } from "next-themes";

export default async function AdminBannersPage() {
  const allBanners = await db.select().from(banners).orderBy(desc(banners.createdAt));
  const now = new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Homepage Banners</h1>
          <p className="text-muted-foreground">Manage festive and promotional slides.</p>
        </div>
        <BannerDialog />
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Preview</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allBanners.map((banner) => {
               // Determine scheduling status for display
               const hasSchedule = banner.startDate && banner.endDate;
               const isCurrentlyScheduled = hasSchedule && isWithinInterval(now, {
                 start: banner.startDate!,
                 end: banner.endDate!
               });

              return (
                <TableRow key={banner.id}>
                  <TableCell>
                    <div className="h-16 w-28 rounded overflow-hidden border bg-muted relative">
                      {/* Using standard img tag for simplicity, use Next/Image in production */}
                      <img 
                        src={banner.imageUrl} 
                        alt={banner.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="font-medium">{banner.title}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {banner.link || "No link"}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Order: {banner.sortOrder}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                     {hasSchedule ? (
                        <div className="flex flex-col gap-1 text-sm">
                           <div className="flex items-center gap-1 text-green-600">
                                <CalendarClock className="w-3 h-3" />
                                <span>{format(banner.startDate!, "MMM d")} - {format(banner.endDate!, "MMM d, yyyy")}</span>
                           </div>
                           {isCurrentlyScheduled && <span className="text-xs font-bold text-green-700">Currently Live</span>}
                        </div>
                     ) : (
                        <span className="text-muted-foreground text-sm">Always visible (if active)</span>
                     )}
                  </TableCell>
                  
                  <TableCell>
                    <form action={toggleBannerStatus.bind(null, banner.id, !!banner.isActive)}>
                      <button type="submit" className="cursor-pointer">
                          <Badge variant={banner.isActive ? "default" : "secondary"}>
                              {banner.isActive ? "Active" : "Disabled"}
                          </Badge>
                      </button>
                    </form>
                  </TableCell>
                  
                  <TableCell className="text-right">
                    <form action={deleteBanner.bind(null, banner.id)}>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {allBanners.length === 0 && (
          <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
            <ImageIcon className="h-10 w-10 opacity-20" />
            <p>No banners found.</p>
          </div>
        )}
      </div>
    </div>
  );
}