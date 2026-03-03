/**
 * GetComponentRelationshipsUseCase Tests
 */

import { GetComponentRelationshipsUseCase } from '../GetComponentRelationshipsUseCase';
import { Repository } from '../../../domain/analysis/Repository';
import { RepositoryId } from '../../../domain/analysis/RepositoryId';
import { GitHubUrl } from '../../../domain/analysis/GitHubUrl';
import { Component } from '../../../domain/analysis/Component';
import { ComponentId } from '../../../domain/analysis/ComponentId';
import { Relationship, RelationshipType } from '../../../domain/analysis/Relationship';
import { Framework, FrameworkType } from '../../../domain/analysis/Framework';
import type { IAnalysisRepository } from '../../../domain/repositories/IAnalysisRepository';

// Mock repository
const createMockRepository = (): jest.Mocked<IAnalysisRepository> => ({
  save: jest.fn(),
  findById: jest.fn(),
  findByUrl: jest.fn(),
  exists: jest.fn(),
  findAll: jest.fn(),
  delete: jest.fn(),
  clear: jest.fn(),
});

describe('GetComponentRelationshipsUseCase', () => {
  let useCase: GetComponentRelationshipsUseCase;
  let mockRepo: jest.Mocked<IAnalysisRepository>;

  beforeEach(() => {
    mockRepo = createMockRepository();
    useCase = new GetComponentRelationshipsUseCase(mockRepo);
  });

  it('should get component with relationships', async () => {
    // Arrange
    const repoId = RepositoryId.create();
    const compId = ComponentId.create();
    const comp2Id = ComponentId.create();
    const comp3Id = ComponentId.create();

    const repository = new Repository(repoId, GitHubUrl.create('https://github.com/owner/repo'), 'test-repo');
    const component = new Component(compId, 'Button', 'components/Button.tsx', Framework.create(FrameworkType.REACT));
    const comp2 = new Component(comp2Id, 'Input', 'components/Input.tsx', Framework.create(FrameworkType.REACT));
    const comp3 = new Component(comp3Id, 'Form', 'components/Form.tsx', Framework.create(FrameworkType.REACT));

    repository.addComponent(component);
    repository.addComponent(comp2);
    repository.addComponent(comp3);

    // Button imports Input (outgoing)
    repository.addRelationship(new Relationship(compId, comp2Id, RelationshipType.IMPORTS));
    // Form imports Button (incoming)
    repository.addRelationship(new Relationship(comp3Id, compId, RelationshipType.IMPORTS));

    mockRepo.findById.mockResolvedValue(repository);

    // Act
    const result = await useCase.execute({
      repositoryId: repoId,
      componentId: compId,
    });

    // Assert
    expect(result.component).toBe(component);
    expect(result.outgoing).toHaveLength(1);
    expect(result.incoming).toHaveLength(1);
    expect(mockRepo.findById).toHaveBeenCalledWith(repoId);
  });

  it('should throw error when repository not found', async () => {
    const repoId = RepositoryId.create();
    const compId = ComponentId.create();

    mockRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ repositoryId: repoId, componentId: compId })
    ).rejects.toThrow('Repository not found');
  });

  it('should throw error when component not found', async () => {
    const repoId = RepositoryId.create();
    const compId = ComponentId.create();
    const otherCompId = ComponentId.create();

    const repository = new Repository(repoId, GitHubUrl.create('https://github.com/owner/repo'), 'test-repo');
    const component = new Component(otherCompId, 'Button', 'components/Button.tsx', Framework.create(FrameworkType.REACT));
    repository.addComponent(component);

    mockRepo.findById.mockResolvedValue(repository);

    await expect(
      useCase.execute({ repositoryId: repoId, componentId: compId })
    ).rejects.toThrow('Component not found');
  });

  it('should return empty arrays when component has no relationships', async () => {
    const repoId = RepositoryId.create();
    const compId = ComponentId.create();

    const repository = new Repository(repoId, GitHubUrl.create('https://github.com/owner/repo'), 'test-repo');
    const component = new Component(compId, 'Button', 'components/Button.tsx', Framework.create(FrameworkType.REACT));
    repository.addComponent(component);

    mockRepo.findById.mockResolvedValue(repository);

    const result = await useCase.execute({
      repositoryId: repoId,
      componentId: compId,
    });

    expect(result.component).toBe(component);
    expect(result.outgoing).toHaveLength(0);
    expect(result.incoming).toHaveLength(0);
  });
});
