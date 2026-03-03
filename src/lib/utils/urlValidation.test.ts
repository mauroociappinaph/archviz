/**
 * Tests for URL Validation
 * TDD Approach - One test at a time
 */

import { isValidGitHubUrl, validateRepoExists } from './urlValidation';

describe('isValidGitHubUrl', () => {
  // Test 1: Valid GitHub URL
  it('should validate a correct GitHub URL', () => {
    const result = isValidGitHubUrl('https://github.com/facebook/react');
    expect(result.isValid).toBe(true);
    expect(result.owner).toBe('facebook');
    expect(result.repo).toBe('react');
  });

  // Test 2: URL without protocol
  it('should validate URL without https://', () => {
    const result = isValidGitHubUrl('github.com/facebook/react');
    expect(result.isValid).toBe(true);
    expect(result.owner).toBe('facebook');
    expect(result.repo).toBe('react');
  });

  // Test 3: Invalid URL format
  it('should reject invalid URL format', () => {
    const result = isValidGitHubUrl('not-a-url');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Invalid GitHub URL format');
  });

  // Test 4: Empty string
  it('should reject empty string', () => {
    const result = isValidGitHubUrl('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Invalid GitHub URL format');
  });

  // Test 5: Missing owner
  it('should reject URL with missing owner', () => {
    const result = isValidGitHubUrl('https://github.com/react');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Invalid GitHub URL format');
  });

  // Test 6: URL with www
  it('should validate URL with www', () => {
    const result = isValidGitHubUrl('https://www.github.com/facebook/react');
    expect(result.isValid).toBe(true);
    expect(result.owner).toBe('facebook');
    expect(result.repo).toBe('react');
  });

  // Test 7: Repo with hyphens and numbers
  it('should validate repo with special characters', () => {
    const result = isValidGitHubUrl('https://github.com/vercel/next.js');
    expect(result.isValid).toBe(true);
    expect(result.owner).toBe('vercel');
    expect(result.repo).toBe('next.js');
  });
});

describe('validateRepoExists', () => {
  // Test 8: Existing public repo
  it('should return true for existing public repo', async () => {
    const result = await validateRepoExists('facebook', 'react');
    expect(result).toBe(true);
  });

  // Test 9: Non-existing repo
  it('should return false for non-existing repo', async () => {
    const result = await validateRepoExists('this-owner-does-not-exist-12345', 'fake-repo');
    expect(result).toBe(false);
  });
});
