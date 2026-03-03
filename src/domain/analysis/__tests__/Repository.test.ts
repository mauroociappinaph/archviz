/**
 * Repository Entity Tests
 * Tests for the Repository aggregate root
 */

import { Repository } from '../Repository';
import { RepositoryId } from '../RepositoryId';
import { GitHubUrl } from '../GitHubUrl';
import { Component } from '../Component';
import { ComponentId } from '../ComponentId';
import { Relationship, RelationshipType } from '../Relationship';
import { Framework, FrameworkType } from '../Framework';
import { ValidationError } from '../../errors/ValidationError';

describe('Repository', () => {
  // Helper functions to create valid value objects
  const createRepositoryId = () => RepositoryId.create();
  const createGitHubUrl = () => GitHubUrl.create('https://github.com/owner/repo');
  const createComponent = (name: string, filePath: string) => {
    return new Component(
      ComponentId.create(),
      name,
      filePath,
      Framework.create(FrameworkType.REACT),
      ['useState'],
      ['react', 'next']
    );
  };

  describe('creation', () => {
    it('should create repository with valid data', () => {
      const id = createRepositoryId();
      const url = createGitHubUrl();
      const repo = new Repository(id, url, 'my-repo');

      expect(repo.getId()).toBe(id);
      expect(repo.getUrl()).toBe(url);
      expect(repo.getName()).toBe('my-repo');
      expect(repo.getComponentCount()).toBe(0);
      expect(repo.getRelationshipCount()).toBe(0);
    });

    it('should throw error when name is empty', () => {
      const id = createRepositoryId();
      const url = createGitHubUrl();

      expect(() => new Repository(id, url, '')).toThrow(ValidationError);
      expect(() => new Repository(id, url, '   ')).toThrow(ValidationError);
    });

    it('should accept custom analyzedAt date', () => {
      const id = createRepositoryId();
      const url = createGitHubUrl();
      const customDate = new Date('2024-01-01');

      const repo = new Repository(id, url, 'my-repo', customDate);

      expect(repo.getAnalyzedAt()).toBe(customDate);
    });
  });

  describe('component management', () => {
    it('should add and retrieve components', () => {
      const repo = new Repository(createRepositoryId(), createGitHubUrl(), 'test-repo');
      const component = createComponent('Button', 'components/Button.tsx');

      repo.addComponent(component);

      expect(repo.getComponentCount()).toBe(1);
      expect(repo.getComponent(component.getId())).toBe(component);
      expect(repo.hasComponent(component.getId())).toBe(true);
    });

    it('should return all components as readonly array', () => {
      const repo = new Repository(createRepositoryId(), createGitHubUrl(), 'test-repo');
      const comp1 = createComponent('Button', 'components/Button.tsx');
      const comp2 = createComponent('Input', 'components/Input.tsx');

      repo.addComponent(comp1);
      repo.addComponent(comp2);

      const components = repo.getComponents();
      expect(components).toHaveLength(2);
      expect(components).toContain(comp1);
      expect(components).toContain(comp2);
    });

    it('should return undefined for non-existent component', () => {
      const repo = new Repository(createRepositoryId(), createGitHubUrl(), 'test-repo');
      const nonExistentId = ComponentId.create();

      expect(repo.getComponent(nonExistentId)).toBeUndefined();
      expect(repo.hasComponent(nonExistentId)).toBe(false);
    });
  });

  describe('relationship management', () => {
    it('should add and retrieve relationships', () => {
      const repo = new Repository(createRepositoryId(), createGitHubUrl(), 'test-repo');
      const comp1Id = ComponentId.create();
      const comp2Id = ComponentId.create();
      const relationship = new Relationship(comp1Id, comp2Id, RelationshipType.IMPORTS);

      repo.addRelationship(relationship);

      expect(repo.getRelationshipCount()).toBe(1);
      expect(repo.getRelationships()).toContain(relationship);
    });

    it('should not add duplicate relationships', () => {
      const repo = new Repository(createRepositoryId(), createGitHubUrl(), 'test-repo');
      const comp1Id = ComponentId.create();
      const comp2Id = ComponentId.create();
      const relationship = new Relationship(comp1Id, comp2Id, RelationshipType.IMPORTS);

      repo.addRelationship(relationship);
      repo.addRelationship(relationship);

      expect(repo.getRelationshipCount()).toBe(1);
    });

    it('should filter relationships by source component', () => {
      const repo = new Repository(createRepositoryId(), createGitHubUrl(), 'test-repo');
      const comp1Id = ComponentId.create();
      const comp2Id = ComponentId.create();
      const comp3Id = ComponentId.create();

      const rel1 = new Relationship(comp1Id, comp2Id, RelationshipType.IMPORTS);
      const rel2 = new Relationship(comp1Id, comp3Id, RelationshipType.USES);
      const rel3 = new Relationship(comp2Id, comp3Id, RelationshipType.IMPORTS);

      repo.addRelationship(rel1);
      repo.addRelationship(rel2);
      repo.addRelationship(rel3);

      const fromComp1 = repo.getRelationshipsFrom(comp1Id);
      expect(fromComp1).toHaveLength(2);
      expect(fromComp1).toContain(rel1);
      expect(fromComp1).toContain(rel2);
    });

    it('should filter relationships by target component', () => {
      const repo = new Repository(createRepositoryId(), createGitHubUrl(), 'test-repo');
      const comp1Id = ComponentId.create();
      const comp2Id = ComponentId.create();
      const comp3Id = ComponentId.create();

      const rel1 = new Relationship(comp1Id, comp3Id, RelationshipType.IMPORTS);
      const rel2 = new Relationship(comp2Id, comp3Id, RelationshipType.USES);
      const rel3 = new Relationship(comp1Id, comp2Id, RelationshipType.IMPORTS);

      repo.addRelationship(rel1);
      repo.addRelationship(rel2);
      repo.addRelationship(rel3);

      const toComp3 = repo.getRelationshipsTo(comp3Id);
      expect(toComp3).toHaveLength(2);
      expect(toComp3).toContain(rel1);
      expect(toComp3).toContain(rel2);
    });
  });

  describe('metrics', () => {
    it('should calculate metrics correctly', () => {
      const repo = new Repository(createRepositoryId(), createGitHubUrl(), 'test-repo');
      const comp1 = createComponent('Button', 'components/Button.tsx');
      const comp2 = createComponent('Input', 'components/Input.tsx');

      repo.addComponent(comp1);
      repo.addComponent(comp2);
      repo.addRelationship(new Relationship(comp1.getId(), comp2.getId(), RelationshipType.IMPORTS));

      const metrics = repo.getMetrics();

      expect(metrics.totalComponents).toBe(2);
      expect(metrics.totalRelationships).toBe(1);
      expect(metrics.externalDependencies).toContain('react');
      expect(metrics.externalDependencies).toContain('next');
    });

    it('should find most connected component', () => {
      const repo = new Repository(createRepositoryId(), createGitHubUrl(), 'test-repo');
      const comp1 = createComponent('Button', 'components/Button.tsx');
      const comp2 = createComponent('Input', 'components/Input.tsx');
      const comp3 = createComponent('Form', 'components/Form.tsx');

      repo.addComponent(comp1);
      repo.addComponent(comp2);
      repo.addComponent(comp3);

      // Button is connected to both Input and Form
      repo.addRelationship(new Relationship(comp1.getId(), comp2.getId(), RelationshipType.IMPORTS));
      repo.addRelationship(new Relationship(comp1.getId(), comp3.getId(), RelationshipType.IMPORTS));
      // Input only connected to Form
      repo.addRelationship(new Relationship(comp2.getId(), comp3.getId(), RelationshipType.IMPORTS));

      const mostConnected = repo.getMostConnectedComponent();
      expect(mostConnected).toBe(comp1); // Button has most connections
    });

    it('should return null for most connected when no relationships', () => {
      const repo = new Repository(createRepositoryId(), createGitHubUrl(), 'test-repo');
      const comp = createComponent('Button', 'components/Button.tsx');
      repo.addComponent(comp);

      expect(repo.getMostConnectedComponent()).toBeNull();
    });
  });

  describe('stale detection', () => {
    it('should detect stale analysis', () => {
      const oldDate = new Date(Date.now() - 25 * 60 * 60 * 1000); // 25 hours ago
      const repo = new Repository(createRepositoryId(), createGitHubUrl(), 'test-repo', oldDate);

      expect(repo.isStale()).toBe(true);
    });

    it('should not detect fresh analysis as stale', () => {
      const recentDate = new Date(Date.now() - 1 * 60 * 60 * 1000); // 1 hour ago
      const repo = new Repository(createRepositoryId(), createGitHubUrl(), 'test-repo', recentDate);

      expect(repo.isStale()).toBe(false);
    });

    it('should allow custom stale threshold', () => {
      const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000);
      const repo = new Repository(createRepositoryId(), createGitHubUrl(), 'test-repo', fiveHoursAgo);

      expect(repo.isStale(6 * 60 * 60 * 1000)).toBe(false); // 6 hour threshold
      expect(repo.isStale(4 * 60 * 60 * 1000)).toBe(true);  // 4 hour threshold
    });
  });

  describe('comparison', () => {
    it('should compare repository ages correctly', () => {
      const oldDate = new Date('2024-01-01');
      const newDate = new Date('2024-06-01');

      const oldRepo = new Repository(createRepositoryId(), createGitHubUrl(), 'old-repo', oldDate);
      const newRepo = new Repository(createRepositoryId(), createGitHubUrl(), 'new-repo', newDate);

      expect(newRepo.isNewerThan(oldRepo)).toBe(true);
      expect(oldRepo.isNewerThan(newRepo)).toBe(false);
    });

    it('should check equality by ID', () => {
      const id = createRepositoryId();
      const repo1 = new Repository(id, createGitHubUrl(), 'repo1');
      const repo2 = new Repository(id, createGitHubUrl(), 'repo2');
      const repo3 = new Repository(createRepositoryId(), createGitHubUrl(), 'repo3');

      expect(repo1.equals(repo2)).toBe(true);
      expect(repo1.equals(repo3)).toBe(false);
    });
  });

  describe('string representation', () => {
    it('should have proper string representation', () => {
      const repo = new Repository(createRepositoryId(), createGitHubUrl(), 'test-repo');
      const comp = createComponent('Button', 'components/Button.tsx');
      repo.addComponent(comp);

      expect(repo.toString()).toBe('test-repo (1 components)');
    });
  });
});
