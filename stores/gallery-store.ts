import { create } from "zustand";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { uploadImage, uploadVideo } from "@/lib/file-upload";
import {
  BucketFolderEnum,
  GalleryStatusEnum,
  NotificationTypeEnum,
} from "@/lib/constants/enums";
import { BUCKET_NAME } from "@/lib/constants";
import { GalleryType } from "@/lib/types";

const ADMIN_ID = process.env.NEXT_PUBLIC_ADMIN_ID;

// Define GalleryType type
interface GalleryState {
  gallery: GalleryType[];
  userGallery: GalleryType[];
  isLoading: boolean;
  error: string | null;
  selectedImage: GalleryType | null;
}

interface GalleryActions {
  fetchGallery: () => Promise<void>;
  fetchUserGallery: (userId: string) => Promise<void>;
  fetchUserGalleryByStatus: (
    userId: string,
    status?: keyof typeof GalleryStatusEnum
  ) => Promise<void>;
  fetchUserGalleryByAlbum: (
    userId: string,
    albumId: string
  ) => Promise<GalleryType[]>;
  uploadToGallery: (
    file: File,
    caption?: string,
    userId?: string,
    albumId?: string
  ) => Promise<void>;
  importFromWeb: (
    imageUrl: string,
    caption?: string,
    userId?: string,
    albumId?: string
  ) => Promise<void>;
  deleteFromGallery: (imageId: string) => Promise<void>;
  updateGalleryDetails: (
    imageId: string,
    updates: Partial<Pick<GalleryType, "caption">>
  ) => Promise<void>;
  selectGalleryItem: (image: GalleryType | null) => void;
}

const initialState: GalleryState = {
  gallery: [],
  userGallery: [],
  isLoading: false,
  error: null,
  selectedImage: null,
};

