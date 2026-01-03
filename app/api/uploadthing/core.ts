import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/lib/auth"; // Your Better-Auth server
import { headers } from "next/headers";

const f = createUploadthing();

export const ourFileRouter = {
  // Define an endpoint for product images
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 4 } })
    .middleware(async ({ req }) => {
      // Security: Only Admins can upload
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session || session.user.role !== "admin")
        throw new Error("Unauthorized");

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
      return { uploadedBy: metadata.userId };
    }),

  // Define an endpoint for banner images
  bannerImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      // Security: Only Admins can upload
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session || session.user.role !== "admin")
        throw new Error("Unauthorized");

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Banner upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
