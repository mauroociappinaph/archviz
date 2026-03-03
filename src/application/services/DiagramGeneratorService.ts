/**
 * Diagram Generator Service
 * Generates C4 Model diagrams (Context, Container, Component) from domain entities
 * Follows Clean Architecture - Application Layer
 */

import { Repository, Component, Relationship } from '../../domain';

export interface DiagramData {
  context: string;
  container: string;
  component: string;
}

export class DiagramGeneratorService {
  /**
   * Generate all three C4 diagrams from a repository
   */
  generateDiagrams(repository: Repository): DiagramData {
    return {
      context: this.generateContextDiagram(repository),
      container: this.generateContainerDiagram(repository),
      component: this.generateComponentDiagram(repository),
    };
  }

  /**
   * Generate System Context Diagram (C4 Level 1)
   * Shows the system as a whole and its external dependencies
   */
  private generateContextDiagram(repository: Repository): string {
    const name = repository.getName();
    const url = repository.getUrl().toString();
    const safeId = this.toSafeId(name);

    let diagram = `C4Context\n`;
    diagram += `    title System Context diagram for ${name}\n`;
    diagram += `\n`;

    // Add the main system
    diagram += `    System(${safeId}, "${name}", "${url}")\n`;

    // Add external dependencies
    const externalDeps = repository.getExternalDependencies();
    externalDeps.forEach((dep, index) => {
      const depId = `ext_${index}`;
      const depName = this.extractPackageName(dep);
      diagram += `    System_Ext(${depId}, "${depName}", "External dependency")\n`;
      diagram += `    Rel(${safeId}, ${depId}, "Uses")\n`;
    });

    // Add user
    diagram += `    Person(user, "User", "End user of the system")\n`;
    diagram += `    Rel(user, ${safeId}, "Uses")\n`;

    return diagram;
  }

  /**
   * Generate Container Diagram (C4 Level 2)
   * Shows the high-level technology containers
   */
  private generateContainerDiagram(repository: Repository): string {
    const name = repository.getName();
    const safeId = this.toSafeId(name);
    const framework = repository.getFramework().toString();

    let diagram = `C4Container\n`;
    diagram += `    title Container diagram for ${name}\n`;
    diagram += `\n`;

    // Add person
    diagram += `    Person(user, "User", "End user of the system")\n`;

    // Add main application container
    const appContainerId = `${safeId}_app`;
    diagram += `    Container(${appContainerId}, "Application", "${framework}", "Main application")\n`;
    diagram += `    Rel(user, ${appContainerId}, "Uses", "HTTPS")\n`;

    // Group components by directory to create logical containers
    const components = repository.getComponents();
    const containers = this.groupComponentsByDirectory(components);

    containers.forEach((container, index) => {
      const containerId = `${safeId}_container_${index}`;
      diagram += `    Container(${containerId}, "${container.name}", "${framework}", "${container.description}")\n`;
      diagram += `    Rel(${appContainerId}, ${containerId}, "Uses")\n`;
    });

    // Add external systems
    const externalDeps = repository.getExternalDependencies();
    externalDeps.slice(0, 5).forEach((dep, index) => {
      const depId = `ext_${index}`;
      const depName = this.extractPackageName(dep);
      diagram += `    System_Ext(${depId}, "${depName}", "External dependency")\n`;
      diagram += `    Rel(${appContainerId}, ${depId}, "Uses")\n`;
    });

    return diagram;
  }

  /**
   * Generate Component Diagram (C4 Level 3)
   * Shows internal components and their relationships
   */
  private generateComponentDiagram(repository: Repository): string {
    const name = repository.getName();
    const safeId = this.toSafeId(name);
    const components = repository.getComponents();
    const relationships = repository.getRelationships();

    if (components.length === 0) {
      return `C4Component\n    title No components detected in ${name}\n`;
    }

    let diagram = `C4Component\n`;
    diagram += `    title Component diagram for ${name}\n`;
    diagram += `\n`;

    // Add container boundary
    diagram += `    Container_Boundary(${safeId}_app, "${name}") {\n`;

    // Add components
    components.forEach((component) => {
      const componentId = this.toSafeId(component.getName());
      const componentName = component.getName();
      const filePath = component.getFilePath();
      const hooks = component.getHooks().slice(0, 3).join(', ');
      const description = hooks ? `Uses: ${hooks}` : filePath;

      diagram += `        Component(${componentId}, "${componentName}", "${description}")\n`;
    });

    diagram += `    }\n`;

    // Add relationships
    relationships.forEach((rel) => {
      const fromId = this.toSafeId(this.findComponentNameById(components, rel.getFrom()));
      const toId = this.toSafeId(this.findComponentNameById(components, rel.getTo()));
      diagram += `    Rel(${fromId}, ${toId}, "${rel.getType()}")\n`;
    });

    return diagram;
  }

  /**
   * Generate a fallback flowchart diagram when C4 is not supported
   */
  generateFallbackDiagram(repository: Repository): string {
    const name = repository.getName();
    const components = repository.getComponents();

    let diagram = `flowchart TB\n`;
    diagram += `    subgraph "${name}"\n`;
    diagram += `        direction TB\n`;

    components.slice(0, 10).forEach((component) => {
      const id = this.toSafeId(component.getName());
      diagram += `        ${id}[${component.getName()}]\n`;
    });

    if (components.length > 10) {
      diagram += `        more[... ${components.length - 10} more components]\n`;
    }

    diagram += `    end\n`;
    diagram += `    User[User] --> app\n`;

    return diagram;
  }

  /**
   * Convert a string to a safe identifier for Mermaid
   */
  private toSafeId(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }

  /**
   * Extract package name from import path
   */
  private extractPackageName(importPath: string): string {
    // Handle scoped packages (@org/package)
    if (importPath.startsWith('@')) {
      const parts = importPath.split('/');
      return parts.slice(0, 2).join('/');
    }
    // Regular packages
    return importPath.split('/')[0];
  }

  /**
   * Group components by their directory structure
   */
  private groupComponentsByDirectory(components: readonly Component[]): Array<{
    name: string;
    description: string;
    components: Component[];
  }> {
    const groups = new Map<string, Component[]>();

    components.forEach((component) => {
      const path = component.getFilePath();
      const dir = path.split('/')[0] || 'root';

      if (!groups.has(dir)) {
        groups.set(dir, []);
      }
      groups.get(dir)!.push(component);
    });

    return Array.from(groups.entries()).map(([dir, comps]) => ({
      name: dir.charAt(0).toUpperCase() + dir.slice(1),
      description: `${comps.length} components`,
      components: comps,
    }));
  }

  /**
   * Find component name by its ID
   */
  private findComponentNameById(
    components: readonly Component[],
    id: { toString(): string }
  ): string {
    const component = components.find((c) => c.getId().toString() === id.toString());
    return component ? component.getName() : 'Unknown';
  }
}
