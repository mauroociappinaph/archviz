/**
 * Repository ID Value Object
 * UUID v4 for unique identification
 */

import { ValidationError } from "../errors/ValidationError";

export class RepositoryId {
  private constructor(private readonly value: string) {}

  static create(): RepositoryId {
    // Simple UUID v4 generation
    const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
    return new RepositoryId(uuid);
  }

  static fromString(id: string): RepositoryId {
    if (!id || typeof id !== "string") {
      throw ValidationError.emptyField("Repository ID");
    }

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new ValidationError(`Invalid Repository ID format: ${id}`);
    }

    return new RepositoryId(id);
  }

  toString(): string {
    return this.value;
  }

  equals(other: RepositoryId): boolean {
    return this.value === other.value;
  }
}
