# Sistema de Monitoreo de Flota — Metropolitano

Sistema web para monitorear buses, reportes de viaje y seguimiento GPS en tiempo real.

---

## Requisitos previos

| Herramienta | Versión mínima |
|-------------|----------------|
| Node.js | 20.x |
| npm | 9.x |
| PostgreSQL | 16 |
| Angular CLI | 17.x |
| Docker + Docker Compose | Cualquier versión reciente |

---

## Opción A — Levantar con Docker (recomendado)

```bash
# Clonar el repositorio
git clone <url-del-repo>
cd "Preuba tecnica metropolitano"

# Levantar todos los servicios (BD + Backend + Frontend)
docker compose up --build
```

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:4200 |
| Backend API | http://localhost:3000 |
| Swagger | http://localhost:3000/api |

Los datos de prueba se cargan automáticamente al crear la base de datos por primera vez.

---

## Variables de entorno (backend)

Archivo: `backend/.env`

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=metropolitano_db
PORT=3000
```

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | NestJS 10 + TypeScript 5 |
| ORM | TypeORM 0.3 |
| Base de datos | PostgreSQL 16 |
| Frontend | Angular 17 (standalone components) |
| UI Components | PrimeNG 17 (tema lara-light-blue) |
| Estilos | Tailwind CSS 3 |
| Mapas | Leaflet 1.9 |
| Contenedores | Docker + Docker Compose |

---

## Decisiones técnicas y supuestos

### Backend
- **NestJS + TypeORM**: stack definido desde el inicio del proyecto como estándar obligatorio para todos los proyectos Node.js.
- **Respuestas estandarizadas**: todos los endpoints retornan `{ success, statusCode, message, data }` mediante un `TransformInterceptor` global y un `HttpExceptionFilter` global.
- **Soft delete**: los registros nunca se eliminan físicamente. Se usa la columna `eliminado: boolean` para marcar bajas lógicas.
- **Columnas de auditoría**: todas las tablas tienen `usuario_creacion`, `usuario_actualizacion`, `fecha_creacion`, `fecha_actualizacion`, `estado` y `eliminado`.
- **`synchronize: true`**: habilitado en desarrollo para que TypeORM genere las tablas automáticamente. En producción debería desactivarse y usar migraciones.
- **Enum de estados**: se modelaron 6 estados operativos (`DISPONIBLE`, `EN_COLA`, `EN_RUTA`, `FINALIZADO`, `FUERA_DE_SERVICIO`, `EN_MANTENIMIENTO`) para representar el ciclo de vida de un bus.

### Frontend
- **Standalone components**: se usó la arquitectura standalone de Angular 17 (sin NgModules), que es el estándar actual del framework.
- **Estructura feature-first**: `core/` para singletons, `shared/` para componentes reutilizables, `pages/` para vistas de negocio.
- **Leaflet para mapas**: se eligió sobre Google Maps por ser open source y no requerir API key.
- **PrimeNG lara-light-blue**: tema claro seleccionado por legibilidad y contraste con las clases de Tailwind.

### Supuestos
- No existe autenticación. Los campos `usuario_creacion` y `usuario_actualizacion` se envían con valor `1` por defecto (usuario del sistema).
- Las coordenadas GPS del seed corresponden a estaciones ficticias del Metropolitano de Lima.
- La capacidad de todos los buses en el seed es 200 pasajeros.

---

## Uso de IA

Este proyecto fue desarrollado con asistencia de **Claude** (Anthropic), usando **Claude Code** como herramienta principal de desarrollo.

### Estándares predefinidos aplicados por Claude
Claude Code tiene instrucciones configuradas que aplicó de forma sistemática en todo el proyecto:

- **NestJS**: estructura modular obligatoria (`module / controller / service / entity / dto`), respuestas HTTP estandarizadas con interceptor y filtro global.
- **Angular**: estructura `core / shared / features`, uso obligatorio de Tailwind CSS y PrimeNG, standalone components, tipado estricto sin `any`.

### Qué generó Claude
- Entidades TypeORM (`Bus`, `Reporte`, `Seguimiento`, `EstadoBus`)
- DTOs con validaciones (`class-validator`)
- Controladores y servicios NestJS
- `TransformInterceptor` y `HttpExceptionFilter`
- Componentes Angular (dashboard, listados, detalle, mapa)
- Integración Leaflet (`RouteMapComponent`)
- Datos del seed SQL con coordenadas reales del Metropolitano Lima
- Configuración Docker Compose

### Qué decidí yo
- Alcance del MVP: qué entidades modelar y qué endpoints exponer
- Elección de Leaflet sobre otras opciones de mapas (Google)
- Paleta de colores y tema visual (lara-light-blue)
- Los 6 estados operativos del bus y su lógica de transición
- **Estructura final de las tablas**: la definición de columnas, tipos y relaciones se trabajó en conjunto con Claude, pero la decisión final sobre qué incluir y cómo quedaría la tomé yo
