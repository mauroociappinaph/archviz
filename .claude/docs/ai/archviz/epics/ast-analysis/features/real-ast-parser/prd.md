# PRD: Real AST Component Analysis

## 1. Feature Name
**Real AST Component Analysis for Architecture Visualization**

---

## 2. Epic
- **Epic**: AST-001 - Enhanced Code Understanding
- **Architecture**: See `/docs/architecture/ast-analysis-module.md`

---

## 3. Goal

### Problem
Los diagramas de arquitectura generados actualmente se basan únicamente en análisis heurístico de `package.json` y estructura de carpetas. Esto resulta en:
- **Precisión del 60%** - No detecta componentes reales del código
- **Relaciones falsas** - Muestra dependencias que no existen en el código
- **Onboarding ineficiente** - Developers nuevos confían en diagramas imprecisos
- **Documentación desactualizada** - Los diagramas no reflejan el código actual

### Solution
Implementar análisis de **Abstract Syntax Tree (AST)** que:
1. Parsee el código fuente real (TypeScript, TSX, JavaScript, JSX)
2. Detecte componentes, hooks, imports y exports
3. Mapee relaciones reales entre componentes
4. Genere diagramas C4 con datos precisos del código

### Impact
| KPI | Baseline | Target | Impact |
|-----|----------|--------|--------|
| Precisión de diagramas | 60% | 90% | +50% |
| Componentes detectados | ~10 heurísticos | Real (todos) | Exacto |
| Tiempo de onboarding | 5 días | 1 día | -80% |
| Confianza en documentación | 40% | 90% | +125% |
| User adoption (30 días) | N/A | 80% | Alto |

---

## 4. User Personas

### Persona 1: Senior Developer "Alex" 👨‍💻
- **Rol**: Senior Full-Stack Developer
- **Contexto**: Se une a equipo con codebase legacy de 3 años
- **Pain Points**:
  - Documentación desactualizada
  - No entiende dependencias reales entre módulos
  - Pierde tiempo leyendo código en lugar de diagramas
- **Goals**:
  - Entender arquitectura en 1 día, no 1 semana
  - Identificar componentes críticos rápidamente
  - Ver relaciones de import reales
- **Tech**: Usa VS Code, familiarizado con React/TypeScript

### Persona 2: Tech Lead "Maria" 👩‍💼
- **Rol**: Tech Lead de equipo de 8 developers
- **Contexto**: Onboarding constante de nuevos miembros
- **Pain Points**:
  - Crear diagramas de arquitectura manualmente
  - Diagramas se desactualizan rápido
  - Code reviews sin contexto visual
- **Goals**:
  - Diagramas auto-generados en cada PR
  - Métricas de arquitectura para decisiones
  - Exportar documentación automática
- **Tech**: GitHub Actions, Mermaid, Notion

### Persona 3: CTO "Carlos" 💼
- **Rol**: CTO de startup en crecimiento
- **Contexto**: Auditar deuda técnica antes de fundraising
- **Pain Points**:
  - No tiene visibilidad de acoplamiento entre módulos
  - Dependencias externas no controladas
  - Riesgos de arquitectura desconocidos
- **Goals**:
  - Métricas de arquitectura automáticas
  - Identificar dependencias críticas
  - Reportes de deuda técnica
- **Tech**: Dashboards, métricas, reportes

---

## 5. User Stories

### US-001: Detectar Componentes Reales
**Como** Developer Senior
**Quiero** que el sistema detecte componentes reales del código
**Para** ver la arquitectura exacta, no aproximaciones

**Acceptance Criteria**:
```gherkin
Given un repositorio con 20 componentes React
When analizo con AST habilitado
Then veo exactamente 20 nodos en el diagrama
And cada nodo tiene el nombre real del componente
And veo el framework detectado (React, Vue, etc.)
```

### US-002: Mapear Relaciones de Import
**Como** Developer Senior
**Quiero** ver flechas que representen imports reales
**Para** entender dependencias entre componentes

**Acceptance Criteria**:
```gherkin
Given ComponentA importa ComponentB en el código
When genero el diagrama de componentes
Then hay una flecha de ComponentA → ComponentB
And la etiqueta muestra "uses" o "imports"
And no hay relaciones falsas que no existen en código
```

