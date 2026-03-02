/**
 * archviz - Architecture Visualizer
 * Direction: Server-Side Analysis using GitHub API + AST parsing
 * Chosen approach for robust, scalable analysis of any public repository
 */

export interface RepoAnalysis {
  owner: string;
  repo: string;
  context: SystemContext;
  containers: Container[];
  components: Component[];
}

export interface SystemContext {
  name: string;
  description: string;
  technology: string;
  externalSystems: ExternalSystem[];
}

export interface ExternalSystem {
  name: string;
  description: string;
  type: 'database' | 'api' | 'service' | 'external';
}

export interface Container {
  id: string;
  name: string;
  description: string;
  technology: string;
  type: 'web' | 'api' | 'database' | 'mobile' | 'desktop';
  components: string[]; // IDs of components
}

export interface Component {
  id: string;
  name: string;
  description: string;
  type: 'controller' | 'service' | 'repository' | 'model' | 'utility' | 'component';
  containerId: string;
  dependencies: string[]; // IDs of other components
  filePath?: string;
}

export interface FileAnalysis {
  path: string;
  content: string;
  language: string;
  imports: string[];
  exports: string[];
  functions: FunctionInfo[];
  classes: ClassInfo[];
}

export interface FunctionInfo {
  name: string;
  parameters: string[];
  returnType?: string;
  isAsync: boolean;
}

export interface ClassInfo {
  name: string;
  methods: FunctionInfo[];
  extends?: string;
  implements?: string[];
}

export interface DiagramData {
  context: string; // Mermaid diagram
  container: string; // Mermaid diagram
  component: string; // Mermaid diagram
}
