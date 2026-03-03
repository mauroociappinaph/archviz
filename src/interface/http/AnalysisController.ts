import { AnalyzeRepositoryUseCase } from '../../application/analysis/AnalyzeRepositoryUseCase';
import { GetComponentRelationshipsUseCase } from '../../application/analysis/GetComponentRelationshipsUseCase';
import { ExportMetricsUseCase } from '../../application/analysis/ExportMetricsUseCase';
import { AnalyzeRepositoryRequest } from '../../application/dto/AnalyzeRepositoryRequest';
import { RepositoryId } from '../../domain/analysis/RepositoryId';
import { ComponentId } from '../../domain/analysis/ComponentId';
import { ValidationError } from '../../domain/errors/ValidationError';

/**
 * Analysis Controller
 * Handles HTTP requests for repository analysis
 * Follows Clean Architecture - Interface Layer
 */
export class AnalysisController {
  constructor(
    private readonly analyzeUseCase: AnalyzeRepositoryUseCase,
    private readonly relationshipsUseCase: GetComponentRelationshipsUseCase,
    private readonly exportUseCase: ExportMetricsUseCase
  ) {}

  /**
   * Analyze a GitHub repository
   */
  async analyzeRepository(url: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      // Create request DTO (validates URL)
      const request = AnalyzeRepositoryRequest.create({
        url,
        maxFiles: 100,
        forceRefresh: false,
        includeHooks: true
      });

      // Execute use case
      const result = await this.analyzeUseCase.execute(request);

      return {
        success: true,
        data: result
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return {
          success: false,
          error: error.message
        };
      }

      console.error('Analysis error:', error);
      return {
        success: false,
        error: 'Failed to analyze repository'
      };
    }
  }

  /**
   * Get component relationships
   */
  async getComponentRelationships(
    repositoryId: string,
    componentId: string
  ): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const repoId = RepositoryId.fromString(repositoryId);
      const compId = ComponentId.fromString(componentId);

      const result = await this.relationshipsUseCase.execute({
        repositoryId: repoId,
        componentId: compId
      });

      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Get relationships error:', error);
      return {
        success: false,
        error: 'Failed to get component relationships'
      };
    }
  }

  /**
   * Export repository metrics
   */
  async exportMetrics(
    repositoryId: string,
    format: 'json' | 'csv' | 'markdown'
  ): Promise<{
    success: boolean;
    data?: string;
    error?: string;
  }> {
    try {
      const repoId = RepositoryId.fromString(repositoryId);

      const result = await this.exportUseCase.execute({
        repositoryId: repoId,
        format
      });

      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Export error:', error);
      return {
        success: false,
        error: 'Failed to export metrics'
      };
    }
  }
}
