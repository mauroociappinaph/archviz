# 🚀 Plan de Refactorización - ArchViz

## Resumen

Este documento detalla el plan para implementar las 3 mejoras principales:
1. **Completar migración** - Eliminar código legacy
2. **Mejorar coverage** - Tests unitarios
3. **Optimizar performance** - Caching

---

## 📋 FASE 1: Completar Migración (Eliminar Código Legacy) ✅ PARCIAL

### 1.1 Preparación ✅
- [x] Ejecutar tests E2E actuales para establecer baseline
- [x] Verificar que `/api/analyze/new` funciona correctamente
- [x] Build exitoso con nueva arquitectura

### 1.2 Migrar Servicios ✅
- [x] Actualizar `analysisService.ts` para usar `/api/analyze/new`
- [x] Crear adapter para compatibilidad de tipos entre legacy y Clean Architecture
- [x] Diagrams integrados en DTO y use case

### 1.3 Consolidar Diagramas ✅
- [x] Crear `DiagramGeneratorService` en `src/application/services/`
- [x] Migrar lógica de `lib/diagrams.ts` a Clean Architecture
- [x] Integrar generación de C4 diagrams en el use case

### 1.4 Eliminar Legacy (✅ Completado - Fase 1B)
- [x] ~~Mover `/api/analyze` a `/api/analyze/legacy` (backup)~~ - No aplica, `/api/analyze` ya usa Clean Architecture
- [x] ~~Renombrar `/api/analyze/new` a `/api/analyze`~~ - No aplica, no existe `/api/analyze/new`
- [x] Eliminar archivos legacy - Ya limpio
  - ~~`lib/analyzer.ts`~~ - Eliminado
  - ~~`lib/diagrams.ts`~~ - Eliminado
  - ~~`lib/services/astAnalysisService.ts`~~ - Eliminado
- [x] ~~Eliminar código AST duplicado en `lib/ast/`~~ - Ya limpio

### 1.5 Testing de Migración ✅
- [x] Verificar que todos los tests pasan (103/103)
- [x] Build exitoso sin errores
- [x] Jest config actualizado (eliminada referencia a `lib/`)
- [ ] Validar análisis con repositorios reales (requiere deploy)

---

### ✅ FASE 1 COMPLETADA - MIGRACIÓN FINALIZADA

#### Estado Actual:
- ✅ Build: Exitoso
- ✅ Tests: 103/103 pasando
- ✅ TypeScript: Sin errores
- ✅ Jest: Configuración actualizada
- ✅ Legacy: Código eliminado
- ✅ API: `/api/analyze` usa Clean Architecture directamente

#### Archivos Eliminados/Limpiados:
- ~~`lib/analyzer.ts`~~ - Eliminado
- ~~`lib/diagrams.ts`~~ - Eliminado
- ~~`lib/ast/`~~ - Directorio eliminado
- ~~`lib/services/astAnalysisService.ts`~~ - Eliminado

#### Archivos Actualizados:
1. `jest.config.js` - Eliminada referencia a `lib/`
2. `REFACTORING_PLAN.md` - Actualizado estado

#### Arquitectura Actual:
```
src/
├── domain/          # ✅ Completo con tests
├── application/     # ✅ Completo
├── infrastructure/  # ✅ Completo
├── interface/       # ✅ Completo
└── lib/             # ✅ Solo utilidades necesarias
    ├── utils.ts     # Utilidades Tailwind
    ├── types/       # Tipos del frontend
    ├── services/    # analysisService.ts
    ├── export/      # Export PNG/PDF
    └── utils/       # Validación URL
```

### ✅ FASE 1B COMPLETADA - Legacy Eliminado

La migración está **completa**. No hay código legacy pendiente.

**Próxima Fase:** Fase 2 - Mejorar Coverage de Tests (>80%)

---

## 🧪 FASE 2: Mejorar Coverage de Tests

### 2.1 Tests Unitarios - Domain Layer

#### Repository Entity
```typescript
// src/domain/analysis/__tests__/Repository.test.ts
- [ ] Crear Repository con datos válidos
- [ ] Validar que lanza error con nombre vacío
- [ ] Agregar componentes y verificar
- [ ] Agregar relaciones sin duplicados
- [ ] Calcular métricas correctamente
- [ ] Detectar componente más conectado
- [ ] Verificar stale detection
- [ ] Comparar igualdad de repositorios
```

