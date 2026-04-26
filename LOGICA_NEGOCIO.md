# Sistema de Monitoreo de Flota - Lógica de Negocio

## Descripción del Problema

Una empresa de transporte público tipo Metropolitano carece de visibilidad en tiempo real de su flota de buses. Los problemas actuales son:

- ❌ Sin visibilidad en tiempo real de la ubicación de buses
- ❌ Sin información de cantidad de pasajeros por unidad
- ❌ Sin capacidad de estimar tiempos de llegada a estaciones
- ❌ Sin seguimiento del estado operativo de la flota

## Objetivo del MVP

Construir una solución funcional que permita:
✅ Registrar y gestionar buses de la flota
✅ Registrar el inicio y fin de viajes por ruta
✅ Trackear la ubicación del bus cada ~5 minutos durante el viaje
✅ Visualizar estado y ocupación de la flota en tiempo real
✅ Reconstruir el recorrido completo de un viaje

---

## Entidades de Datos

### Bus
Representa cada vehículo en la flota.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID/Int | Identificador único del bus |
| `código` | String | Código único del bus (ej: "BUS-001", "M-1234") |
| `capacidad` | Integer | Número máximo de pasajeros |
| `creado_en` | Timestamp | Cuándo se registró el bus |

---

### Reporte

Representa el ciclo completo de un bus en una ruta: desde que el conductor inicia el servicio hasta que lo finaliza.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID/Int | Identificador único del reporte |
| `bus_id` | FK → Bus | Bus que realizó el recorrido |
| `cantidad_pasajeros` | Integer | Pasajeros al momento del inicio |
| `estado_bus_id` | FK → EstadoBus | Último estado registrado del bus en este reporte |
| `latitud_inicio` | Float | Coordenada donde inició el reporte |
| `longitud_inicio` | Float | Coordenada donde inició el reporte |
| `latitud_fin` | Float | Coordenada donde finalizó (se llena al completar) |
| `longitud_fin` | Float | Coordenada donde finalizó (se llena al completar) |
| `inicio_en` | Timestamp | Cuándo inició el reporte |
| `fin_en` | Timestamp | Cuándo finalizó (se llena al completar) |

> `estado_bus_id` apunta al registro más reciente de `EstadoBus` para ese bus. Cuando el conductor actualiza el estado (ej: EN_RUTA → COMPLETADO), se crea un nuevo registro en `EstadoBus` y se actualiza esta FK.
>
> Un bus solo puede tener un reporte activo (estado EN_RUTA o EN_COLA) a la vez.

---

### Seguimiento

Registro periódico de ubicación del bus durante un viaje activo. Se genera aproximadamente cada 5 minutos. Permite reconstruir el recorrido completo.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID/Int | Identificador único del registro |
| `viaje_id` | FK → Reporte | Reporte al que pertenece este punto |
| `latitud` | Float | Coordenada de ubicación |
| `longitud` | Float | Coordenada de ubicación |
| `creado_en` | Timestamp | Cuándo se registró esta ubicación |

> Con todos los registros de `Seguimiento` de un viaje ordenados por `creado_en`, se puede reconstruir el trayecto completo del bus.

---

### EstadoBus

Historial de cambios de estado de cada bus a lo largo del tiempo. Cada fila representa el momento exacto en que el bus cambió de estado. El estado actual del bus es siempre el registro más reciente.

Permite visualizar, por ejemplo, una línea de tiempo del día: cuánto tiempo estuvo en cola, en ruta, o fuera de servicio.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID/Int | Identificador único del registro |
| `bus_id` | FK → Bus | Bus al que pertenece el estado |
| `estado` | Enum | Estado registrado (ver tabla abajo) |
| `creado_en` | Timestamp | Cuándo entró en este estado |

**Estados posibles:**

| Estado | Descripción |
| ------ | ----------- |
| `DISPONIBLE` | Bus operativo, sin actividad activa |
| `EN_COLA` | Bus en terminal esperando para recoger pasajeros |
| `EN_RUTA` | Bus circulando activamente en su recorrido |
| `FUERA_DE_SERVICIO` | Bus no disponible por avería o incidente |
| `EN_MANTENIMIENTO` | Bus en taller por mantenimiento programado |

