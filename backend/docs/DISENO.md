# Diseño del software de gestión TelecomHub — Modelo de datos

Evidencia **GA7-220501096-AA5-EV03** — Diseño y desarrollo de servicios web.

Este documento complementa la [documentación de los servicios](./API.md) con el
diseño: qué información maneja el software, cómo se relacionan los módulos y
por qué se tomaron esas decisiones.

---

## 1. Características del software que guía el diseño

El proyecto TelecomHub administra un operador de internet. La pantalla de
administración está dividida en nueve módulos, y **cada módulo corresponde a un
grupo de servicios web** de la API:

| Módulo de la pantalla | Servicios web que lo soportan |
|---|---|
| Dashboard | `/api/dashboard` |
| Clientes | `/api/clientes` |
| Planes de Servicio | `/api/planes` |
| Contratos | `/api/contratos` |
| Facturas | `/api/facturas` |
| Pagos | `/api/pagos` |
| Vendedores | `/api/vendedores` |
| Soporte | `/api/soporte` |
| Administración | `/api/usuarios` |
| Autenticación | `/api/auth` |

De ahí se derivan tres características que la API debe cumplir:

1. **Integridad referencial.** Un cliente tiene un plan, un contrato relaciona
   cliente + plan + vendedor, y la factura y el pago cuelgan del contrato. No
   puede haber una factura de un contrato inexistente ni un pago de una factura
   que no existe.
2. **Trazabilidad del dinero.** El valor de la factura se congela al emitirla,
   y registrar un pago cambia el estado de la factura en la misma operación.
3. **Control por perfil.** No todas las personas que usan el software pueden
   hacer lo mismo: el Supervisor comercial no debe eliminar clientes y el
   Soporte Técnico solo gestiona tickets y cobros.

---

## 2. Entidades del modelo

### 2.1 Usuario

| Campo | Tipo | Regla |
|---|---|---|
| `id` | Entero | Consecutivo autogenerado |
| `nombre` | Texto | 3 a 50 caracteres, solo letras y espacios |
| `username` | Texto | 4 a 30 caracteres, único, en minúsculas |
| `passwordHash` | Texto | Hash `bcrypt`; nunca se expone en una respuesta |
| `rol` | Texto | `Administrador`, `Supervisor`, `Soporte Técnico` |
| `estado` | Texto | `Activo` / `Inactivo` |
| `creadoEn` | Texto | Fecha y hora ISO de creación |

Relación: un usuario opera el sistema. No tiene datos del negocio; los clientes
finales son la entidad `Cliente`.

### 2.2 Plan de servicio

| Campo | Tipo | Regla |
|---|---|---|
| `id` | Entero | Consecutivo autogenerado |
| `nombre` | Texto | 3 a 40 caracteres, único |
| `velocidad` | Entero | 1 a 2000 Mbps |
| `precio` | Número | 1 a 5.000.000 (valor mensual) |
| `tipo` | Texto | `Fibra`, `Banda Ancha`, `Cable`, `Inalámbrico` |
| `estado` | Texto | `Activo` / `Inactivo` |

Relaciones: `1..N` **Cliente** (cada cliente tiene un plan) y `1..N` **Contrato**.

### 2.3 Cliente

| Campo | Tipo | Regla |
|---|---|---|
| `id` | Entero | Consecutivo autogenerado |
| `nombre` | Texto | 3 a 50 caracteres, solo letras y espacios |
| `cedula` | Texto | 6 a 10 dígitos, **único** |
| `telefono` | Texto | Formato `+57 300 123 4567` |
| `correo` | Texto | Formato de correo válido |
| `planId` | Entero | Debe existir y estar `Activo` |
| `direccion` | Texto | Opcional, máximo 120 caracteres |
| `estado` | Texto | `Activo` / `Suspendido` |

Relaciones: `N..1` **Plan**; `1..N` **Contrato**, **Factura**, **Pago**,
**Ticket**.

### 2.4 Vendedor