#### Value Objects
```typescript
// src/domain/analysis/__tests__/GitHubUrl.test.ts
- [ ] Validar URLs correctas
- [ ] Rechazar URLs inválidas
- [ ] Extraer owner y repo
- [ ] Normalizar URLs

// src/domain/analysis/__tests__/ComponentId.test.ts
- [ ] Generar IDs únicos
- [ ] Crear desde string
- [ ] Validar formato UUID
```

#### Framework Detection
```typescript
// src/domain/analysis/__tests__/Framework.test.ts
- [ ] Detectar React
- [ ] Detectar Vue
- [ ] Detectar Angular
- [ ] Detectar Svelte
- [ ] Detectar framework predominante
```

### 2.2 Tests Unitarios - Application Layer

#### AnalyzeRepositoryUseCase
```typescript
// src/application/analysis/__tests__/AnalyzeRepositoryUseCase.test.ts
- [ ] Ejecutar análisis exitoso
- [ ] Manejar repositorio no encontrado
- [ ] Respetar límite de archivos
- [ ] Forzar refresh ignorando cache
- [ ] Parsear archivos TypeScript
- [ ] Detectar relaciones entre componentes
- [ ] Manejar errores de parsing gracefully
- [ ] Usar cache cuando está disponible
```

#### GetComponentRelationshipsUseCase
```typescript
// src/application/analysis/__tests__/GetComponentRelationshipsUseCase.test.ts
- [ ] Obtener relaciones de un componente
- [ ] Manejar componente no encontrado
- [ ] Manejar repositorio no encontrado
```

#### ExportMetricsUseCase
```typescript
// src/application/analysis/__tests__/ExportMetricsUseCase.test.ts
- [ ] Exportar en formato JSON
- [ ] Exportar en formato CSV
- [ ] Exportar en formato Markdown
- [ ] Manejar repositorio sin componentes
```

### 2.3 Tests de Integración

#### GitHubApiAdapter
```typescript
// src/infrastructure/github/__tests__/GitHubApiAdapter.test.ts
- [ ] Traer archivos fuente
- [ ] Manejar rate limiting
- [ ] Validar repositorio existe
- [ ] Obtener contenido de archivo
- [ ] Manejar directorios excluidos
```

#### BabelASTAdapter
```typescript
// src/infrastructure/parser/__tests__/BabelASTAdapter.test.ts
- [ ] Parsear TypeScript
- [ ] Parsear TSX con JSX
- [ ] Extraer componentes
- [ ] Extraer hooks
- [ ] Extraer imports
- [ ] Manejar syntax errors
```

#### InMemoryAnalysisRepository
```typescript
// src/infrastructure/persistence/__tests__/InMemoryAnalysisRepository.test.ts
- [ ] Guardar repositorio
- [ ] Buscar por URL
- [ ] Buscar por ID
- [ ] Listar todos
- [ ] Eliminar repositorio
```

### 2.4 Tests de Infrastructure

#### AnalysisController
```typescript
// src/interface/http/__tests__/AnalysisController.test.ts
- [ ] Analizar repositorio exitosamente
- [ ] Manejar URL inválida
- [ ] Manejar error de validación
- [ ] Obtener relaciones de componente
- [ ] Exportar métricas
```

### 2.5 Configuración de Tests
- [ ] Actualizar `jest.config.js` para incluir `src/`
- [ ] Crear mocks para Octokit
- [ ] Crear fixtures de código de ejemplo
- [ ] Configurar coverage thresholds (80%)

---

## ⚡ FASE 3: Optimizar Performance con Caching

### 3.1 Estrategia de Caching

#### Opciones Consideradas:
| Opción | Pros | Contras |
|--------|------|---------|
| **SQLite** | Persistente, queryable, ligero | Requiere schema |
| **Redis** | Muy rápido, TTL nativo | Requiere servidor |
| **Memory + Disk** | Simple, offline | Manual sync |
| **Vercel KV** | Serverless, escalable | Vendor lock-in |

**Decisión**: Implementar SQLite para desarrollo local + Redis para producción

### 3.2 Implementación SQLite (Desarrollo)

#### Schema
```sql
-- migrations/001_create_analysis_cache.sql
CREATE TABLE IF NOT EXISTS analysis_cache (
    id TEXT PRIMARY KEY,
    url TEXT UNIQUE NOT NULL,
    owner TEXT NOT NULL,
    repo TEXT NOT NULL,
    data JSON NOT NULL,
    metrics JSON,
    analyzed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    file_count INTEGER,
    framework TEXT
);

CREATE INDEX IF NOT EXISTS idx_url ON analysis_cache(url);
CREATE INDEX IF NOT EXISTS idx_expires ON analysis_cache(expires_at);
```

