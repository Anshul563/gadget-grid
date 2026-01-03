import { db } from "@/db";
import { announcements } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Plus } from "lucide-react";
import { createAnnouncement, deleteAnnouncement, toggleAnnouncement } from "./actions";

export default async function AdminAnnouncementsPage() {
  const data = await db.select().from(announcements).orderBy(desc(announcements.createdAt));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground">Manage the top notification bar.</p>
        </div>
        
        {/* CREATE DIALOG */}
        <Dialog>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> New Announcement</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Announcement</DialogTitle>
            </DialogHeader>
            <form action={createAnnouncement} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Message</Label>
                <Input name="message" placeholder="Big Sale! 50% Off..." required />
              </div>
              <div className="space-y-2">
                <Label>Link (Optional)</Label>
                <Input name="link" placeholder="/collections/sale" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Background Color</Label>
                  <div className="flex items-center gap-2">
                    <Input type="color" name="backgroundColor" defaultValue="#000000" className="w-12 p-1 h-10" />
                    <Input type="text" name="backgroundColor" defaultValue="#000000" placeholder="#000000" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Text Color</Label>
                  <div className="flex items-center gap-2">
                    <Input type="color" name="textColor" defaultValue="#ffffff" className="w-12 p-1 h-10" />
                    <Input type="text" name="textColor" defaultValue="#ffffff" placeholder="#ffffff" />
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full">Publish</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Message</TableHead>
              <TableHead>Colors</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="font-medium">{item.message}</div>
                  <div className="text-xs text-muted-foreground">{item.link || "No Link"}</div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <div className="h-6 w-6 rounded border shadow-sm" style={{background: item.backgroundColor || "#000"}} title="Background" />
                    <div className="h-6 w-6 rounded border shadow-sm" style={{background: item.textColor || "#fff"}} title="Text" />
                  </div>
                </TableCell>
                <TableCell>
                  <form action={toggleAnnouncement.bind(null, item.id, !!item.isActive)}>
                    <button type="submit">
                      <Badge variant={item.isActive ? "default" : "secondary"}>
                        {item.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </button>
                  </form>
                </TableCell>
                <TableCell className="text-right">
                  <form action={deleteAnnouncement.bind(null, item.id)}>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}