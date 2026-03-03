import { Octokit } from 'octokit';
import { AnalyzeRepositoryUseCase } from '../../application/analysis/AnalyzeRepositoryUseCase';
import { GetComponentRelationshipsUseCase } from '../../application/analysis/GetComponentRelationshipsUseCase';
import { ExportMetricsUseCase } from '../../application/analysis/ExportMetricsUseCase';
import { GitHubApiAdapter } from '../github/GitHubApiAdapter';
import { GitHubRepositoryMapper } from '../github/GitHubRepositoryMapper';
import { BabelASTAdapter } from '../parser/BabelASTAdapter';
import { InMemoryAnalysisRepository } from '../persistence/InMemoryAnalysisRepository';

/**
 * Dependency Injection Container
 * Central registry for all dependencies
 * Follows Clean Architecture - Composition Root
 */
export class Container {
  private static instance: Container;
  private dependencies: Map<string, any> = new Map();

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
      Container.instance.register();
    }
    return Container.instance;
  }

  private register(): void {
    // External services
    const octokit = new Octokit();
    this.dependencies.set('octokit', octokit);

    // Infrastructure - Adapters
    this.dependencies.set('githubApi', new GitHubApiAdapter(octokit));
    this.dependencies.set('githubMapper', new GitHubRepositoryMapper());
    this.dependencies.set('parser', new BabelASTAdapter());
    this.dependencies.set('repository', new InMemoryAnalysisRepository());

    // Application - Use Cases
    this.dependencies.set('analyzeUseCase', new AnalyzeRepositoryUseCase(
      this.get('githubApi'),
      this.get('parser'),
      this.get('repository')
    ));

    this.dependencies.set('relationshipsUseCase', new GetComponentRelationshipsUseCase(
      this.get('repository')
    ));

    this.dependencies.set('exportUseCase', new ExportMetricsUseCase(
      this.get('repository')
    ));
  }

  get<T>(key: string): T {
    const dependency = this.dependencies.get(key);
    if (!dependency) {
      throw new Error(`Dependency not found: ${key}`);
    }
    return dependency as T;
  }

  /**
   * Reset container (useful for testing)
   */
  reset(): void {
    this.dependencies.clear();
    this.register();
  }
}

// Export singleton instance
export const container = Container.getInstance();
