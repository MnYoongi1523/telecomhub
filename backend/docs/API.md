# Documentación de los servicios web — TelecomHub API

Evidencia **GA7-220501096-AA5-EV03** — Diseño y desarrollo de servicios web.

Este documento describe **cada uno de los servicios web** que expone el proyecto
para que el software TelecomHub funcione. La especificación en formato
OpenAPI 3.0 está disponible en:

| Recurso | Ubicación |
|---|---|
| Especificación servida por el servicio | `GET http://localhost:3001/api/documentacion` |
| Archivo OpenAPI para importar en Postman/Swagger | [`openapi.yaml`](./openapi.yaml) |
| Catálogo de rutas consultable en caliente | `GET http://localhost:3001/api/servicios` |

---

## 1. Convenciones generales

### 1.1 Dirección base y formato

- Protocolo HTTP, datos en **JSON** (`Content-Type: application/json`).
- Todos los servicios cuelgan del prefijo `/api`.
- Puerto por defecto: **3001** (configurable con la variable `PORT`).

### 1.2 Formato de las respuestas

Todas las respuestas tienen la misma estructura, para que la interfaz del
software siempre lea las mismas llaves.

**Operación exitosa:**

```json
{
  "ok": true,
  "mensaje": "Cliente registrado correctamente.",
  "data": { "id": 5, "nombre": "Pedro Ramírez", "...": "..." }
}
```

**Listado de registros** (añade el total de elementos encontrados):

```json
{
  "ok": true,
  "mensaje": "Listado de clientes.",
  "total": 4,
  "data": [ { "id": 1, "...": "..." } ]
}
```

**Error:**

```json
{
  "ok": false,
  "mensaje": "Los datos del cliente no son válidos.",
  "error": "VALIDACION",
  "detalles": [
    { "campo": "correo", "mensaje": "Correo electrónico no válido" },
    { "campo": "cedula", "mensaje": "Debe tener entre 6 y 10 dígitos numéricos" }
  ]
}
```

El arreglo `detalles` solo aparece en errores de validación: permite que cada
formulario de la interfaz muestre el mensaje exactamente debajo del campo que
falló.

### 1.3 Códigos de estado

| Código | Significado | Cuándo se devuelve |
|---|---|---|
| `200` | Operación exitosa | Consultas, listados, actualizaciones |
| `201` | Recurso creado | Altas en todos los módulos |
| `400` | Datos inválidos | Falla una regla de validación del negocio |
| `401` | No autenticado | Falta el token, está vencido o las credenciales fallan |
| `403` | Sin permiso | El rol del usuario no autoriza la operación |
| `404` | No encontrado | El recurso o la ruta no existe |
| `409` | Conflicto | Cédula o nombre duplicado, recurso con relaciones, estado inválido |
| `500` | Error interno | Fallo no controlado (se registra en consola) |

### 1.4 Autenticación

Todos los servicios exigen un **token JWT**, excepto los marcados como
*públicos*. El token se obtiene al iniciar sesión y se envía en la cabecera:

```
Authorization: Bearer <token>
```

| Usuario | Contraseña | Rol |
|---|---|---|
| `administrador` | `Admin123` | Administrador |
| `supervisor` | `Super123` | Supervisor |
| `soporte` | `Soporte123` | Soporte Técnico |

### 1.5 Permisos por rol

| Operación | Administrador | Supervisor | Soporte Técnico |
|---|:---:|:---:|:---:|
| Consultar (GET) todos los módulos | Sí | Sí | Sí |
| Crear / editar clientes, planes, vendedores | Sí | Sí | No |
| Crear contratos y facturas | Sí | Sí | No |
| Registrar pagos | Sí | Sí | Sí |
| Gestionar tickets de soporte | Sí | Sí | Sí |
| Eliminar registros | Sí | No | No |
| Crear, editar o eliminar usuarios | Sí | No | No |
| Reportes de ventas y estado de cuenta | Sí | Sí | No |

Un rol sin permiso recibe `403` con el código `ROL_SIN_PERMISO`.

---

## 2. Servicios generales

### 2.1 `GET /api/salud` — Estado del servicio

Verifica que el servicio web esté en línea. **Público.**

```json
{
  "ok": true,
  "mensaje": "Servicio TelecomHub API en línea.",
  "version": "1.0.0"
}
```

### 2.2 `GET /api/documentacion` — Especificación OpenAPI

