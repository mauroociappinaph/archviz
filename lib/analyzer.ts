/**
 * Repository Analyzer
 * Uses GitHub API to fetch and analyze repository structure
 */

import { Octokit } from 'octokit';
import { RepoAnalysis, Container, Component, SystemContext, ExternalSystem } from './types';

export const octokit = new Octokit();

export async function analyzeRepository(repoUrl: string): Promise<RepoAnalysis> {
  // Parse owner and repo from URL
  const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) {
    throw new Error('Invalid GitHub URL');
  }

  const [, owner, repo] = match;

  // Fetch repository info
  const { data: repoData } = await octokit.rest.repos.get({ owner, repo });

  // Fetch root contents to understand structure
  const { data: rootContents } = await octokit.rest.repos.getContent({
    owner,
    repo,
    path: '',
  });

  const files = Array.isArray(rootContents) ? rootContents : [];

  // Detect technology stack
  const technology = detectTechnology(files);

  // Analyze structure
  const containers = await detectContainers(owner, repo, files, technology);
  const components = await detectComponents(owner, repo, containers);
  const externalSystems = detectExternalSystems(files, technology);

  const context: SystemContext = {
    name: repoData.name,
    description: repoData.description || `${repoData.name} - ${technology} application`,
    technology,
    externalSystems,
  };

  return {
    owner,
    repo,
    context,
    containers,
    components,
  };
}

function detectTechnology(files: any[]): string {
  const fileNames = files.map(f => f.name.toLowerCase());

  if (fileNames.includes('package.json')) {
    return 'TypeScript/Node.js';
  }
  if (fileNames.includes('requirements.txt') || fileNames.includes('pyproject.toml')) {
    return 'Python';
  }
  if (fileNames.includes('pom.xml') || fileNames.includes('build.gradle')) {
    return 'Java';
  }
  if (fileNames.includes('go.mod')) {
    return 'Go';
  }
  if (fileNames.includes('cargo.toml')) {
    return 'Rust';
  }
  if (fileNames.includes('gemfile')) {
    return 'Ruby';
  }

  return 'Unknown';
}

async function detectContainers(
  owner: string,
  repo: string,
  files: any[],
  technology: string
): Promise<Container[]> {
  const containers: Container[] = [];
  const fileNames = files.map(f => f.name.toLowerCase());

  // Check for Next.js / React apps
  if (fileNames.includes('package.json')) {
    try {
      const { data: packageJson } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: 'package.json',
      });

      const content = Buffer.from((packageJson as any).content, 'base64').toString();
      const pkg = JSON.parse(content);

      if (pkg.dependencies?.next) {
        containers.push({
          id: 'web-app',
          name: 'Web Application',
          description: 'Next.js web application with React components',
          technology: 'Next.js / React',
          type: 'web',
          components: [],
        });

        if (pkg.dependencies?.['next-auth'] || pkg.dependencies?.['@auth/core']) {
          containers.push({
            id: 'auth-service',
            name: 'Authentication Service',
            description: 'Authentication and authorization service',
            technology: 'NextAuth.js',
            type: 'api',
            components: [],
          });
        }
      } else if (pkg.dependencies?.react) {
        containers.push({
          id: 'frontend',
          name: 'Frontend Application',
          description: 'React frontend application',
          technology: 'React',
          type: 'web',
          components: [],
        });
      }

      // Check for API server
      if (pkg.dependencies?.express || pkg.dependencies?.fastify || pkg.dependencies?.['@nestjs/core']) {
        const framework = pkg.dependencies.express ? 'Express' :
                         pkg.dependencies.fastify ? 'Fastify' : 'NestJS';
        containers.push({
          id: 'api-server',
          name: 'API Server',
          description: `Backend API server using ${framework}`,
          technology: framework,
          type: 'api',
          components: [],
        });
      }
    } catch (e) {
      console.error('Error parsing package.json:', e);
    }
  }

  // Check for Docker containers
  if (fileNames.includes('dockerfile') || fileNames.includes('docker-compose.yml')) {
    containers.push({
      id: 'docker-container',
      name: 'Docker Container',
      description: 'Containerized application',
      technology: 'Docker',
      type: 'web',
      components: [],
    });
  }

  // Default container if none detected
  if (containers.length === 0) {
    containers.push({
      id: 'main-app',
      name: 'Main Application',
      description: `${technology} application`,
      technology,
      type: 'web',
      components: [],
    });
  }

  return containers;
}

async function detectComponents(
  owner: string,
  repo: string,
  containers: Container[]
): Promise<Component[]> {
  const components: Component[] = [];

  for (const container of containers) {
    // Try to find source files based on container type
    const commonPaths = ['src', 'app', 'lib', 'components', 'pages'];

    for (const basePath of commonPaths) {
      try {
        const { data: contents } = await octokit.rest.repos.getContent({
          owner,
          repo,
          path: basePath,
        });

        if (Array.isArray(contents)) {
          for (const item of contents) {
            if (item.type === 'file' && (item.name.endsWith('.tsx') || item.name.endsWith('.ts') || item.name.endsWith('.jsx') || item.name.endsWith('.js'))) {
              const componentId = `${container.id}-${item.name.replace(/\.(tsx?|jsx?)$/, '')}`;

              const component: Component = {
                id: componentId,
                name: item.name.replace(/\.(tsx?|jsx?)$/, ''),
                description: `Component in ${basePath}`,
                type: item.name.includes('page') || item.name.includes('route') ? 'controller' :
                      item.name.includes('service') ? 'service' :
                      item.name.includes('layout') ? 'component' : 'component',
                containerId: container.id,
                dependencies: [],
                filePath: item.path,
              };

              components.push(component);
              container.components.push(componentId);
            }
          }
        }
      } catch (e) {
        // Path doesn't exist, continue
      }
    }
  }

  return components;
}

function detectExternalSystems(files: any[], technology: string): ExternalSystem[] {
  const systems: ExternalSystem[] = [];
  const fileNames = files.map(f => f.name.toLowerCase());

  // Check for database connections
  if (fileNames.includes('prisma') || fileNames.some(f => f.includes('schema.prisma'))) {
    systems.push({
      name: 'PostgreSQL Database',
      description: 'Primary database using Prisma ORM',
      type: 'database',
    });
  }

  if (fileNames.includes('docker-compose.yml')) {
    systems.push({
      name: 'Docker Infrastructure',
      description: 'Container orchestration',
      type: 'service',
    });
  }

  // Common external APIs
  systems.push({
    name: 'External APIs',
    description: 'Third-party service integrations',
    type: 'external',
  });

  return systems;
}
