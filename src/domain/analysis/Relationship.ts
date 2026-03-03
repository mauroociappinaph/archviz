/**
 * Relationship Value Object
 * Represents a dependency between components
 */

import { ComponentId } from "./ComponentId";

export enum RelationshipType {
  IMPORTS = "imports",
  EXTENDS = "extends",
  IMPLEMENTS = "implements",
  USES = "uses",
  COMPOSES = "composes",
}

export class Relationship {
  constructor(
    private readonly from: ComponentId,
    private readonly to: ComponentId,
    private readonly type: RelationshipType = RelationshipType.IMPORTS
  ) {}

  getFrom(): ComponentId {
    return this.from;
  }

  getTo(): ComponentId {
    return this.to;
  }

  getType(): RelationshipType {
    return this.type;
  }

  /**
   * Two relationships are equal if they connect the same components
   */
  equals(other: Relationship): boolean {
    return (
      this.from.equals(other.from) &&
      this.to.equals(other.to) &&
      this.type === other.type
    );
  }

  toString(): string {
    return `${this.from.toString()} --${this.type}--> ${this.to.toString()}`;
  }
}
