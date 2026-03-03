/**
 * Domain Layer - Clean Architecture
 * Core business logic with no external dependencies
 */

// Errors
export { DomainError } from "./errors/DomainError";
export { ValidationError } from "./errors/ValidationError";

// Value Objects
export { GitHubUrl } from "./analysis/GitHubUrl";
export { RepositoryId } from "./analysis/RepositoryId";
export { ComponentId } from "./analysis/ComponentId";
export { Relationship, RelationshipType } from "./analysis/Relationship";
export { Framework, FrameworkType } from "./analysis/Framework";

// Entities
export { Component } from "./analysis/Component";
export { Repository } from "./analysis/Repository";
export type { RepositoryMetrics } from "./analysis/Repository";

// Repository Interface (Driven Port)
export type { IAnalysisRepository } from "./repositories/IAnalysisRepository";
