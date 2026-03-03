/**
 * Request DTO for Analyze Repository Use Case
 */

import { ValidationError } from "../../domain/errors/ValidationError";

export interface AnalyzeRepositoryRequestProps {
  url: string;
  maxFiles?: number;
  forceRefresh?: boolean;
  includeHooks?: boolean;
}

export class AnalyzeRepositoryRequest {
  private constructor(
    public readonly url: string,
    public readonly maxFiles: number,
    public readonly forceRefresh: boolean,
    public readonly includeHooks: boolean
  ) {
    this.validate();
  }

  static create(props: AnalyzeRepositoryRequestProps): AnalyzeRepositoryRequest {
    return new AnalyzeRepositoryRequest(
      props.url,
      props.maxFiles ?? 50,
      props.forceRefresh ?? false,
      props.includeHooks ?? true
    );
  }

  private validate(): void {
    if (!this.url || this.url.trim().length === 0) {
      throw ValidationError.emptyField("URL");
    }

    if (this.maxFiles < 1 || this.maxFiles > 100) {
      throw new ValidationError("maxFiles must be between 1 and 100");
    }

    // Basic GitHub URL validation
    const githubRegex =
      /^(https?:\/\/)?(www\.)?github\.com\/[^\/]+\/[^\/]+/i;
    if (!githubRegex.test(this.url)) {
      throw ValidationError.invalidUrl(this.url);
    }
  }
}