Mismos campos de contacto que el cliente (`nombre`, `cedula` única de 6 a 10
dígitos, `telefono`, `correo`) más `estado` (`Activo` / `Inactivo`).

Relación: `1..N` **Contrato**. Un vendedor con contratos no se elimina.

### 2.5 Contrato

| Campo | Tipo | Regla |
|---|---|---|
| `id` | Entero | Consecutivo autogenerado |
| `clienteId` | Entero | Referencia a **Cliente** |
| `planId` | Entero | Referencia a **Plan** |
| `vendedorId` | Entero | Referencia a **Vendedor** |
| `inicio` | Fecha | No futura, máximo un año de antigüedad |
| `vigenciaMeses` | Entero | `6`, `12` o `24` |
| `valorMensual` | Número | Copia del precio del plan al crear el contrato |
| `cancelado` | Booleano | `false` por defecto |
| `fin` | Fecha *(calculada)* | `inicio` + `vigenciaMeses` |
| `estado` | Texto *(calculado)* | `Vigente`, `Por vencer`, `Finalizado`, `Cancelado` |

Relaciones: `N..1` **Cliente**, **Plan**, **Vendedor**; `1..N` **Factura**.

### 2.6 Factura

| Campo | Tipo | Regla |
|---|---|---|
| `id` | Entero | Consecutivo autogenerado |
| `contratoId` | Entero | Referencia a **Contrato** |
| `clienteId` | Entero | Copia del cliente del contrato |
| `planId` | Entero | Copia del plan del contrato |
| `valor` | Número | Copia del `valorMensual` del contrato |
| `emision` | Fecha | Formato `YYYY-MM-DD` |
| `vencimiento` | Fecha | **Posterior** a la emisión |
| `pagada` | Booleano | `false` por defecto |
| `estado` | Texto *(calculado)* | `Pagada`, `Pendiente`, `Vencida` |

Relación: `N..1` **Contrato**; `1..1` **Pago** (o ninguno).

### 2.7 Pago

| Campo | Tipo | Regla |
|---|---|---|
| `id` | Entero | Consecutivo autogenerado |
| `facturaId` | Entero | Referencia a **Factura` no pagada |
| `clienteId` | Entero | Copia del cliente de la factura |
| `valor` | Número | Copia del valor de la factura |
| `fecha` | Fecha | Entre la emisión de la factura y hoy |
| `metodo` | Texto | `Efectivo`, `Transferencia`, `Tarjeta` |

### 2.8 Ticket de soporte

| Campo | Tipo | Regla |
|---|---|---|
| `id` | Entero | Consecutivo autogenerado |
| `clienteId` | Entero | Referencia a **Cliente** |
| `asunto` | Texto | 4 a 80 caracteres |
| `descripcion` | Texto | Mínimo 10 caracteres |
| `prioridad` | Texto | `Alta`, `Media`, `Baja` |
| `estado` | Texto | `Abierto`, `En proceso`, `Resuelto` |
| `fecha` | Fecha | La asigna el servicio al crear el ticket |

---

## 3. Diagrama de relaciones

```
                    ┌────────────────────┐
                    │      Usuario       │  (rol, estado)
                    └────────────────────┘

┌────────────────────┐        ┌────────────────────┐
│ Plan de servicio   │<───────│      Cliente       │────┐
│ nombre, velocidad  │  1..N  │ nombre, cedula,    │    │ 1..N
│ precio, tipo       │        │ telefono, correo   │    │
└─────────┬──────────┘        │ planId, estado     │    │
          │                   └────────────────────┘    │
          │ 1..N                                          │
