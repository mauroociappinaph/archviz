# Clean Architecture Refactor Plan
## AST Analysis Module

---

## 1. Current State Analysis

### 1.1 Estructura Legacy (Problemas)

```
lib/
├── analyzer.ts          # ❌ God File: 200+ líneas
│   ├── GitHub API calls
│   ├── Business logic
│   ├── Type definitions
│   └── Diagram generation
├── diagrams.ts          # ❌ Mezcla: generación + lógica
├── types/index.ts       # ❌ Anémico: solo interfaces
└── ast/                 # ❌ Sin separación de concerns
    ├── parsers/
    │   └── typescriptParser.ts  # Parser + lógica
    └── repoAnalyzer.ts          # Infrastructure mezclada
```

### 1.2 Problemas Identificados

| Anti-Pattern | Síntoma | Impacto |
|-------------|---------|---------|
| **God Class** | `analyzer.ts` hace todo | Difícil de testear, mantener |
| **Anemic Domain** | Types sin comportamiento | Lógica dispersa |
| **Infrastructure Leak** | Octokit en domain | Acoplamiento fuerte |
| **No Ports/Adapters** | Dependencias directas | Imposible mockear |
| **CRUD Thinking** | Solo lee datos, no opera | Pérdida de semántica |

---

## 2. Target Architecture (Clean + DDD)

```
src/
├── domain/                      # 🎯 Core Business (NO deps externas)
│   ├── analysis/
│   │   ├── Repository.ts        # Entity: Aggregate Root
│   │   ├── Component.ts         # Entity: Child
│   │   ├── Relationship.ts      # Value Object
│   │   └── GitHubUrl.ts         # Value Object (validación)
│   ├── errors/
│   │   ├── AnalysisError.ts
│   │   ├── ParseError.ts
│   │   └── ValidationError.ts
│   └── repositories/
│       └── IAnalysisRepository.ts    # Driven Port
│
├── application/                 # 🎯 Use Cases (orquesta)
│   ├── analysis/
│   │   ├── AnalyzeRepositoryUseCase.ts
│   │   ├── GetComponentRelationshipsUseCase.ts
│   │   └── ExportMetricsUseCase.ts
│   ├── ports/
│   │   ├── IGitHubApiPort.ts        # Driven Port
│   │   ├── IASTParserPort.ts        # Driven Port
│   │   └── IDiagramGeneratorPort.ts # Driven Port
│   └── dto/
│       ├── AnalyzeRepositoryRequest.ts
│       ├── AnalysisResultDTO.ts
│       └── ComponentMetricsDTO.ts
│
├── infrastructure/              # 🎯 Adapters (externos)
│   ├── github/
│   │   ├── GitHubApiAdapter.ts      # Implenta IGitHubApiPort
│   │   └── GitHubRepositoryMapper.ts # Anti-Corruption Layer
│   ├── parser/
│   │   ├── BabelASTAdapter.ts       # Implenta IASTParserPort
│   │   └── ASTAnalysisMapper.ts     # ACL
│   ├── persistence/
│   │   ├── InMemoryCache.ts         # Opcional: caching
│   │   └── RedisCache.ts
│   └── generator/
│       ├── MermaidGenerator.ts      # Implenta IDiagramGeneratorPort
│       └── C4ModelBuilder.ts
│
└── interface/                   # 🎯 Entry Points
    ├── http/
    │   ├── AnalysisController.ts
    │   ├── routes.ts
    │   └── middleware/
    │       └── validation.ts
    └── cli/
        └── AnalyzeCommand.ts
```

---

## 3. Domain Layer (Core)

### 3.1 Entities

