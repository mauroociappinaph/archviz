# Plan de Implementación: 4 Features Prioritarias

## 📋 Resumen

Este documento detalla el plan paso a paso para implementar las 4 features de mayor prioridad:
1. Análisis AST real
2. Diagramas interactivos
3. Exportar PNG/PDF
4. Validación de URL

**Tiempo estimado total**: 3-4 semanas
**Orden recomendado**: URL Validation → Interactive Diagrams → PNG/PDF Export → AST Analysis

---

## 🎯 FASE 1: Validación de URL (Semana 1)

### Objetivo
Proporcionar feedback visual inmediato al usuario sobre la validez de la URL ingresada.

### Tareas

#### Día 1-2: Componente de Validación
```typescript
// lib/utils/urlValidation.ts
export function isValidGitHubUrl(url: string): {
  isValid: boolean;
  error?: string;
  owner?: string;
  repo?: string;
} {
  // Regex para GitHub URLs
  const githubRegex = /^(https?:\/\/)?(www\.)?github\.com\/([^\/]+)\/([^\/]+)/;
  const match = url.match(githubRegex);

  if (!match) {
    return { isValid: false, error: 'Invalid GitHub URL format' };
  }

  const [, , , owner, repo] = match;

  // Validaciones adicionales
  if (owner.length < 1) {
    return { isValid: false, error: 'Invalid username' };
  }

  if (repo.length < 1) {
    return { isValid: false, error: 'Invalid repository name' };
  }

  return { isValid: true, owner, repo };
}
```

#### Día 3-4: UI de Feedback
```typescript
// Modificar InputSection.tsx
export function InputSection({ ... }) {
  const [validation, setValidation] = useState<{
    status: 'idle' | 'valid' | 'invalid';
    message?: string;
  }>({ status: 'idle' });

  useEffect(() => {
    if (!repoUrl) {
      setValidation({ status: 'idle' });
      return;
    }

    const result = isValidGitHubUrl(repoUrl);

    if (result.isValid) {
      setValidation({ status: 'valid', message: '✓ Valid GitHub URL' });
    } else {
      setValidation({ status: 'invalid', message: result.error });
    }
  }, [repoUrl]);

  return (
    <div className="relative">
      <Input
        value={repoUrl}
        onChange={(e) => setRepoUrl(e.target.value)}
        className={cn(
          validation.status === 'valid' && "border-emerald-500 focus-visible:ring-emerald-500",
          validation.status === 'invalid' && "border-red-500 focus-visible:ring-red-500"
        )}
      />

      {/* Icono de validación */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2">
        {validation.status === 'valid' && (
          <Check className="w-5 h-5 text-emerald-400" />
        )}
        {validation.status === 'invalid' && (
          <X className="w-5 h-5 text-red-400" />
        )}
      </div>

      {/* Mensaje de validación */}
      {validation.message && (
        <p className={cn(
          "text-sm mt-2",
          validation.status === 'valid' ? "text-emerald-400" : "text-red-400"
        )}>
          {validation.message}
        </p>
      )}
    </div>
  );
}
```

#### Día 5: Verificación de Existencia del Repo
```typescript
// lib/services/githubValidation.ts
export async function validateRepoExists(owner: string, repo: string): Promise<boolean> {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
    return response.status === 200;
  } catch {
    return false;
  }
}

// Usar en el componente con debounce
useEffect(() => {
  const timer = setTimeout(async () => {
    if (validation.status === 'valid') {
      const exists = await validateRepoExists(validation.owner!, validation.repo!);
      if (!exists) {
        setValidation({ status: 'invalid', message: 'Repository not found or not public' });
      }
    }
  }, 500); // Debounce 500ms

  return () => clearTimeout(timer);
}, [repoUrl]);
```

### Entregables
- [ ] Función de validación de URL
- [ ] UI con feedback visual (bordes coloreados, iconos)
- [ ] Verificación de existencia del repo
- [ ] Tests unitarios

