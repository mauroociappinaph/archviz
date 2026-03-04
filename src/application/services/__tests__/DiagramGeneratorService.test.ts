/**
 * Diagram Generator Service Tests
 */

import { DiagramGeneratorService } from '../DiagramGeneratorService';
import { Repository } from '../../../domain/analysis/Repository';
import { RepositoryId } from '../../../domain/analysis/RepositoryId';
import { GitHubUrl } from '../../../domain/analysis/GitHubUrl';
import { Component } from '../../../domain/analysis/Component';
import { ComponentId } from '../../../domain/analysis/ComponentId';
import { Relationship, RelationshipType } from '../../../domain/analysis/Relationship';
import { Framework, FrameworkType } from '../../../domain/analysis/Framework';

describe('DiagramGeneratorService', () => {
  let service: DiagramGeneratorService;

  beforeEach(() => {
    service = new DiagramGeneratorService();
  });

  const createTestRepository = (name: string = 'test-repo'): Repository => {
    const repo = new Repository(
      RepositoryId.create(),
      GitHubUrl.create(`https://github.com/owner/${name}`),
      name
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

    repo.addComponent(comp1);
    repo.addComponent(comp2);
    repo.addRelationship(new Relationship(comp1.getId(), comp2.getId(), RelationshipType.IMPORTS));

    return repo;
  };

  describe('generateDiagrams', () => {
    it('should generate all three diagram types', () => {
      const repo = createTestRepository();
      const diagrams = service.generateDiagrams(repo);

      expect(diagrams.context).toBeDefined();
      expect(diagrams.container).toBeDefined();
      expect(diagrams.component).toBeDefined();
    });

    it('should generate context diagram with C4 syntax', () => {
      const repo = createTestRepository();
      const diagrams = service.generateDiagrams(repo);

      expect(diagrams.context).toContain('C4Context');
      expect(diagrams.context).toContain('test-repo');
      expect(diagrams.context).toContain('System(');
      expect(diagrams.context).toContain('Person(user');
    });

    it('should generate container diagram with C4 syntax', () => {
      const repo = createTestRepository();
      const diagrams = service.generateDiagrams(repo);

      expect(diagrams.container).toContain('C4Container');
      expect(diagrams.container).toContain('test-repo');
      expect(diagrams.container).toContain('Container(');
      expect(diagrams.container).toContain('React');
    });

    it('should generate component diagram with C4 syntax', () => {
      const repo = createTestRepository();
      const diagrams = service.generateDiagrams(repo);

      expect(diagrams.component).toContain('C4Component');
      expect(diagrams.component).toContain('test-repo');
      expect(diagrams.component).toContain('Component(');
      expect(diagrams.component).toContain('Button');
      expect(diagrams.component).toContain('Input');
    });
  });

  describe('generateFallbackDiagram', () => {
    it('should generate flowchart diagram', () => {
      const repo = createTestRepository();
      const diagram = service.generateFallbackDiagram(repo);

      expect(diagram).toContain('flowchart TB');
      expect(diagram).toContain('test-repo');
      expect(diagram).toContain('Button');
      expect(diagram).toContain('Input');
    });

    it('should handle repository with many components', () => {
      const repo = new Repository(
        RepositoryId.create(),
        GitHubUrl.create('https://github.com/owner/big-repo'),
        'big-repo'
      );

      // Add 15 components
      for (let i = 0; i < 15; i++) {
        const comp = new Component(
          ComponentId.create(),
          `Component${i}`,
          `components/Component${i}.tsx`,
          Framework.create(FrameworkType.REACT)
        );
        repo.addComponent(comp);
      }

      const diagram = service.generateFallbackDiagram(repo);
      expect(diagram).toContain('... 5 more components');
    });
  });

  describe('component diagram variations', () => {
    it('should handle empty repository', () => {
      const emptyRepo = new Repository(
        RepositoryId.create(),
        GitHubUrl.create('https://github.com/owner/empty'),
        'empty-repo'
      );

      const diagrams = service.generateDiagrams(emptyRepo);
      expect(diagrams.component).toContain('No components detected');
    });

    it('should include hooks in component descriptions', () => {
      const repo = createTestRepository();
      const diagrams = service.generateDiagrams(repo);

      expect(diagrams.component).toContain('useState');
      expect(diagrams.component).toContain('useEffect');
    });

    it('should include relationships in component diagram', () => {
      const repo = createTestRepository();
      const diagrams = service.generateDiagrams(repo);

      expect(diagrams.component).toContain('Rel(');
      expect(diagrams.component).toContain(RelationshipType.IMPORTS);
    });
  });

  describe('external dependencies', () => {
    it('should include external dependencies in context diagram', () => {
      const repo = createTestRepository();
      const diagrams = service.generateDiagrams(repo);

      expect(diagrams.context).toContain('System_Ext(');
      expect(diagrams.context).toContain('react');
    });

    it('should limit external dependencies in container diagram', () => {
      const repo = new Repository(
        RepositoryId.create(),
        GitHubUrl.create('https://github.com/owner/deps-repo'),
        'deps-repo'
      );

      const comp = new Component(
        ComponentId.create(),
        'App',
        'App.tsx',
        Framework.create(FrameworkType.REACT),
        [],
        ['react', 'react-dom', 'next', 'lodash', 'axios', 'express', 'typescript']
      );
      repo.addComponent(comp);

      const diagrams = service.generateDiagrams(repo);
      // Should only include first 5 external deps
      const extCount = (diagrams.container.match(/System_Ext/g) || []).length;
      expect(extCount).toBeLessThanOrEqual(5);
    });
  });

  describe('safe ID generation', () => {
    it('should handle repository names with special characters', () => {
      const repo = new Repository(
        RepositoryId.create(),
        GitHubUrl.create('https://github.com/owner/my-app_v2.0'),
        'my-app_v2.0'
      );

      const diagrams = service.generateDiagrams(repo);
      expect(diagrams.context).toContain('C4Context');
      // Should not throw and should contain the repo name
      expect(diagrams.context).toContain('my-app_v2.0');
    });
  });
});