```typescript
// domain/analysis/Repository.ts
export class Repository {
  constructor(
    private readonly id: RepositoryId,
    private readonly url: GitHubUrl,
    private readonly name: RepositoryName,
    private components: Component[] = [],
    private relationships: Relationship[] = []
  ) {}

  addComponent(component: Component): void {
    this.components.push(component);
  }

  addRelationship(from: ComponentId, to: ComponentId): void {
    const relationship = new Relationship(from, to);
    this.relationships.push(relationship);
  }

  getComponents(): ReadonlyArray<Component> {
    return this.components;
  }

  getRelationships(): ReadonlyArray<Relationship> {
    return this.relationships;
  }

  getFramework(): Framework {
    // Domain logic: detectar framework predominante
    const frameworks = this.components.map(c => c.getFramework());
    return Framework.detectPredominant(frameworks);
  }

  getMetrics(): RepositoryMetrics {
    return {
      totalComponents: this.components.length,
      totalRelationships: this.relationships.length,
      mostConnectedComponent: this.findMostConnected(),
      externalDependencies: this.extractExternalDeps()
    };
  }

  private findMostConnected(): Component | null {
    // Domain logic puro
    return this.components
      .sort((a, b) => b.getConnectionCount() - a.getConnectionCount())[0] || null;
  }
}
```

### 3.2 Value Objects

```typescript
// domain/analysis/GitHubUrl.ts
export class GitHubUrl {
  private constructor(private readonly url: string) {}

  static create(url: string): Result<GitHubUrl, ValidationError> {
    const pattern = /^https:\/\/github\.com\/[^\/]+\/[^\/]+$/;
    if (!pattern.test(url)) {
      return Result.fail(new ValidationError('Invalid GitHub URL format'));
    }
    return Result.ok(new GitHubUrl(url));
  }

  getOwner(): string {
    const parts = this.url.split('/');
    return parts[3];
  }

  getRepo(): string {
    const parts = this.url.split('/');
    return parts[4];
  }

  toString(): string {
    return this.url;
  }
}

// domain/analysis/Relationship.ts
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
}
```

### 3.3 Repository Interface (Port)

```typescript
// domain/repositories/IAnalysisRepository.ts
export interface IAnalysisRepository {
  save(repository: Repository): Promise<void>;
  findByUrl(url: GitHubUrl): Promise<Repository | null>;
  exists(url: GitHubUrl): Promise<boolean>;
}
```

---

## 4. Application Layer (Use Cases)

### 4.1 Analyze Repository Use Case

```typescript
// application/analysis/AnalyzeRepositoryUseCase.ts
export class AnalyzeRepositoryUseCase {
  constructor(
    private readonly githubApi: IGitHubApiPort,
    private readonly parser: IASTParserPort,
    private readonly repository: IAnalysisRepository,
    private readonly logger: ILoggerPort
  ) {}

  async execute(request: AnalyzeRepositoryRequest): Promise<AnalysisResultDTO> {
    this.logger.info(`Starting analysis for ${request.url}`);

    // 1. Validar URL
    const urlResult = GitHubUrl.create(request.url);
    if (urlResult.isFailure()) {
      throw new ValidationError('Invalid URL');
    }
    const url = urlResult.getValue();

    // 2. Verificar caché
    const cached = await this.repository.findByUrl(url);
    if (cached && !request.forceRefresh) {
      this.logger.info('Returning cached analysis');
      return this.mapToDTO(cached);
    }

    // 3. Obtener archivos fuente
    const files = await this.githubApi.fetchSourceFiles(
      url.getOwner(),
      url.getRepo(),
      request.maxFiles
    );

    // 4. Crear aggregate
    const repository = new Repository(
      RepositoryId.create(),
      url,
      RepositoryName.create(url.getRepo())
    );

    // 5. Analizar cada archivo
    for (const file of files) {
      try {
        const content = await this.githubApi.fetchFileContent(file.path);
        const analysis = await this.parser.parse(content);

        // 6. Agregar componentes al aggregate
        analysis.components.forEach(comp => {
          const component = new Component(
            ComponentId.create(),
            ComponentName.create(comp.name),
            FilePath.create(file.path),
            Framework.create(comp.framework),
            comp.hooks
          );
          repository.addComponent(component);
        });
      } catch (error) {
        this.logger.warn(`Failed to parse ${file.path}: ${error.message}`);
        // Continuar con otros archivos (graceful degradation)
      }
    }

    // 7. Detectar relaciones (segunda pasada)
    await this.detectRelationships(repository, files);

    // 8. Guardar en repositorio
    await this.repository.save(repository);

    // 9. Retornar DTO
    return this.mapToDTO(repository);
  }

  private async detectRelationships(repo: Repository, files: SourceFile[]): Promise<void> {
    // Lógica de detección de relaciones
  }

  private mapToDTO(repository: Repository): AnalysisResultDTO {
    return {
      id: repository.getId().toString(),
      url: repository.getUrl().toString(),
      framework: repository.getFramework().toString(),
      components: repository.getComponents().map(c => ({
        id: c.getId().toString(),
        name: c.getName().toString(),
        filePath: c.getFilePath().toString(),
        framework: c.getFramework().toString(),
        hooks: c.getHooks()
      })),
      relationships: repository.getRelationships().map(r => ({
        from: r.getFrom().toString(),
        to: r.getTo().toString(),
        type: r.getType()
      })),
      metrics: repository.getMetrics()
    };
  }
}
```

