import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  gameZipUploader: f({ 
    blob: { maxFileSize: "1GB", maxFileCount: 1 } // Allow large ZIPs (technically blob accepts everything)
  })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => {
      // In a real production app, verify if the user is an admin here
      // For now, we allow the upload since it comes from the admin dashboard
      return { uploadedBy: "admin" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.uploadedBy);
      console.log("file url", file.url);
      console.log("file key", file.key);

      // Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.uploadedBy, fileUrl: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