export const useGalleryStore = create<GalleryState & GalleryActions>(
  (set, get) => ({
    ...initialState,

    fetchGallery: async () => {
      set({ isLoading: true, error: null });

      try {
        // Get gallery from the gallery table
        const { data, error } = await supabase
          .from("galleries")
          .select("*")
          .eq("status", GalleryStatusEnum.approved)
          .order("updated_at", { ascending: false });

        if (error) throw error;

        // Set the gallery in the store
        set({ gallery: data || [], isLoading: false });
      } catch (err: any) {
        console.error("Error fetching gallery:", err);
        set({
          error: err.message || "Failed to fetch gallery",
          isLoading: false,
        });
      }
    },

    fetchUserGallery: async (userId) => {
      set({ isLoading: true, error: null });

      try {
        const { data, error } = await supabase
          .from("galleries")
          .select("*")
          .eq("user_id", userId)
          .order("updated_at", { ascending: false });

        if (error) throw error;

        set({ userGallery: data || [], isLoading: false });
      } catch (err: any) {
        console.error("Error fetching user gallery:", err);
        set({
          error: err.message || "Failed to fetch user gallery",
          isLoading: false,
        });
      }
    },

    fetchUserGalleryByStatus: async (userId, status) => {
      set({ isLoading: true, error: null });

      try {
        let query = supabase
          .from("galleries")
          .select("*")
          .eq("user_id", userId);

        if (status) {
          query = query.eq("status", status);
        }

        const { data, error } = await query.order("updated_at", {
          ascending: false,
        });

        if (error) throw error;

        set({ userGallery: data || [], isLoading: false });
      } catch (err: any) {
        console.error("Error fetching user gallery by status:", err);
        set({
          error: err.message || "Failed to fetch user gallery",
          isLoading: false,
        });
      }
    },

    fetchUserGalleryByAlbum: async (userId, albumId) => {
      try {
        const { data, error } = await supabase
          .from("galleries")
          .select("*")
          .eq("user_id", userId)
          .eq("album_id", albumId)
          .order("updated_at", { ascending: false });

        if (error) throw error;

        return data || [];
      } catch (err: any) {
        console.error("Error fetching user gallery by album:", err);
        throw err;
      }
    },

    uploadToGallery: async (file, caption, userId, albumId) => {
      set({ isLoading: true, error: null });

      try {
        // Create a unique file_name
        const fileExt = file.name.split(".").pop();
        const file_name = `${
          BucketFolderEnum.gallery
        }/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        // Upload to Supabase Storage
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(file_name, file, {
            cacheControl: "3600",
            upsert: false, // Prevent overwriting
          });

        if (uploadError) throw uploadError;

        // Get the public URL
        const { data: urlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(file_name);

        if (!urlData || !urlData.publicUrl) {
          throw new Error("Failed to get gallert item URL");
        }

        const imageUrl = urlData.publicUrl;

        const now = new Date().toISOString();

        // Insert image data into the galleries table
        const newImage: GalleryType = {
          id: uuidv4(), // Generate ID client-side
          url: imageUrl,
          caption: caption || file.name,
          uploaded_at: now,
          created_at: now,
          updated_at: now,
          user_id: userId || "",
          file_name: file_name,
          file_size: file.size,
          album_id: albumId,
          status:
            userId === ADMIN_ID
              ? GalleryStatusEnum.approved
              : GalleryStatusEnum.pending,
        };

        const { error: insertError } = await supabase
          .from("galleries")
          .insert(newImage);

        if (insertError) throw insertError;

        console.log("[ADMIN_ID]", ADMIN_ID);

        if (userId !== ADMIN_ID) {
          // Create notification for admin about the gallery request
          try {
            const notificationData = {
              title: "New Gallery Request",
              body: `A new gallery item "${
                caption || file.name
              }" has been uploaded and is pending approval.`,
              type: NotificationTypeEnum.gallery_request,
              resource_id: newImage.id,
              user_id: ADMIN_ID,
              read: false,
              image: imageUrl,
            };

            const { error: notificationError } = await supabase
              .from("notifications")
              .insert(notificationData);

            if (notificationError) {
              console.error("Error creating notification:", notificationError);
              // Don't throw here as the main gallery upload was successful
            } else {
              console.log(
                "Notification created for admin about gallery request"
              );
            }
          } catch (notificationErr) {
            console.error("Failed to create notification:", notificationErr);
            // Don't throw here as the main gallery upload was successful
          }
        }
      } catch (err: any) {
        console.error("Error uploading image:", err);
        set({
          error: err.message || "Failed to upload image",
          isLoading: false,
        });
        throw err; // Re-throw to allow caller to handle
      }
    },

    importFromWeb: async (imageUrl, caption, userId, albumId) => {
      set({ isLoading: true, error: null });

      try {
        let blob: Blob;
        let contentType = "";

        try {
          // First, try direct fetch with CORS mode
          const response = await fetch(imageUrl, {
            mode: "cors",
            headers: {
              Accept: "image/*",
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          blob = await response.blob();
          contentType = response.headers.get("content-type") || "";
        } catch (corsError) {
          console.log("Direct fetch failed, trying canvas method:", corsError);

          // If CORS fails, try using canvas method
          blob = await new Promise<Blob>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";

            img.onload = () => {
              try {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                if (!ctx) {
                  reject(new Error("Failed to get canvas context"));
                  return;
                }

                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                canvas.toBlob(
                  (blob) => {
                    if (blob) {
                      resolve(blob);
                    } else {
                      reject(new Error("Failed to convert canvas to blob"));
                    }
                  },
                  "image/jpeg",
                  0.9
                );
              } catch (error) {
                reject(error);
              }
            };

            img.onerror = () => {
              reject(
                new Error(
                  "Failed to load image. The URL may not be accessible due to CORS restrictions or the image may not exist."
                )
              );
            };

            img.src = imageUrl;
          });

          contentType = "image/jpeg"; // Canvas output is always JPEG
        }

        // Determine file type and extension
        let fileExtension = "jpg";
        let mimeType = "image/jpeg";

        if (contentType) {
          mimeType = contentType;
          const mimeToExt: { [key: string]: string } = {
            "image/jpeg": "jpg",
            "image/jpg": "jpg",
            "image/png": "png",
            "image/gif": "gif",
            "image/webp": "webp",
            "image/bmp": "bmp",
          };
          fileExtension = mimeToExt[contentType.toLowerCase()] || "jpg";
        } else {
          // Try to determine from URL
          const urlExtension = imageUrl
            .split(".")
            .pop()
            ?.split("?")[0]
            ?.toLowerCase();
          if (
            urlExtension &&
            ["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(urlExtension)
          ) {
            fileExtension = urlExtension === "jpeg" ? "jpg" : urlExtension;
            mimeType = `image/${
              fileExtension === "jpg" ? "jpeg" : fileExtension
            }`;
          }
        }

        // Ensure we have a valid blob
        if (!blob || blob.size === 0) {
          throw new Error(
            "Failed to fetch image data - the image may be too large or not accessible"
          );
        }

        // Create file with proper MIME type
        const fileName = `imported-${Date.now()}.${fileExtension}`;
        const file = new File([blob], fileName, {
          type: mimeType,
          lastModified: Date.now(),
        });

        console.log("Created file:", {
          name: file.name,
          size: file.size,
          type: file.type,
          originalUrl: imageUrl,
        });

        // Use the existing uploadToGallery function
        await get().uploadToGallery(file, caption, userId, albumId);
      } catch (err: any) {
        console.error("Error importing from web:", err);
        set({
          error: err.message || "Failed to import image from web",
          isLoading: false,
        });
        throw err;
      }
    },

    deleteFromGallery: async (imageId) => {
      set({ isLoading: true, error: null });

      try {
        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("User not authenticated");
        }

        // Find the image to get its file name
        const imageToDelete =
          get().gallery.find((img) => img.id === imageId) ||
          get().userGallery.find((img) => img.id === imageId);
        if (!imageToDelete) {
          throw new Error("Image not found");
        }

        // Delete from Supabase Storage
        const { error: storageError } = await supabase.storage
          .from(BUCKET_NAME)
          .remove([imageToDelete.file_name]);

        // Even if storage deletion fails, try to remove from the database
        if (storageError) {
          console.warn(
            "Storage delete error, continuing with database delete:",
            storageError
          );
        }

        // Delete from the galleries table
        const { error: dbError } = await supabase
          .from("galleries")
          .delete()
          .match({ id: imageId });

        if (dbError) throw dbError;

        // Update local state
        set((state) => ({
          gallery: state.gallery.filter((image) => image.id !== imageId),
          userGallery: state.userGallery.filter(
            (image) => image.id !== imageId
          ),
          isLoading: false,
          selectedImage:
            state.selectedImage?.id === imageId ? null : state.selectedImage,
        }));
      } catch (err: any) {
        console.error("Error deleting image:", err);
        set({
          error: err.message || "Failed to delete image",
          isLoading: false,
        });
        throw err; // Re-throw to allow caller to handle
      }
    },

    updateGalleryDetails: async (imageId, updates) => {
      set({ isLoading: true, error: null });

      try {
        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("User not authenticated");
        }

        // Add updated_at timestamp to updates
        const updatesWithTimestamp = {
          ...updates,
          updated_at: new Date().toISOString(),
        };

        // Update the galleries table
        const { error } = await supabase
          .from("galleries")
          .update(updatesWithTimestamp)
          .match({ id: imageId });

        if (error) throw error;

        // Update local state
        set((state) => ({
          gallery: state.gallery.map((image) =>
            image.id === imageId ? { ...image, ...updatesWithTimestamp } : image
          ),
          userGallery: state.userGallery.map((image) =>
            image.id === imageId ? { ...image, ...updatesWithTimestamp } : image
          ),
          isLoading: false,
        }));
      } catch (err: any) {
        console.error("Error updating image:", err);
        set({
          error: err.message || "Failed to update image details",
          isLoading: false,
        });
        throw err;
      }
    },

    selectGalleryItem: (image) => {
      set({ selectedImage: image });
    },
  })
);

// Optional: Persist store (if needed)
// import { persist, createJSONStorage } from 'zustand/middleware';
//
// export const useGalleryStore = create(
//   persist<GalleryState & GalleryActions>(
//     (set, get) => ({
//       // ... store definition ...
//     }),
//     {
//       name: 'gallery-storage', // unique name
//       storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
//     }
//   )
// );
