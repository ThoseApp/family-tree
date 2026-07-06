export interface PoolOptions {
  /** Max number of workers running at once. */
  concurrency: number;
  /** Automatic retries after the first attempt (total attempts = 1 + retries). */
  retries: number;
}

export interface PoolResult<T> {
  index: number;
  item: T;
  status: "fulfilled" | "rejected";
  value?: unknown;
  error?: unknown;
}

/**
 * Runs `worker` over `items` with bounded concurrency and per-item retries.
 * Never rejects: each item resolves to a settled PoolResult. Results are
 * returned in the same order as `items`.
 */
export async function runPool<T>(
  items: T[],
  worker: (item: T, index: number) => Promise<unknown>,
  options: PoolOptions
): Promise<PoolResult<T>[]> {
  const { concurrency, retries } = options;
  const results: PoolResult<T>[] = new Array(items.length);
  let next = 0;

  const runOne = async (index: number): Promise<void> => {
    const item = items[index];
    let attempt = 0;
    while (true) {
      try {
        const value = await worker(item, index);
        results[index] = { index, item, status: "fulfilled", value };
        return;
      } catch (error) {
        attempt++;
        if (attempt > retries) {
          results[index] = { index, item, status: "rejected", error };
          return;
        }
      }
    }
  };

  const workerLoop = async (): Promise<void> => {
    while (true) {
      const index = next++;
      if (index >= items.length) return;
      await runOne(index);
    }
  };

  const workers = Math.max(1, Math.min(concurrency, items.length || 1));
  await Promise.all(Array.from({ length: workers }, () => workerLoop()));
  return results;
}
