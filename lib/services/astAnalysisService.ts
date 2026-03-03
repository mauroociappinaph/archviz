/**
 * AST Analysis Service
 * Integrates AST-based analysis with the existing diagram generation
 */

import { analyzeRepoAST, RepoASTAnalysis } from "../ast/repoAnalyzer";
import { RepoAnalysis } from "../types";

export interface EnhancedAnalysis extends RepoAnalysis {
  astAnalysis?: RepoASTAnalysis;
  useAST: boolean;
}

/**
 * Analyze repository with optional AST analysis
 */
export async function analyzeWithAST(
  owner: string,
  repo: string,
  useAST: boolean = false
): Promise<EnhancedAnalysis> {
  // Import the base analyzer
  const { analyzeRepository } = await import("../analyzer");

  // Get base analysis
  const baseAnalysis = await analyzeRepository(`https://github.com/${owner}/${repo}`);

  // Optionally enhance with AST analysis
  let astAnalysis: RepoASTAnalysis | undefined;
  if (useAST) {
    try {
      astAnalysis = await analyzeRepoAST(owner, repo, 30); // Limit to 30 files for performance
    } catch (error) {
      console.error("AST analysis failed:", error);
      // Continue without AST analysis
    }
  }

  return {
    ...baseAnalysis,
    astAnalysis,
    useAST,
  };
}

/**
 * Generate enhanced component diagram using AST data
 */
export function generateEnhancedComponentDiagram(
  analysis: EnhancedAnalysis
): string {
  const { astAnalysis, context, containers } = analysis;

  if (!astAnalysis || astAnalysis.components.length === 0) {
    // Fallback to basic diagram if no AST data
    return generateBasicComponentDiagram(analysis);
  }

  const mainContainer = containers[0];

  let diagram = `C4Component\n`;
  diagram += `    title Component diagram for ${context.name}\n\n`;
  diagram += `    Container_Boundary(${mainContainer.id}, "${mainContainer.name}") {\n`;

  // Add components from AST analysis
  astAnalysis.components.forEach((component) => {
    const componentId = component.component.replace(/[^a-zA-Z0-9]/g, "_");
    const description = component.hooks.length > 0
      ? `Uses: ${component.hooks.slice(0, 3).join(", ")}${component.hooks.length > 3 ? "..." : ""}`
      : component.file.split("/").pop() || "Component";

    diagram += `        Component(${componentId}, "${component.component}", "${component.framework}", "${description}")\n`;
  });

  diagram += `    }\n\n`;

  // Add relationships
  astAnalysis.components.forEach((component) => {
    const sourceId = component.component.replace(/[^a-zA-Z0-9]/g, "_");

    // Limit to first 3 relationships to avoid diagram clutter
    component.usedBy.slice(0, 3).forEach((usedByFile) => {
      // Find the component that uses this one
      const targetComponent = astAnalysis!.components.find((c) =>
        usedByFile.includes(c.file.replace(/\.(tsx?|jsx?)$/, ""))
      );

      if (targetComponent) {
        const targetId = targetComponent.component.replace(/[^a-zA-Z0-9]/g, "_");
        diagram += `    Rel(${sourceId}, ${targetId}, "used by")\n`;
      }
    });
  });

  return diagram;
}

/**
 * Generate basic component diagram without AST
 */
function generateBasicComponentDiagram(analysis: RepoAnalysis): string {
  const { context, containers, components } = analysis;
  const mainContainer = containers[0];

  let diagram = `C4Component\n`;
  diagram += `    title Component diagram for ${context.name}\n\n`;
  diagram += `    Container_Boundary(${mainContainer.id}, "${mainContainer.name}") {\n`;

  components.forEach((component) => {
    diagram += `        Component(${component.id}, "${component.name}", "${component.type}", "${component.description}")\n`;
  });

  diagram += `    }\n`;

  return diagram;
}

/**
 * Get statistics from AST analysis
 */
export function getASTStatistics(analysis: RepoASTAnalysis) {
  return {
    totalComponents: analysis.components.length,
    totalFiles: analysis.totalFiles,
    framework: analysis.framework,
    topDependencies: analysis.externalDependencies.slice(0, 10),
    averageHooksPerComponent: analysis.components.length > 0
      ? analysis.components.reduce((sum, c) => sum + c.hooks.length, 0) / analysis.components.length
      : 0,
    mostConnectedComponent: analysis.components
      .sort((a, b) => b.usedBy.length - a.usedBy.length)[0]?.component || "None",
  };
}
