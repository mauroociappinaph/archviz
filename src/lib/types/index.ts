/**
 * Legacy types for frontend components
 * These types match the expected structure of the UI components
 */

export interface RepoContext {
  name: string;
  description: string;
  technology: string;
  externalSystems: Array<{
    name: string;
    description: string;
  }>;
}

export interface Container {
  id: string;
  name: string;
  technology: string;
  description: string;
}

export interface Component {
  id: string;
  name: string;
  type: string;
  containerId: string;
}

export interface RepoAnalysis {
  context: RepoContext;
  containers: Container[];
  components: Component[];
}

export interface DiagramData {
  context: string;
  container: string;
  component: string;
}

// Analysis result type alias
export type AnalysisResult = RepoAnalysis;
