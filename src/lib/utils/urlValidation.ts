/**
 * URL Validation Utilities
 * TDD Implementation
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  owner?: string;
  repo?: string;
}

/**
 * Validates if a string is a valid GitHub repository URL
 * Supports formats:
 * - https://github.com/owner/repo
 * - http://github.com/owner/repo
 * - github.com/owner/repo
 * - www.github.com/owner/repo
 */
export function isValidGitHubUrl(url: string): ValidationResult {
  // Empty string check
  if (!url || url.trim() === '') {
    return { isValid: false, error: 'Invalid GitHub URL format' };
  }

  // Regex for GitHub URLs
  // Matches: optional protocol, optional www, github.com, owner, repo
  const githubRegex = /^(https?:\/\/)?(www\.)?github\.com\/([^\/]+)\/([^\/]+)/i;
  const match = url.match(githubRegex);

  if (!match) {
    return { isValid: false, error: 'Invalid GitHub URL format' };
  }

  const owner = match[3];
  const repo = match[4];

  // Additional validations
  if (!owner || owner.length < 1) {
    return { isValid: false, error: 'Invalid username' };
  }

  if (!repo || repo.length < 1) {
    return { isValid: false, error: 'Invalid repository name' };
  }

  // Clean up repo name (remove trailing slashes, etc.)
  const cleanRepo = repo.split('/')[0];

  return {
    isValid: true,
    owner,
    repo: cleanRepo,
  };
}

/**
 * Validates if a GitHub repository exists by making an API call
 */
export async function validateRepoExists(owner: string, repo: string): Promise<boolean> {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    });

    return response.status === 200;
  } catch (error) {
    return false;
  }
}