Devuelve la especificación completa (OpenAPI 3.0) de los 34 servicios web.
Puede importarse en Postman (`Import > Link`) o en Swagger Editor. **Público.**

### 2.3 `GET /api/servicios` — Catálogo de servicios

Devuelve la lista de rutas agrupadas por módulo del software. Requiere token.

---

## 3. Autenticación — `/api/auth`

### 3.1 `POST /api/auth/registro` — Registrar usuario

**Público.** Cifra la contraseña con `bcrypt` (nunca se almacena en texto
plano). Si el nombre de usuario ya existe responde `409`.

| Campo | Tipo | Regla |
|---|---|---|
| `username` | texto | Obligatorio, 3 a 30 caracteres, se normaliza a minúsculas |
| `password` | texto | Obligatorio, mínimo 6 caracteres |
| `nombre` | texto | Opcional; si no llega se usa el `username` |
| `rol` | texto | Opcional; por defecto `Administrador` |

```json
// Respuesta 201
{
  "ok": true,
  "mensaje": "Usuario registrado correctamente.",
  "data": { "id": 4, "username": "operador1", "rol": "Administrador", "estado": "Activo" }
}
```

El campo `passwordHash` **nunca** se devuelve en ninguna respuesta.

### 3.2 `POST /api/auth/login` — Iniciar sesión

**Público.** Este es el servicio que cumple el planteamiento de la evidencia:
si la autenticación es correcta devuelve el mensaje de **autenticación
satisfactoria**; en caso contrario, el **error en la autenticación**.

| Campo | Tipo | Regla |
|---|---|---|
| `username` | texto | Obligatorio, mínimo 3 caracteres (acepta el alias `usuario`) |
| `password` | texto | Obligatorio, mínimo 6 caracteres (acepta `contrasena` / `contraseña`) |

```json
// Respuesta 200 — autenticación satisfactoria
{
  "ok": true,
  "mensaje": "Autenticación satisfactoria. Bienvenido.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": { "id": 1, "username": "administrador", "rol": "Administrador", "estado": "Activo" }
  }
}
```

```json
// Respuesta 401 — error en la autenticación
{
  "ok": false,
  "mensaje": "Error en la autenticación: usuario o contraseña incorrectos.",
  "error": "CREDENCIALES_INVALIDAS"
}
```

El mismo mensaje se devuelve cuando el usuario no existe y cuando la contraseña
es incorrecta, para no revelar qué cuentas están registradas.

### 3.3 `GET /api/auth/perfil` — Perfil del usuario

Devuelve los datos del usuario autenticado. Requiere token.

---

## 4. Administración de usuarios — `/api/usuarios`

Gestiona las cuentas internas del software y sus roles. La lectura está
disponible para todos los perfiles; la escritura es exclusiva del
**Administrador**.

| Servicio | Descripción |
|---|---|
| `GET /api/usuarios` | Lista los usuarios. Filtros: `?estado=Activo&rol=Supervisor&busqueda=san` |
| `GET /api/usuarios/:id` | Consulta un usuario |
| `POST /api/usuarios` | Crea un usuario |
| `PUT /api/usuarios/:id` | Actualiza nombre, usuario, contraseña, rol o estado |
| `PATCH /api/usuarios/:id/estado` | Activa (`Activo`) o desactiva (`Inactivo`) un usuario |
| `DELETE /api/usuarios/:id` | Elimina un usuario |

```json
// POST /api/usuarios
{
  "nombre": "Fernando Forero",
  "username": "fernando",
  "password": "Clave123",
  "rol": "Supervisor",
  "estado": "Activo"
}
```

**Regla de negocio:** un usuario con estado `Inactivo` no puede iniciar sesión
(`401`) y su token deja de ser válido.

---

## 5. Planes de servicio — `/api/planes`

Catálogo comercial que el software ofrece a los clientes.

| Servicio | Descripción |
|---|---|
| `GET /api/planes` | Lista los planes. Filtros: `?estado=&tipo=&busqueda=` |
| `GET /api/planes/:id` | Consulta un plan |
| `POST /api/planes` | Crea un plan |
| `PUT /api/planes/:id` | Actualiza un plan |
| `PATCH /api/planes/:id/estado` | Activa o inactiva un plan |
| `DELETE /api/planes/:id` | Elimina un plan |

