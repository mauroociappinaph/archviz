import type { Component } from '../../domain/Component';
import type { Relationship } from '../../domain/Relationship';
import type { ComponentId } from '../../domain/value-objects/ComponentId';
import type { IAnalysisRepository } from '../../domain/ports/IAnalysisRepository';

export interface GetComponentRelationshipsRequest {
  componentId: ComponentId;
  repositoryId: string;
}

export interface ComponentWithRelationshipsDTO {
  component: Component;
  incoming: Relationship[];
  outgoing: Relationship[];
  dependencies: Component[];
  dependents: Component[];
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
    // Step 1: Retrieve the component
    const component = await this.analysisRepository.getComponent(
      request.componentId
    );

    if (!component) {
      throw new Error(`Component not found: ${request.componentId.value}`);
    }

    // Step 2: Get all relationships for this component
    const incoming = await this.analysisRepository.getIncomingRelationships(
      request.componentId
    );
    const outgoing = await this.analysisRepository.getOutgoingRelationships(
      request.componentId
    );

    // Step 3: Get related components
    const dependencyIds = outgoing.map(r => r.targetId);
    const dependentIds = incoming.map(r => r.sourceId);

    const [dependencies, dependents] = await Promise.all([
      Promise.all(
        dependencyIds.map(id => this.analysisRepository.getComponent(id))
      ),
      Promise.all(
        dependentIds.map(id => this.analysisRepository.getComponent(id))
      )
    ]);

    // Step 4: Filter out nulls (in case components were deleted)
    const validDependencies = dependencies.filter((c): c is Component => c !== null);
    const validDependents = dependents.filter((c): c is Component => c !== null);

    return {
      component,
      incoming,
      outgoing,
      dependencies: validDependencies,
      dependents: validDependents
    };
  }
}
