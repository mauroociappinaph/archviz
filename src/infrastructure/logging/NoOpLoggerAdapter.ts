/**
 * No-Op Logger Adapter
 * Implementation of ILoggerPort that does nothing
 * Useful for testing to avoid console output noise
 * Following Clean Architecture - Infrastructure Layer implements the port
 */

import { ILoggerPort } from "../../application/ports/ILoggerPort";

export class NoOpLoggerAdapter implements ILoggerPort {
  debug(): void {
    // No operation - intentionally empty for testing
  }

  info(): void {
    // No operation - intentionally empty for testing
  }

  warn(): void {
    // No operation - intentionally empty for testing
  }

  error(): void {
    // No operation - intentionally empty for testing
  }
}