### US-003: Detectar Hooks y Dependencias
**Como** Tech Lead
**Quiero** ver hooks usados por cada componente
**Para** entender la lógica de estado y side effects

**Acceptance Criteria**:
```gherkin
Given un componente usa useState, useEffect, useRouter
When analizo el componente
Then veo los hooks listados en la descripción
And veo las dependencias externas usadas
And puedo filtrar por tipo de hook
```

### US-004: Exportar Métricas de Arquitectura
**Como** CTO
**Quiero** exportar estadísticas en JSON
**Para** integrar en dashboards y reportes

**Acceptance Criteria**:
```gherkin
Given un análisis AST completado
When hago click en "Export Metrics"
Then descargo un archivo metrics.json
And contiene: total componentes, total relaciones, top dependencias
And puedo usar los datos en scripts CI/CD
```

### US-005: Fallback a Análisis Heurístico
**Como** Developer
**Quiero** que si AST falla, use heurísticas
**Para** no perder funcionalidad completa

**Acceptance Criteria**:
```gherkin
Given un repo con código no-parseable
When AST analysis falla
Then automáticamente usa heurísticas
And veo un warning "Using heuristic analysis"
And el diagrama sigue generándose
```

### US-006: Limitar Scope para Performance
**Como** Developer
**Quiero** configurar límite de archivos analizados
**Para** análisis rápido en repos grandes

**Acceptance Criteria**:
```gherkin
Given un repositorio con 500 archivos
When configuro maxFiles = 50
Then solo analiza los 50 primeros
And el análisis completa en <5 segundos
And veo un indicador "Analyzed 50/500 files"
```

---

## 6. Requirements

### Functional Requirements

#### FR-001: Parser Multi-Lenguaje
- Debe parsear TypeScript (.ts, .tsx)
- Debe parsear JavaScript (.js, .jsx)
- Debe soportar JSX y TSX
- Debe manejar syntax moderna (ES2020+)

#### FR-002: Detección de Componentes
- Detectar function components
- Detectar class components
- Detectar arrow function components
- Detectar componentes default export
- Detectar componentes named export

#### FR-003: Detección de Frameworks
- Detectar React (import de 'react')
- Detectar Vue (SFC, composition API)
- Detectar Angular (@Component decorator)
- Detectar Svelte (svelte files)
- Detectar SolidJS
- Mostrar framework en diagrama

#### FR-004: Análisis de Imports
- Detectar imports ES6 (import/from)
- Detectar requires (CommonJS)
- Detectar imports dinámicos
- Distinguir imports locales vs externos
- Mapear import → componente

#### FR-005: Análisis de Hooks
- Detectar hooks de React (useState, useEffect, etc.)
- Detectar custom hooks (use[A-Z]*)
- Listar hooks en descripción de componente
- Detectar uso de context (useContext)

#### FR-006: Relaciones Entre Componentes
- Crear grafo de dependencias
- Detectar "ComponentA usa ComponentB"
- Detectar composición (children)
- Limitar a 3 relaciones por componente en UI

#### FR-007: Generación de Diagramas
- Generar diagramas C4 Component
- Incluir tecnología detectada
- Incluir hooks usados
- Incluir descripción del archivo

#### FR-008: Estadísticas y Métricas
- Total de archivos analizados
- Total de componentes detectados
- Total de hooks encontrados
- Top 10 dependencias externas
- Framework predominante
- Componente más conectado

#### FR-009: Configuración
- Configurar maxFiles (default: 30)
- Configurar timeout (default: 10s)
- Toggle AST vs heurístico
- Excluir carpetas (node_modules, .git, etc.)

### Non-Functional Requirements

#### NFR-001: Performance
- Análisis de 50 archivos: <5 segundos
- Análisis de 100 archivos: <10 segundos
- Timeout configurable (default 30s)
- Lazy loading de parser

#### NFR-002: Escalabilidad
- Limitar archivos analizados (default 50)
- Procesamiento asíncrono
- No bloquear UI durante análisis
- Streaming de resultados

#### NFR-003: Seguridad
- No persistir código analizado
- No enviar código a servicios externos
- Sanitizar outputs antes de renderizar
- Validar URLs antes de fetch

#### NFR-004: Disponibilidad
- Fallback automático a heurísticas
- Graceful degradation
- Mensajes de error claros
- Retry con backoff exponencial

