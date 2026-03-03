import type { Repository } from '../../domain/analysis/Repository';
import type { RepositoryId } from '../../domain/analysis/RepositoryId';
import type { GitHubUrl } from '../../domain/analysis/GitHubUrl';
import type { IAnalysisRepository } from '../../domain/repositories/IAnalysisRepository';

/**
 * In-Memory Analysis Repository
 * Implementation of IAnalysisRepository for testing and prototyping
 * Follows Clean Architecture - Infrastructure Layer
 */
export class InMemoryAnalysisRepository implements IAnalysisRepository {
  private repositories: Map<string, Repository> = new Map();

  async save(repository: Repository): Promise<void> {
    this.repositories.set(repository.getId().toString(), repository);
  }

  async findById(id: RepositoryId): Promise<Repository | null> {
    return this.repositories.get(id.toString()) || null;
  }

  async findByUrl(url: GitHubUrl): Promise<Repository | null> {
    for (const repo of this.repositories.values()) {
      if (repo.getUrl().equals(url)) {
        return repo;
      }
    }
    return null;
  }

  async exists(url: GitHubUrl): Promise<boolean> {
    const repo = await this.findByUrl(url);
    return repo !== null;
  }

  async findAll(): Promise<Repository[]> {
    return Array.from(this.repositories.values());
  }

  async delete(id: RepositoryId): Promise<void> {
    this.repositories.delete(id.toString());
  }

  async clear(): Promise<void> {
    this.repositories.clear();
  }

  /**
   * Get count of stored repositories (for testing)
   */
  getCount(): number {
    return this.repositories.size;
  }
}
