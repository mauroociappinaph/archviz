/**
 * SQLite Cache Adapter
 * Implements caching using SQLite database
 */

import Database from "better-sqlite3";
import { ICachePort, CacheStats } from "../../application/ports/ICachePort";
import * as path from "path";
import * as fs from "fs";

export class SQLiteCacheAdapter implements ICachePort {
  private db: Database.Database;
  private hits: number = 0;
  private misses: number = 0;
  private readonly defaultTTL: number = 3600; // 1 hour in seconds

  constructor(dbPath?: string) {
    // Use /tmp for serverless environments (Vercel)
    const cacheDir = process.env.VERCEL ? "/tmp" : path.join(process.cwd(), ".cache");

    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    const databasePath = dbPath || path.join(cacheDir, "archviz-cache.db");
    this.db = new Database(databasePath);
    this.initializeTable();
  }

  private initializeTable(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS cache_entries (
        key TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        ttl INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_cache_timestamp
      ON cache_entries(timestamp);
    `);
  }

  get<T>(key: string): T | null {
    try {
      const stmt = this.db.prepare(
        "SELECT data, timestamp, ttl FROM cache_entries WHERE key = ?"
      );
      const row = stmt.get(key) as {
        data: string;
        timestamp: number;
        ttl: number;
      } | undefined;

      if (!row) {
        this.misses++;
        return null;
      }

      const now = Math.floor(Date.now() / 1000);
      const isExpired = now > row.timestamp + row.ttl;

      if (isExpired) {
        this.delete(key);
        this.misses++;
        return null;
      }

      this.hits++;
      return JSON.parse(row.data) as T;
    } catch (error) {
      console.error("Cache get error:", error);
      this.misses++;
      return null;
    }
  }

  set<T>(key: string, data: T, ttlSeconds: number = this.defaultTTL): void {
    try {
      const serialized = JSON.stringify(data);
      const timestamp = Math.floor(Date.now() / 1000);

      const stmt = this.db.prepare(`
        INSERT INTO cache_entries (key, data, timestamp, ttl)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET
          data = excluded.data,
          timestamp = excluded.timestamp,
          ttl = excluded.ttl
      `);

      stmt.run(key, serialized, timestamp, ttlSeconds);
    } catch (error) {
      console.error("Cache set error:", error);
    }
  }

  has(key: string): boolean {
    try {
      const stmt = this.db.prepare(
        "SELECT timestamp, ttl FROM cache_entries WHERE key = ?"
      );
      const row = stmt.get(key) as { timestamp: number; ttl: number } | undefined;

      if (!row) return false;

      const now = Math.floor(Date.now() / 1000);
      const isExpired = now > row.timestamp + row.ttl;

      if (isExpired) {
        this.delete(key);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Cache has error:", error);
      return false;
    }
  }

  delete(key: string): void {
    try {
      const stmt = this.db.prepare("DELETE FROM cache_entries WHERE key = ?");
      stmt.run(key);
    } catch (error) {
      console.error("Cache delete error:", error);
    }
  }

  clear(): void {
    try {
      this.db.exec("DELETE FROM cache_entries");
      this.hits = 0;
      this.misses = 0;
    } catch (error) {
      console.error("Cache clear error:", error);
    }
  }

  getStats(): CacheStats {
    try {
      const stmt = this.db.prepare("SELECT COUNT(*) as count FROM cache_entries");
      const row = stmt.get() as { count: number };
      const totalEntries = row?.count || 0;

      const totalRequests = this.hits + this.misses;
      const hitRate = totalRequests > 0 ? this.hits / totalRequests : 0;
      const missRate = totalRequests > 0 ? this.misses / totalRequests : 0;

      return {
        totalEntries,
        hitRate,
        missRate,
        totalRequests,
      };
    } catch (error) {
      console.error("Cache stats error:", error);
      return {
        totalEntries: 0,
        hitRate: 0,
        missRate: 0,
        totalRequests: 0,
      };
    }
  }

  /**
   * Clean up expired entries (useful for maintenance)
   */
  cleanup(): void {
    try {
      const now = Math.floor(Date.now() / 1000);
      const stmt = this.db.prepare(
        "DELETE FROM cache_entries WHERE (? - timestamp) > ttl"
      );
      stmt.run(now);
    } catch (error) {
      console.error("Cache cleanup error:", error);
    }
  }

  /**
   * Close database connection
   */
  close(): void {
    this.db.close();
  }
}
