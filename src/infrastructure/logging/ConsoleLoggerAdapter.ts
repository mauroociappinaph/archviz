/**
 * Console Logger Adapter
 * Implementation of ILoggerPort using console for development/production
 * Following Clean Architecture - Infrastructure Layer implements the port
 */

import { ILoggerPort } from "../../application/ports/ILoggerPort";

export class ConsoleLoggerAdapter implements ILoggerPort {
  private readonly prefix: string;

  constructor(prefix: string = "ArchViz") {
    this.prefix = prefix;
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    console.debug(`[${this.prefix}] [DEBUG] ${message}`, meta ? JSON.stringify(meta) : "");
  }

  info(message: string, meta?: Record<string, unknown>): void {
    console.info(`[${this.prefix}] [INFO] ${message}`, meta ? JSON.stringify(meta) : "");
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    console.warn(`[${this.prefix}] [WARN] ${message}`, meta ? JSON.stringify(meta) : "");
  }

  error(message: string, meta?: Record<string, unknown>): void {
    console.error(`[${this.prefix}] [ERROR] ${message}`, meta ? JSON.stringify(meta) : "");
  }
}
