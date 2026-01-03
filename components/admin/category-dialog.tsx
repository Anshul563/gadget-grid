"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCategory, createSubcategory } from "@/app/admin/categories/actions";
import { toast } from "sonner";
import { Plus } from "lucide-react";

interface CategoryDialogProps {
  parentId?: number; // If present, we are creating a Subcategory
  triggerLabel?: string;
}

export function CategoryDialog({ parentId, triggerLabel = "Add Category" }: CategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setIsLoading(true);
    
    let result;
    if (parentId) {
      result = await createSubcategory(parentId, formData);
    } else {
      result = await createCategory(formData);
    }

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(parentId ? "Subcategory added" : "Category created");
      setOpen(false);
    }
    setIsLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={parentId ? "sm" : "default"} variant={parentId ? "outline" : "default"}>
          {parentId && <Plus className="mr-2 h-3 w-3" />}
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{parentId ? "Add Subcategory" : "Create Category"}</DialogTitle>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input name="name" placeholder={parentId ? "e.g. Wireless" : "e.g. Headphones"} required />
          </div>
          
          {!parentId && (
             <div className="space-y-2">
                <Label>Description</Label>
                <Input name="description" placeholder="Short description..." />
             </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}