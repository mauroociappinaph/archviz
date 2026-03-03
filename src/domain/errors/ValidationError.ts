/**
 * Validation error for invalid inputs
 */

import { DomainError } from "./DomainError";

export class ValidationError extends DomainError {
  readonly code = "VALIDATION_ERROR";
  readonly statusCode = 400;

  constructor(message: string) {
    super(message);
  }

  static invalidUrl(url: string): ValidationError {
    return new ValidationError(`Invalid URL format: ${url}`);
  }

  static invalidComponentName(name: string): ValidationError {
    return new ValidationError(`Invalid component name: ${name}`);
  }

  static emptyField(fieldName: string): ValidationError {
    return new ValidationError(`${fieldName} cannot be empty`);
  }
}
