/**
 * Response DTO for Analysis Result
 * Flat structure for API response
 */

export interface ComponentDTO {
  id: string;
  name: string;
  filePath: string;
  framework: string;
  hooks: string[];
  dependencies: string[];
}

export interface RelationshipDTO {
  from: string;
  to: string;
  type: string;
}

export interface RepositoryMetricsDTO {
  totalComponents: number;
  totalRelationships: number;
  externalDependencies: string[];
  mostConnectedComponent: string | null;
}

export interface DiagramDataDTO {
  context: string;
  container: string;
  component: string;
}

export class AnalysisResultDTO {
  constructor(
    public readonly id: string,
    public readonly url: string,
    public readonly name: string,
    public readonly framework: string,
    public readonly components: ComponentDTO[],
    public readonly relationships: RelationshipDTO[],
    public readonly metrics: RepositoryMetricsDTO,
    public readonly diagrams: DiagramDataDTO,
    public readonly analyzedAt: string
  ) {}

  /**
   * Factory method for creating from domain Repository
   */
  static fromDomain(
    id: string,
    url: string,
    name: string,
    framework: string,
    components: ComponentDTO[],
    relationships: RelationshipDTO[],
    metrics: RepositoryMetricsDTO,
    diagrams: DiagramDataDTO,
    analyzedAt: Date
  ): AnalysisResultDTO {
    return new AnalysisResultDTO(
      id,
      url,
      name,
      framework,
      components,
      relationships,
      metrics,
      diagrams,
      analyzedAt.toISOString()
    );
  }
}
