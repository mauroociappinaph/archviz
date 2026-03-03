/**
 * Repository Aggregate Root
 * Represents a GitHub repository with all its components and relationships
 */

import { ValidationError } from "../errors/ValidationError";
import { RepositoryId } from "./RepositoryId";
import { GitHubUrl } from "./GitHubUrl";
import { Framework } from "./Framework";
import { Component } from "./Component";
import { Relationship } from "./Relationship";
import { ComponentId } from "./ComponentId";

export interface RepositoryMetrics {
  totalComponents: number;
  totalRelationships: number;
  externalDependencies: string[];
  mostConnectedComponent: Component | null;
}

export class Repository {
  private components: Map<string, Component> = new Map();
  private relationships: Relationship[] = [];
  private analyzedAt: Date;

  constructor(
    private readonly id: RepositoryId,
    private readonly url: GitHubUrl,
    private readonly name: string,
    analyzedAt: Date = new Date()
  ) {
    this.validate();
    this.analyzedAt = analyzedAt;
  }

  private validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw ValidationError.emptyField("Repository name");
    }
  }

  // === Component Management ===

  addComponent(component: Component): void {
    this.components.set(component.getId().toString(), component);
  }

  getComponent(id: ComponentId): Component | undefined {
    return this.components.get(id.toString());
  }

  getComponents(): ReadonlyArray<Component> {
    return Array.from(this.components.values());
  }

  hasComponent(id: ComponentId): boolean {
    return this.components.has(id.toString());
  }

  getComponentCount(): number {
    return this.components.size;
  }

  // === Relationship Management ===

  addRelationship(relationship: Relationship): void {
    // Check if relationship already exists
    const exists = this.relationships.some((r) => r.equals(relationship));
    if (!exists) {
      this.relationships.push(relationship);
    }
  }

  getRelationships(): ReadonlyArray<Relationship> {
    return this.relationships;
  }

  getRelationshipsFrom(componentId: ComponentId): Relationship[] {
    return this.relationships.filter((r) =>
      r.getFrom().equals(componentId)
    );
  }

  getRelationshipsTo(componentId: ComponentId): Relationship[] {
    return this.relationships.filter((r) => r.getTo().equals(componentId));
  }

  getRelationshipCount(): number {
    return this.relationships.length;
  }

  // === Domain Logic ===

  getFramework(): Framework {
    const frameworks = this.getComponents().map((c) => c.getFramework());
    return Framework.detectPredominant(frameworks);
  }

  getExternalDependencies(): string[] {
    const allDeps = new Set<string>();

    this.getComponents().forEach((component) => {
      component.getDependencies().forEach((dep) => {
        // Only external dependencies (not local imports)
        if (!dep.startsWith(".") && !dep.startsWith("@/")) {
          allDeps.add(dep);
        }
      });
    });

    return Array.from(allDeps).sort();
  }

  getMostConnectedComponent(): Component | null {
    if (this.components.size === 0) {
      return null;
    }

    const connectionCounts = new Map<string, number>();

    // Count connections for each component
    this.relationships.forEach((rel) => {
      const fromId = rel.getFrom().toString();
      const toId = rel.getTo().toString();

      connectionCounts.set(fromId, (connectionCounts.get(fromId) || 0) + 1);
      connectionCounts.set(toId, (connectionCounts.get(toId) || 0) + 1);
    });

    // Find component with most connections
    let maxId: string | null = null;
    let maxCount = 0;

    connectionCounts.forEach((count, id) => {
      if (count > maxCount) {
        maxCount = count;
        maxId = id;
      }
    });

    return maxId ? this.components.get(maxId) || null : null;
  }

  getMetrics(): RepositoryMetrics {
    return {
      totalComponents: this.getComponentCount(),
      totalRelationships: this.getRelationshipCount(),
      externalDependencies: this.getExternalDependencies(),
      mostConnectedComponent: this.getMostConnectedComponent(),
    };
  }

  // === Getters ===

  getId(): RepositoryId {
    return this.id;
  }

  getUrl(): GitHubUrl {
    return this.url;
  }

  getName(): string {
    return this.name;
  }

  getAnalyzedAt(): Date {
    return this.analyzedAt;
  }

  // === Business Methods ===

  /**
   * Check if this repository is newer than another
   */
  isNewerThan(other: Repository): boolean {
    return this.analyzedAt > other.getAnalyzedAt();
  }

  /**
   * Check if analysis is older than a certain duration
   */
  isStale(maxAgeMs: number = 24 * 60 * 60 * 1000): boolean {
    const age = Date.now() - this.analyzedAt.getTime();
    return age > maxAgeMs;
  }

  equals(other: Repository): boolean {
    return this.id.equals(other.id);
  }

  toString(): string {
    return `${this.name} (${this.getComponentCount()} components)`;
  }
}