### 4.2 Ports (Interfaces)

```typescript
// application/ports/IGitHubApiPort.ts
export interface IGitHubApiPort {
  fetchSourceFiles(owner: string, repo: string, limit: number): Promise<SourceFile[]>;
  fetchFileContent(path: string): Promise<string>;
  validateRepository(owner: string, repo: string): Promise<boolean>;
}

// application/ports/IASTParserPort.ts
export interface IASTParserPort {
  parse(code: string): Promise<ParseResult>;
  supports(fileExtension: string): boolean;
}

// application/ports/IDiagramGeneratorPort.ts
export interface IDiagramGeneratorPort {
  generateComponentDiagram(repository: Repository): string;
  generateContainerDiagram(repository: Repository): string;
  generateContextDiagram(repository: Repository): string;
}
```

---

## 5. Infrastructure Layer (Adapters)

### 5.1 GitHub API Adapter

```typescript
// infrastructure/github/GitHubApiAdapter.ts
export class GitHubApiAdapter implements IGitHubApiPort {
  constructor(private readonly octokit: Octokit) {}

  async fetchSourceFiles(
    owner: string,
    repo: string,
    limit: number
  ): Promise<SourceFile[]> {
    // Implementación usando Octokit
    const files: SourceFile[] = [];

    const traverseDir = async (path: string = '') => {
      if (files.length >= limit) return;

      const { data } = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path
      });

      if (Array.isArray(data)) {
        for (const item of data) {
          if (files.length >= limit) break;

          if (this.shouldTraverse(item)) {
            await traverseDir(item.path);
          } else if (this.isSourceFile(item)) {
            files.push(this.mapToSourceFile(item));
          }
        }
      }
    };

    await traverseDir();
    return files;
  }

  async fetchFileContent(path: string): Promise<string> {
    // Implementation
    return '';
  }

  private shouldTraverse(item: any): boolean {
    return item.type === 'dir' && !item.name.startsWith('.') &&
           !['node_modules', 'dist', 'build'].includes(item.name);
  }

  private isSourceFile(item: any): boolean {
    return item.type === 'file' &&
           /\.(ts|tsx|js|jsx)$/.test(item.name);
  }

  private mapToSourceFile(item: any): SourceFile {
    return {
      path: item.path,
      name: item.name,
      size: item.size
    };
  }
}
```

### 5.2 Anti-Corruption Layer

```typescript
// infrastructure/github/GitHubRepositoryMapper.ts
export class GitHubRepositoryMapper {
  toDomain(apiResponse: any): Repository {
    // Mapeo protegido contra cambios en API externa
  }

  toDTO(repository: Repository): RepositoryDTO {
    // Mapeo a formato externo
  }
}

// infrastructure/parser/ASTAnalysisMapper.ts
export class ASTAnalysisMapper {
  toDomain(parserOutput: BabelParseResult): AnalysisResult {
    // Mapeo protegido contra cambios en parser
  }
}
```

---

## 6. Interface Layer (Entry Points)

### 6.1 HTTP Controller

```typescript
// interface/http/AnalysisController.ts
export class AnalysisController {
  constructor(
    private readonly analyzeUseCase: AnalyzeRepositoryUseCase,
    private readonly exportUseCase: ExportMetricsUseCase
  ) {}

  async analyze(req: Request, res: Response): Promise<void> {
    try {
      const request = AnalyzeRepositoryRequest.create({
        url: req.body.url,
        maxFiles: req.body.maxFiles || 50,
        forceRefresh: req.body.forceRefresh || false
      });

      const result = await this.analyzeUseCase.execute(request);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
}
```

### 6.2 Dependency Injection (Composition Root)

