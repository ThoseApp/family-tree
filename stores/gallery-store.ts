import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { uploadImage } from "@/lib/file-upload";
import { BucketFolderEnum } from "@/lib/constants/enums";
import { BUCKET_NAME } from "@/lib/constants";

// Define GalleryImage type
interface GalleryImage {
  id: string;
  url: string;
  caption?: string;
  uploaded_at?: string;
  created_at: string;
  updated_at?: string;
  user_id: string;
  file_name: string;
  file_size: number;
}

interface GalleryState {
  images: GalleryImage[];
  isLoading: boolean;
  error: string | null;
  selectedImage: GalleryImage | null;
}

interface GalleryActions {
  fetchImages: () => Promise<void>;
  uploadImage: (file: File, caption?: string) => Promise<void>;
  deleteImage: (imageId: string) => Promise<void>;
  updateImageDetails: (
    imageId: string,
    updates: Partial<Pick<GalleryImage, "caption">>
  ) => Promise<void>;
  selectImage: (image: GalleryImage | null) => void;
}

const initialState: GalleryState = {
  images: [],
  isLoading: false,
  error: null,
  selectedImage: null,
};

export const useGalleryStore = create<GalleryState & GalleryActions>(
  (set, get) => ({
    ...initialState,

    fetchImages: async () => {
      set({ isLoading: true, error: null });
      const supabase = createClient();

      try {
        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("User not authenticated");
        }

        // Get images from the gallery table
        const { data, error } = await supabase
          .from("galleries")
          .select("*")
          .order("updated_at", { ascending: false });

        if (error) throw error;

        // Set the images in the store
        set({ images: data || [], isLoading: false });
      } catch (err: any) {
        console.error("Error fetching images:", err);
        set({
          error: err.message || "Failed to fetch images",
          isLoading: false,
        });
      }
    },

    uploadImage: async (file, caption) => {
      set({ isLoading: true, error: null });
      const supabase = createClient();

      try {
        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("User not authenticated");
        }

        // Upload the file directly to avoid issues with the utility function
        // Create a unique file_name
        const fileExt = file.name.split(".").pop();
        const file_name = `gallery/${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}.${fileExt}`;

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
          throw new Error("Failed to get image URL");
        }

        const imageUrl = urlData.publicUrl;

        // Log successful upload info for debugging
        console.log("Image uploaded successfully:", {
          path: file_name,
          url: imageUrl,
          size: file.size,
        });

        const now = new Date().toISOString();

        // Insert image data into the galleries table
        const newImage: GalleryImage = {
          id: uuidv4(), // Generate ID client-side
          url: imageUrl,
          caption: caption || file.name,
          uploaded_at: now,
          created_at: now,
          updated_at: now,
          user_id: user.id,
          file_name: file_name,
          file_size: file.size,
        };

        const { error: insertError } = await supabase
          .from("galleries")
          .insert(newImage);

        if (insertError) throw insertError;

        // Update local state
        set((state) => ({
          images: [newImage, ...state.images],
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

    deleteImage: async (imageId) => {
      set({ isLoading: true, error: null });
      const supabase = createClient();

      try {
        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("User not authenticated");
        }

        // Find the image to get its file name
        const imageToDelete = get().images.find((img) => img.id === imageId);
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
          images: state.images.filter((image) => image.id !== imageId),
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

    updateImageDetails: async (imageId, updates) => {
      set({ isLoading: true, error: null });
      const supabase = createClient();

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
          images: state.images.map((image) =>
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

    selectImage: (image) => {
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