---

## 🎯 FASE 2: Diagramas Interactivos (Semana 2)

### Objetivo
Permitir zoom, pan y click en nodos de los diagramas Mermaid.

### Tareas

#### Día 1-2: Investigar Librerías
Opciones:
1. **Mermaid Zoom/Pan nativo** - Limitado
2. **D3.js + Mermaid** - Flexible pero complejo
3. **React Flow** - Recomendado, diseñado para diagramas interactivos
4. **Cytoscape.js** - Bueno para grafos complejos

**Decisión**: Usar **React Flow** o agregar zoom/pan nativo a Mermaid.

#### Día 3-4: Implementar Zoom y Pan
```typescript
// components/diagrams/InteractiveDiagram.tsx
'use client';

import { useState, useRef, useCallback } from 'react';
import { MermaidDiagram } from './MermaidDiagram';
import { ZoomIn, ZoomOut, Move, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InteractiveDiagramProps {
  chart: string;
}

export function InteractiveDiagram({ chart }: InteractiveDiagramProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === containerRef.current) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  }, [position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div className="relative">
      {/* Toolbar */}
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomIn}
          className="bg-slate-800/80 backdrop-blur"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomOut}
          className="bg-slate-800/80 backdrop-blur"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleReset}
          className="bg-slate-800/80 backdrop-blur"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Diagram Container */}
      <div
        ref={containerRef}
        className="overflow-hidden cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center',
            transition: isDragging ? 'none' : 'transform 0.2s ease'
          }}
        >
          <MermaidDiagram chart={chart} />
        </div>
      </div>

      {/* Zoom Level Indicator */}
      <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-slate-800/80 backdrop-blur text-sm text-slate-300">
        {Math.round(scale * 100)}%
      </div>
    </div>
  );
}
```

#### Día 5: Click en Nodos
```typescript
// Modificar MermaidDiagram para agregar interacción
useEffect(() => {
  if (chartRef.current) {
    // Agregar event listeners a los nodos
    const nodes = chartRef.current.querySelectorAll('.node');
    nodes.forEach(node => {
      node.style.cursor = 'pointer';
      node.addEventListener('click', (e) => {
        const nodeId = node.getAttribute('id');
        const nodeText = node.textContent;
        onNodeClick?.({ id: nodeId, text: nodeText });
      });

      // Hover effect
      node.addEventListener('mouseenter', () => {
        node.style.filter = 'brightness(1.2)';
      });
      node.addEventListener('mouseleave', () => {
        node.style.filter = 'none';
      });
    });
  }
}, [chart]);
```

### Entregables
- [ ] Componente InteractiveDiagram con zoom/pan
- [ ] Toolbar con controles de zoom
- [ ] Click en nodos con modal de detalles
- [ ] Soporte para touch events (móvil)

---

## 🎯 FASE 3: Exportar PNG/PDF (Semana 3)

### Objetivo
Permitir exportar diagramas en formatos PNG y PDF para documentación.

### Tareas

#### Día 1: Instalar Dependencias
```bash
npm install html2canvas jspdf
# o
npm install dom-to-image
```

#### Día 2-3: Exportar PNG
```typescript
// lib/export/exportImage.ts
import html2canvas from 'html2canvas';

export async function exportToPNG(
  element: HTMLElement,
  filename: string
): Promise<void> {
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#0a0e1a', // Fondo del tema
      scale: 2, // Alta resolución
      logging: false,
      useCORS: true // Para imágenes externas
    });

    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    console.error('Error exporting PNG:', error);
    throw new Error('Failed to export PNG');
  }
}

// Uso en DiagramCard
const handleDownloadPNG = async () => {
  const diagramElement = document.getElementById(`diagram-${type}`);
  if (diagramElement) {
    await exportToPNG(diagramElement, `${analysis.context.name}-${type}`);
  }
};
```

