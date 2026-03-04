/**
 * Analysis Service
 * Frontend service to communicate with the analysis API
 */

// Import types from lib/types to maintain consistency
import type { RepoAnalysis, DiagramData } from "@/lib/types";

// Re-export for convenience
export type { RepoAnalysis, DiagramData };

export interface AnalysisResponse {
  success: boolean;
  data?: {
    analysis: RepoAnalysis;
    diagrams: DiagramData;
  };
  error?: string;
}

/**
 * Analyze a GitHub repository
 */
export async function analyzeRepository(repoUrl: string): Promise<AnalysisResponse> {
  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ repoUrl }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Failed to analyze repository",
      };
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    // Error handling without console output for production
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
