/**
 * Storage management utilities to handle localStorage quota issues
 */

export interface StorageInfo {
  used: number;
  available: number;
  total: number;
  usedMB: number;
  availableMB: number;
  totalMB: number;
}

/**
 * Get approximate localStorage usage information
 */
export const getStorageInfo = (): StorageInfo => {
  let used = 0;

  // Calculate used space
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      used += localStorage[key].length + key.length;
    }
  }

  // Estimate total available space (5MB is typical)
  const total = 5 * 1024 * 1024; // 5MB in bytes
  const available = total - used;

  return {
    used,
    available,
    total,
    usedMB: used / (1024 * 1024),
    availableMB: available / (1024 * 1024),
    totalMB: total / (1024 * 1024),
  };
};

/**
 * Check if localStorage has enough space for data
 */
export const hasEnoughSpace = (dataSize: number): boolean => {
  const info = getStorageInfo();
  return info.available > dataSize * 1.1; // 10% buffer
};

/**
 * Clear specific localStorage items by pattern
 */
export const clearStorageByPattern = (pattern: string): void => {
  const keysToRemove: string[] = [];

  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key) && key.includes(pattern)) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => {
    localStorage.removeItem(key);
  });

  console.log(
    `Cleared ${keysToRemove.length} localStorage items matching "${pattern}"`
  );
};

/**
 * Clear all localStorage data
 */
export const clearAllStorage = (): void => {
  const count = localStorage.length;
  localStorage.clear();
  console.log(`Cleared all localStorage data (${count} items)`);
};

/**
 * Get the largest localStorage items
 */
export const getLargestStorageItems = (
  limit = 10
): Array<{ key: string; size: number; sizeMB: number }> => {
  const items: Array<{ key: string; size: number; sizeMB: number }> = [];

  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      const size = localStorage[key].length + key.length;
      items.push({
        key,
        size,
        sizeMB: size / (1024 * 1024),
      });
    }
  }

  return items.sort((a, b) => b.size - a.size).slice(0, limit);
};

/**
 * Safe localStorage setter with quota error handling
 */
export const safeSetItem = (key: string, value: string): boolean => {
  try {
    const dataSize = value.length + key.length;

    if (!hasEnoughSpace(dataSize)) {
      console.warn("Insufficient localStorage space for data");
      return false;
    }

    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    if (
      error instanceof DOMException &&
      (error.code === 22 ||
        error.name === "QuotaExceededError" ||
        error.name === "NS_ERROR_DOM_QUOTA_REACHED")
    ) {
      console.error("localStorage quota exceeded");

      // Try to free up space by removing largest items
      const largestItems = getLargestStorageItems(3);
      largestItems.forEach((item) => {
        if (item.key !== key) {
          // Don't remove the item we're trying to set
          localStorage.removeItem(item.key);
          console.log(
            `Removed large localStorage item: ${
              item.key
            } (${item.sizeMB.toFixed(2)}MB)`
          );
        }
      });

      // Retry once
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (retryError) {
        console.error("Failed to store data even after cleanup");
        return false;
      }
    } else {
      console.error("Failed to write to localStorage:", error);
      return false;
    }
  }
};

/**
 * Display storage information in console
 */
export const logStorageInfo = (): void => {
  const info = getStorageInfo();
  const largestItems = getLargestStorageItems(5);

  console.group("🗄️ localStorage Information");
  console.log(`Total: ${info.totalMB.toFixed(2)}MB`);
  console.log(
    `Used: ${info.usedMB.toFixed(2)}MB (${(
      (info.used / info.total) *
      100
    ).toFixed(1)}%)`
  );
  console.log(`Available: ${info.availableMB.toFixed(2)}MB`);

  if (largestItems.length > 0) {
    console.log("\n📊 Largest items:");
    largestItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item.key}: ${item.sizeMB.toFixed(2)}MB`);
    });
  }
  console.groupEnd();
};

/**
 * Emergency storage cleanup - removes all non-essential data
 */
export const emergencyCleanup = (): void => {
  console.log("🚨 Performing emergency localStorage cleanup...");

  // Keep only essential auth/user data
  const essentialKeys = ["auth", "user", "session", "token"];
  const itemsToKeep: Record<string, string> = {};

  // Backup essential items
  essentialKeys.forEach((pattern) => {
    for (const key in localStorage) {
      if (
        localStorage.hasOwnProperty(key) &&
        key.toLowerCase().includes(pattern)
      ) {
        itemsToKeep[key] = localStorage[key];
      }
    }
  });

  // Clear everything
  const originalCount = localStorage.length;
  localStorage.clear();

  // Restore essential items
  Object.entries(itemsToKeep).forEach(([key, value]) => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn(`Failed to restore essential item: ${key}`);
    }
  });

  console.log(
    `✅ Emergency cleanup complete. Removed ${
      originalCount - Object.keys(itemsToKeep).length
    } items, kept ${Object.keys(itemsToKeep).length} essential items.`
  );

  logStorageInfo();
};
