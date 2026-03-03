/**
 * Component Entity
 * Represents a software component in the codebase
 */

import { ValidationError } from "../errors/ValidationError";
import { ComponentId } from "./ComponentId";
import { Framework } from "./Framework";

export class Component {
  constructor(
    private readonly id: ComponentId,
    private readonly name: string,
    private readonly filePath: string,
    private readonly framework: Framework,
    private readonly hooks: string[] = [],
    private readonly dependencies: string[] = []
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw ValidationError.emptyField("Component name");
    }

    if (!this.filePath || this.filePath.trim().length === 0) {
      throw ValidationError.emptyField("File path");
    }

    // Validate component naming convention (PascalCase for React)
    if (!this.isValidComponentName(this.name)) {
      throw ValidationError.invalidComponentName(this.name);
    }
  }

  private isValidComponentName(name: string): boolean {
    // Components should be PascalCase (start with uppercase)
    return /^[A-Z][a-zA-Z0-9]*$/.test(name);
  }

  getId(): ComponentId {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getFilePath(): string {
    return this.filePath;
  }

  getFramework(): Framework {
    return this.framework;
  }

  getHooks(): ReadonlyArray<string> {
    return this.hooks;
  }

  getDependencies(): ReadonlyArray<string> {
    return this.dependencies;
  }

  /**
   * Get the file name without extension
   */
  getFileName(): string {
    const parts = this.filePath.split("/");
    return parts[parts.length - 1];
  }

  /**
   * Check if component uses a specific hook
   */
  hasHook(hookName: string): boolean {
    return this.hooks.includes(hookName);
  }

  /**
   * Check if component has any hooks
   */
  hasHooks(): boolean {
    return this.hooks.length > 0;
  }

  /**
   * Get the directory path
   */
  getDirectory(): string {
    const parts = this.filePath.split("/");
    parts.pop();
    return parts.join("/");
  }

  equals(other: Component): boolean {
    return this.id.equals(other.id);
  }

  toString(): string {
    return `${this.name} (${this.framework.toString()})`;
  }
}
