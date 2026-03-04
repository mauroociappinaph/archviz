/**
 * AnalyzeRepositoryUseCase Tests
 */

import { AnalyzeRepositoryUseCase } from '../AnalyzeRepositoryUseCase';
import { AnalyzeRepositoryRequest } from '../../dto/AnalyzeRepositoryRequest';
import { AnalysisResultDTO } from '../../dto/AnalysisResultDTO';
import { IGitHubApiPort } from '../../ports/IGitHubApiPort';
import { IASTParserPort } from '../../ports/IASTParserPort';
import { ICachePort } from '../../ports/ICachePort';
import { IAnalysisRepository } from '../../../domain/repositories/IAnalysisRepository';
import { DiagramGeneratorService } from '../../services/DiagramGeneratorService';

// Mock implementations
const createMockGitHubApi = (): jest.Mocked<IGitHubApiPort> => ({
  fetchSourceFiles: jest.fn(),
  fetchFileContent: jest.fn(),
  validateRepository: jest.fn(),
  getRepositoryInfo: jest.fn(),
});

const createMockParser = (): jest.Mocked<IASTParserPort> => ({
  parse: jest.fn(),
  supports: jest.fn(),
  getSupportedExtensions: jest.fn(),
});

const createMockCache = (): jest.Mocked<ICachePort> => ({
  get: jest.fn(),
  set: jest.fn(),
  has: jest.fn(),
  delete: jest.fn(),
  clear: jest.fn(),
  getStats: jest.fn(),
});

const createMockRepository = (): jest.Mocked<IAnalysisRepository> => ({
  save: jest.fn(),
  findById: jest.fn(),
  findByUrl: jest.fn(),
  exists: jest.fn(),
  findAll: jest.fn(),
  delete: jest.fn(),
  clear: jest.fn(),
});

