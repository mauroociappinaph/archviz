/**
 * ExportMetricsUseCase Tests
 */

import { ExportMetricsUseCase } from '../ExportMetricsUseCase';
import { Repository } from '../../../domain/analysis/Repository';
import { RepositoryId } from '../../../domain/analysis/RepositoryId';
import { GitHubUrl } from '../../../domain/analysis/GitHubUrl';
import { Component } from '../../../domain/analysis/Component';
import { ComponentId } from '../../../domain/analysis/ComponentId';
import { Framework, FrameworkType } from '../../../domain/analysis/Framework';
import type { IAnalysisRepository } from '../../../domain/repositories/IAnalysisRepository';

const createMockRepository = (): jest.Mocked<IAnalysisRepository> => ({
  save: jest.fn(),
  findById: jest.fn(),
  findByUrl: jest.fn(),
  exists: jest.fn(),
  findAll: jest.fn(),
  delete: jest.fn(),
  clear: jest.fn(),
});

describe('ExportMetricsUseCase', () => {
  let useCase: ExportMetricsUseCase;
  let mockRepo: jest.Mocked<IAnalysisRepository>;

  beforeEach(() => {
    mockRepo = createMockRepository();
    useCase = new ExportMetricsUseCase(mockRepo);
  });

  const createTestRepository = () => {
    const repoId = RepositoryId.create();
    const repository = new Repository(
      repoId,
      GitHubUrl.create('https://github.com/owner/test-repo'),
      'test-repo'
    );

    const comp1 = new Component(
      ComponentId.create(),
      'Button',
      'components/Button.tsx',
      Framework.create(FrameworkType.REACT),
      ['useState', 'useEffect'],
      ['react', 'styled-components']
    );

    const comp2 = new Component(
      ComponentId.create(),
      'Input',
      'components/Input.tsx',
      Framework.create(FrameworkType.REACT),
      ['useState'],
      ['react']
    );

    repository.addComponent(comp1);
    repository.addComponent(comp2);

    return { repoId, repository };
  };

  describe('JSON format', () => {
    it('should export metrics as JSON', async () => {
      const { repoId, repository } = createTestRepository();
      mockRepo.findById.mockResolvedValue(repository);

      const result = await useCase.execute({
        repositoryId: repoId,
        format: 'json',
      });

      const parsed = JSON.parse(result);
      expect(parsed.repository.name).toBe('test-repo');
      expect(parsed.repository.url).toBe('https://github.com/owner/test-repo');
      expect(parsed.summary.totalComponents).toBe(2);
      expect(parsed.components).toHaveLength(2);
    });

    it('should include component details in JSON', async () => {
      const { repoId, repository } = createTestRepository();
      mockRepo.findById.mockResolvedValue(repository);

      const result = await useCase.execute({
        repositoryId: repoId,
        format: 'json',
      });

      const parsed = JSON.parse(result);
      const buttonComponent = parsed.components.find((c: any) => c.name === 'Button');

      expect(buttonComponent).toBeDefined();
      expect(buttonComponent.filePath).toBe('components/Button.tsx');
      expect(buttonComponent.framework).toBe('React');
      expect(buttonComponent.hooks).toEqual(['useState', 'useEffect']);
      expect(buttonComponent.dependencies).toEqual(['react', 'styled-components']);
    });
  });

  describe('CSV format', () => {
    it('should export metrics as CSV', async () => {
      const { repoId, repository } = createTestRepository();
      mockRepo.findById.mockResolvedValue(repository);

      const result = await useCase.execute({
        repositoryId: repoId,
        format: 'csv',
      });

      const lines = result.split('\n');
      expect(lines[0]).toBe('Name,File Path,Framework,Hooks Count,Dependencies Count');
      expect(lines).toHaveLength(3); // Header + 2 components
    });

    it('should quote values in CSV', async () => {
      const { repoId, repository } = createTestRepository();
      mockRepo.findById.mockResolvedValue(repository);

      const result = await useCase.execute({
        repositoryId: repoId,
        format: 'csv',
      });

      expect(result).toContain('"Button"');
      expect(result).toContain('"components/Button.tsx"');
    });
  });

  describe('Markdown format', () => {
    it('should export metrics as Markdown', async () => {
      const { repoId, repository } = createTestRepository();
      mockRepo.findById.mockResolvedValue(repository);

      const result = await useCase.execute({
        repositoryId: repoId,
        format: 'markdown',
      });

      expect(result).toContain('# test-repo - Analysis Report');
      expect(result).toContain('## Repository Information');
      expect(result).toContain('## Summary');
      expect(result).toContain('## Components');
      expect(result).toContain('| Total Components | 2 |');
    });

    it('should include component table in Markdown', async () => {
      const { repoId, repository } = createTestRepository();
      mockRepo.findById.mockResolvedValue(repository);

      const result = await useCase.execute({
        repositoryId: repoId,
        format: 'markdown',
      });

      expect(result).toContain('| Button | Button.tsx | React | 2 | 2 |');
      expect(result).toContain('| Input | Input.tsx | React | 1 | 1 |');
    });
  });

  describe('error handling', () => {
    it('should throw error when repository not found', async () => {
      const repoId = RepositoryId.create();
      mockRepo.findById.mockResolvedValue(null);

      await expect(
        useCase.execute({ repositoryId: repoId, format: 'json' })
      ).rejects.toThrow('Repository not found');
    });

    it('should throw error for unsupported format', async () => {
      const { repoId, repository } = createTestRepository();
      mockRepo.findById.mockResolvedValue(repository);

      await expect(
        useCase.execute({ repositoryId: repoId, format: 'xml' as any })
      ).rejects.toThrow('Unsupported format');
    });
  });
});