#### Día 4: Exportar PDF
```typescript
// lib/export/exportPDF.ts
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportToPDF(
  diagrams: {
    context: HTMLElement;
    container: HTMLElement;
    component: HTMLElement;
  },
  title: string
): Promise<void> {
  const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape, A4

  let yPosition = 10;

  // Título
  pdf.setFontSize(20);
  pdf.text(`Architecture: ${title}`, 10, yPosition);
  yPosition += 20;

  // Fecha
  pdf.setFontSize(12);
  pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 10, yPosition);
  yPosition += 20;

  // Exportar cada diagrama
  const diagramTypes = ['context', 'container', 'component'] as const;

  for (const type of diagramTypes) {
    const element = diagrams[type];

    if (yPosition > 150) {
      pdf.addPage();
      yPosition = 10;
    }

    // Título del diagrama
    pdf.setFontSize(16);
    pdf.text(`${type.charAt(0).toUpperCase() + type.slice(1)} Diagram`, 10, yPosition);
    yPosition += 10;

    // Capturar diagrama
    const canvas = await html2canvas(element, {
      backgroundColor: '#0a0e1a',
      scale: 2
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 280; // A4 landscape width - margins
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight);
    yPosition += imgHeight + 20;
  }

  pdf.save(`${title}-architecture.pdf`);
}
```

#### Día 5: UI de Exportación
```typescript
// Agregar al DropdownMenu de DiagramCard
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline" size="sm">
      <Download className="w-4 h-4 mr-2" />
      Export
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={handleDownloadSVG}>
      <FileCode className="w-4 h-4 mr-2" />
      Mermaid Code (.mmd)
    </DropdownMenuItem>
    <DropdownMenuItem onClick={handleDownloadPNG}>
      <Image className="w-4 h-4 mr-2" />
      PNG Image (.png)
    </DropdownMenuItem>
    <DropdownMenuItem onClick={handleDownloadPDF}>
      <FileText className="w-4 h-4 mr-2" />
      PDF Document (.pdf)
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Entregables
- [ ] Función exportToPNG
- [ ] Función exportToPDF
- [ ] UI con dropdown de opciones
- [ ] Manejo de errores

---

## 🎯 FASE 4: Análisis AST Real (Semana 4)

### Objetivo
Analizar el código fuente real usando AST parsers para detectar relaciones entre componentes.

### Tareas

#### Día 1-2: Setup de AST Parsers
```bash
npm install @babel/parser @babel/traverse @babel/types
npm install typescript @typescript-eslint/typescript-estree
npm install -D @types/babel__traverse
```

```typescript
// lib/ast/parsers/typescriptParser.ts
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';

export interface ASTAnalysis {
  imports: string[];
  exports: string[];
  components: string[];
  hooks: string[];
  dependencies: string[];
}

export function parseTypeScript(code: string): ASTAnalysis {
  const ast = parse(code, {
    sourceType: 'module',
    plugins: [
      'typescript',
      'jsx',
      'decorators-legacy',
      'classProperties'
    ]
  });

  const analysis: ASTAnalysis = {
    imports: [],
    exports: [],
    components: [],
    hooks: [],
    dependencies: []
  };

  traverse(ast, {
    // Detectar imports
    ImportDeclaration(path) {
      const source = path.node.source.value;
      analysis.imports.push(source);

      // Detectar si es dependencia externa
      if (!source.startsWith('.') && !source.startsWith('@/')) {
        analysis.dependencies.push(source);
      }
    },

    // Detectar componentes React
    FunctionDeclaration(path) {
      const name = path.node.id?.name;
      if (name && isComponentName(name)) {
        analysis.components.push(name);
      }
    },

    // Detectar hooks
    CallExpression(path) {
      const callee = path.node.callee;
      if (t.isIdentifier(callee) && callee.name.startsWith('use')) {
        analysis.hooks.push(callee.name);
      }
    },

    // Detectar exports
    ExportNamedDeclaration(path) {
      if (path.node.declaration) {
        if (t.isFunctionDeclaration(path.node.declaration) && path.node.declaration.id) {
          analysis.exports.push(path.node.declaration.id.name);
        }
      }
    }
  });

  return analysis;
}