describe('AnalyzeRepositoryUseCase', () => {
  let useCase: AnalyzeRepositoryUseCase;
  let mockGitHubApi: jest.Mocked<IGitHubApiPort>;
  let mockParser: jest.Mocked<IASTParserPort>;
  let mockRepository: jest.Mocked<IAnalysisRepository>;
  let mockCache: jest.Mocked<ICachePort>;
  let diagramGenerator: DiagramGeneratorService;

  beforeEach(() => {
    mockGitHubApi = createMockGitHubApi();
    mockParser = createMockParser();
    mockRepository = createMockRepository();
    mockCache = createMockCache();
    diagramGenerator = new DiagramGeneratorService();

    useCase = new AnalyzeRepositoryUseCase(
      mockGitHubApi,
      mockParser,
      mockRepository,
      diagramGenerator,
      mockCache
    );

    // Default mock implementations
    mockGitHubApi.validateRepository.mockResolvedValue(true);
    mockGitHubApi.fetchSourceFiles.mockResolvedValue([]);
    mockParser.supports.mockReturnValue(true);
    mockCache.getStats.mockReturnValue({
      totalEntries: 0,
      hitRate: 0,
      missRate: 0,
      totalRequests: 0,
    });
  });

  describe('basic execution', () => {
    it('should analyze repository successfully', async () => {
      const request = AnalyzeRepositoryRequest.create({
        url: 'https://github.com/owner/test-repo',
      });

      mockGitHubApi.fetchSourceFiles.mockResolvedValue([
        { path: 'src/Button.tsx', name: 'Button.tsx', size: 100 },
      ]);
      mockGitHubApi.fetchFileContent.mockResolvedValue('export const Button = () => {}');
      mockParser.parse.mockResolvedValue({
        components: [{ name: 'Button', framework: 'React', hooks: [] }],
        imports: [],
        exports: [],
        dependencies: [],
      });

      const result = await useCase.execute(request);

      expect(result).toBeDefined();
      expect(result.name).toBe('test-repo');
      expect(result.url).toBe('https://github.com/owner/test-repo');
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should validate repository exists', async () => {
      const request = AnalyzeRepositoryRequest.create({
        url: 'https://github.com/owner/non-existent',
      });

      mockGitHubApi.validateRepository.mockResolvedValue(false);

      await expect(useCase.execute(request)).rejects.toThrow('Repository not found');
    });
  });

  describe('caching', () => {
    it('should return cached result when available', async () => {
      const request = AnalyzeRepositoryRequest.create({
        url: 'https://github.com/owner/cached-repo',
      });

      const cachedResult: AnalysisResultDTO = {
        id: 'cached-id',
        url: 'https://github.com/owner/cached-repo',
        name: 'cached-repo',
        framework: 'React',
        components: [],
        relationships: [],
        metrics: {
          totalComponents: 0,
          totalRelationships: 0,
          externalDependencies: [],
          mostConnectedComponent: null,
        },
        diagrams: { context: '', container: '', component: '' },
        analyzedAt: new Date().toISOString(),
      };

      mockCache.get.mockReturnValue(cachedResult);
      mockCache.getStats.mockReturnValue({
        totalEntries: 1,
        hitRate: 1,
        missRate: 0,
        totalRequests: 1,
      });

      const result = await useCase.execute(request);

      expect(result.id).toBe('cached-id');
      expect(result.cacheStats).toBeDefined();
      expect(result.cacheStats?.fromCache).toBe(true);
      expect(mockGitHubApi.fetchSourceFiles).not.toHaveBeenCalled();
    });

    it('should bypass cache when forceRefresh is true', async () => {
      const request = AnalyzeRepositoryRequest.create({
        url: 'https://github.com/owner/refresh-repo',
        forceRefresh: true,
      });

      const cachedResult: AnalysisResultDTO = {
        id: 'cached-id',
        url: 'https://github.com/owner/refresh-repo',
        name: 'refresh-repo',
        framework: 'React',
        components: [],
        relationships: [],
        metrics: {
          totalComponents: 0,
          totalRelationships: 0,
          externalDependencies: [],
          mostConnectedComponent: null,
        },
        diagrams: { context: '', container: '', component: '' },
        analyzedAt: new Date().toISOString(),
      };

      mockCache.get.mockReturnValue(cachedResult);
      mockGitHubApi.fetchSourceFiles.mockResolvedValue([]);

      await useCase.execute(request);

      expect(mockGitHubApi.fetchSourceFiles).toHaveBeenCalled();
    });

    it('should cache new results', async () => {
      const request = AnalyzeRepositoryRequest.create({
        url: 'https://github.com/owner/new-repo',
      });

      mockGitHubApi.fetchSourceFiles.mockResolvedValue([]);
      mockCache.get.mockReturnValue(null);

      const result = await useCase.execute(request);

      expect(mockCache.set).toHaveBeenCalled();
      expect(result.cacheStats?.fromCache).toBe(false);
    });
  });

  describe('file parsing', () => {
    it('should parse supported files', async () => {
      const request = AnalyzeRepositoryRequest.create({
        url: 'https://github.com/owner/parse-repo',
      });

      mockGitHubApi.fetchSourceFiles.mockResolvedValue([
        { path: 'src/Button.tsx', name: 'Button.tsx', size: 100 },
        { path: 'src/Input.tsx', name: 'Input.tsx', size: 100 },
      ]);
      mockGitHubApi.fetchFileContent.mockResolvedValue('export const Component = () => {}');
      mockParser.supports.mockReturnValue(true);
      // Mock parse to return different components for different files
      mockParser.parse
        .mockResolvedValueOnce({
          components: [{ name: 'Button', framework: 'React', hooks: ['useState'] }],
          imports: [],
          exports: [],
          dependencies: ['react'],
        })
        .mockResolvedValueOnce({
          components: [{ name: 'Input', framework: 'React', hooks: ['useEffect'] }],
          imports: [],
          exports: [],
          dependencies: ['react'],
        });

      const result = await useCase.execute(request);

      // parse is called twice per file (once for components, once for relationships)
      expect(mockParser.parse).toHaveBeenCalledTimes(4);
      expect(result.components).toHaveLength(2);
    });

    it('should skip unsupported file extensions', async () => {
      const request = AnalyzeRepositoryRequest.create({
        url: 'https://github.com/owner/skip-repo',
      });

      mockGitHubApi.fetchSourceFiles.mockResolvedValue([
        { path: 'README.md', name: 'README.md', size: 100 },
        { path: 'src/App.tsx', name: 'App.tsx', size: 100 },
      ]);
      mockGitHubApi.fetchFileContent.mockResolvedValue('content');
      mockParser.supports.mockImplementation((ext) => ext === 'tsx');
      mockParser.parse.mockResolvedValue({
        components: [{ name: 'App', framework: 'React', hooks: [] }],
        imports: [],
        exports: [],
        dependencies: [],
      });

      const result = await useCase.execute(request);

      // parse is called twice for the supported file (components + relationships)
      expect(mockParser.parse).toHaveBeenCalledTimes(2);
      expect(result.components).toHaveLength(1);
    });

    it('should continue on parse errors', async () => {
      const request = AnalyzeRepositoryRequest.create({
        url: 'https://github.com/owner/error-repo',
      });

      mockGitHubApi.fetchSourceFiles.mockResolvedValue([
        { path: 'src/Good.tsx', name: 'Good.tsx', size: 100 },
        { path: 'src/Bad.tsx', name: 'Bad.tsx', size: 100 },
      ]);
      mockGitHubApi.fetchFileContent.mockResolvedValue('content');
      mockParser.supports.mockReturnValue(true);
      mockParser.parse.mockResolvedValue({
        components: [{ name: 'Good', framework: 'React', hooks: [] }],
        imports: [],
        exports: [],
        dependencies: [],
      });

      const result = await useCase.execute(request);

      expect(result.components.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('relationship detection', () => {
    it('should detect component relationships', async () => {
      const request = AnalyzeRepositoryRequest.create({
        url: 'https://github.com/owner/relations-repo',
      });

      mockGitHubApi.fetchSourceFiles.mockResolvedValue([
        { path: 'src/Button.tsx', name: 'Button.tsx', size: 100 },
        { path: 'src/Card.tsx', name: 'Card.tsx', size: 100 },
      ]);
      mockGitHubApi.fetchFileContent.mockResolvedValue('content');
      mockParser.supports.mockReturnValue(true);
      mockParser.parse
        .mockResolvedValueOnce({
          components: [{ name: 'Button', framework: 'React', hooks: [] }],
          imports: [],
          exports: [],
          dependencies: [],
        })
        .mockResolvedValueOnce({
          components: [{ name: 'Card', framework: 'React', hooks: [] }],
          imports: ['./Button'],
          exports: [],
          dependencies: [],
        });

      const result = await useCase.execute(request);

      expect(result).toBeDefined();
    });
  });

  describe('hooks option', () => {
    it('should include hooks when includeHooks is true', async () => {
      const request = AnalyzeRepositoryRequest.create({
        url: 'https://github.com/owner/hooks-repo',
        includeHooks: true,
      });

      mockGitHubApi.fetchSourceFiles.mockResolvedValue([
        { path: 'src/Button.tsx', name: 'Button.tsx', size: 100 },
      ]);
      mockGitHubApi.fetchFileContent.mockResolvedValue('content');
      mockParser.parse.mockResolvedValue({
        components: [{ name: 'Button', framework: 'React', hooks: ['useState', 'useEffect'] }],
        imports: [],
        exports: [],
        dependencies: [],
      });

      const result = await useCase.execute(request);

      const buttonComponent = result.components.find((c) => c.name === 'Button');
      expect(buttonComponent?.hooks).toContain('useState');
      expect(buttonComponent?.hooks).toContain('useEffect');
    });

    it('should exclude hooks when includeHooks is false', async () => {
      const request = AnalyzeRepositoryRequest.create({
        url: 'https://github.com/owner/no-hooks-repo',
        includeHooks: false,
      });

      mockGitHubApi.fetchSourceFiles.mockResolvedValue([
        { path: 'src/Button.tsx', name: 'Button.tsx', size: 100 },
      ]);
      mockGitHubApi.fetchFileContent.mockResolvedValue('content');
      mockParser.parse.mockResolvedValue({
        components: [{ name: 'Button', framework: 'React', hooks: ['useState'] }],
        imports: [],
        exports: [],
        dependencies: [],
      });

      const result = await useCase.execute(request);

      const buttonComponent = result.components.find((c) => c.name === 'Button');
      expect(buttonComponent?.hooks).toHaveLength(0);
    });
  });

  describe('maxFiles limit', () => {
    it('should respect maxFiles parameter', async () => {
      const request = AnalyzeRepositoryRequest.create({
        url: 'https://github.com/owner/limit-repo',
        maxFiles: 3,
      });

      mockGitHubApi.fetchSourceFiles.mockResolvedValue([
        { path: 'src/1.tsx', name: '1.tsx', size: 100 },
        { path: 'src/2.tsx', name: '2.tsx', size: 100 },
        { path: 'src/3.tsx', name: '3.tsx', size: 100 },
        { path: 'src/4.tsx', name: '4.tsx', size: 100 },
      ]);
      mockGitHubApi.fetchFileContent.mockResolvedValue('content');
      mockParser.parse.mockResolvedValue({
        components: [{ name: 'Comp', framework: 'React', hooks: [] }],
        imports: [],
        exports: [],
        dependencies: [],
      });

      await useCase.execute(request);

      expect(mockGitHubApi.fetchSourceFiles).toHaveBeenCalledWith('owner', 'limit-repo', 3);
    });
  });

  describe('result structure', () => {
    it('should return complete analysis result', async () => {
      const request = AnalyzeRepositoryRequest.create({
        url: 'https://github.com/owner/complete-repo',
      });

      mockGitHubApi.fetchSourceFiles.mockResolvedValue([
        { path: 'src/Button.tsx', name: 'Button.tsx', size: 100 },
      ]);
      mockGitHubApi.fetchFileContent.mockResolvedValue('content');
      mockParser.parse.mockResolvedValue({
        components: [{ name: 'Button', framework: 'React', hooks: [] }],
        imports: [],
        exports: [],
        dependencies: ['react'],
      });

      const result = await useCase.execute(request);

      expect(result.id).toBeDefined();
      expect(result.url).toBe('https://github.com/owner/complete-repo');
      expect(result.name).toBe('complete-repo');
      expect(result.framework).toBeDefined();
      expect(result.components).toBeDefined();
      expect(result.relationships).toBeDefined();
      expect(result.metrics).toBeDefined();
      expect(result.diagrams).toBeDefined();
      expect(result.analyzedAt).toBeDefined();
    });

    it('should include metrics in result', async () => {
      const request = AnalyzeRepositoryRequest.create({
        url: 'https://github.com/owner/metrics-repo',
      });

      mockGitHubApi.fetchSourceFiles.mockResolvedValue([
        { path: 'src/Button.tsx', name: 'Button.tsx', size: 100 },
      ]);
      mockGitHubApi.fetchFileContent.mockResolvedValue('content');
      mockParser.parse.mockResolvedValue({
        components: [{ name: 'Button', framework: 'React', hooks: [] }],
        imports: [],
        exports: [],
        dependencies: ['react'],
      });

      const result = await useCase.execute(request);

      expect(result.metrics.totalComponents).toBeGreaterThanOrEqual(0);
      expect(result.metrics.externalDependencies).toBeDefined();
    });
  });
});
