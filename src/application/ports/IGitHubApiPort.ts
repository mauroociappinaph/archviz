/**
 * GitHub API Port - Driven Port
 * Interface for GitHub API operations
 * Infrastructure will implement this interface
 */

export interface SourceFile {
  path: string;
  name: string;
  size: number;
}

export interface IGitHubApiPort {
  /**
   * Fetch source files from repository
   */
  fetchSourceFiles(
    owner: string,
    repo: string,
    limit: number
  ): Promise<SourceFile[]>;

  /**
   * Fetch content of a specific file
   */
  fetchFileContent(owner: string, repo: string, path: string): Promise<string>;

  /**
   * Validate if repository exists and is accessible
   */
  validateRepository(owner: string, repo: string): Promise<boolean>;

  /**
   * Get repository metadata
   */
  getRepositoryInfo(
    owner: string,
    repo: string
  ): Promise<{
    name: string;
    description: string | null;
    defaultBranch: string;
    stars: number;
    language: string | null;
  }>;
}
