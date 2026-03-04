/**
 * Logger Port (Interface)
 * Defines the contract for logging operations
 * Following Clean Architecture - Application Layer defines the port
 */

export interface ILoggerPort {
  debug(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
}