| Campo | Regla de validación |
|---|---|
| `nombre` | Obligatorio, 3 a 40 caracteres, sin caracteres `< > { } $ % ^ *`, único |
| `velocidad` | Obligatorio, número entero entre 1 y 2000 Mbps |
| `precio` | Obligatorio, número entre 1 y 5.000.000 (valor mensual en pesos) |
| `tipo` | Obligatorio: `Fibra`, `Banda Ancha`, `Cable` o `Inalámbrico` |
| `estado` | Obligatorio: `Activo` o `Inactivo` |

```json
// POST /api/planes
{
  "nombre": "Fibra 700MB",
  "velocidad": 700,
  "precio": 150000,
  "tipo": "Fibra",
  "estado": "Activo"
}
```

**Regla de negocio:** un plan con clientes o contratos asociados no se puede
eliminar; se responde `409 PLAN_EN_USO`. Se debe inactivar (`PATCH .../estado`)
en lugar de borrarlo.

---

## 6. Clientes — `/api/clientes`

Gestiona a los usuarios finales del servicio de internet.

| Servicio | Descripción |
|---|---|
| `GET /api/clientes` | Lista los clientes. Filtros: `?estado=&planId=&busqueda=` |
| `GET /api/clientes/:id` | Consulta un cliente |
| `POST /api/clientes` | Registra un cliente |
| `PUT /api/clientes/:id` | Actualiza un cliente |
| `PATCH /api/clientes/:id/estado` | **Suspende** o **reactiva** el servicio |
| `DELETE /api/clientes/:id` | Elimina un cliente |

| Campo | Regla de validación |
|---|---|
| `nombre` | Obligatorio, 3 a 50 caracteres, solo letras y espacios |
| `cedula` | Obligatorio, 6 a 10 dígitos numéricos, único |
| `telefono` | Obligatorio, formato `+57 300 123 4567` |
| `correo` | Obligatorio, formato de correo válido, único por cliente |
| `planId` | Obligatorio, el plan debe existir y estar `Activo` |
| `direccion` | Opcional, máximo 120 caracteres |
| `estado` | Obligatorio: `Activo` o `Suspendido` |

```json
// POST /api/clientes
{
  "nombre": "Pedro Ramírez",
  "cedula": "1050607080",
  "telefono": "+57 301 555 6677",
  "correo": "pedro.ramirez@correo.com",
  "planId": 1,
  "direccion": "Carrera 7 # 10-20",
  "estado": "Activo"
}
```

**Reglas de negocio:**
- La cédula es única: si se repite responde `409 CEDULA_DUPLICADA`.
- Un cliente con contratos o facturas no se puede eliminar (`409 CLIENTE_EN_USO`).
- La respuesta incluye el nombre del plan en el campo `plan` y la cantidad de
  contratos activos en `contratosActivos`, que es lo que muestra la tabla del
  software.

```json
// Respuesta 201
{
  "ok": true,
  "mensaje": "Cliente registrado correctamente.",
  "data": {
    "id": 5,
    "nombre": "Pedro Ramírez",
    "cedula": "1050607080",
    "planId": 1,
    "plan": "Fibra 100MB",
    "estado": "Activo",
    "contratosActivos": 0
  }
}
```

---

## 7. Vendedores — `/api/vendedores`

Asesores comerciales que captan los contratos.

| Servicio | Descripción |
|---|---|
| `GET /api/vendedores` | Lista los vendedores. Filtros: `?estado=&busqueda=` |
| `GET /api/vendedores/:id` | Consulta un vendedor |
| `POST /api/vendedores` | Registra un vendedor |
| `PUT /api/vendedores/:id` | Actualiza un vendedor |
| `PATCH /api/vendedores/:id/estado` | Activa o inactiva un vendedor |
| `DELETE /api/vendedores/:id` | Elimina un vendedor |

Los campos y sus reglas son los mismos del módulo de clientes: `nombre`,
`cedula` (única), `telefono`, `correo` y `estado` (`Activo` / `Inactivo`).

**Regla de negocio:** un vendedor con contratos asociados no se puede eliminar
(`409 VENDEDOR_EN_USO`).

---

## 8. Contratos — `/api/contratos`

Relaciona un cliente con un plan y el vendedor que lo captó.

| Servicio | Descripción |
|---|---|
| `GET /api/contratos` | Lista los contratos. Filtros: `?clienteId=&vendedorId=&planId=&estado=&busqueda=` |
| `GET /api/contratos/:id` | Consulta un contrato |
| `POST /api/contratos` | Registra un contrato |
| `PUT /api/contratos/:id` | Actualiza un contrato vigente |
| `PATCH /api/contratos/:id/cancelar` | Cancela un contrato |
| `PATCH /api/contratos/:id/reactivar` | Reactiva un contrato cancelado |
| `DELETE /api/contratos/:id` | Elimina un contrato |

