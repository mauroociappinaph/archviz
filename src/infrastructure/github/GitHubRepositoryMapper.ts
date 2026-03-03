import { GitHubUrl } from '../../domain/analysis/GitHubUrl';
import { RepositoryId } from '../../domain/analysis/RepositoryId';
import { Repository } from '../../domain/analysis/Repository';
import { Framework, FrameworkType } from '../../domain/analysis/Framework';
import { ValidationError } from '../../domain/errors/ValidationError';
import type { IGitHubApiPort } from '../../application/ports/IGitHubApiPort';

/**
 * GitHub Repository Mapper
 * Anti-Corruption Layer (ACL) - Protects domain from external API changes
 * Maps GitHub API responses to Domain entities
 */
export class GitHubRepositoryMapper {
  /**
   * Maps GitHub repository info to Domain Repository aggregate
   */
  async toDomain(
    owner: string,
    repo: string,
    githubApi: IGitHubApiPort
  ): Promise<Repository> {
    // Fetch repository info from GitHub
    const repoInfo = await githubApi.getRepositoryInfo(owner, repo);

    // Create value objects - GitHubUrl.create throws on invalid
    let url: GitHubUrl;
    try {
      url = GitHubUrl.create(`https://github.com/${owner}/${repo}`);
    } catch (error) {
      throw new ValidationError(`Invalid GitHub URL: ${error}`);
    }

    const repositoryId = RepositoryId.create();

    // Create the aggregate root
    const repository = new Repository(
      repositoryId,
      url,
      repoInfo.name
    );

    return repository;
  }

  /**
   * Creates a Repository from raw GitHub URL string
   * Validates and parses the URL before creating the domain object
   */
  createFromUrl(urlString: string): {
    owner: string;
    repo: string;
    url: GitHubUrl;
  } {
    let url: GitHubUrl;
    try {
      url = GitHubUrl.create(urlString);
    } catch (error) {
      throw new ValidationError(`Invalid GitHub URL: ${error}`);
    }

    const owner = url.getOwner();
    const repo = url.getRepo();

    return { owner, repo, url };
  }

  /**
   * Maps Repository aggregate to a DTO for external use
   */
  toDTO(repository: Repository): {
    id: string;
    url: string;
    name: string;
    framework: string;
    analyzedAt: Date;
    metrics: {
      totalComponents: number;
      totalRelationships: number;
    };
  } {
    const metrics = repository.getMetrics();

    return {
      id: repository.getId().toString(),
      url: repository.getUrl().toString(),
      name: repository.getName(),
      framework: repository.getFramework().toString(),
      analyzedAt: repository.getAnalyzedAt(),
      metrics: {
        totalComponents: metrics.totalComponents,
        totalRelationships: metrics.totalRelationships
      }
    };
  }

  /**
   * Detects framework from GitHub's primary language
   * Maps language strings to FrameworkType enum
   */
  private detectFramework(language: string | null): Framework {
    if (!language) {
      return Framework.create(FrameworkType.UNKNOWN);
    }

    // Map GitHub language names to our FrameworkTypes
    const languageToFramework: Record<string, FrameworkType> = {
      'TypeScript': FrameworkType.REACT, // Default assumption
      'JavaScript': FrameworkType.REACT,
      'Python': FrameworkType.UNKNOWN,
      'Java': FrameworkType.UNKNOWN,
      'Go': FrameworkType.UNKNOWN,
      'Rust': FrameworkType.UNKNOWN,
      'Ruby': FrameworkType.UNKNOWN,
      'PHP': FrameworkType.UNKNOWN,
      'C#': FrameworkType.UNKNOWN,
      'Swift': FrameworkType.UNKNOWN,
      'Kotlin': FrameworkType.UNKNOWN
    };

    const frameworkType = languageToFramework[language] || FrameworkType.UNKNOWN;
    return Framework.create(frameworkType);
  }

  /**
   * Detects technology stack from repository files
   * More sophisticated than language-only detection
   */
  async detectTechnologyStack(
    owner: string,
    repo: string,
    githubApi: IGitHubApiPort
  ): Promise<{
    primaryFramework: Framework;
    hasFrontend: boolean;
    hasBackend: boolean;
    hasDatabase: boolean;
    containerTypes: string[];
  }> {
    // Fetch only root-level files (limit 20 for root detection)
    const rootFiles = await githubApi.fetchSourceFiles(owner, repo, 20);
    const fileNames = rootFiles.map((f: { name: string }) => f.name.toLowerCase());

    // Detect containers/technologies
    const containerTypes: string[] = [];
    let hasFrontend = false;
    let hasBackend = false;
    let hasDatabase = false;

    // Check for package.json (Node.js ecosystem)
    if (fileNames.includes('package.json')) {
      hasFrontend = true;
      hasBackend = true;
      containerTypes.push('nodejs');
    }

    // Check for Python
    if (fileNames.includes('requirements.txt') || fileNames.includes('pyproject.toml')) {
      hasBackend = true;
      containerTypes.push('python');
    }

    // Check for Docker
    if (fileNames.includes('dockerfile') || fileNames.includes('docker-compose.yml')) {
      containerTypes.push('docker');
    }

    // Check for database
    if (fileNames.includes('prisma') || fileNames.some((f: string) => f.includes('schema.prisma'))) {
      hasDatabase = true;
    }

    // Get primary framework from language
    const repoInfo = await githubApi.getRepositoryInfo(owner, repo);
    const primaryFramework = this.detectFramework(repoInfo.language);

    return {
      primaryFramework,
      hasFrontend,
      hasBackend,
      hasDatabase,
      containerTypes
    };
  }
}
