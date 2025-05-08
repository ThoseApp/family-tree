import { create } from "zustand";

// TODO: Define a more specific type for GalleryImage if available
interface GalleryImage {
  id: string;
  url: string;
  caption?: string;
  uploadedAt: string; // Or Date object
  // Add other relevant properties, e.g., uploaderId, tags, etc.
}

interface GalleryState {
  images: GalleryImage[];
  isLoading: boolean;
  error: string | null;
  selectedImage: GalleryImage | null;
}

interface GalleryActions {
  fetchImages: () => Promise<void>;
  uploadImage: (file: File, caption?: string) => Promise<void>; // Example: takes a File object
  deleteImage: (imageId: string) => Promise<void>;
  updateImageDetails: (
    imageId: string,
    updates: Partial<Pick<GalleryImage, "caption">>
  ) => Promise<void>; // Example: only caption updatable
  selectImage: (image: GalleryImage | null) => void;
}

const initialState: GalleryState = {
  images: [],
  isLoading: false,
  error: null,
  selectedImage: null,
};

export const useGalleryStore = create<GalleryState & GalleryActions>((set) => ({
  ...initialState,
  fetchImages: async () => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const mockImages: GalleryImage[] = [
        {
          id: "1",
          url: "https://via.placeholder.com/150/0000FF/808080?Text=Image1",
          caption: "First image",
          uploadedAt: new Date().toISOString(),
        },
        {
          id: "2",
          url: "https://via.placeholder.com/150/FF0000/FFFFFF?Text=Image2",
          caption: "Second image",
          uploadedAt: new Date().toISOString(),
        },
      ]; // Replace with actual API call
      set({ images: mockImages, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to fetch images", isLoading: false });
    }
  },
  uploadImage: async (file, caption) => {
    set({ isLoading: true });
    try {
      // Simulate API call & file upload
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // In a real app, you would upload the file to a server/storage and get back a URL
      const newImage: GalleryImage = {
        id: Date.now().toString(),
        url: URL.createObjectURL(file), // This is a temporary local URL, replace with actual uploaded URL
        caption: caption,
        uploadedAt: new Date().toISOString(),
      };
      set((state) => ({
        images: [...state.images, newImage],
        isLoading: false,
      }));
    } catch (err: any) {
      set({ error: err.message || "Failed to upload image", isLoading: false });
    }
  },
  deleteImage: async (imageId) => {
    set({ isLoading: true });
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      set((state) => ({
        images: state.images.filter((image) => image.id !== imageId),
        isLoading: false,
        selectedImage:
          state.selectedImage?.id === imageId ? null : state.selectedImage, // Clear selection if deleted
      }));
    } catch (err: any) {
      set({ error: err.message || "Failed to delete image", isLoading: false });
    }
  },
  updateImageDetails: async (imageId, updates) => {
    set({ isLoading: true });
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      set((state) => ({
        images: state.images.map((image) =>
          image.id === imageId ? { ...image, ...updates } : image
        ),
        isLoading: false,
      }));
    } catch (err: any) {
      set({
        error: err.message || "Failed to update image details",
        isLoading: false,
      });
    }
  },
  selectImage: (image) => {
    set({ selectedImage: image });
  },
}));

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
