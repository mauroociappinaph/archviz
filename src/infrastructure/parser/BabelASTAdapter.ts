import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import type { IASTParserPort, ParseResult } from '../../application/ports/IASTParserPort';

/**
 * Babel AST Adapter
 * Implements IASTParserPort using Babel parser
 * Follows Clean Architecture - Infrastructure Layer
 */
export class BabelASTAdapter implements IASTParserPort {
  private readonly supportedExtensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'];

  supports(fileExtension: string): boolean {
    return this.supportedExtensions.includes(fileExtension.toLowerCase());
  }

  getSupportedExtensions(): string[] {
    return [...this.supportedExtensions];
  }

  async parse(code: string, fileExtension: string): Promise<ParseResult> {
    if (!this.supports(fileExtension)) {
      throw new Error(`Unsupported file extension: ${fileExtension}`);
    }

    // Determine if file uses JSX
    const isJsx = fileExtension.toLowerCase().includes('x');

    const ast = parse(code, {
      sourceType: 'module',
      plugins: [
        'typescript',
        isJsx ? 'jsx' : null,
        'decorators-legacy',
        'classProperties',
        'asyncGenerators',
        'dynamicImport',
      ].filter(Boolean) as any[],
    });

    const analysis = this.extractAnalysis(ast);

    return this.transformToParseResult(analysis);
  }

  private extractAnalysis(ast: any): ASTAnalysis {
    const analysis: ASTAnalysis = {
      imports: [],
      exports: [],
      components: [],
      hooks: [],
      dependencies: [],
      functions: [],
      interfaces: [],
      types: [],
    };

    // Helper functions (not methods, to avoid 'this' binding issues)
    const isComponentName = (name: string): boolean => {
      return /^[A-Z][a-zA-Z0-9]*$/.test(name);
    };

    const isHookName = (name: string): boolean => {
      return /^use[A-Z][a-zA-Z0-9]*$/.test(name);
    };

    traverse(ast, {
      // Detect imports
      ImportDeclaration(path) {
        const source = path.node.source.value;
        analysis.imports.push(source);

        // Detect if it's an external dependency
        if (!source.startsWith('.') && !source.startsWith('@/')) {
          analysis.dependencies.push(source);
        }
      },

      // Detect React components (functions starting with capital letter)
      FunctionDeclaration(path) {
        const name = path.node.id?.name;
        if (name) {
          analysis.functions.push(name);

          if (isComponentName(name)) {
            analysis.components.push(name);
          }
        }
      },

      // Detect arrow function components
      VariableDeclarator(path) {
        if (t.isIdentifier(path.node.id) && t.isArrowFunctionExpression(path.node.init)) {
          const name = path.node.id.name;
          analysis.functions.push(name);

          if (isComponentName(name)) {
            analysis.components.push(name);
          }
        }
      },

      // Detect hooks (functions starting with 'use')
      CallExpression(path) {
        const callee = path.node.callee;
        if (t.isIdentifier(callee) && callee.name.startsWith('use')) {
          // Only add if it's a React hook or custom hook
          if (isHookName(callee.name)) {
            analysis.hooks.push(callee.name);
          }
        }
      },

      // Detect exports
      ExportNamedDeclaration(path) {
        if (path.node.declaration) {
          if (t.isFunctionDeclaration(path.node.declaration) && path.node.declaration.id) {
            analysis.exports.push(path.node.declaration.id.name);
          } else if (t.isVariableDeclaration(path.node.declaration)) {
            path.node.declaration.declarations.forEach((decl) => {
              if (t.isIdentifier(decl.id)) {
                analysis.exports.push(decl.id.name);
              }
            });
          }
        }
      },

      ExportDefaultDeclaration(path) {
        if (t.isFunctionDeclaration(path.node.declaration) && path.node.declaration.id) {
          analysis.exports.push(path.node.declaration.id.name);
        } else if (t.isIdentifier(path.node.declaration)) {
          analysis.exports.push(path.node.declaration.name);
        }
      },

      // Detect TypeScript interfaces
      TSInterfaceDeclaration(path) {
        analysis.interfaces.push(path.node.id.name);
      },

      // Detect TypeScript type aliases
      TSTypeAliasDeclaration(path) {
        analysis.types.push(path.node.id.name);
      },
    });

    // Remove duplicates
    return {
      imports: [...new Set(analysis.imports)],
      exports: [...new Set(analysis.exports)],
      components: [...new Set(analysis.components)],
      hooks: [...new Set(analysis.hooks)],
      dependencies: [...new Set(analysis.dependencies)],
      functions: [...new Set(analysis.functions)],
      interfaces: [...new Set(analysis.interfaces)],
      types: [...new Set(analysis.types)],
    };
  }

  private transformToParseResult(analysis: ASTAnalysis): ParseResult {
    return {
      components: analysis.components.map(name => ({
        name,
        framework: this.detectFramework(analysis),
        hooks: analysis.hooks,
      })),
      imports: analysis.imports,
      exports: analysis.exports,
      dependencies: analysis.dependencies,
    };
  }

  private detectFramework(analysis: ASTAnalysis): string {
    const deps = analysis.dependencies.map((d) => d.toLowerCase());

    if (deps.some((d) => d.includes('react'))) {
      return 'React';
    }
    if (deps.some((d) => d.includes('vue'))) {
      return 'Vue';
    }
    if (deps.some((d) => d.includes('angular') || d.includes('@angular'))) {
      return 'Angular';
    }
    if (deps.some((d) => d.includes('svelte'))) {
      return 'Svelte';
    }
    if (deps.some((d) => d.includes('solid-js'))) {
      return 'SolidJS';
    }
    if (deps.some((d) => d.includes('preact'))) {
      return 'Preact';
    }

    return 'Unknown';
  }
}

interface ASTAnalysis {
  imports: string[];
  exports: string[];
  components: string[];
  hooks: string[];
  dependencies: string[];
  functions: string[];
  interfaces: string[];
  types: string[];
}
