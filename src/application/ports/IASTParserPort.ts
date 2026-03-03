/**
 * AST Parser Port - Driven Port
 * Interface for parsing source code into AST
 * Infrastructure will implement this interface
 */

export interface ParseResult {
  components: Array<{
    name: string;
    framework: string;
    hooks: string[];
  }>;
  imports: string[];
  exports: string[];
  dependencies: string[];
}

export interface IASTParserPort {
  /**
   * Parse source code and extract component information
   */
  parse(code: string, fileExtension: string): Promise<ParseResult>;

  /**
   * Check if parser supports this file extension
   */
  supports(fileExtension: string): boolean;

  /**
   * Get list of supported file extensions
   */
  getSupportedExtensions(): string[];
}
