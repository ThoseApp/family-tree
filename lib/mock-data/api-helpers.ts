/**
 * API Helpers for mock mode
 * Utilities to help API routes handle mock data
 */

/**
 * Check if mock mode is enabled
 */
export function isMockMode(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
}

/**
 * Simulate network delay for API responses
 */
export async function simulateDelay(
  min: number = 100,
  max: number = 300
): Promise<void> {
  const delay = Math.random() * (max - min) + min;
  await new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Format success response
 */
export function createSuccessResponse<T>(
  data: T,
  message: string = "Success"
): {
  success: boolean;
  data: T;
  message: string;
  errors: string[];
} {
  return {
    success: true,
    data,
    message,
    errors: [],
  };
}

/**
 * Format error response
 */
export function createErrorResponse(
  message: string,
  errors: string[] = []
): {
  success: boolean;
  data: null;
  message: string;
  errors: string[];
} {
  return {
    success: false,
    data: null,
    message,
    errors: errors.length > 0 ? errors : [message],
  };
}

/**
 * Wrap a mock API handler with automatic delay simulation
 */
export async function withMockDelay<T>(
  handler: () => Promise<T> | T,
  delay?: { min?: number; max?: number }
): Promise<T> {
  if (isMockMode()) {
    await simulateDelay(delay?.min, delay?.max);
  }
  return await handler();
}