function isComponentName(name: string): boolean {
  // Convención: Componentes empiezan con mayúscula
  return /^[A-Z]/.test(name);
}
```

#### Día 3: Analizador de Repositorios
```typescript
// lib/ast/repoAnalyzer.ts
import { parseTypeScript } from './parsers/typescriptParser';
import { octokit } from '../analyzer';

export interface ComponentRelation {
  file: string;
  component: string;
  imports: string[];
  usedBy: string[];
  dependencies: string[];
}

export async function analyzeRepoAST(
  owner: string,
  repo: string
): Promise<ComponentRelation[]> {
  const relations: ComponentRelation[] = [];

  // Obtener todos los archivos TypeScript/JavaScript
  const files = await getAllSourceFiles(owner, repo);

  for (const file of files) {
    try {
      // Obtener contenido del archivo
      const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: file.path
      });

      if ('content' in data) {
        const content = Buffer.from(data.content, 'base64').toString();
        const analysis = parseTypeScript(content);

        relations.push({
          file: file.path,
          component: analysis.components[0] || file.name,
          imports: analysis.imports,
          usedBy: [], // Se llena después
          dependencies: analysis.dependencies
        });
      }
    } catch (error) {
      console.error(`Error analyzing ${file.path}:`, error);
    }
  }

  // Segunda pasada: detectar relaciones "usedBy"
  for (const relation of relations) {
    for (const other of relations) {
      if (other.imports.some(imp =>
        imp.includes(relation.file.replace(/\.tsx?$/, '')) ||
        imp.includes(relation.component)
      )) {
        relation.usedBy.push(other.file);
      }
    }
  }

  return relations;
}

async function getAllSourceFiles(owner: string, repo: string) {
  const files: Array<{ path: string; name: string }> = [];
  const extensions = ['.ts', '.tsx', '.js', '.jsx'];

  async function traverseDir(path: string = '') {
    try {
      const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path
      });

      if (Array.isArray(data)) {
        for (const item of data) {
          if (item.type === 'dir' &&
              !item.name.includes('node_modules') &&
              !item.name.startsWith('.')) {
            await traverseDir(item.path);
          } else if (item.type === 'file' &&
                     extensions.some(ext => item.name.endsWith(ext))) {
            files.push({ path: item.path, name: item.name });
          }
        }
      }
    } catch (error) {
      console.error(`Error traversing ${path}:`, error);
    }
  }

  await traverseDir();
  return files;
}
```

#### Día 4: Integración con Diagramas
```typescript
// Modificar generateComponentDiagram para usar AST
export async function generateComponentDiagram(
  analysis: RepoAnalysis,
  astRelations: ComponentRelation[]
): Promise<string> {
  const { containers } = analysis;
  const mainContainer = containers[0];

  let diagram = `C4Component\n`;
  diagram += `    title Component diagram for ${mainContainer.name}\n\n`;
  diagram += `    Container_Boundary(${mainContainer.id}, "${mainContainer.name}") {\n`;

  // Agregar componentes basados en AST
  for (const relation of astRelations) {
    const componentId = relation.component.replace(/[^a-zA-Z0-9]/g, '_');
    const description = relation.dependencies.length > 0
      ? `Uses: ${relation.dependencies.slice(0, 3).join(', ')}${relation.dependencies.length > 3 ? '...' : ''}`
      : relation.file;

    diagram += `        Component(${componentId}, "${relation.component}", "Component", "${description}")\n`;
  }

  diagram += `    }\n\n`;

  // Agregar relaciones reales
  for (const relation of astRelations) {
    const sourceId = relation.component.replace(/[^a-zA-Z0-9]/g, '_');
    for (const used of relation.usedBy.slice(0, 3)) { // Limitar relaciones
      const targetComponent = astRelations.find(r => r.file === used);
      if (targetComponent) {
        const targetId = targetComponent.component.replace(/[^a-zA-Z0-9]/g, '_');
        diagram += `    Rel(${sourceId}, ${targetId}, "uses")\n`;
      }
    }
  }

  return diagram;
}
```

#### Día 5: Optimización y Caching
```typescript
// lib/ast/cache.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
});

