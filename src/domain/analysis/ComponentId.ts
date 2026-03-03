/**
 * Component ID Value Object
 */

import { ValidationError } from "../errors/ValidationError";

export class ComponentId {
  private constructor(private readonly value: string) {}

  static create(): ComponentId {
    const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
    return new ComponentId(uuid);
  }

  static fromString(id: string): ComponentId {
    if (!id || typeof id !== "string") {
      throw ValidationError.emptyField("Component ID");
    }

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new ValidationError(`Invalid Component ID format: ${id}`);
    }

    return new ComponentId(id);
  }

  toString(): string {
    return this.value;
  }

  equals(other: ComponentId): boolean {
    return this.value === other.value;
  }
}
