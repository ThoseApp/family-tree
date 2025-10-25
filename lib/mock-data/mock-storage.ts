// @ts-nocheck
import {
  MockStorageClient,
  MockStorageUploadResponse,
  MockError,
} from "./types";

/**
 * MockStorageService - Mock file storage system
 * Simulates Supabase storage with mock CDN URLs
 */
class MockStorageService implements MockStorageClient {
  private uploadedFiles: Map<
    string,
    { path: string; url: string; metadata: any }
  > = new Map();

  /**
   * Get storage bucket
   */
  from(bucket: string) {
    return {
      /**
       * Upload file to mock storage
       */
      upload: async (
        path: string,
        file: File | Blob,
        options?: any
      ): Promise<MockStorageUploadResponse> => {
        await this.simulateDelay();

        try {
          // Generate mock URL for the uploaded file
          const mockUrl = this.generateMockUrl(path, file);
          const fileId = `mock-file-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`;

          // Store file metadata
          this.uploadedFiles.set(fileId, {
            path: `${bucket}/${path}`,
            url: mockUrl,
            metadata: {
              size: file.size,
              type: file.type,
              lastModified:
                file instanceof File ? file.lastModified : Date.now(),
            },
          });

          console.log(`[Mock Storage] Uploaded file to ${bucket}/${path}`);

          return {
            data: {
              path: path,
              id: fileId,
              fullPath: `${bucket}/${path}`,
            },
            error: null,
          };
        } catch (error: any) {
          return {
            data: null,
            error: {
              message: error.message || "Upload failed",
              code: "upload_error",
            },
          };
        }
      },

      /**
       * Download file from mock storage
       */
      download: async (
        path: string
      ): Promise<{ data: Blob | null; error: MockError | null }> => {
        await this.simulateDelay();

        // In mock mode, we can't actually return the file content
        // Return a small mock blob
        const mockBlob = new Blob(["mock file content"], {
          type: "text/plain",
        });

        return {
          data: mockBlob,
          error: null,
        };
      },

      /**
       * Remove files from mock storage
       */
      remove: async (
        paths: string[]
      ): Promise<{ data: any; error: MockError | null }> => {
        await this.simulateDelay();

        const removed: string[] = [];

        for (const [fileId, file] of this.uploadedFiles.entries()) {
          if (paths.some((path) => file.path.endsWith(path))) {
            this.uploadedFiles.delete(fileId);
            removed.push(file.path);
          }
        }

        console.log(`[Mock Storage] Removed ${removed.length} files`);

        return {
          data: removed,
          error: null,
        };
      },

      /**
       * Get public URL for a file
       */
      getPublicUrl: (path: string): { data: { publicUrl: string } } => {
        // Check if we have this file in our uploads
        for (const [_, file] of this.uploadedFiles.entries()) {
          if (file.path.endsWith(path)) {
            return {
              data: { publicUrl: file.url },
            };
          }
        }

        // Generate a mock URL
        const mockUrl = this.generateMockUrl(path);
        return {
          data: { publicUrl: mockUrl },
        };
      },
    };
  }

  /**
   * Generate a mock CDN URL for uploaded files
   */
  private generateMockUrl(path: string, file?: File | Blob): string {
    // For images, use a placeholder service
    if (file) {
      const isImage = file.type.startsWith("image/");
      if (isImage) {
        // Use a random unsplash image as mock
        const imageId = Math.floor(Math.random() * 1000);
        return `https://images.unsplash.com/photo-${imageId}?w=800&auto=format`;
      }
    }

    // For other files or when no file object is provided
    const fileName = path.split("/").pop() || "file";
    return `https://mock-cdn.example.com/storage/${path}?t=${Date.now()}`;
  }

  /**
   * Simulate network delay
   */
  private async simulateDelay(): Promise<void> {
    const delay = Math.random() * 300 + 200; // 200-500ms for file operations
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  /**
   * Get all uploaded files (for debugging)
   */
  getUploadedFiles(): Array<{ path: string; url: string; metadata: any }> {
    return Array.from(this.uploadedFiles.values());
  }

  /**
   * Clear all uploaded files
   */
  clearAll(): void {
    this.uploadedFiles.clear();
    console.log("[Mock Storage] Cleared all uploaded files");
  }
}

// Singleton instance
export const mockStorageService = new MockStorageService();
