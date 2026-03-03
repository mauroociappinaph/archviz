/**
 * Repository AST Analyzer
 * Analyzes entire repositories to detect component relationships
 */

import { parseTypeScript, ASTAnalysis, detectFramework } from "./parsers/typescriptParser";
import { octokit } from "../analyzer";

export interface ComponentRelation {
  file: string;
  component: string;
  framework: string;
  imports: string[];
  usedBy: string[];
  dependencies: string[];
  hooks: string[];
  functions: string[];
  interfaces: string[];
}

export interface RepoASTAnalysis {
  components: ComponentRelation[];
  totalFiles: number;
  framework: string;
  externalDependencies: string[];
}

/**
 * Analyze a GitHub repository using AST parsing
 */
export async function analyzeRepoAST(
  owner: string,
  repo: string,
  maxFiles: number = 50
): Promise<RepoASTAnalysis> {
  const relations: ComponentRelation[] = [];
  const fileAnalyses: Map<string, ASTAnalysis> = new Map();

  // Get all source files
  const files = await getAllSourceFiles(owner, repo, maxFiles);

  // Analyze each file
  for (const file of files) {
    try {
      const content = await getFileContent(owner, repo, file.path);
      if (content) {
        const analysis = parseTypeScript(content);
        fileAnalyses.set(file.path, analysis);

        // Create component relations
        for (const componentName of analysis.components) {
          relations.push({
            file: file.path,
            component: componentName,
            framework: detectFramework(analysis),
            imports: analysis.imports,
            usedBy: [], // Will be populated in second pass
            dependencies: analysis.dependencies,
            hooks: analysis.hooks,
            functions: analysis.functions,
            interfaces: analysis.interfaces,
          });
        }
      }
    } catch (error) {
      console.error(`Error analyzing ${file.path}:`, error);
    }
  }

  // Second pass: detect relationships
  for (const relation of relations) {
    for (const [filePath, analysis] of fileAnalyses) {
      if (filePath === relation.file) continue;

      // Check if this file imports the component
      const importsComponent = analysis.imports.some(
        (imp) =>
          imp.includes(relation.file.replace(/\.(tsx?|jsx?)$/, "")) ||
          imp.includes(relation.component)
      );

      if (importsComponent) {
        relation.usedBy.push(filePath);
      }
    }
  }

  // Collect all external dependencies
  const allDependencies = new Set<string>();
  fileAnalyses.forEach((analysis) => {
    analysis.dependencies.forEach((dep) => allDependencies.add(dep));
  });

  // Detect primary framework
  const frameworkCount: Record<string, number> = {};
  relations.forEach((rel) => {
    frameworkCount[rel.framework] = (frameworkCount[rel.framework] || 0) + 1;
  });
  const primaryFramework =
    Object.entries(frameworkCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "Unknown";

  return {
    components: relations,
    totalFiles: files.length,
    framework: primaryFramework,
    externalDependencies: Array.from(allDependencies).slice(0, 20), // Top 20 deps
  };
}

/**
 * Get all TypeScript/JavaScript files from a repository
 */
async function getAllSourceFiles(
  owner: string,
  repo: string,
  maxFiles: number
): Promise<Array<{ path: string; name: string }>> {
  const files: Array<{ path: string; name: string }> = [];
  const extensions = [".ts", ".tsx", ".js", ".jsx"];
  const excludeDirs = [
    "node_modules",
    ".git",
    ".next",
    "dist",
    "build",
    "coverage",
    "__tests__",
    "__mocks__",
    ".storybook",
  ];

  async function traverseDir(path: string = "") {
    if (files.length >= maxFiles) return;

    try {
      const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path,
      });

      if (Array.isArray(data)) {
        for (const item of data) {
          if (files.length >= maxFiles) break;

          if (
            item.type === "dir" &&
            !excludeDirs.some((dir) => item.name.includes(dir)) &&
            !item.name.startsWith(".")
          ) {
            await traverseDir(item.path);
          } else if (
            item.type === "file" &&
            extensions.some((ext) => item.name.endsWith(ext))
          ) {
            files.push({ path: item.path, name: item.name });
          }
        }
      }
    } catch (error) {
      console.error(`Error traversing ${path}:`, error);
    }
  }

  await traverseDir();
  return files;
}

/**
 * Get file content from GitHub
 */
async function getFileContent(
  owner: string,
  repo: string,
  path: string
): Promise<string | null> {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    });

    if ("content" in data) {
      return Buffer.from(data.content, "base64").toString();
    }
    return null;
  } catch (error) {
    console.error(`Error fetching ${path}:`, error);
    return null;
  }
}

/**
 * Generate component diagram data from AST analysis
 */
export function generateComponentDiagramData(
  analysis: RepoASTAnalysis
): {
  nodes: Array<{ id: string; label: string; type: string }>;
  edges: Array<{ from: string; to: string; label: string }>;
} {
  const nodes: Array<{ id: string; label: string; type: string }> = [];
  const edges: Array<{ from: string; to: string; label: string }> = [];

  // Create nodes for each component
  analysis.components.forEach((component) => {
    const id = component.component.replace(/[^a-zA-Z0-9]/g, "_");
    nodes.push({
      id,
      label: component.component,
      type: "component",
    });
  });

  // Create edges for relationships
  analysis.components.forEach((component) => {
    const sourceId = component.component.replace(/[^a-zA-Z0-9]/g, "_");

    component.usedBy.forEach((usedByFile) => {
      // Find the component that uses this one
      const usingComponent = analysis.components.find((c) =>
        usedByFile.includes(c.file.replace(/\.(tsx?|jsx?)$/, ""))
      );

      if (usingComponent) {
        const targetId = usingComponent.component.replace(/[^a-zA-Z0-9]/g, "_");
        edges.push({
          from: sourceId,
          to: targetId,
          label: "used by",
        });
      }
    });
  });

  return { nodes, edges };
}