> El estado actual del bus = último registro `EstadoBus` de ese bus ordenado por `creado_en DESC`.
>
> Con todos los registros del día ordenados por `creado_en` se puede construir una línea de tiempo visual del comportamiento del bus durante la jornada.

---

## Relaciones entre Entidades

```
BUS (1) ──────────── (N) VIAJE (1) ──────────── (N) SEGUIMIENTO
    │    un bus              un viaje tiene
    │    tiene muchos        muchos puntos de
    │    viajes              ubicación
    │
    └─────────────── (N) ESTADO_BUS
         un bus tiene
         muchos registros
         de estado (log)
```

---

## Flujos de Negocio

### 1. Registro de Bus
**Actor:** Administrador del sistema
**Objetivo:** Agregar un nuevo bus a la flota

```
1. Admin envía POST /buses con: código, capacidad
2. Sistema valida que el código sea único
3. Sistema crea registro en BD
4. Retorna el bus creado con su ID
5. Bus queda disponible para iniciar viajes
```

---

### 2. Inicio de Reporte

**Actor:** Conductor (desde dispositivo/app en el bus)
**Objetivo:** Registrar el inicio de servicio en una ruta

```
1. Conductor envía POST /viajes con: bus_id, latitud, longitud, cantidad_pasajeros
2. Sistema valida que el bus exista y no tenga un viaje EN_CURSO activo
3. Sistema crea Reporte con estado = EN_CURSO, registra latitud/longitud de inicio
4. Retorna el viaje creado con su ID
5. A partir de este momento, el sistema comienza a recibir registros de Seguimiento
```

---

### 3. Registro Periódico de Ubicación (Seguimiento)

**Actor:** Dispositivo GPS del bus (automático cada ~5 minutos)
**Objetivo:** Trazar el recorrido del bus durante el viaje

```
1. GPS envía POST /seguimientos con: viaje_id, latitud, longitud
2. Sistema valida que el viaje exista y esté EN_CURSO
3. Sistema crea registro en tabla Seguimiento con timestamp actual
4. Retorna confirmación
5. Se repite cada ~5 minutos mientras el viaje esté activo
```

---

### 4. Finalización de Reporte

**Actor:** Conductor (desde dispositivo/app en el bus)
**Objetivo:** Marcar el viaje como completado al llegar al destino

```
1. Conductor envía PATCH /viajes/{id}/completar con: latitud, longitud
2. Sistema valida que el viaje esté EN_CURSO
3. Sistema actualiza Reporte:
   - estado = COMPLETADO
   - latitud_fin / longitud_fin = coordenada actual
   - fin_en = timestamp actual
4. Retorna el viaje actualizado
5. Bus queda disponible para iniciar un nuevo viaje
```

---

### 5. Visualización de Flota
**Actor:** Operador / Supervisor
**Objetivo:** Ver estado actual de todos los buses

```
1. Frontend solicita GET /buses con sus últimos viajes
2. Sistema retorna lista de buses con:
   - Último viaje activo (EN_CURSO) si existe
   - Ubicación del último seguimiento
   - Cantidad de pasajeros
   - Porcentaje de ocupación (pasajeros / capacidad)
   - Timestamp del último seguimiento
3. Frontend renderiza interfaz visual
4. Operador puede tomar decisiones (desvíos, reasignaciones, etc.)
```

---

### 6. Reconstrucción de Recorrido

**Actor:** Analista / Supervisor
**Objetivo:** Ver el trayecto completo que hizo un bus en un viaje

```
1. Usuario solicita GET /viajes/{id}/seguimientos
2. Sistema retorna lista de puntos de Seguimiento ordenados por creado_en
3. Frontend puede graficar o listar la secuencia de coordenadas
4. Permite auditar rutas, tiempos entre paradas, etc.
```

---

## Requisitos Funcionales

