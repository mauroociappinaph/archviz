import type { Repository } from '../../domain/Repository';
import type { RepositoryId } from '../../domain/value-objects/RepositoryId';
import type { Framework } from '../../domain/value-objects/Framework';
import type { IAnalysisRepository } from '../../domain/ports/IAnalysisRepository';

export interface ExportMetricsRequest {
  repositoryId: RepositoryId;
  format: 'json' | 'csv' | 'markdown';
}

export interface ComponentMetricsDTO {
  name: string;
  type: string;
  filePath: string;
  linesOfCode: number;
  incomingDependencies: number;
  outgoingDependencies: number;
  complexity: number;
}

export interface RepositoryMetricsDTO {
  repository: {
    name: string;
    url: string;
    framework: Framework;
    analyzedAt: Date;
  };
  summary: {
    totalComponents: number;
    totalRelationships: number;
    averageComplexity: number;
    linesOfCode: number;
  };
  components: ComponentMetricsDTO[];
}

/**
 * Use case for exporting repository metrics
 * Follows Clean Architecture - Application Layer
 */
export class ExportMetricsUseCase {
  constructor(
    private readonly analysisRepository: IAnalysisRepository
  ) {}

  async execute(
    request: ExportMetricsRequest
  ): Promise<string> {
    // Step 1: Retrieve the repository aggregate
    const repository = await this.analysisRepository.findById(
      request.repositoryId
    );

    if (!repository) {
      throw new Error(`Repository not found: ${request.repositoryId.value}`);
    }

    // Step 2: Get all components
    const components = await this.analysisRepository.getAllComponents(
      request.repositoryId
    );

    // Step 3: Build metrics DTO
    const metrics = await this.buildMetricsDTO(repository, components);

    // Step 4: Format based on requested format
    switch (request.format) {
      case 'json':
        return this.formatAsJson(metrics);
      case 'csv':
        return this.formatAsCsv(metrics);
      case 'markdown':
        return this.formatAsMarkdown(metrics);
      default:
        throw new Error(`Unsupported format: ${request.format}`);
    }
  }

  private async buildMetricsDTO(
    repository: Repository,
    components: import('../../domain/Component').Component[]
  ): Promise<RepositoryMetricsDTO> {
    const componentMetrics: ComponentMetricsDTO[] = await Promise.all(
      components.map(async (component) => {
        const incoming = await this.analysisRepository.getIncomingRelationships(
          component.id
        );
        const outgoing = await this.analysisRepository.getOutgoingRelationships(
          component.id
        );

        return {
          name: component.name,
          type: component.type,
          filePath: component.filePath,
          linesOfCode: component.metrics.linesOfCode,
          incomingDependencies: incoming.length,
          outgoingDependencies: outgoing.length,
          complexity: component.metrics.complexity
        };
      })
    );

    const totalLoc = componentMetrics.reduce((sum, c) => sum + c.linesOfCode, 0);
    const avgComplexity = componentMetrics.length > 0
      ? componentMetrics.reduce((sum, c) => sum + c.complexity, 0) / componentMetrics.length
      : 0;

    return {
      repository: {
        name: repository.name,
        url: repository.url.value,
        framework: repository.framework,
        analyzedAt: repository.analyzedAt
      },
      summary: {
        totalComponents: repository.components.length,
        totalRelationships: repository.relationships.length,
        averageComplexity: Math.round(avgComplexity * 100) / 100,
        linesOfCode: totalLoc
      },
      components: componentMetrics
    };
  }

  private formatAsJson(metrics: RepositoryMetricsDTO): string {
    return JSON.stringify(metrics, null, 2);
  }

  private formatAsCsv(metrics: RepositoryMetricsDTO): string {
    const headers = [
      'Name',
      'Type',
      'File Path',
      'Lines of Code',
      'Incoming Dependencies',
      'Outgoing Dependencies',
      'Complexity'
    ].join(',');

    const rows = metrics.components.map(c =>
      [
        `"${c.name}"`,
        c.type,
        `"${c.filePath}"`,
        c.linesOfCode,
        c.incomingDependencies,
        c.outgoingDependencies,
        c.complexity
      ].join(',')
    );

    return [headers, ...rows].join('\n');
  }

  private formatAsMarkdown(metrics: RepositoryMetricsDTO): string {
    const lines: string[] = [
      `# ${metrics.repository.name} - Analysis Report`,
      '',
      '## Repository Information',
      '',
      `- **URL:** ${metrics.repository.url}`,
      `- **Framework:** ${metrics.repository.framework}`,
      `- **Analyzed At:** ${metrics.repository.analyzedAt.toISOString()}`,
      '',
      '## Summary',
      '',
      `| Metric | Value |`,
      `|--------|-------|`,
      `| Total Components | ${metrics.summary.totalComponents} |`,
      `| Total Relationships | ${metrics.summary.totalRelationships} |`,
      `| Average Complexity | ${metrics.summary.averageComplexity} |`,
      `| Lines of Code | ${metrics.summary.linesOfCode} |`,
      '',
      '## Components',
      '',
      `| Component | Type | File | LOC | In | Out | Complexity |`,
      `|-----------|------|------|-----|----|-----|------------|`
    ];

    for (const c of metrics.components) {
      lines.push(
        `| ${c.name} | ${c.type} | ${c.filePath.split('/').pop()} | ${c.linesOfCode} | ${c.incomingDependencies} | ${c.outgoingDependencies} | ${c.complexity} |`
      );
    }

    return lines.join('\n');
  }
}