| Campo | Regla de validación |
|---|---|
| `clienteId` | Obligatorio, el cliente debe existir |
| `planId` | Obligatorio, el plan debe existir |
| `vendedorId` | Obligatorio, el vendedor debe existir |
| `inicio` | Obligatorio, formato `YYYY-MM-DD`, no puede ser futura ni mayor a un año |
| `vigenciaMeses` | Obligatorio: `6`, `12` o `24` meses |

```json
// POST /api/contratos
{
  "clienteId": 4,
  "planId": 1,
  "vendedorId": 2,
  "inicio": "2026-04-14",
  "vigenciaMeses": 6
}
```

**Estado calculado:** el servicio no almacena el estado, lo calcula comparando
la fecha de inicio con la vigencia. Así el estado siempre está al día.

| Estado | Condición |
|---|---|
| `Cancelado` | El contrato fue cancelado |
| `Finalizado` | Ya pasó la fecha fin |
| `Por vencer` | Faltan 30 días o menos para el vencimiento |
| `Vigente` | Faltan más de 30 días |

```json
// Respuesta 201
{
  "ok": true,
  "mensaje": "Contrato registrado correctamente.",
  "data": {
    "id": 4,
    "clienteId": 4,
    "cliente": "María Ortega",
    "plan": "Fibra 100MB",
    "vendedor": "Camila Suárez",
    "inicio": "2026-04-14",
    "fin": "2026-10-14",
    "diasRestantes": 14,
    "vigenciaMeses": 6,
    "valorMensual": 65000,
    "estado": "Por vencer"
  }
}
```

**Reglas de negocio:**
- El `valorMensual` se copia del precio del plan al crear el contrato.
- Un contrato cancelado no se puede modificar (`409 CONTRATO_CANCELADO`).
- Un contrato finalizado por fecha no se puede cancelar (`409 CONTRATO_FINALIZADO`).
- Un contrato con facturas emitidas no se puede eliminar (`409 CONTRATO_EN_USO`).

---

## 9. Facturación — `/api/facturas`

Emite la factura mensual de un contrato.

| Servicio | Descripción |
|---|---|
| `GET /api/facturas` | Lista las facturas. Filtros: `?clienteId=&contratoId=&estado=&pagada=&busqueda=` |
| `GET /api/facturas/:id` | Consulta una factura |
| `POST /api/facturas` | Emite una factura para un contrato |
| `PUT /api/facturas/:id` | Actualiza las fechas de una factura pendiente |
| `DELETE /api/facturas/:id` | Elimina una factura sin pagos |

| Campo | Regla de validación |
|---|---|
| `contratoId` | Obligatorio, el contrato debe existir |
| `emision` | Obligatorio, formato `YYYY-MM-DD` |
| `vencimiento` | Obligatorio, **debe ser posterior** a la emisión |

```json
// POST /api/facturas
{
  "contratoId": 1,
  "emision": "2026-07-01",
  "vencimiento": "2026-07-15"
}
```

**Estado calculado:**

| Estado | Condición |
|---|---|
| `Pagada` | Ya tiene un pago registrado |
| `Pendiente` | No vencida y sin pago |
| `Vencida` | Pasó la fecha de vencimiento y sigue sin pago |

**Reglas de negocio:**
- El valor de la factura se copia del `valorMensual` del contrato, por lo que
  cambiar después el precio del plan no altera facturas ya emitidas.
- Una factura pagada no se puede modificar (`409 FACTURA_PAGADA`).
- Una factura con pagos registrados no se puede eliminar (`409 FACTURA_EN_USO`).

---

## 10. Pagos — `/api/pagos`

Registra el pago de una factura y la marca como pagada.

| Servicio | Descripción |
|---|---|
| `GET /api/pagos` | Lista los pagos. Filtros: `?clienteId=&facturaId=&metodo=&desde=&hasta=&busqueda=` |
| `GET /api/pagos/facturas-pendientes` | Lista las facturas que aún no tienen pago |
| `GET /api/pagos/:id` | Consulta un pago |
| `POST /api/pagos` | Registra el pago de una factura |
| `DELETE /api/pagos/:id` | Elimina un pago y libera la factura |

