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
  uploadToGallery: (
    file: File,
    caption?: string,
    userId?: string
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
          .eq("status", GalleryStatusEnum.approved)
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

    uploadToGallery: async (file, caption, userId) => {
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

        // Log successful upload info for debugging
        console.log(
          "Image uploaded successfully:",
          {
            path: file_name,
            url: imageUrl,
            size: file.size,
          },
          ADMIN_ID
        );

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
              // image: imageUrl,
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

        // Update local state
        set((state) => ({
          userGallery: [newImage, ...state.userGallery],
          gallery: [newImage, ...state.gallery],
          isLoading: false,
        }));
      } catch (err: any) {
        console.error("Error uploading image:", err);
        set({
          error: err.message || "Failed to upload image",
          isLoading: false,
        });
        throw err; // Re-throw to allow caller to handle
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
        const imageToDelete = get().gallery.find((img) => img.id === imageId);
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
