/**
 * C4 Diagram Generator
 * Converts repository analysis into Mermaid C4 diagrams
 */

import { RepoAnalysis, DiagramData } from './types';

export function generateDiagrams(analysis: RepoAnalysis): DiagramData {
  return {
    context: generateContextDiagram(analysis),
    container: generateContainerDiagram(analysis),
    component: generateComponentDiagram(analysis),
  };
}

function generateContextDiagram(analysis: RepoAnalysis): string {
  const { context } = analysis;

  let diagram = `C4Context\n`;
  diagram += `    title System Context diagram for ${context.name}\n`;
  diagram += `\n`;

  // Add the main system
  diagram += `    System(${context.name.toLowerCase().replace(/\s/g, '_')}, "${context.name}", "${context.description}")\n`;

  // Add external systems
  context.externalSystems.forEach((system, index) => {
    const id = `ext_${index}`;
    diagram += `    System_Ext(${id}, "${system.name}", "${system.description}")\n`;
    diagram += `    Rel(${context.name.toLowerCase().replace(/\s/g, '_')}, ${id}, "Uses")\n`;
  });

  // Add user
  diagram += `    Person(user, "User", "End user of the system")\n`;
  diagram += `    Rel(user, ${context.name.toLowerCase().replace(/\s/g, '_')}, "Uses")\n`;

  return diagram;
}

function generateContainerDiagram(analysis: RepoAnalysis): string {
  const { context, containers } = analysis;

  let diagram = `C4Container\n`;
  diagram += `    title Container diagram for ${context.name}\n`;
  diagram += `\n`;

  // Add person
  diagram += `    Person(user, "User", "End user of the system")\n`;

  // Add containers
  containers.forEach((container) => {
    const containerId = container.id.replace(/-/g, '_');
    diagram += `    Container(${containerId}, "${container.name}", "${container.technology}", "${container.description}")\n`;
  });

  // Add relationships
  diagram += `    Rel(user, ${containers[0]?.id.replace(/-/g, '_') || 'web_app'}, "Uses", "HTTPS")\n`;

  // Relate containers to each other
  for (let i = 0; i < containers.length - 1; i++) {
    const current = containers[i].id.replace(/-/g, '_');
    const next = containers[i + 1].id.replace(/-/g, '_');
    diagram += `    Rel(${current}, ${next}, "Calls", "JSON/HTTPS")\n`;
  }

  // Add external systems
  context.externalSystems.forEach((system, index) => {
    const id = `ext_${index}`;
    diagram += `    System_Ext(${id}, "${system.name}", "${system.description}")\n`;
    // Connect last container to external system
    const lastContainer = containers[containers.length - 1]?.id.replace(/-/g, '_');
    if (lastContainer) {
      diagram += `    Rel(${lastContainer}, ${id}, "Uses")\n`;
    }
  });

  return diagram;
}

function generateComponentDiagram(analysis: RepoAnalysis): string {
  const { containers, components } = analysis;

  if (containers.length === 0 || components.length === 0) {
    return 'C4Component\n    title No components detected\n';
  }

  const mainContainer = containers[0];
  const containerComponents = components.filter(c => c.containerId === mainContainer.id);

  if (containerComponents.length === 0) {
    return `C4Component\n    title No components in ${mainContainer.name}\n`;
  }

  let diagram = `C4Component\n`;
  diagram += `    title Component diagram for ${mainContainer.name}\n`;
  diagram += `\n`;

  // Add container boundary
  diagram += `    Container_Boundary(${mainContainer.id.replace(/-/g, '_')}, "${mainContainer.name}") {\n`;

  // Add components
  containerComponents.forEach((component) => {
    const componentId = component.id.replace(/-/g, '_');
    const componentType = component.type === 'controller' ? 'Component' :
                          component.type === 'service' ? 'Component' : 'Component';
    diagram += `        ${componentType}(${componentId}, "${component.name}", "${component.type}")\n`;
  });

  diagram += `    }\n`;

  // Add relationships between components
  for (let i = 0; i < containerComponents.length - 1; i++) {
    const current = containerComponents[i].id.replace(/-/g, '_');
    const next = containerComponents[i + 1].id.replace(/-/g, '_');
    diagram += `    Rel(${current}, ${next}, "Uses")\n`;
  }

  return diagram;
}

// Fallback to standard Mermaid flowchart if C4 is not supported
export function generateFallbackDiagram(analysis: RepoAnalysis): string {
  const { context, containers } = analysis;

  let diagram = `flowchart TB\n`;
  diagram += `    subgraph "${context.name}"\n`;
  diagram += `        direction TB\n`;

  containers.forEach((container) => {
    diagram += `        ${container.id}[${container.name}<br/>${container.technology}]\n`;
  });

  diagram += `    end\n`;
  diagram += `    User[User] --> ${containers[0]?.id || 'app'}\n`;

  return diagram;
}
