/**
 * Analysis Service
 * Handles API calls for repository analysis
 *
 * SRP Principle: Handles only API communication
 * Clean Architecture: Service layer between UI and API
 */

import { RepoAnalysis, DiagramData } from '@/lib/types';

export interface AnalysisResult {
  success: boolean;
  data?: {
    analysis: RepoAnalysis;
    diagrams: DiagramData;
  };
  error?: string;
}

export const analyzeRepository = async (repoUrl: string): Promise<AnalysisResult> => {
  try {
    const response = await fetch('/api/analyze', {
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

    return {
      success: true,
      data: result.data,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An error occurred',
    };
  }
};
