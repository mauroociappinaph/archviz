import type { Component } from '../../domain/analysis/Component';
import type { Relationship } from '../../domain/analysis/Relationship';
import type { ComponentId } from '../../domain/analysis/ComponentId';
import type { RepositoryId } from '../../domain/analysis/RepositoryId';
import type { Repository } from '../../domain/analysis/Repository';
import type { IAnalysisRepository } from '../../domain/repositories/IAnalysisRepository';

export interface GetComponentRelationshipsRequest {
  repositoryId: RepositoryId;
  componentId: ComponentId;
}

export interface ComponentWithRelationshipsDTO {
  component: Component;
  incoming: Relationship[];
  outgoing: Relationship[];
}

/**
 * Use case for retrieving component relationships
 * Follows Clean Architecture - Application Layer
 */
export class GetComponentRelationshipsUseCase {
  constructor(
    private readonly analysisRepository: IAnalysisRepository
  ) {}

  async execute(
    request: GetComponentRelationshipsRequest
  ): Promise<ComponentWithRelationshipsDTO> {
    // Step 1: Retrieve the repository
    const repository = await this.analysisRepository.findById(
      request.repositoryId
    );

    if (!repository) {
      throw new Error(`Repository not found: ${request.repositoryId.toString()}`);
    }

    // Step 2: Find the component in the repository
    const component = repository.getComponent(request.componentId);

    if (!component) {
      throw new Error(`Component not found: ${request.componentId.toString()}`);
    }

    // Step 3: Get all relationships for this component
    const incoming = repository.getRelationshipsTo(request.componentId);
    const outgoing = repository.getRelationshipsFrom(request.componentId);

    return {
      component,
      incoming,
      outgoing
    };
  }
}
