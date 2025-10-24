import { mockDataService } from "./mock-service";
import { mockAuthService } from "./mock-auth";
import { mockStorageService } from "./mock-storage";
import { mockRealtimeService } from "./mock-realtime";

/**
 * Initialize mock data system
 */
export async function initializeMockData(): Promise<void> {
  if (typeof window === "undefined") {
    // Don't initialize on server side
    return;
  }

  try {
    console.log("[Mock Data] Initializing mock data system...");

    // Initialize data service with fixtures
    await mockDataService.initialize();

    console.log("[Mock Data] ✓ Mock data system initialized successfully");
  } catch (error) {
    console.error(
      "[Mock Data] ✗ Failed to initialize mock data system:",
      error
    );
    throw error;
  }
}

/**
 * Reset all mock data to initial fixtures
 */
export async function resetMockData(): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  try {
    console.log("[Mock Data] Resetting mock data...");

    // Reset data service
    await mockDataService.reset();

    // Clear storage
    mockStorageService.clearAll();

    // Remove realtime channels
    mockRealtimeService.removeAllChannels();

    // Sign out auth
    await mockAuthService.signOut();

    console.log("[Mock Data] ✓ Mock data reset successfully");
  } catch (error) {
    console.error("[Mock Data] ✗ Failed to reset mock data:", error);
    throw error;
  }
}

/**
 * Export current mock data state (for debugging)
 */
export function exportMockData(): any {
  if (typeof window === "undefined") {
    return null;
  }

  return {
    data: mockDataService.export(),
    uploadedFiles: mockStorageService.getUploadedFiles(),
    authSession: mockAuthService.getCurrentSession(),
  };
}

/**
 * Check if mock mode is enabled
 */
export function isMockMode(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
}

/**
 * Get mock mode status message
 */
export function getMockModeStatus(): string {
  if (!isMockMode()) {
    return "Mock mode is disabled";
  }

  return "Mock mode is enabled - Using in-memory test data";
}