export async function getCachedASTAnalysis(
  owner: string,
  repo: string,
  commit: string
): Promise<ComponentRelation[] | null> {
  const key = `ast:${owner}:${repo}:${commit}`;
  const cached = await redis.get<ComponentRelation[]>(key);
  return cached;
}

export async function cacheASTAnalysis(
  owner: string,
  repo: string,
  commit: string,
  analysis: ComponentRelation[]
): Promise<void> {
  const key = `ast:${owner}:${repo}:${commit}`;
  await redis.set(key, analysis, { ex: 60 * 60 * 24 }); // 24 horas
}
```

### Entregables
- [ ] Parser TypeScript con Babel
- [ ] Analizador de repos con AST
- [ ] Relaciones reales entre componentes
- [ ] Caching con Redis
- [ ] Tests con repos reales

---

## 🧪 Testing Strategy

### Tests Unitarios
```typescript
// __tests__/urlValidation.test.ts
describe('isValidGitHubUrl', () => {
  it('validates correct GitHub URLs', () => {
    expect(isValidGitHubUrl('https://github.com/owner/repo')).toBeValid();
  });

  it('rejects invalid URLs', () => {
    expect(isValidGitHubUrl('not-a-url')).toBeInvalid();
  });
});

// __tests__/astParser.test.ts
describe('parseTypeScript', () => {
  it('detects React components', () => {
    const code = `export function MyComponent() { return <div /> }`;
    const result = parseTypeScript(code);
    expect(result.components).toContain('MyComponent');
  });
});
```

### Tests E2E
```typescript
// __tests__/export.test.ts
describe('Export functionality', () => {
  it('exports diagram to PNG', async () => {
    await page.click('[data-testid="export-png"]');
    const download = await page.waitForEvent('download');
    expect(download.suggestedFilename()).toMatch(/\.png$/);
  });
});
```

---

## 📅 Timeline Visual

```
Semana 1: Validación de URL
├─ Día 1-2: Función de validación
├─ Día 3-4: UI feedback visual
└─ Día 5: Verificación de existencia

Semana 2: Diagramas Interactivos
├─ Día 1-2: Setup y librerías
├─ Día 3-4: Zoom/Pan
└─ Día 5: Click en nodos

Semana 3: Exportar PNG/PDF
├─ Día 1: Dependencias
├─ Día 2-3: Export PNG
├─ Día 4: Export PDF
└─ Día 5: UI final

Semana 4: Análisis AST
├─ Día 1-2: Setup parsers
├─ Día 3: Repo analyzer
├─ Día 4: Integración diagramas
└─ Día 5: Caching
```

---

## 🚀 Deployment

### Pre-deployment Checklist
- [ ] Todos los tests pasan
- [ ] Documentación actualizada
- [ ] Variables de entorno configuradas
- [ ] Redis configurado (para AST caching)

### Post-deployment
- [ ] Monitorear errores
- [ ] Medir performance de AST analysis
- [ ] Feedback de usuarios

---

## 💰 Costos Estimados

| Servicio | Costo Mensual |
|----------|--------------|
| Vercel Pro (si excede límites) | $20 |
| Upstash Redis (10GB) | $10 |
| GitHub API (rate limits) | Gratis (5000 req/h) |
| **Total** | **~$30/mes** |

---

## 📝 Notas

- El análisis AST puede ser lento para repos grandes (>100 archivos)
- Considerar Web Workers para parsing en el frontend
- Implementar rate limiting para GitHub API
- AST analysis opcional (toggle en UI)

---

*Plan creado el: 2026-03-03*
*Versión: 1.0*