┌─────────┴──────────┐        ┌────────────────────┐    │
│      Vendedor      │<───────│      Contrato      │    │
│ nombre, cedula     │  1..N  │ inicio,            │    │
│ telefono, correo   │───────>│ vigenciaMeses,     │    │
└────────────────────┘        │ valorMensual,      │    │
                               │ cancelado          │    │
                               └─────────┬──────────┘    │
                                         │ 1..N          │
                               ┌─────────┴──────────┐    │
                               │      Factura       │    │
                               │ valor, emision,    │    │
                               │ vencimiento, pagada│    │
                               └─────────┬──────────┘    │
                                         │ 0..1          │
                               ┌─────────┴──────────┐    │
                               │       Pago         │    │
                               │ fecha, metodo      │    │
                               └────────────────────┘    │
                                                             │
                               ┌────────────────────┐       │
                               │ Ticket de soporte  │<──────┘
                               │ asunto, prioridad, │
                               │ estado, fecha      │
                               └────────────────────┘
```

---

## 4. Flujo principal del negocio

1. **Captación.** El vendedor registra al cliente con su plan.
2. **Contratación.** Se crea el contrato: se copia el precio del plan a
   `valorMensual` y se calculan `fin` y el estado.
3. **Facturación.** Se emite la factura del mes con el valor congelado y una
   fecha de vencimiento.
4. **Cobro.** Se consulta `/api/pagos/facturas-pendientes`, se registra el pago
   y la factura queda `Pagada`.
5. **Seguimiento.** El cliente reporta una falla: se abre un ticket que avanza de
   `Abierto` a `En proceso` y a `Resuelto`.
6. **Medición.** `/api/dashboard` resume clientes, contratos, cartera por cobrar,
   recaudo y tickets abiertos.

---

## 5. Estados y sus transiciones

### 5.1 Cliente

```
       (alta)  ──────────►  Activo  ──PATCH .../estado──►  Suspendido
                              ▲                                   │
                              └──────────PATCH .../estado─────────┘
```

### 5.2 Plan de servicio y Vendedor

```
       (alta)  ──────────►  Activo  ──PATCH .../estado──►  Inactivo
                              ▲                                   │
                              └──────────PATCH .../estado─────────┘
```

### 5.3 Contrato

```
        (alta)
           │
           ▼
   ┌───────────────┐  cancela   ┌───────────┐
   │    Vigente    │───────────►│ Cancelado │──reactivar──┐
   └───────┬───────┘             └───────────┘             │
           │ pasa la fecha fin          ▲                  │
           ▼                            │                  │
   ┌───────────────┐                     │                  │
   │  Por vencer   │──── cancela ────────┘                  │
   └───────┬───────┘                                        │
           │ pasa la fecha fin                              │
           ▼                                                │
   ┌───────────────┐                                        │
   │  Finalizado   │  (no se puede cancelar ni reactivar)   │
   └───────────────┘                                        │
                                                             │
   ┌─────────────────────────────────────────────────────────┘
   └──► vuelve a calcular su estado según las fechas
```

Los estados `Vigente`, `Por vencer` y `Finalizado` **no se almacenan**: se
calculan en cada consulta a partir de `inicio` y `vigenciaMeses`. Solo
`cancelado` es un dato almacenado.

### 5.4 Factura

```
        (emisión)
            │
            ▼
      ┌───────────┐   pasa el vencimiento   ┌──────────┐
      │ Pendiente │────────────────────────►│ Vencida  │
      └─────┬─────┘                         └────┬─────┘
            │ registra pago                     │ registra pago
            └──────────────┬────────────────────┘
                           ▼
                      ┌──────────┐
                      │  Pagada  │
                      └──────────┘
```

### 5.5 Ticket de soporte

```
        (alta)
           │
           ▼
     ┌──────────┐   asigna   ┌─────────────┐   cierra   ┌──────────┐
     │ Abierto  │───────────►│ En proceso  │───────────►│ Resuelto │
     └────┬─────┘            └──────┬──────┘            └──────────┘
          └──────────────┬───────────┘
                         └── puede volver a "Abierto"
