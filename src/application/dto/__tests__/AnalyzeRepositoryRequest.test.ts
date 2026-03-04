/**
 * AnalyzeRepositoryRequest DTO Tests
 */

import { AnalyzeRepositoryRequest } from '../AnalyzeRepositoryRequest';
import { ValidationError } from '../../../domain/errors/ValidationError';

describe('AnalyzeRepositoryRequest', () => {
  describe('creation', () => {
    it('should create request with valid GitHub URL', () => {
      const request = AnalyzeRepositoryRequest.create({
        url: 'https://github.com/owner/repo',
      });

      expect(request.url).toBe('https://github.com/owner/repo');
      expect(request.maxFiles).toBe(50);
      expect(request.forceRefresh).toBe(false);
      expect(request.includeHooks).toBe(true);
    });

    it('should accept custom maxFiles', () => {
      const request = AnalyzeRepositoryRequest.create({
        url: 'https://github.com/owner/repo',
        maxFiles: 25,
      });

      expect(request.maxFiles).toBe(25);
    });

    it('should accept forceRefresh option', () => {
      const request = AnalyzeRepositoryRequest.create({
        url: 'https://github.com/owner/repo',
        forceRefresh: true,
      });

      expect(request.forceRefresh).toBe(true);
    });

    it('should accept includeHooks option', () => {
      const request = AnalyzeRepositoryRequest.create({
        url: 'https://github.com/owner/repo',
        includeHooks: false,
      });

      expect(request.includeHooks).toBe(false);
    });

    it('should accept all custom options', () => {
      const request = AnalyzeRepositoryRequest.create({
        url: 'https://github.com/owner/repo',
        maxFiles: 75,
        forceRefresh: true,
        includeHooks: false,
      });

      expect(request.url).toBe('https://github.com/owner/repo');
      expect(request.maxFiles).toBe(75);
      expect(request.forceRefresh).toBe(true);
      expect(request.includeHooks).toBe(false);
    });

    it('should accept www.github.com URLs', () => {
      const request = AnalyzeRepositoryRequest.create({
        url: 'https://www.github.com/owner/repo',
      });

      expect(request.url).toBe('https://www.github.com/owner/repo');
    });

    it('should accept http URLs', () => {
      const request = AnalyzeRepositoryRequest.create({
        url: 'http://github.com/owner/repo',
      });

      expect(request.url).toBe('http://github.com/owner/repo');
    });
  });

  describe('validation', () => {
    it('should throw error for empty URL', () => {
      expect(() =>
        AnalyzeRepositoryRequest.create({ url: '' })
      ).toThrow(ValidationError);
    });

    it('should throw error for whitespace-only URL', () => {
      expect(() =>
        AnalyzeRepositoryRequest.create({ url: '   ' })
      ).toThrow(ValidationError);
    });

    it('should throw error for invalid URL format', () => {
      expect(() =>
        AnalyzeRepositoryRequest.create({ url: 'not-a-url' })
      ).toThrow(ValidationError);

      expect(() =>
        AnalyzeRepositoryRequest.create({ url: 'https://example.com/repo' })
      ).toThrow(ValidationError);

      expect(() =>
        AnalyzeRepositoryRequest.create({ url: 'github.com/owner' })
      ).toThrow(ValidationError);
    });

    it('should throw error for maxFiles less than 1', () => {
      expect(() =>
        AnalyzeRepositoryRequest.create({
          url: 'https://github.com/owner/repo',
          maxFiles: 0,
        })
      ).toThrow(ValidationError);
    });

    it('should throw error for maxFiles greater than 100', () => {
      expect(() =>
        AnalyzeRepositoryRequest.create({
          url: 'https://github.com/owner/repo',
          maxFiles: 101,
        })
      ).toThrow(ValidationError);
    });

    it('should accept boundary values for maxFiles', () => {
      const request1 = AnalyzeRepositoryRequest.create({
        url: 'https://github.com/owner/repo',
        maxFiles: 1,
      });
      expect(request1.maxFiles).toBe(1);

      const request2 = AnalyzeRepositoryRequest.create({
        url: 'https://github.com/owner/repo',
        maxFiles: 100,
      });
      expect(request2.maxFiles).toBe(100);
    });
  });
});
