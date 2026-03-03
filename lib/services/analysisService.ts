/**
 * Analysis Service
 * Handles API calls for repository analysis
 *
 * SRP Principle: Handles only API communication
 * Clean Architecture: Service layer between UI and API
 */

import { RepoAnalysis, DiagramData } from '@/lib/types';
import { AnalysisResultDTO } from '@/src/application/dto/AnalysisResultDTO';

export interface AnalysisResult {
  success: boolean;
  data?: {
    analysis: RepoAnalysis;
    diagrams: DiagramData;
  };
  error?: string;
}

/**
 * Adapter to convert Clean Architecture DTO to legacy RepoAnalysis format
 * This ensures backward compatibility during migration
 */
function adaptToLegacyFormat(dto: AnalysisResultDTO): {
  analysis: RepoAnalysis;
  diagrams: DiagramData;
} {
  // Convert components to legacy format
  const components = dto.components.map((comp) => ({
    id: comp.id,
    name: comp.name,
    description: `Component in ${comp.filePath}`,
    type: 'component' as const,
    containerId: 'main-app',
    dependencies: comp.dependencies,
    filePath: comp.filePath,
  }));

  // Convert external dependencies to external systems
  const externalSystems = dto.metrics.externalDependencies.slice(0, 5).map((dep) => ({
    name: dep.split('/')[0] || dep,
    description: `External dependency: ${dep}`,
    type: 'external' as const,
  }));

  // Create legacy RepoAnalysis structure
  const analysis: RepoAnalysis = {
    owner: dto.url.split('/')[3] || 'unknown',
    repo: dto.name,
    context: {
      name: dto.name,
      description: `${dto.name} - ${dto.framework} application`,
      technology: dto.framework,
      externalSystems,
    },
    containers: [
      {
        id: 'main-app',
        name: 'Main Application',
        description: `${dto.framework} application`,
        technology: dto.framework,
        type: 'web',
        components: components.map((c) => c.id),
      },
    ],
    components,
  };

  // Diagrams are already in the correct format
  const diagrams: DiagramData = dto.diagrams;

  return { analysis, diagrams };
}

export const analyzeRepository = async (repoUrl: string): Promise<AnalysisResult> => {
  try {
    // Use the new Clean Architecture endpoint
    const response = await fetch('/api/analyze/new', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoUrl }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to analyze repository',
      };
    }

    // Adapt the new DTO format to legacy format for backward compatibility
    const adaptedData = adaptToLegacyFormat(result.data);

    return {
      success: true,
      data: adaptedData,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An error occurred',
    };
  }
};
