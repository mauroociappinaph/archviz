# Plan de Implementación - Sistema de Logging (ILoggerPort)

## Resumen
Reemplazar `console.warn` en `AnalyzeRepositoryUseCase` con un logger inyectado siguiendo Clean Architecture.

---

## Fases

### Fase 1: Crear Port (Interface)
**Archivo**: `src/application/ports/ILoggerPort.ts`

```typescript
export interface ILoggerPort {
  debug(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
}
```

### Fase 2: Crear Implementaciones (Adapters)

**Archivo**: `src/infrastructure/logging/ConsoleLoggerAdapter.ts`
```typescript
// Implementación usando console para desarrollo/producción
export class ConsoleLoggerAdapter implements ILoggerPort {
  debug(message: string, meta?: Record<string, unknown>): void {
    console.debug(`[DEBUG] ${message}`, meta || '');
  }
  info(message: string, meta?: Record<string, unknown>): void {
    console.info(`[INFO] ${message}`, meta || '');
  }
  warn(message: string, meta?: Record<string, unknown>): void {
    console.warn(`[WARN] ${message}`, meta || '');
  }
  error(message: string, meta?: Record<string, unknown>): void {
    console.error(`[ERROR] ${message}`, meta || '');
  }
}
```

**Archivo**: `src/infrastructure/logging/NoOpLoggerAdapter.ts`
```typescript
// Implementación no-op para tests (silencia logs)
export class NoOpLoggerAdapter implements ILoggerPort {
  debug(): void {}
  info(): void {}
  warn(): void {}
  error(): void {}
}
```

### Fase 3: Actualizar Container
**Archivo**: `src/infrastructure/config/Container.ts`
- Agregar logger como dependencia
- Registrar implementación por defecto (ConsoleLoggerAdapter)

### Fase 4: Modificar Use Case
**Archivo**: `src/application/analysis/AnalyzeRepositoryUseCase.ts`
- Inyectar `ILoggerPort` en constructor
- Reemplazar `console.warn` con `this.logger.warn()`
- Agregar logging adicional para trazabilidad

**Líneas a modificar**:
- Línea 130: `console.warn` en catch de análisis de archivos
- Líneas 166-175: Loop de detección de relaciones
- Líneas 206-209: Error en detección de relaciones
- Línea 224: Error en extracción de componentes

### Fase 5: Actualizar Tests
**Archivo**: `src/application/analysis/__tests__/AnalyzeRepositoryUseCase.test.ts`
- Usar `NoOpLoggerAdapter` en tests para silenciar logs
- Verificar que el logger es llamado con los parámetros correctos (opcional)

---

## Beneficios

1. **Testabilidad**: Tests sin ruido de console output
2. **Flexibilidad**: Fácil cambiar implementación (Winston, Pino, etc.)
3. **Clean Architecture**: Dependencia de abstracción, no implementación
4. **Observabilidad**: Base para agregar métricas y tracing
5. **Producción**: Poder desactivar logs de debug en producción

---

## Archivos a Modificar/Crear

### Nuevos Archivos
- `src/application/ports/ILoggerPort.ts`
- `src/infrastructure/logging/ConsoleLoggerAdapter.ts`
- `src/infrastructure/logging/NoOpLoggerAdapter.ts`

### Archivos a Modificar
- `src/infrastructure/config/Container.ts`
- `src/application/analysis/AnalyzeRepositoryUseCase.ts`
- `src/application/analysis/__tests__/AnalyzeRepositoryUseCase.test.ts`

### Archivos a Actualizar (exports)
- `src/application/index.ts`
- `src/infrastructure/index.ts`

---

## Criterios de Aceptación

- [ ] Todos los tests pasan (189/189)
- [ ] No hay `console.warn` en el use case
- [ ] Coverage mantiene >90%
- [ ] Build exitoso
- [ ] Logs funcionan en desarrollo
- [ ] Tests corren sin output de logs