| Campo | Regla de validación |
|---|---|
| `facturaId` | Obligatorio, la factura debe existir y **no estar pagada** |
| `fecha` | Obligatorio, entre la emisión de la factura y hoy (no puede ser futura) |
| `metodo` | Obligatorio: `Efectivo`, `Transferencia` o `Tarjeta` |

```json
// POST /api/pagos
{
  "facturaId": 1,
  "fecha": "2026-10-01",
  "metodo": "Transferencia"
}
```

**Reglas de negocio:**
- Registrar el pago y marcar la factura como pagada ocurren en una sola
  operación, de modo que nunca queda una factura pagada sin su pago.
- No se puede pagar dos veces la misma factura: responde `400` con el detalle
  `{ "campo": "facturaId", "mensaje": "Esta factura ya fue pagada" }`.
- Al eliminar un pago, la factura vuelve automáticamente a estado pendiente.
- `GET /api/pagos/facturas-pendientes` existe porque el formulario de cobro del
  software solo debe permitir pagar facturas pendientes.

---

## 11. Soporte — `/api/soporte`

Registro y seguimiento de las solicitudes de los clientes.

| Servicio | Descripción |
|---|---|
| `GET /api/soporte` | Lista los tickets. Filtros: `?clienteId=&prioridad=&estado=&busqueda=` |
| `GET /api/soporte/:id` | Consulta un ticket |
| `POST /api/soporte` | Registra un ticket |
| `PUT /api/soporte/:id` | Actualiza un ticket |
| `PATCH /api/soporte/:id/estado` | Cambia el estado: `Abierto`, `En proceso`, `Resuelto` |
| `DELETE /api/soporte/:id` | Elimina un ticket |

| Campo | Regla de validación |
|---|---|
| `clienteId` | Obligatorio, el cliente debe existir |
| `asunto` | Obligatorio, 4 a 80 caracteres |
| `descripcion` | Obligatorio, mínimo 10 caracteres |
| `prioridad` | Obligatorio: `Alta`, `Media` o `Baja` |
| `estado` | Obligatorio: `Abierto`, `En proceso` o `Resuelto` |

```json
// POST /api/soporte
{
  "clienteId": 2,
  "asunto": "Sin señal",
  "descripcion": "El servicio se cae cada noche desde las ocho.",
  "prioridad": "Alta",
  "estado": "Abierto"
}
```

La fecha del ticket (`fecha`) la asigna el servicio con el día local en que se
registró.

---

## 12. Dashboard e indicadores — `/api/dashboard`

Consolida en un solo servicio web las cifras de la pantalla principal.

### 12.1 `GET /api/dashboard` — Resumen de gestión

Devuelve las tarjetas de estadísticas y las tablas de novedades.

```json
{
  "ok": true,
  "mensaje": "Resumen de gestión de TelecomHub.",
  "data": {
    "clientes": { "total": 5, "activos": 4, "suspendidos": 1 },
    "contratos": {
      "total": 4, "vigentes": 2, "porVencer": 1,
      "finalizados": 0, "cancelados": 0, "ingresoMensual": 204000
    },
    "facturacion": {
      "total": 3, "pendientes": 2, "vencidas": 1,
      "facturado": 243000, "carteraPorCobrar": 153000
    },
    "pagos": {
      "total": 1, "delMes": 0, "recaudoDelMes": 0,
      "recaudoTotal": 65000, "porMetodo": { "Transferencia": 1 }
    },
    "soporte": {
      "total": 5, "abiertos": 2, "enProceso": 2, "resueltos": 1,
      "porPrioridad": { "Alta": 2, "Media": 1 }
    },
    "ultimosTickets": [ ],
    "ultimosClientes": [ ]
  }
}
```

### 12.2 `GET /api/dashboard/indicadores` — Solo cifras

Devuelve únicamente los bloques de indicadores, sin las listas de novedades.

### 12.3 `GET /api/dashboard/ventas-vendedores` — Reporte comercial

Agrupa la producción por vendedor: contratos totales, contratos vigentes e
ingreso mensual proyectado. Restringido a Administrador y Supervisor.

### 12.4 `GET /api/dashboard/clientes/:clienteId/estado-cuenta`

Estado de cuenta de un cliente: sus contratos, facturas, pagos y los totales
`facturado`, `pagado` y `saldo`. Restringido a Administrador y Supervisor.

---

## 13. Ejemplo completo de uso

