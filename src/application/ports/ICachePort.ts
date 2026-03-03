/**
 * Cache Port Interface
 * Defines the contract for caching operations
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface ICachePort {
  /**
   * Get cached data by key
   * @param key Cache key
   * @returns Cached data or null if not found/expired
   */
  get<T>(key: string): T | null;

  /**
   * Set data in cache
   * @param key Cache key
   * @param data Data to cache
   * @param ttlSeconds Time to live in seconds (default: 3600 = 1 hour)
   */
  set<T>(key: string, data: T, ttlSeconds?: number): void;

  /**
   * Check if key exists and is not expired
   * @param key Cache key
   */
  has(key: string): boolean;

  /**
   * Delete cached entry
   * @param key Cache key
   */
  delete(key: string): void;

  /**
   * Clear all cached entries
   */
  clear(): void;

  /**
   * Get cache statistics
   */
  getStats(): CacheStats;
}

export interface CacheStats {
  totalEntries: number;
  hitRate: number;
  missRate: number;
  totalRequests: number;
}