#### NFR-005: Usabilidad
- Indicador de progreso
- Mensaje "Analizando archivo X de Y"
- Warnings visuales para partial analysis
- Tooltips con información extra

#### NFR-006: Mantenibilidad
- Tests unitarios >80% coverage
- Tests de integración para parsers
- Documentación de API
- Changelog actualizado

---

## 7. Acceptance Criteria

### Criterios Generales

| ID | Criterio | Prioridad |
|----|----------|-----------|
| AC-001 | Dado un repo React, cuando analizo, entonces detecta >90% de componentes reales | P0 |
| AC-002 | Dado ComponentA importa ComponentB, cuando genero diagrama, entonces flecha A→B existe | P0 |
| AC-003 | Dado un repo con 30 archivos, cuando analizo, entonces completa en <5s | P0 |
| AC-004 | Dado AST falla, cuando analizo, entonces fallback a heurísticas automáticamente | P1 |
| AC-005 | Dado análisis completo, cuando exporto métricas, entonces JSON válido con estructura definida | P1 |
| AC-006 | Dado hooks en componente, cuando veo diagrama, entonces hooks listados en descripción | P2 |
| AC-007 | Dado repo mixto React/Vue, cuando analizo, entonces detecta framework por componente | P2 |

### Definition of Done
- [ ] Todos los user stories implementados
- [ ] Tests unitarios >80% coverage
- [ ] Tests E2E pasando
- [ ] Documentación técnica completa
- [ ] Code review aprobado
- [ ] Performance validada (benchmarks)
- [ ] Seguridad auditada
- [ ] UX validada con usuarios

---

## 8. Out of Scope

### No Incluido en este Feature

| Item | Razón | Futuro |
|------|-------|--------|
| Análisis de lenguajes no-JS | Fuera del scope inicial | Python, Java, Go v2.0 |
| Análisis de flujo de datos | Complejidad alta | Data flow analysis v2.0 |
| Análisis de coverage | Requiere integración CI | Test coverage v1.5 |
| Análisis de complejidad ciclomática | Lower priority | Code quality metrics v2.0 |
| Análisis de bundle size | Requiere build | Bundle analysis v1.5 |
| Soporte para monorepos grandes | Performance challenge | Incremental analysis v2.0 |
| Análisis de dependencias de tipos | TypeScript compiler API | Type analysis v2.0 |
| Edición manual de diagramas | Scope diferente | Diagram editor v3.0 |
| Colaboración en tiempo real | Infraestructura compleja | Real-time collab v3.0 |
| AI-powered suggestions | Requiere ML | Smart recommendations v2.0 |

### Notas de Scope
- **v1.0**: TypeScript/JavaScript only, repos <100 archivos
- **v1.5**: Monorepo support, Python analysis
- **v2.0**: Multi-lenguaje, data flow, ML insights

---

## 9. Appendix

### A. Métricas de Éxito (KPIs)

| Métrica | Método de Medición | Target |
|---------|-------------------|--------|
| Precisión de componentes | Validación manual vs automática | >90% |
| Precisión de relaciones | Ground truth de repos conocidos | >85% |
| Tiempo de análisis | Benchmark repos de 50 archivos | <5s |
| User satisfaction | Survey NPS | >50 |
| Adoption rate | % users usando AST vs heurístico | >80% |
| Error rate | Logs de fallos AST | <5% |

### B. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Parser falla en syntax experimental | Alta | Medio | Fallback + actualizar Babel |
| Performance lento en repos grandes | Media | Alto | Limitar archivos + caching |
| Falsos positivos en relaciones | Media | Medio | Filtros + thresholds |
| Dependencias de parser obsoletas | Baja | Alto | Dependabot + tests |

### C. Dependencias Técnicas

- `@babel/parser` ^7.x - AST parsing
- `@babel/traverse` ^7.x - AST traversal
- `@babel/types` ^7.x - Type checking
- `octokit` ^5.x - GitHub API

### D. Referencias

- [Babel Parser Docs](https://babeljs.io/docs/babel-parser)
- [AST Explorer](https://astexplorer.net/)
- [C4 Model](https://c4model.com/)
- Clean Architecture - Robert C. Martin

---

**Fecha de creación**: 2026-03-03
**Autor**: Product Manager Senior
**Versión**: 1.0
**Estado**: Draft → Ready for Engineering
