/**
 * Analyze Repository Use Case
 * Orchestrates the analysis of a GitHub repository
 * Coordinates domain logic with external services (ports)
 */

import {
  Repository,
  RepositoryId,
  GitHubUrl,
  Component,
  ComponentId,
  Relationship,
  RelationshipType,
  Framework,
  IAnalysisRepository,
} from "../../domain";

import { IGitHubApiPort } from "../ports/IGitHubApiPort";
import { IASTParserPort } from "../ports/IASTParserPort";
import { ILoggerPort } from "../ports/ILoggerPort";
import { AnalyzeRepositoryRequest } from "../dto/AnalyzeRepositoryRequest";
import {
  AnalysisResultDTO,
  ComponentDTO,
  RelationshipDTO,
  DiagramDataDTO,
} from "../dto/AnalysisResultDTO";
import { DiagramGeneratorService } from "../services/DiagramGeneratorService";
import { ICachePort } from "../ports/ICachePort";

export interface CacheStatsDTO {
  hitRate: number;
  missRate: number;
  totalEntries: number;
  totalRequests: number;
  fromCache: boolean;
}

export class AnalyzeRepositoryUseCase {
  constructor(
    private readonly githubApi: IGitHubApiPort,
    private readonly parser: IASTParserPort,
    private readonly repository: IAnalysisRepository,
    private readonly diagramGenerator: DiagramGeneratorService,
    private readonly cache: ICachePort,
    private readonly logger: ILoggerPort
  ) {}

  async execute(
    request: AnalyzeRepositoryRequest
  ): Promise<AnalysisResultDTO & { cacheStats?: CacheStatsDTO }> {
    // 1. Create validated URL Value Object
    const url = GitHubUrl.create(request.url);
    const owner = url.getOwner();
    const repoName = url.getRepo();

    // 2. Check SQLite cache first if not forcing refresh
    const cacheKey = `analysis:${owner}/${repoName}`;
    if (!request.forceRefresh) {
      const cached = this.cache.get<AnalysisResultDTO>(cacheKey);
      if (cached) {
        const stats = this.cache.getStats();
        return {
          ...cached,
          cacheStats: {
            ...stats,
            fromCache: true,
          },
        };
      }
    }

    // 3. Validate repository exists
    const exists = await this.githubApi.validateRepository(owner, repoName);
    if (!exists) {
      throw new Error(`Repository not found: ${url.toString()}`);
    }

    // 4. Fetch source files
    const files = await this.githubApi.fetchSourceFiles(
      owner,
      repoName,
      request.maxFiles
    );

    // 5. Create Repository aggregate
    const repository = new Repository(
      RepositoryId.create(),
      url,
      repoName
    );

    // 6. Track component IDs by name for relationship mapping
    const componentIdsByName = new Map<string, ComponentId>();

    // 7. Analyze each file
    for (const file of files) {
      try {
        const content = await this.githubApi.fetchFileContent(
          owner,
          repoName,
          file.path
        );

        const extension = file.name.split(".").pop() || "";

        if (!this.parser.supports(extension)) {
          continue;
        }

        const analysis = await this.parser.parse(content, extension);

        // Create components
        for (const comp of analysis.components) {
          const componentId = ComponentId.create();
          componentIdsByName.set(comp.name, componentId);

          const component = new Component(
            componentId,
            comp.name,
            file.path,
            Framework.fromString(comp.framework),
            request.includeHooks ? comp.hooks : [],
            analysis.dependencies
          );

          repository.addComponent(component);
        }
      } catch (error) {
        // Log error but continue with other files
        this.logger.warn(`Failed to analyze ${file.path}:`, { error });
      }
    }

    // 8. Detect relationships (second pass)
    for (const file of files) {
      try {
        const content = await this.githubApi.fetchFileContent(
          owner,
          repoName,
          file.path
        );

        const extension = file.name.split(".").pop() || "";

        if (!this.parser.supports(extension)) {
          continue;
        }

        const analysis = await this.parser.parse(content, extension);

        // Find source component for this file
        let sourceComponentId: ComponentId | null = null;
        for (const comp of analysis.components) {
          const id = componentIdsByName.get(comp.name);
          if (id) {
            sourceComponentId = id;
            break;
          }
        }

        if (!sourceComponentId) continue;

        // Create relationships based on imports
        for (const importPath of analysis.imports) {
          // Extract component name from import
          const importedName = this.extractComponentName(importPath);
          const targetId = componentIdsByName.get(importedName);

          if (targetId) {
            const relationship = new Relationship(
              sourceComponentId,
              targetId,
              RelationshipType.IMPORTS
            );
            repository.addRelationship(relationship);
          }
        }
      } catch (error) {
        this.logger.warn(`Failed to detect relationships in ${file.path}:`, { error });
      }
    }

    // 9. Save to repository
    await this.repository.save(repository);

    // 10. Cache the result
    const result = this.mapToDTO(repository);
    this.cache.set(cacheKey, result, 7200); // Cache for 2 hours

    // 11. Return DTO with cache stats
    const stats = this.cache.getStats();
    return {
      ...result,
      cacheStats: {
        ...stats,
        fromCache: false,
      },
    };
  }

  private extractComponentName(importPath: string): string {
    // Handle various import patterns
    // ./Component -> Component
    // ../components/Button -> Button
    // @/components/Card -> Card
    const parts = importPath.split("/");
    const lastPart = parts[parts.length - 1];
    // Remove extension if present
    return lastPart.replace(/\.(tsx?|jsx?)$/, "");
  }

  private mapToDTO(repository: Repository): AnalysisResultDTO {
    const components: ComponentDTO[] = repository.getComponents().map((c) => ({
      id: c.getId().toString(),
      name: c.getName(),
      filePath: c.getFilePath(),
      framework: c.getFramework().toString(),
      hooks: Array.from(c.getHooks()),
      dependencies: Array.from(c.getDependencies()),
    }));

    const relationships: RelationshipDTO[] = repository
      .getRelationships()
      .map((r) => ({
        from: r.getFrom().toString(),
        to: r.getTo().toString(),
        type: r.getType(),
      }));

    const metrics = repository.getMetrics();

    // Generate diagrams using the diagram generator service
    const diagrams = this.diagramGenerator.generateDiagrams(repository);

    return AnalysisResultDTO.fromDomain(
      repository.getId().toString(),
      repository.getUrl().toString(),
      repository.getName(),
      repository.getFramework().toString(),
      components,
      relationships,
      {
        totalComponents: metrics.totalComponents,
        totalRelationships: metrics.totalRelationships,
        externalDependencies: metrics.externalDependencies,
        mostConnectedComponent: metrics.mostConnectedComponent
          ? metrics.mostConnectedComponent.getName()
          : null,
      },
      diagrams,
      repository.getAnalyzedAt()
    );
  }
}