```powershell
# 1. Autenticarse y guardar el token
$login = Invoke-RestMethod -Method Post -Uri http://localhost:3001/api/auth/login `
  -ContentType "application/json" -Body '{"username":"administrador","password":"Admin123"}'
$token = $login.data.token
$cabeceras = @{ Authorization = "Bearer $token" }

# 2. Registrar un cliente
Invoke-RestMethod -Method Post -Uri http://localhost:3001/api/clientes `
  -Headers $cabeceras -ContentType "application/json" -Body '{
    "nombre": "Pedro Ramírez", "cedula": "1050607080",
    "telefono": "+57 301 555 6677", "correo": "pedro@correo.com",
    "planId": 1, "estado": "Activo"
  }'

# 3. Firmar un contrato
Invoke-RestMethod -Method Post -Uri http://localhost:3001/api/contratos `
  -Headers $cabeceras -ContentType "application/json" -Body '{
    "clienteId": 5, "planId": 1, "vendedorId": 1,
    "inicio": "2026-09-01", "vigenciaMeses": 12
  }'

# 4. Facturar y cobrar
Invoke-RestMethod -Method Post -Uri http://localhost:3001/api/facturas `
  -Headers $cabeceras -ContentType "application/json" `
  -Body '{"contratoId":4,"emision":"2026-09-01","vencimiento":"2026-09-15"}'

Invoke-RestMethod -Method Post -Uri http://localhost:3001/api/pagos `
  -Headers $cabeceras -ContentType "application/json" `
  -Body '{"facturaId":3,"fecha":"2026-09-10","metodo":"Tarjeta"}'

# 5. Ver el resumen del negocio
Invoke-RestMethod -Method Get -Uri http://localhost:3001/api/dashboard -Headers $cabeceras
```

---

## 14. Diseño técnico

La arquitectura es por capas, de modo que cada capa tiene una sola
responsabilidad:

```
Cliente (React, Postman, curl)
        │  JSON sobre HTTP
        ▼
Rutas            → declaran método, ruta, middlewares y controlador
Middlewares      → verificarToken, autorizarRoles, manejadorErrores
Controladores    → traducen HTTP a llamadas de servicio y respuestas
Servicios        → reglas de negocio y validaciones
Persistencia     → almacén en memoria (store.js) con datos iniciales
```

| Capa | Archivos |
|---|---|
| Punto de entrada | `src/index.js` |
| Rutas | `src/routes/*.routes.js` |
| Middlewares | `src/middlewares/*.js` |
| Controladores | `src/controllers/*.controller.js` |
| Servicios | `src/services/*.service.js` |
| Persistencia | `src/db/store.js`, `src/db/seed.js` |
| Utilidades | `src/utils/*.js` (errores, fechas, validadores, respuestas) |
| Documentación | `src/docs/openapi.js`, `docs/openapi.yaml` |

**Decisiones de diseño relevantes:**

1. **Almacén en memoria** (`src/db/store.js`): simula las tablas del sistema
   con un consecutivo autoincremental. Sustituirlo por MySQL o PostgreSQL solo
   requiere cambiar ese archivo; los servicios no se modifican.
2. **Estados calculados, no almacenados**: el estado de un contrato o de una
   factura se deduce de sus fechas en cada consulta, por lo que nunca queda
   desactualizado.
3. **Errores de negocio centralizados** (`ErrorApi`): cada error lleva su
   código HTTP y un código de negocio, y el manejador global los convierte en
   una respuesta JSON uniforme.
4. **Fechas en zona local** (`src/utils/fechas.js`): todo se maneja en
   `YYYY-MM-DD` local. Usar la fecha UTC podría mostrar un día distinto al que
   ve el usuario.
5. **Contraseñas cifradas**: `bcrypt` con 10 rondas; el hash nunca sale de la
   capa de servicio.
6. **Validación en el servidor**: las reglas están duplicadas en la API, de
   modo que un cliente que las omita no puede saltárselas.

El detalle del modelo de datos y de los diagramas está en
[`DISENO.md`](./DISENO.md).

---

## 15. Pruebas

```bash
npm test
```

La suite (`tests/api.test.js`, 32 pruebas) levanta el servicio en un puerto
libre y verifica por HTTP: los códigos de estado de cada módulo, la
autenticación y los permisos por rol, las reglas de validación, los estados
calculados, los conflictos (duplicados y recursos en uso) y el formato de la
documentación.
