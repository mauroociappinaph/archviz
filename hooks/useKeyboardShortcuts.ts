/**
 * useKeyboardShortcuts Hook
 * Manages keyboard shortcuts for the application
 *
 * SRP Principle: Handles only keyboard shortcut logic
 * DRY Principle: Reusable shortcut system
 */

import { useEffect, useCallback } from 'react';

interface KeyboardShortcutsOptions {
  onAnalyze: () => void;
  onTabChange: (tab: string) => void;
  onClear: () => void;
  canAnalyze: boolean;
  hasAnalysis: boolean;
  hasInput: boolean;
}

export const useKeyboardShortcuts = ({
  onAnalyze,
  onTabChange,
  onClear,
  canAnalyze,
  hasAnalysis,
  hasInput,
}: KeyboardShortcutsOptions) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Cmd/Ctrl + Enter to analyze
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (canAnalyze) {
          onAnalyze();
        }
      }

      // Cmd/Ctrl + 1/2/3 for tabs
      if ((e.metaKey || e.ctrlKey) && ['1', '2', '3'].includes(e.key)) {
        e.preventDefault();
        const tabs = ['context', 'container', 'component'];
        const tabIndex = parseInt(e.key) - 1;
        if (tabs[tabIndex]) {
          onTabChange(tabs[tabIndex]);
        }
      }

      // Escape to clear
      if (e.key === 'Escape') {
        if (hasAnalysis) {
          onClear();
        }
      }
    },
    [onAnalyze, onTabChange, onClear, canAnalyze, hasAnalysis, hasInput]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};
