# Git Strategy - ArchViz Project
## Clean Architecture Refactor

---

## Branching Model: Git Flow

```
main (production)
  ↑
develop (integration)
  ↑
feature/AST-*** (sprints)
```

---

## Branches Creadas

### Ramas Principales

| Branch | Propósito | Protección |
|--------|-----------|------------|
| `main` | Código en producción | ✅ Require PR |
| `develop` | Integración continua | ✅ Require PR |

### Ramas de Feature (6 Sprints)

| Branch | Sprint | Contenido | Base |
|--------|--------|-----------|------|
| `feature/AST-001-domain-layer` | Sprint 1 | Entities, Value Objects, Repository interfaces | develop |
| `feature/AST-002-application-layer` | Sprint 2 | Use Cases, Ports, DTOs | develop |
| `feature/AST-003-github-infrastructure` | Sprint 3 | GitHubApiAdapter, ACL mappers | develop |
| `feature/AST-004-parser-infrastructure` | Sprint 4 | BabelASTAdapter, AST ACL | develop |
| `feature/AST-005-interface-layer` | Sprint 5 | Controllers, DI container | develop |
| `feature/AST-006-migration-cleanup` | Sprint 6 | Migration, cleanup, tests | develop |

---

## Workflow por Sprint

### 1. Inicio de Sprint

```bash
# Asegurarse de estar en develop actualizado
git checkout develop
git pull origin develop

# Crear feature branch desde develop
git checkout -b feature/AST-XXX-nombre-del-sprint

# Push al remoto
git push -u origin feature/AST-XXX-nombre-del-sprint
```

### 2. Durante el Sprint

```bash
# Commit frecuentes con conventional commits
git add .
git commit -m "feat(domain): add Repository entity

- Implement Repository aggregate root
- Add addComponent method
- Add getMetrics calculation"

# Push diario
git push origin feature/AST-XXX-nombre-del-sprint
```

### 3. Fin de Sprint - Pull Request

```bash
# Asegurar tests pasan
npm test
npm run build

# Crear PR a develop
gh pr create --base develop --title "feat(AST-XXX): Sprint X - Domain Layer"
```

**PR Template:**
```markdown
## Sprint X: [Nombre del Sprint]

### Cambios
- [ ] Feature implementada
- [ ] Tests unitarios >80%
- [ ] Tests de integración
- [ ] Documentación actualizada

### Cómo probar
1. `npm install`
2. `npm run test`
3. `npm run build`

### Breaking Changes
- [ ] Ninguno
- [ ] Listar si hay

### Checklist
- [ ] Code review aprobado
- [ ] CI/CD verde
- [ ] No hay secrets en código
```

### 4. Merge a Develop

```bash
# Usar squash merge para mantener historial limpio
git checkout develop
git merge --squash feature/AST-XXX-nombre-del-sprint
git commit -m "feat(AST-XXX): complete sprint X"
git push origin develop

# Opcional: Borrar feature branch
git branch -d feature/AST-XXX-nombre-del-sprint
git push origin --delete feature/AST-XXX-nombre-del-sprint
```

### 5. Release a Main

Al completar los 6 sprints:

```bash
# Crear PR de develop a main
git checkout main
git pull origin main
git merge develop

# Tag de versión
git tag -a v2.0.0 -m "Clean Architecture Refactor Complete"
git push origin main --tags
```

---

## Conventional Commits

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | Uso | Ejemplo |
|------|-----|---------|
| `feat` | Nueva feature | `feat(domain): add Repository entity` |
| `fix` | Bug fix | `fix(adapter): handle null response` |
| `docs` | Documentación | `docs(readme): update architecture diagram` |
| `test` | Tests | `test(domain): add Repository unit tests` |
| `refactor` | Refactor | `refactor(usecase): simplify error handling` |
| `chore` | Mantenimiento | `chore(deps): update babel packages` |

### Scopes

- `domain` - Domain layer
- `application` - Application layer
- `infrastructure` - Infrastructure layer
- `interface` - Interface layer
- `api` - GitHub API adapter
- `parser` - AST parser adapter
- `test` - Tests
- `docs` - Documentación

---

## Protección de Ramas

### Main
```yaml
- Require pull request reviews: 1
- Require status checks: [build, test]
- Include administrators: false
- Allow force pushes: false
- Allow deletions: false
```

### Develop
```yaml
- Require pull request reviews: 1
- Require status checks: [build, test]
- Include administrators: true
- Allow force pushes: false
- Allow deletions: false
```

---

## Estrategia de Merge

### Squash Merge para Features → Develop
- Mantiene historial de develop limpio
- 1 commit por feature
- Mensaje descriptivo del sprint

### Merge Commit para Develop → Main
- Preserva historial completo en main
- Tag de versión asociado

---

## Hotfixes

Para bugs críticos en producción:

```bash
# Crear hotfix desde main
git checkout main
git checkout -b hotfix/critical-bug-fix

# Fix + commit
git commit -m "fix(domain): correct null pointer exception"

# Merge a main y develop
git checkout main
git merge hotfix/critical-bug-fix
git push origin main

git checkout develop
git merge hotfix/critical-bug-fix
git push origin develop
```

---

## CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop, feature/*]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
      - name: Install
        run: npm ci
      - name: Lint
        run: npm run lint
      - name: Test
        run: npm run test:coverage
      - name: Build
        run: npm run build

  deploy-preview:
    if: github.ref != 'refs/heads/main'
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy Preview
        run: vercel --preview

  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy Production
        run: vercel --prod
```

---

## Comandos Rápidos

```bash
# Ver estado de todas las ramas
git branch -v

# Ver diff entre develop y main
git diff main..develop

# Ver commits no mergeados
git log main..develop --oneline

# Push forzado (solo feature branches)
git push origin feature/xxx --force-with-lease

# Rebase de feature sobre develop
git checkout feature/xxx
git rebase develop
```

---

## Contacto

**Tech Lead**: [Tu nombre]
**Equipo**: [Nombre del equipo]
**Slack**: #archviz-dev

---

**Fecha**: 2026-03-03
**Versión**: 1.0