```typescript
// infrastructure/config/di.ts
export class Container {
  private static instance: Container;
  private dependencies: Map<string, any> = new Map();

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  register() {
    // Infrastructure
    this.dependencies.set('octokit', new Octokit());
    this.dependencies.set('githubApi', new GitHubApiAdapter(
      this.get('octokit')
    ));
    this.dependencies.set('parser', new BabelASTAdapter());
    this.dependencies.set('repository', new InMemoryAnalysisRepository());

    // Use Cases
    this.dependencies.set('analyzeUseCase', new AnalyzeRepositoryUseCase(
      this.get('githubApi'),
      this.get('parser'),
      this.get('repository'),
      this.get('logger')
    ));
  }

  get<T>(key: string): T {
    return this.dependencies.get(key);
  }
}
```

---

## 7. Testing Strategy

### 7.1 Unit Tests (Domain)

```typescript
// domain/analysis/__tests__/Repository.test.ts
describe('Repository', () => {
  it('should add components', () => {
    const repo = createTestRepository();
    const component = createTestComponent();

    repo.addComponent(component);

    expect(repo.getComponents()).toHaveLength(1);
  });

  it('should detect predominant framework', () => {
    const repo = createTestRepository();
    repo.addComponent(new Component(/* React */));
    repo.addComponent(new Component(/* React */));
    repo.addComponent(new Component(/* Vue */));

    expect(repo.getFramework().toString()).toBe('React');
  });
});
```

### 7.2 Integration Tests (Use Cases)

```typescript
// application/__tests__/AnalyzeRepositoryUseCase.test.ts
describe('AnalyzeRepositoryUseCase', () => {
  it('should analyze repository and return results', async () => {
    const useCase = createTestUseCase();
    const request = AnalyzeRepositoryRequest.create({
      url: 'https://github.com/facebook/react'
    });

    const result = await useCase.execute(request);

    expect(result.components.length).toBeGreaterThan(0);
    expect(result.framework).toBeDefined();
  });
});
```

### 7.3 Architecture Tests

```typescript
// __tests__/architecture.test.ts
describe('Architecture', () => {
  it('domain should not depend on infrastructure', () => {
    const rule = noClasses()
      .that()
      .resideInAPackage('domain..')
      .should()
      .dependOnClassesThat()
      .resideInAPackage('infrastructure..');

    rule.check();
  });
});
```

---

## 8. Migration Plan (6 Sprints)

### Sprint 1: Domain Layer Foundation
- [ ] Crear entities (Repository, Component)
- [ ] Crear value objects (GitHubUrl, Relationship)
- [ ] Definir repository interfaces
- [ ] Tests unitarios de domain

### Sprint 2: Application Layer
- [ ] Implementar use cases
- [ ] Definir ports (interfaces)
- [ ] Crear DTOs y mappers
- [ ] Tests de integración

### Sprint 3: GitHub Infrastructure
- [ ] Implementar GitHubApiAdapter
- [ ] Crear ACL mappers
- [ ] Tests con mocks

### Sprint 4: Parser Infrastructure
- [ ] Implementar BabelASTAdapter
- [ ] Crear AST ACL
- [ ] Tests con código real

### Sprint 5: Interface Layer
- [ ] Crear AnalysisController
- [ ] Configurar rutas API
- [ ] Implementar DI container
- [ ] Tests E2E

### Sprint 6: Migration & Cleanup
- [ ] Migrar código legacy
- [ ] Eliminar analyzer.ts
- [ ] Performance testing
- [ ] Documentación

---

## 9. Acceptance Criteria

| ID | Criterio |
|----|----------|
| CA-001 | Domain layer tiene 0 dependencias externas |
| CA-002 | Use cases no conocen Octokit ni Babel |
| CA-003 | Tests unitarios cubren 80%+ de domain |
| CA-004 | Architecture tests pasan en CI |
| CA-005 | Tiempo de build no aumenta >20% |
| CA-006 | Funcionalidad legacy preservada |

---

## 10. References

- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design - Eric Evans](https://www.domainlanguage.com/ddd/)
- [Hexagonal Architecture - Alistair Cockburn](https://alistair.cockburn.us/hexagonal-architecture/)

---

**Estado**: Ready for Implementation
**Versión**: 1.0
**Fecha**: 2026-03-03
