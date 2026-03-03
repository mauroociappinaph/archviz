/**
 * Repository Interface - Driven Port
 * Abstracts persistence mechanism from domain logic
 */

import { Repository } from "../analysis/Repository";
import { GitHubUrl } from "../analysis/GitHubUrl";
import { RepositoryId } from "../analysis/RepositoryId";

export interface IAnalysisRepository {
  /**
   * Save a repository to persistence
   */
  save(repository: Repository): Promise<void>;

  /**
   * Find repository by ID
   */
  findById(id: RepositoryId): Promise<Repository | null>;

  /**
   * Find repository by GitHub URL
   */
  findByUrl(url: GitHubUrl): Promise<Repository | null>;

  /**
   * Check if repository exists
   */
  exists(url: GitHubUrl): Promise<boolean>;

  /**
   * Get all analyzed repositories
   */
  findAll(): Promise<Repository[]>;

  /**
   * Delete a repository
   */
  delete(id: RepositoryId): Promise<void>;

  /**
   * Clear all repositories (for testing)
   */
  clear(): Promise<void>;
}
