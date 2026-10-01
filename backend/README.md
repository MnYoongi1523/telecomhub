# TelecomHub API — Servicios web del proyecto

Evidencia **GA7-220501096-AA5-EV03** — *Diseño y desarrollo de servicios web –
proyecto* (componente formativo).

Servicio web que soporta el software de gestión **TelecomHub**: los nueve
módulos de la interfaz (Dashboard, Clientes, Planes de Servicio, Contratos,
Facturas, Pagos, Vendedores, Soporte y Administración) consumen sus datos de
esta API.

## 1. Documentación

| Documento | Contenido |
|---|---|
| [`docs/API.md`](docs/API.md) | **Documentación de cada servicio web**: método, ruta, datos de entrada, reglas de validación, códigos de respuesta y ejemplos |
| [`docs/DISENO.md`](docs/DISENO.md) | Diseño: entidades, diagrama de relaciones, estados, transiciones, arquitectura por capas y seguridad |
| [`docs/openapi.yaml`](docs/openapi.yaml) | Especificación OpenAPI 3.0 de los 34 servicios (importable en Postman o Swagger Editor) |
| `GET /api/documentacion` | La misma especificación servida por el servicio en caliente |
| `GET /api/servicios` | Catálogo de rutas agrupadas por módulo |

## 2. Servicios web por módulo

| Módulo | Prefijo | Servicios |
|---|---|---|
| Autenticación | `/api/auth` | Registro, inicio de sesión, perfil |
| Dashboard | `/api/dashboard` | Resumen, indicadores, ventas por vendedor, estado de cuenta |
| Administración | `/api/usuarios` | CRUD de usuarios y activación por rol |
| Planes de servicio | `/api/planes` | CRUD, activar/inactivar |
| Clientes | `/api/clientes` | CRUD, suspender/reactivar |
| Vendedores | `/api/vendedores` | CRUD, activar/inactivar |
| Contratos | `/api/contratos` | CRUD, cancelar, reactivar |
| Facturas | `/api/facturas` | CRUD y emisión |
| Pagos | `/api/pagos` | Registro, consulta, eliminación y facturas pendientes |
| Soporte | `/api/soporte` | CRUD de tickets y cambio de estado |
| General | `/api` | Estado del servicio, documentación y catálogo |

## 3. Arquitectura

```
Cliente (React · Postman · curl)
        │  JSON sobre HTTP
        ▼
Rutas          → método, ruta, middlewares y controlador
Middlewares    → verificarToken · autorizarRoles · manejadorErrores
Controladores  → traducen HTTP a llamadas de servicio
Servicios      → reglas de negocio, validaciones y estados calculados
Persistencia   → almacén en memoria con datos iniciales
```

## 4. Requisitos y ejecución

- Node.js 18 o superior.

```bash
npm install     # instala las dependencias
npm start       # inicia el servicio en http://localhost:3001
npm run dev     # mismo, con recarga automática
npm test        # ejecuta las 32 pruebas de los servicios web
```

Verificación rápida:

```powershell
Invoke-RestMethod -Uri http://localhost:3001/api/salud
Invoke-RestMethod -Method Post -Uri http://localhost:3001/api/auth/login `
  -ContentType "application/json" -Body '{"username":"administrador","password":"Admin123"}'
```

Para actualizar la especificación en `docs/openapi.yaml` después de modificar
los servicios:

```bash
npm run docs:openapi
```

## 5. Configuración

Todas las variables son opcionales; el servicio arranca con valores por
defecto (ver `.env.example`).

| Variable | Por defecto | Uso |
|---|---|---|
| `PORT` | `3001` | Puerto del servicio |
| `JWT_SECRET` | valor formativo | Firma del token de autenticación |
| `JWT_EXPIRES_IN` | `2h` | Vigencia del token |
| `BCRYPT_ROUNDS` | `10` | Rondas de cifrado de contraseñas |

> En producción `JWT_SECRET` debe definirse como variable de entorno con un
> valor propio; el valor por defecto es únicamente para el entorno formativo.

## 6. Usuarios de prueba

| Usuario | Contraseña | Rol |
|---|---|---|
| `administrador` | `Admin123` | Administrador |
| `supervisor` | `Super123` | Supervisor |
| `soporte` | `Soporte123` | Soporte Técnico |

## 7. Dependencias

| Paquete | Uso |
|---|---|
| `express` | Servidor web y enrutamiento |
| `cors` | Permitir peticiones desde el frontend en otro puerto |
| `jsonwebtoken` | Autenticación por token |
| `bcryptjs` | Cifrado de contraseñas |

## 8. Versionamiento

El proyecto está versionado con **Git**. El historial completo, con un commit
por módulo, permite ver cómo se construyeron los servicios:

```bash
git log --oneline
git log --oneline -- backend
```
