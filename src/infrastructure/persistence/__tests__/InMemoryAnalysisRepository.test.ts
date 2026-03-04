/**
 * InMemoryAnalysisRepository Tests
 */

import { InMemoryAnalysisRepository } from '../InMemoryAnalysisRepository';
import { Repository } from '../../../domain/analysis/Repository';
import { RepositoryId } from '../../../domain/analysis/RepositoryId';
import { GitHubUrl } from '../../../domain/analysis/GitHubUrl';
import { Component } from '../../../domain/analysis/Component';
import { ComponentId } from '../../../domain/analysis/ComponentId';
import { Framework, FrameworkType } from '../../../domain/analysis/Framework';

describe('InMemoryAnalysisRepository', () => {
  let repo: InMemoryAnalysisRepository;

  beforeEach(() => {
    repo = new InMemoryAnalysisRepository();
  });

  const createTestRepository = (name: string = 'test-repo'): Repository => {
    const repository = new Repository(
      RepositoryId.create(),
      GitHubUrl.create(`https://github.com/owner/${name}`),
      name
    );

    const component = new Component(
      ComponentId.create(),
      'Button',
      'components/Button.tsx',
      Framework.create(FrameworkType.REACT)
    );
    repository.addComponent(component);

    return repository;
  };

  describe('save', () => {
    it('should save repository', async () => {
      const repository = createTestRepository();

      await repo.save(repository);

      expect(repo.getCount()).toBe(1);
    });

    it('should update existing repository', async () => {
      const repository = createTestRepository();
      await repo.save(repository);

      // Add component and save again
      const newComp = new Component(
        ComponentId.create(),
        'Input',
        'components/Input.tsx',
        Framework.create(FrameworkType.REACT)
      );
      repository.addComponent(newComp);
      await repo.save(repository);

      expect(repo.getCount()).toBe(1);
      const saved = await repo.findById(repository.getId());
      expect(saved?.getComponentCount()).toBe(2);
    });
  });

  describe('findById', () => {
    it('should find repository by ID', async () => {
      const repository = createTestRepository();
      await repo.save(repository);

      const found = await repo.findById(repository.getId());

      expect(found).toBe(repository);
    });

    it('should return null for non-existent ID', async () => {
      const found = await repo.findById(RepositoryId.create());

      expect(found).toBeNull();
    });
  });

  describe('findByUrl', () => {
    it('should find repository by URL', async () => {
      const repository = createTestRepository('my-repo');
      await repo.save(repository);

      const url = GitHubUrl.create('https://github.com/owner/my-repo');
      const found = await repo.findByUrl(url);

      expect(found).toBe(repository);
    });

    it('should return null for non-existent URL', async () => {
      const url = GitHubUrl.create('https://github.com/owner/non-existent');
      const found = await repo.findByUrl(url);

      expect(found).toBeNull();
    });

    it('should find repository with matching URL', async () => {
      const repo1 = createTestRepository('repo1');
      const repo2 = createTestRepository('repo2');
      await repo.save(repo1);
      await repo.save(repo2);

      const url = GitHubUrl.create('https://github.com/owner/repo1');
      const found = await repo.findByUrl(url);

      expect(found).toBe(repo1);
    });
  });

  describe('exists', () => {
    it('should return true for existing URL', async () => {
      const repository = createTestRepository('exists-repo');
      await repo.save(repository);

      const url = GitHubUrl.create('https://github.com/owner/exists-repo');
      const exists = await repo.exists(url);

      expect(exists).toBe(true);
    });

    it('should return false for non-existent URL', async () => {
      const url = GitHubUrl.create('https://github.com/owner/non-existent');
      const exists = await repo.exists(url);

      expect(exists).toBe(false);
    });
  });

  describe('findAll', () => {
    it('should return empty array when no repositories', async () => {
      const all = await repo.findAll();

      expect(all).toEqual([]);
    });

    it('should return all repositories', async () => {
      const repo1 = createTestRepository('repo1');
      const repo2 = createTestRepository('repo2');
      await repo.save(repo1);
      await repo.save(repo2);

      const all = await repo.findAll();

      expect(all).toHaveLength(2);
      expect(all).toContain(repo1);
      expect(all).toContain(repo2);
    });
  });

  describe('delete', () => {
    it('should delete repository by ID', async () => {
      const repository = createTestRepository();
      await repo.save(repository);

      await repo.delete(repository.getId());

      expect(repo.getCount()).toBe(0);
    });

    it('should not throw when deleting non-existent ID', async () => {
      await expect(repo.delete(RepositoryId.create())).resolves.not.toThrow();
    });
  });

  describe('clear', () => {
    it('should clear all repositories', async () => {
      await repo.save(createTestRepository('repo1'));
      await repo.save(createTestRepository('repo2'));
      await repo.save(createTestRepository('repo3'));

      await repo.clear();

      expect(repo.getCount()).toBe(0);
      const all = await repo.findAll();
      expect(all).toHaveLength(0);
    });
  });

  describe('getCount', () => {
    it('should return 0 for empty repository', () => {
      expect(repo.getCount()).toBe(0);
    });

    it('should return correct count', async () => {
      await repo.save(createTestRepository('repo1'));
      expect(repo.getCount()).toBe(1);

      await repo.save(createTestRepository('repo2'));
      expect(repo.getCount()).toBe(2);
    });
  });
});
