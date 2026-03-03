/**
 * useRecentRepos Hook
 * Manages recent repositories list with localStorage persistence
 *
 * SRP Principle: Handles only recent repos logic
 * DRY Principle: Reusable across components
 */

import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS, STORAGE_LIMITS } from '@/lib/constants/storage';

export interface RecentRepo {
  url: string;
  name: string;
  timestamp: number;
}

export const useRecentRepos = () => {
  const [recentRepos, setRecentRepos] = useState<RecentRepo[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.RECENT_REPOS);
    if (stored) {
      try {
        const repos = JSON.parse(stored);
        setRecentRepos(repos);
      } catch (e) {
        console.error('Failed to parse recent repos:', e);
      }
    }
  }, []);

  // Save repo to recent list
  const saveRecentRepo = useCallback((url: string, name: string) => {
    const newRepo: RecentRepo = { url, name, timestamp: Date.now() };
    setRecentRepos(prev => {
      const filtered = prev.filter(r => r.url !== url);
      const updated = [newRepo, ...filtered].slice(0, STORAGE_LIMITS.MAX_RECENT_REPOS);
      localStorage.setItem(STORAGE_KEYS.RECENT_REPOS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Clear all recent repos
  const clearRecentRepos = useCallback(() => {
    setRecentRepos([]);
    localStorage.removeItem(STORAGE_KEYS.RECENT_REPOS);
  }, []);

  return {
    recentRepos,
    saveRecentRepo,
    clearRecentRepos,
  };
};
