import { Octokit } from 'octokit';
import type { IGitHubApiPort, SourceFile } from '../../application/ports/IGitHubApiPort';

/**
 * GitHub API Adapter
 * Implements IGitHubApiPort using Octokit
 * Follows Clean Architecture - Infrastructure Layer
 */
export class GitHubApiAdapter implements IGitHubApiPort {
  constructor(private readonly octokit: Octokit) {}

  async fetchSourceFiles(
    owner: string,
    repo: string,
    limit: number = 100,
    maxDepth: number = 10
  ): Promise<SourceFile[]> {
    const files: SourceFile[] = [];
    const visitedDirs = new Set<string>();

    // Queue for BFS: [path, depth]
    const queue: Array<{ path: string; depth: number }> = [{ path: '', depth: 0 }];

    while (queue.length > 0 && files.length < limit) {
      const { path, depth } = queue.shift()!;

      // Skip if already visited or exceeds max depth
      if (visitedDirs.has(path) || depth >= maxDepth) {
        continue;
      }
      visitedDirs.add(path);

      try {
        const { data } = await this.octokit.rest.repos.getContent({
          owner,
          repo,
          path
        });

        if (!Array.isArray(data)) continue;

        for (const item of data) {
          if (files.length >= limit) break;

          if (this.shouldTraverse(item)) {
            // Add to queue for later processing (BFS)
            queue.push({ path: item.path, depth: depth + 1 });
          } else if (this.isSourceFile(item)) {
            files.push(this.mapToSourceFile(item));
          }
        }
      } catch (error) {
        // Silently skip directories we can't access
        console.warn(`Skipping path ${path}: ${error}`);
      }
    }

    return files;
  }

  async fetchFileContent(owner: string, repo: string, path: string): Promise<string> {
    try {
      const { data } = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path
      });

      if (Array.isArray(data)) {
        throw new Error(`Path ${path} is a directory, not a file`);
      }

      if ('content' in data && data.content) {
        // GitHub returns base64 encoded content
        return Buffer.from(data.content, 'base64').toString('utf-8');
      }

      throw new Error(`No content found for ${path}`);
    } catch (error) {
      throw new Error(`Failed to fetch file content for ${path}: ${error}`);
    }
  }

  async validateRepository(owner: string, repo: string): Promise<boolean> {
    try {
      await this.octokit.rest.repos.get({ owner, repo });
      return true;
    } catch (error) {
      return false;
    }
  }

  async getRepositoryInfo(owner: string, repo: string): Promise<{
    name: string;
    description: string | null;
    defaultBranch: string;
    stars: number;
    language: string | null;
  }> {
    const { data } = await this.octokit.rest.repos.get({ owner, repo });

    return {
      name: data.name,
      description: data.description,
      defaultBranch: data.default_branch,
      stars: data.stargazers_count,
      language: data.language
    };
  }

  private shouldTraverse(item: any): boolean {
    if (item.type !== 'dir') return false;

    // Skip hidden directories and common non-source directories
    const skipDirs = [
      'node_modules',
      'dist',
      'build',
      '.git',
      '.github',
      '.vscode',
      'coverage',
      'out',
      '.next',
      '.vercel',
      '.turbo'
    ];

    return !skipDirs.includes(item.name) && !item.name.startsWith('.');
  }

  private isSourceFile(item: any): boolean {
    if (item.type !== 'file') return false;

    // Supported source file extensions
    const validExtensions = /\.(ts|tsx|js|jsx|mjs|cjs|py|java|go|rs|rb|php)$/i;
    return validExtensions.test(item.name);
  }

  private mapToSourceFile(item: any): SourceFile {
    return {
      path: item.path,
      name: item.name,
      size: item.size
    };
  }
}