### RF1: Gestión de Buses
- [ ] Crear bus (POST /buses)
- [ ] Listar todos los buses (GET /buses)
- [ ] Obtener detalle de un bus (GET /buses/{id})
- [ ] Actualizar información de bus (PUT /buses/{id})
- [ ] Eliminar bus (DELETE /buses/{id})

### RF2: Gestión de Reportes

- [ ] Iniciar viaje (POST /viajes)
- [ ] Listar viajes de un bus (GET /buses/{id}/viajes)
- [ ] Completar viaje (PATCH /viajes/{id}/completar)
- [ ] Obtener detalle de un viaje (GET /viajes/{id})
- [ ] Validar que un bus no tenga dos viajes EN_CURSO simultáneos

### RF3: Seguimiento de Ubicación

- [ ] Registrar punto de seguimiento (POST /seguimientos)
- [ ] Obtener todos los puntos de un viaje (GET /viajes/{id}/seguimientos)
- [ ] Validar que el viaje esté EN_CURSO antes de aceptar seguimientos
- [ ] Ordenar puntos por timestamp para reconstruir recorrido

### RF4: Visualización
- [ ] Mostrar lista de buses con estado actual
- [ ] Mostrar último punto de seguimiento de cada bus
- [ ] Mostrar ocupación (cantidad_pasajeros / capacidad)
- [ ] Mostrar estado del viaje activo (EN_CURSO / COMPLETADO)
- [ ] Indicador visual de ocupación (colores: bajo, medio, alto)

### RF5: Datos Simulados

- [ ] Simular inicio de viaje para pruebas
- [ ] Simular registros de seguimiento cada 5 minutos
- [ ] Simular finalización de viaje

---


## Diagrama de Flujo del Ciclo de Vida de un Reporte

```
CONDUCTOR                    SISTEMA                        BD
   │                            │                            │
   │── POST /viajes ────────────▶│                            │
   │   (bus_id, lat, lng,        │── Valida bus sin viaje ──▶ │
   │    cantidad_pasajeros)      │   EN_CURSO activo          │
   │                            │── INSERT Reporte ───────────▶ │
   │◀── viaje_id ───────────────│   estado=EN_CURSO           │
   │                            │                            │
   │         [cada 5 min]       │                            │
   │── POST /seguimientos ──────▶│                            │
   │   (viaje_id, lat, lng)      │── Valida viaje EN_CURSO ──▶ │
   │                            │── INSERT Seguimiento ─────▶ │
   │◀── confirmación ───────────│                            │
   │                            │                            │
   │         [repetir N veces]  │                            │
   │                            │                            │
   │── PATCH /viajes/{id}       │                            │
   │   /completar ─────────────▶│                            │
   │   (lat_fin, lng_fin)        │── UPDATE Reporte ───────────▶ │
   │                            │   estado=COMPLETADO        │
   │◀── viaje completado ───────│   latitud/longitud_fin     │
   │                            │   fin_en = now()           │
```

---

## Diagrama de Relaciones de BD

```
┌──────────────────┐       ┌──────────────────────────────────┐
│      BUSES       │       │             VIAJES               │
├──────────────────┤       ├──────────────────────────────────┤
│ id               │──1──N─│ id                               │
│ código           │       │ bus_id (FK)                      │
│ capacidad        │       │ cantidad_pasajeros               │
│ creado_en        │       │ estado (EN_CURSO/COMPLETADO)     │
└──────────────────┘       │ latitud_inicio / longitud_inicio │
                           │ latitud_fin / longitud_fin       │
                           │ inicio_en                        │
                           │ fin_en                           │
                           └──────────────┬───────────────────┘
                                          │ 1
                                          │
                                          N
                           ┌──────────────────────────────────┐
                           │          SEGUIMIENTOS            │
                           ├──────────────────────────────────┤
                           │ id                               │
                           │ viaje_id (FK)                    │
                           │ latitud                          │
                           │ longitud                         │
                           │ creado_en                        │
                           └──────────────────────────────────┘
```

---

