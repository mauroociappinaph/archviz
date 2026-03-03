/**
 * GitHub URL Value Object
 * Immutable and validated at creation
 */

import { ValidationError } from "../errors/ValidationError";

export class GitHubUrl {
  private readonly GITHUB_REGEX =
    /^(https?:\/\/)?(www\.)?github\.com\/([^\/]+)\/([^\/]+)\/?$/i;

  private constructor(private readonly value: string) {}

  /**
   * Factory method with validation
   * Returns null if invalid instead of throwing (for type safety)
   */
  static create(url: string): GitHubUrl {
    const trimmed = url.trim();

    if (!trimmed) {
      throw ValidationError.emptyField("URL");
    }

    const match = trimmed.match(
      /^(https?:\/\/)?(www\.)?github\.com\/([^\/]+)\/([^\/]+)\/?$/i
    );

    if (!match) {
      throw ValidationError.invalidUrl(url);
    }

    const [, , , owner, repo] = match;

    if (!owner || owner.length < 1) {
      throw ValidationError.invalidUrl(url);
    }

    if (!repo || repo.length < 1) {
      throw ValidationError.invalidUrl(url);
    }

    // Normalize URL to https format
    const normalized = `https://github.com/${owner}/${repo}`;

    return new GitHubUrl(normalized);
  }

  /**
   * Unsafe creation - only use when you know the URL is valid
   */
  static fromValidated(url: string): GitHubUrl {
    return new GitHubUrl(url);
  }

  getOwner(): string {
    const parts = this.value.split("/");
    return parts[3];
  }

  getRepo(): string {
    const parts = this.value.split("/");
    return parts[4];
  }

  getFullName(): string {
    return `${this.getOwner()}/${this.getRepo()}`;
  }

  toString(): string {
    return this.value;
  }

  equals(other: GitHubUrl): boolean {
    return this.value === other.value;
  }

  /**
   * For use in Maps/Sets
   */
  getHashCode(): string {
    return this.value;
  }
}
