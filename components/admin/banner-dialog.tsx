"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Upload, Loader2, Crop as CropIcon, RefreshCw } from "lucide-react"; // Added RefreshCw
import { createBanner } from "@/app/admin/banners/actions";

// Cropper Imports
import Cropper, { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";

// UploadThing Import
import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

// Generate hooks
const { useUploadThing } = generateReactHelpers<OurFileRouter>();

export function BannerDialog() {
  const [open, setOpen] = useState(false);
  
  // Image State
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  
  // Cropper Ref
  const cropperRef = useRef<ReactCropperElement>(null);

  // UploadThing Hook
  const { startUpload } = useUploadThing("bannerImage");

  // 1. Handle File Selection
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const files = e.target.files;
    if (files && files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
      };
      reader.readAsDataURL(files[0]);
    }
  };

  // 2. Handle Crop & Upload
  const onCropAndUpload = async () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;

    setIsUploading(true);

    // Get the cropped canvas
    cropper.getCroppedCanvas({
        width: 3240, // Force output width
        height: 537, // Force output height
    }).toBlob(async (blob) => {
      if (!blob) {
        setIsUploading(false);
        return;
      }

      // Convert Blob to File for UploadThing
      const file = new File([blob], "banner-crop.png", { type: "image/png" });

      try {
        const res = await startUpload([file]);
        if (res && res[0]) {
            setUploadedUrl(res[0].url);
            setImageSrc(null); // Clear cropper view
        }
      } catch (err) {
        console.error("Upload failed", err);
      } finally {
        setIsUploading(false);
      }
    }, "image/png");
  };

  const resetImage = () => {
    setImageSrc(null);
    setUploadedUrl("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Banner
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Banner</DialogTitle>
          <DialogDescription>
            Upload and crop a 3240x537 banner.
          </DialogDescription>
        </DialogHeader>

        {/* --- Image Uploader & Cropper Section --- */}
        <div className="space-y-4 border-b pb-6">
            <Label>Banner Image (Required)</Label>
            
            {!imageSrc && !uploadedUrl && (
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-2 text-gray-400" />
                            <p className="text-sm text-gray-500 font-semibold">Click to upload banner</p>
                            <p className="text-xs text-gray-500">SVG, PNG, JPG (Rec. 3240x537)</p>
                        </div>
                        <Input id="dropzone-file" type="file" className="hidden" accept="image/*" onChange={onFileChange} />
                    </label>
                </div>
            )}

            {/* Cropper View */}
            {imageSrc && (
                <div className="flex flex-col gap-4">
                    <div className="relative w-full h-[400px] bg-black">
                        <Cropper
                            ref={cropperRef}
                            style={{ height: "100%", width: "100%" }}
                            initialAspectRatio={3240 / 537}
                            aspectRatio={3240 / 537}
                            preview=".img-preview"
                            src={imageSrc}
                            viewMode={1}
                            minCropBoxHeight={10}
                            minCropBoxWidth={10}
                            background={false}
                            responsive={true}
                            autoCropArea={1}
                            checkOrientation={false}
                            guides={true}
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                         <Button variant="outline" onClick={() => setImageSrc(null)} disabled={isUploading}>
                            Cancel
                         </Button>
                         <Button onClick={onCropAndUpload} disabled={isUploading}>
                            {isUploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                                </>
                            ) : (
                                <>
                                    <CropIcon className="mr-2 h-4 w-4" /> Crop & Save
                                </>
                            )}
                         </Button>
                    </div>
                </div>
            )}

            {/* Final Preview View (UPDATED) */}
            {uploadedUrl && (
                <div className="relative rounded-md overflow-hidden border group">
                    <img 
                        src={uploadedUrl} 
                        alt="Banner Preview" 
                        className="w-full h-auto object-cover aspect-[3.2/1] transition-opacity group-hover:opacity-90" 
                    />
                    
                    {/* Change Image Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                        <Button 
                            variant="secondary" 
                            className="shadow-lg"
                            onClick={resetImage}
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Change Image
                        </Button>
                    </div>

                    <div className="absolute bottom-2 left-2 bg-green-600/90 text-white text-xs px-2 py-1 rounded shadow-sm">
                        Ready to submit
                    </div>
                </div>
            )}
        </div>

        {/* --- Form Section --- */}
        <form
          action={async (formData) => {
            if (!uploadedUrl) {
                alert("Please upload an image first");
                return;
            }
            await createBanner(formData);
            setOpen(false);
            resetImage();
          }}
          className="grid gap-4 py-4"
        >
            <input type="hidden" name="imageUrl" value={uploadedUrl} />

            <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" placeholder="e.g. Summer Sale" required />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="link">Redirect Link (Optional)</Label>
                <Input id="link" name="link" placeholder="/products/sale" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" name="startDate" type="datetime-local" />
                </div>
                <div className="grid gap-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input id="endDate" name="endDate" type="datetime-local" />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input id="sortOrder" name="sortOrder" type="number" defaultValue="0" />
            </div>

            <Button type="submit" disabled={!uploadedUrl || isUploading}>
                Save Banner
            </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}