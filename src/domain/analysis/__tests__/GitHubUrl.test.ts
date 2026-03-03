/**
 * GitHubUrl Value Object Tests
 */

import { GitHubUrl } from '../GitHubUrl';
import { ValidationError } from '../../errors/ValidationError';

describe('GitHubUrl', () => {
  describe('creation', () => {
    it('should create valid GitHub URL with https', () => {
      const url = GitHubUrl.create('https://github.com/owner/repo');

      expect(url.getOwner()).toBe('owner');
      expect(url.getRepo()).toBe('repo');
      expect(url.getFullName()).toBe('owner/repo');
      expect(url.toString()).toBe('https://github.com/owner/repo');
    });

    it('should create valid GitHub URL without protocol', () => {
      const url = GitHubUrl.create('github.com/owner/repo');

      expect(url.getOwner()).toBe('owner');
      expect(url.getRepo()).toBe('repo');
    });

    it('should create valid GitHub URL with http', () => {
      const url = GitHubUrl.create('http://github.com/owner/repo');

      expect(url.getOwner()).toBe('owner');
      expect(url.getRepo()).toBe('repo');
    });

    it('should create valid GitHub URL with www', () => {
      const url = GitHubUrl.create('https://www.github.com/owner/repo');

      expect(url.getOwner()).toBe('owner');
      expect(url.getRepo()).toBe('repo');
    });

    it('should normalize URL to https format', () => {
      const url = GitHubUrl.create('http://github.com/owner/repo');

      expect(url.toString()).toBe('https://github.com/owner/repo');
    });

    it('should throw error for empty URL', () => {
      expect(() => GitHubUrl.create('')).toThrow(ValidationError);
    });

    it('should throw error for whitespace-only URL', () => {
      expect(() => GitHubUrl.create('   ')).toThrow(ValidationError);
    });

    it('should throw error for invalid URL format', () => {
      expect(() => GitHubUrl.create('not-a-url')).toThrow(ValidationError);
      expect(() => GitHubUrl.create('https://example.com/owner/repo')).toThrow(ValidationError);
    });

    it('should throw error for missing owner', () => {
      expect(() => GitHubUrl.create('https://github.com/repo')).toThrow(ValidationError);
    });

    it('should throw error for missing repo', () => {
      expect(() => GitHubUrl.create('https://github.com/owner/')).toThrow(ValidationError);
    });
  });

  describe('fromValidated', () => {
    it('should create URL without validation', () => {
      const url = GitHubUrl.fromValidated('https://github.com/owner/repo');

      expect(url.getOwner()).toBe('owner');
      expect(url.getRepo()).toBe('repo');
    });
  });

  describe('equality', () => {
    it('should be equal for same URL', () => {
      const url1 = GitHubUrl.create('https://github.com/owner/repo');
      const url2 = GitHubUrl.create('https://github.com/owner/repo');

      expect(url1.equals(url2)).toBe(true);
    });

    it('should be equal for different formats of same URL', () => {
      const url1 = GitHubUrl.create('https://github.com/owner/repo');
      const url2 = GitHubUrl.create('github.com/owner/repo');

      expect(url1.equals(url2)).toBe(true);
    });

    it('should not be equal for different URLs', () => {
      const url1 = GitHubUrl.create('https://github.com/owner/repo1');
      const url2 = GitHubUrl.create('https://github.com/owner/repo2');

      expect(url1.equals(url2)).toBe(false);
    });
  });

  describe('hash code', () => {
    it('should return consistent hash code', () => {
      const url = GitHubUrl.create('https://github.com/owner/repo');

      expect(url.getHashCode()).toBe('https://github.com/owner/repo');
    });
  });
});
