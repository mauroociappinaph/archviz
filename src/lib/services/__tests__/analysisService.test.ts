/**
 * Analysis Service Tests
 */

import { analyzeRepository, AnalysisResponse } from '../analysisService';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('analysisService', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('analyzeRepository', () => {
    it('should analyze repository successfully', async () => {
      const mockResult = {
        data: {
          analysis: {
            context: { name: 'test', description: 'test', technology: 'React', externalSystems: [] },
            containers: [],
            components: [],
          },
          diagrams: { context: '', container: '', component: '' },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResult,
      });

      const result = await analyzeRepository('https://github.com/owner/repo');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockFetch).toHaveBeenCalledWith('/api/analyze', expect.any(Object));
    });

    it('should return error on failed request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' }),
      });

      const result = await analyzeRepository('https://github.com/owner/repo');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Server error');
    });

    it('should return error with default message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({}),
      });

      const result = await analyzeRepository('https://github.com/owner/repo');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to analyze repository');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await analyzeRepository('https://github.com/owner/repo');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('should send correct request body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await analyzeRepository('https://github.com/owner/repo');

      expect(mockFetch).toHaveBeenCalledWith('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repoUrl: 'https://github.com/owner/repo' }),
      });
    });
  });
});