```

---

## 6. Modelo de datos inicial

El servicio carga datos de ejemplo al arrancar (`src/db/seed.js`) para que
todos los módulos tengan información con la que operar:

| Entidad | Registros iniciales |
|---|---|
| Usuarios | 3 (un Administrador, un Supervisor, un Soporte Técnico) |
| Planes | 4 (Fibra 100/300/500 MB y Banda Ancha 80 MB) |
| Clientes | 4 (Carlos Mendoza, Ana Gómez, Luis Torres, María Ortega) |
| Vendedores | 2 (Julián Rojas, Camila Suárez) |
| Contratos | 3 |
| Facturas | 2 (una pagada, una vencida) |
| Pagos | 1 |
| Tickets | 4 (abierto, resuelto, abierto, en proceso) |

---

## 7. Arquitectura por capas

```
┌───────────────────────────────────────────────────────────────┐
│ Cliente: React (Vite) · Postman · curl · Swagger UI           │
└───────────────────────────┬───────────────────────────────────┘
                            │ HTTP/JSON
┌───────────────────────────▼───────────────────────────────────┐
│ Rutas           src/routes/*.routes.js                        │
│  Declaran método, ruta, middlewares y controlador.            │
├───────────────────────────────────────────────────────────────┤
│ Middlewares     src/middlewares/                             │
│  verificarToken · autorizarRoles · manejadorErrores           │
├───────────────────────────────────────────────────────────────┤
│ Controladores   src/controllers/*.controller.js               │
│  Tradicen HTTP a llamadas de servicio y respuestas.            │
├───────────────────────────────────────────────────────────────┤
│ Servicios       src/services/*.service.js                    │
│  Reglas de negocio, validaciones y cálculos de estado.        │
├───────────────────────────────────────────────────────────────┤
│ Persistencia    src/db/store.js · src/db/seed.js             │
│  Colecciones en memoria con consecutivo autoincremental.     │
└───────────────────────────────────────────────────────────────┘
```

**Por qué esta separación:** los controladores no deciden nada de negocio y los
servicios no conocen HTTP. Eso permite cambiar la base de datos sin tocar la
lógica, y reutilizar un servicio desde otro punto de entrada (por ejemplo, un
proceso por lotes) sin duplicar código.

---

## 8. Seguridad aplicada

| Medida | Implementación |
|---|---|
| Contraseñas cifradas | `bcrypt` con 10 rondas de sal |
| El hash nunca se expone | Proyección del usuario sin `passwordHash` en `user.service` |
| Sesión sin estado | Token JWT firmado con `JWT_SECRET`, expira en 2 horas |
| Token no reutilizable tras baja | `verificarToken` valida que el usuario siga activo |
| Autorización por rol | `autorizarRoles` en cada ruta de escritura |
| Mensajes de login genéricos | No se revela si el usuario existe |
| Validación en el servidor | Las reglas están en la API, no solo en la interfaz |
| Códigos de error internos | `manejadorErrores` no filtra detalles al cliente |
| Configuración por entorno | `PORT`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `BCRYPT_ROUNDS` |

---

## 9. Persistencia: de la memoria a una base de datos

La API usa un almacén en memoria porque en un despliegue real las colecciones se
reemplazan por tablas. La sustitución es localizada: **todo acceso a datos pasa
por las funciones de `src/db/store.js`**.

| Función actual | Equivalente en base de datos |
|---|---|
| `insertar(coleccion, datos)` | `INSERT INTO ... RETURNING id` |
| `obtenerTodos(coleccion)` | `SELECT * FROM ...` |
| `obtenerPorId(coleccion, id)` | `SELECT * FROM ... WHERE id = ?` |
| `actualizar(coleccion, id, cambios)` | `UPDATE ... SET ... WHERE id = ?` |
| `eliminar(coleccion, id)` | `DELETE FROM ... WHERE id = ?` |

Los servicios y los controladores no se modifican. Lo que sí habría que añadir
con una base de datos real son las claves foráneas entre `clienteId`, `planId`,
`vendedorId`, `contratoId` y `facturaId`, que hoy se validan en el servicio antes
de guardar.