#### Implementation Tasks
- [ ] Crear `SQLiteAnalysisRepository` en `src/infrastructure/persistence/`
- [ ] Implementar interface `IAnalysisRepository`
- [ ] Agregar método `isStale()` basado en TTL
- [ ] Agregar migración automática
- [ ] Implementar cleanup de entradas expiradas

### 3.3 Implementación Redis (Producción)

#### Configuration
```typescript
// src/infrastructure/config/RedisConfig.ts
- [ ] Configurar Redis client
- [ ] Implementar connection pooling
- [ ] Configurar retry strategy
- [ ] Implementar circuit breaker
```

#### Implementation
- [ ] Crear `RedisAnalysisRepository`
- [ ] Serializar/deserializar datos
- [ ] Configurar TTL por default (24 horas)
- [ ] Implementar key namespacing

### 3.4 Cache Invalidation Strategy

```typescript
// Invalidación inteligente
- [ ] Invalidar por URL cuando se fuerza refresh
- [ ] Invalidar por patrón cuando cambia configuración
- [ ] TTL automático: 24 horas por default
- [ ] Stale-while-revalidate: servir cache antiguo mientras se actualiza
```

### 3.5 Optimizaciones Adicionales

#### Análisis Incremental
- [ ] Detectar archivos modificados desde último análisis
- [ ] Reutilizar resultados de archivos sin cambios
- [ ] Implementar checksum por archivo

#### Parallel Processing
- [ ] Procesar archivos en batches paralelos
- [ ] Limitar concurrencia (max 5 requests simultáneos)
- [ ] Implementar p-queue para control de rate

#### Result Compression
- [ ] Comprimir datos antes de guardar en cache
- [ ] Usar lz-string para JSON grande
- [ ] Descomprimir on-demand

### 3.6 Monitoring

```typescript
// Métricas a trackear
- [ ] Cache hit rate
- [ ] Cache miss rate
- [ ] Average cache read time
- [ ] Average cache write time
- [ ] TTL expiration rate
- [ ] Cache size (cantidad de entries)
```

---

## 📊 Cronograma de Implementación

### Semana 1: Migración
```
Día 1-2: Preparación y validación de nueva API
Día 3-4: Migrar servicios y tipos
Día 5-6: Consolidar diagramas y eliminar legacy
Día 7: Testing y validación
```

### Semana 2: Tests
```
Día 1-2: Tests Domain Layer
Día 3-4: Tests Application Layer
Día 5: Tests Infrastructure Layer
Día 6-7: Integration tests y coverage
```

### Semana 3: Performance
```
Día 1-2: Implementar SQLite caching
Día 3-4: Implementar Redis + fallback
Día 5: Optimizaciones adicionales
Día 6-7: Benchmarking y ajustes
```

---

## 🎯 Success Criteria

### Migración
- [ ] 0 archivos legacy en producción
- [ ] 100% tests E2E pasando
- [ ] Performance igual o mejor

### Testing
- [ ] >80% coverage global
- [ ] >90% coverage domain layer
- [ ] >85% coverage application layer
- [ ] Todos los use cases testeados

### Performance
- [ ] Cache hit rate >70%
- [ ] Tiempo de análisis cacheado <100ms
- [ ] Tiempo de análisis fresco <5s (50 archivos)
- [ ] 0 timeouts en repos medianos

---

## 📝 Checklist de Implementación

### Pre-requisitos
- [ ] Backup de código actual
- [ ] Crear branch `feature/refactor-v2`
- [ ] Instalar dependencias nuevas (sqlite3, ioredis)

### Ejecución
- [ ] Completar FASE 1
- [ ] Completar FASE 2
- [ ] Completar FASE 3

### Post-implementación
- [ ] Code review
- [ ] Documentar cambios en CHANGELOG
- [ ] Actualizar README
- [ ] Merge a main
- [ ] Deploy a producción

---

## 🆘 Rollback Plan

Si algo sale mal:
1. Revertir a commit anterior: `git revert HEAD~N`
2. Restaurar legacy files desde backup
3. Redeploy inmediato
4. Investigar issue en staging

---

**Fecha de inicio**: TBD
**Estimación total**: 3 semanas
**Riesgo**: Medio (mitigado con tests y backups)
