/**
 * AnalysisResultDTO Tests
 */

import { AnalysisResultDTO, ComponentDTO, RelationshipDTO, RepositoryMetricsDTO, DiagramDataDTO } from '../AnalysisResultDTO';

describe('AnalysisResultDTO', () => {
  const createComponentDTO = (id: string, name: string): ComponentDTO => ({
    id,
    name,
    filePath: `components/${name}.tsx`,
    framework: 'React',
    hooks: ['useState'],
    dependencies: ['react'],
  });

  const createRelationshipDTO = (from: string, to: string): RelationshipDTO => ({
    from,
    to,
    type: 'imports',
  });

  const createMetricsDTO = (): RepositoryMetricsDTO => ({
    totalComponents: 2,
    totalRelationships: 1,
    externalDependencies: ['react'],
    mostConnectedComponent: 'Button',
  });

  const createDiagramsDTO = (): DiagramDataDTO => ({
    context: 'C4Context diagram',
    container: 'C4Container diagram',
    component: 'C4Component diagram',
  });

  describe('creation', () => {
    it('should create DTO with all properties', () => {
      const analyzedAt = new Date('2024-01-15');
      const dto = new AnalysisResultDTO(
        'repo-123',
        'https://github.com/owner/repo',
        'my-repo',
        'React',
        [createComponentDTO('comp-1', 'Button')],
        [createRelationshipDTO('comp-1', 'comp-2')],
        createMetricsDTO(),
        createDiagramsDTO(),
        analyzedAt.toISOString()
      );

      expect(dto.id).toBe('repo-123');
      expect(dto.url).toBe('https://github.com/owner/repo');
      expect(dto.name).toBe('my-repo');
      expect(dto.framework).toBe('React');
      expect(dto.components).toHaveLength(1);
      expect(dto.relationships).toHaveLength(1);
      expect(dto.metrics.totalComponents).toBe(2);
      expect(dto.diagrams.context).toBe('C4Context diagram');
      expect(dto.analyzedAt).toBe(analyzedAt.toISOString());
    });

    it('should create DTO with empty arrays', () => {
      const dto = new AnalysisResultDTO(
        'repo-123',
        'https://github.com/owner/repo',
        'my-repo',
        'React',
        [],
        [],
        createMetricsDTO(),
        createDiagramsDTO(),
        new Date().toISOString()
      );

      expect(dto.components).toEqual([]);
      expect(dto.relationships).toEqual([]);
    });
  });

  describe('fromDomain factory method', () => {
    it('should create DTO from domain values', () => {
      const analyzedAt = new Date('2024-01-15');
      const dto = AnalysisResultDTO.fromDomain(
        'repo-123',
        'https://github.com/owner/repo',
        'my-repo',
        'React',
        [createComponentDTO('comp-1', 'Button')],
        [createRelationshipDTO('comp-1', 'comp-2')],
        createMetricsDTO(),
        createDiagramsDTO(),
        analyzedAt
      );

      expect(dto.id).toBe('repo-123');
      expect(dto.url).toBe('https://github.com/owner/repo');
      expect(dto.name).toBe('my-repo');
      expect(dto.framework).toBe('React');
      expect(dto.analyzedAt).toBe(analyzedAt.toISOString());
    });

    it('should convert analyzedAt Date to ISO string', () => {
      const date = new Date('2024-06-01T12:00:00Z');
      const dto = AnalysisResultDTO.fromDomain(
        'repo-123',
        'https://github.com/owner/repo',
        'my-repo',
        'React',
        [],
        [],
        createMetricsDTO(),
        createDiagramsDTO(),
        date
      );

      expect(dto.analyzedAt).toBe('2024-06-01T12:00:00.000Z');
    });
  });

  describe('data structures', () => {
    it('should properly structure ComponentDTO', () => {
      const component: ComponentDTO = {
        id: 'comp-1',
        name: 'Button',
        filePath: 'components/Button.tsx',
        framework: 'React',
        hooks: ['useState', 'useEffect'],
        dependencies: ['react', 'styled-components'],
      };

      expect(component.id).toBe('comp-1');
      expect(component.name).toBe('Button');
      expect(component.hooks).toHaveLength(2);
      expect(component.dependencies).toHaveLength(2);
    });

    it('should properly structure RelationshipDTO', () => {
      const relationship: RelationshipDTO = {
        from: 'comp-1',
        to: 'comp-2',
        type: 'imports',
      };

      expect(relationship.from).toBe('comp-1');
      expect(relationship.to).toBe('comp-2');
      expect(relationship.type).toBe('imports');
    });

    it('should handle null mostConnectedComponent in metrics', () => {
      const metrics: RepositoryMetricsDTO = {
        totalComponents: 0,
        totalRelationships: 0,
        externalDependencies: [],
        mostConnectedComponent: null,
      };

      expect(metrics.mostConnectedComponent).toBeNull();
    });
  });
});
