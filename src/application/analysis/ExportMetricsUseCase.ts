import type { Repository } from '../../domain/analysis/Repository';
import type { RepositoryId } from '../../domain/analysis/RepositoryId';
import type { Framework } from '../../domain/analysis/Framework';
import type { IAnalysisRepository } from '../../domain/repositories/IAnalysisRepository';

export interface ExportMetricsRequest {
  repositoryId: RepositoryId;
  format: 'json' | 'csv' | 'markdown';
}

export interface ComponentMetricsDTO {
  name: string;
  filePath: string;
  framework: string;
  hooks: string[];
  dependencies: string[];
}

export interface RepositoryMetricsDTO {
  repository: {
    name: string;
    url: string;
    framework: string;
    analyzedAt: Date;
  };
  summary: {
    totalComponents: number;
    totalExternalDependencies: number;
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
      throw new Error(`Repository not found: ${request.repositoryId.toString()}`);
    }

    // Step 2: Build metrics DTO
    const metrics = this.buildMetricsDTO(repository);

    // Step 3: Format based on requested format
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

  private buildMetricsDTO(
    repository: Repository
  ): RepositoryMetricsDTO {
    const components = repository.getComponents();

    const componentMetrics: ComponentMetricsDTO[] = components.map((component) => ({
      name: component.getName(),
      filePath: component.getFilePath(),
      framework: component.getFramework().toString(),
      hooks: Array.from(component.getHooks()),
      dependencies: Array.from(component.getDependencies())
    }));

    return {
      repository: {
        name: repository.getName(),
        url: repository.getUrl().toString(),
        framework: repository.getFramework().toString(),
        analyzedAt: repository.getAnalyzedAt()
      },
      summary: {
        totalComponents: repository.getComponentCount(),
        totalExternalDependencies: repository.getExternalDependencies().length
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
      'File Path',
      'Framework',
      'Hooks Count',
      'Dependencies Count'
    ].join(',');

    const rows = metrics.components.map(c =>
      [
        `"${c.name}"`,
        `"${c.filePath}"`,
        c.framework,
        c.hooks.length,
        c.dependencies.length
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
      `| Total External Dependencies | ${metrics.summary.totalExternalDependencies} |`,
      '',
      '## Components',
      '',
      `| Component | File | Framework | Hooks | Deps |`,
      `|-----------|------|-----------|-------|------|`
    ];

    for (const c of metrics.components) {
      lines.push(
        `| ${c.name} | ${c.filePath.split('/').pop()} | ${c.framework} | ${c.hooks.length} | ${c.dependencies.length} |`
      );
    }

    return lines.join('\n');
  }
}
