/**
 * Storage Constants
 * Centralized constants for localStorage keys and limits
 *
 * DRY Principle: Single source of truth for storage configuration
 */

export const STORAGE_KEYS = {
  RECENT_REPOS: 'archviz_recent_repos',
} as const;

export const STORAGE_LIMITS = {
  MAX_RECENT_REPOS: 5,
} as const;
