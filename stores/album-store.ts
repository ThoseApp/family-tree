import { create } from "zustand";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

export interface Album {
  id: string;
  name: string;
  description?: string;
  cover_image?: string;
  user_id: string;
  item_count: number;
  created_at: string;
  updated_at: string;
}

interface AlbumState {
  albums: Album[];
  userAlbums: Album[];
  isLoading: boolean;
  error: string | null;
  selectedAlbum: Album | null;
}

interface AlbumActions {
  fetchAlbums: () => Promise<void>;
  fetchUserAlbums: (userId: string) => Promise<void>;
  createAlbum: (
    name: string,
    description?: string,
    userId?: string
  ) => Promise<Album>;
  deleteAlbum: (albumId: string) => Promise<void>;
  updateAlbum: (
    albumId: string,
    updates: Partial<Pick<Album, "name" | "description">>
  ) => Promise<void>;
  selectAlbum: (album: Album | null) => void;
}

const initialState: AlbumState = {
  albums: [],
  userAlbums: [],
  isLoading: false,
  error: null,
  selectedAlbum: null,
};

export const useAlbumStore = create<AlbumState & AlbumActions>((set, get) => ({
  ...initialState,

  fetchAlbums: async () => {
    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase
        .from("albums")
        .select(
          `
            *,
            galleries(count)
          `
        )
        .order("updated_at", { ascending: false });

      if (error) throw error;

      const formattedAlbums =
        data?.map((album: any) => ({
          ...album,
          item_count: album.galleries?.[0]?.count || 0,
        })) || [];

      set({ albums: formattedAlbums, isLoading: false });
    } catch (err: any) {
      console.error("Error fetching albums:", err);
      set({
        error: err.message || "Failed to fetch albums",
        isLoading: false,
      });
    }
  },

  fetchUserAlbums: async (userId) => {
    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase
        .from("albums")
        .select(
          `
            *,
            galleries(count)
          `
        )
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      const formattedAlbums =
        data?.map((album: any) => ({
          ...album,
          item_count: album.galleries?.[0]?.count || 0,
        })) || [];

      set({ userAlbums: formattedAlbums, isLoading: false });
    } catch (err: any) {
      console.error("Error fetching user albums:", err);
      set({
        error: err.message || "Failed to fetch user albums",
        isLoading: false,
      });
    }
  },

  createAlbum: async (name, description, userId) => {
    set({ isLoading: true, error: null });

    try {
      const now = new Date().toISOString();

      const newAlbum: Omit<Album, "item_count"> = {
        id: uuidv4(),
        name,
        description: description || "",
        user_id: userId || "",
        created_at: now,
        updated_at: now,
      };

      const { data, error } = await supabase
        .from("albums")
        .insert(newAlbum)
        .select()
        .single();

      if (error) throw error;

      const albumWithCount = { ...data, item_count: 0 };

      // Update local state
      set((state) => ({
        userAlbums: [albumWithCount, ...state.userAlbums],
        albums: [albumWithCount, ...state.albums],
        isLoading: false,
      }));

      return albumWithCount;
    } catch (err: any) {
      console.error("Error creating album:", err);
      set({
        error: err.message || "Failed to create album",
        isLoading: false,
      });
      throw err;
    }
  },

  deleteAlbum: async (albumId) => {
    set({ isLoading: true, error: null });

    try {
      // First, check if album has images
      const { data: galleryItems } = await supabase
        .from("galleries")
        .select("id")
        .eq("album_id", albumId);

      if (galleryItems && galleryItems.length > 0) {
        // If album has images, you might want to either delete them or move them to another album
        // For now, we'll prevent deletion
        throw new Error(
          "Cannot delete album that contains images. Please move or delete images first."
        );
      }

      const { error } = await supabase
        .from("albums")
        .delete()
        .eq("id", albumId);

      if (error) throw error;

      // Update local state
      set((state) => ({
        albums: state.albums.filter((album) => album.id !== albumId),
        userAlbums: state.userAlbums.filter((album) => album.id !== albumId),
        selectedAlbum:
          state.selectedAlbum?.id === albumId ? null : state.selectedAlbum,
        isLoading: false,
      }));
    } catch (err: any) {
      console.error("Error deleting album:", err);
      set({
        error: err.message || "Failed to delete album",
        isLoading: false,
      });
      throw err;
    }
  },

  updateAlbum: async (albumId, updates) => {
    set({ isLoading: true, error: null });

    try {
      const updatesWithTimestamp = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("albums")
        .update(updatesWithTimestamp)
        .eq("id", albumId);

      if (error) throw error;

      // Update local state
      set((state) => ({
        albums: state.albums.map((album) =>
          album.id === albumId ? { ...album, ...updatesWithTimestamp } : album
        ),
        userAlbums: state.userAlbums.map((album) =>
          album.id === albumId ? { ...album, ...updatesWithTimestamp } : album
        ),
        isLoading: false,
      }));
    } catch (err: any) {
      console.error("Error updating album:", err);
      set({
        error: err.message || "Failed to update album",
        isLoading: false,
      });
      throw err;
    }
  },

  selectAlbum: (album) => {
    set({ selectedAlbum: album });
  },
}));
