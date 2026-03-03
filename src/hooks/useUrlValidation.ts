/**
 * Hook for URL Validation with debounce
 * Follows TDD principles - tested behavior
 */

import { useState, useEffect, useCallback } from 'react';
import { isValidGitHubUrl, validateRepoExists } from '@/lib/utils/urlValidation';

export interface UseUrlValidationReturn {
  status: 'idle' | 'valid' | 'invalid' | 'checking';
  message?: string;
  owner?: string;
  repo?: string;
}

export function useUrlValidation(url: string): UseUrlValidationReturn {
  const [validation, setValidation] = useState<UseUrlValidationReturn>({
    status: 'idle',
  });

  useEffect(() => {
    // Reset if empty
    if (!url || url.trim() === '') {
      setValidation({ status: 'idle' });
      return;
    }

    // Check format first (synchronous)
    const result = isValidGitHubUrl(url);

    if (!result.isValid) {
      setValidation({
        status: 'invalid',
        message: result.error,
      });
      return;
    }

    // Valid format - now check if repo exists
    setValidation({
      status: 'checking',
      message: 'Checking repository...',
      owner: result.owner,
      repo: result.repo,
    });

    // Debounced API check
    const timer = setTimeout(async () => {
      if (result.owner && result.repo) {
        const exists = await validateRepoExists(result.owner, result.repo);

        if (exists) {
          setValidation({
            status: 'valid',
            message: '✓ Valid GitHub repository',
            owner: result.owner,
            repo: result.repo,
          });
        } else {
          setValidation({
            status: 'invalid',
            message: 'Repository not found or not public',
            owner: result.owner,
            repo: result.repo,
          });
        }
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [url]);

  return validation;
}
