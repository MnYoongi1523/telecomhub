# TelecomHub — Desarrollo único (monorepo)

Repositorio consolidado del proyecto de gestión **TelecomHub** (evidencia
**GA7-220501096-AA5-EV03** — *Diseño y desarrollo de servicios web*).

- `frontend/` es el desarrollo principal (`telecomhub-ui`, React + Vite) con los
  nueve módulos de la interfaz: Dashboard, Clientes, Planes de Servicio,
  Contratos, Facturas, Pagos, Vendedores, Soporte y Administración.
- `backend/` es el servicio web que la interfaz consume (`telecomhub-api`,
  Express: autenticación, clientes, planes, vendedores, contratos, facturas,
  pagos, soporte, usuarios e indicadores).

## Estructura

```
telecomhub/
├── frontend/            → aplicación React (puerto 5173, proxy /api → :3001)
├── backend/             → API Express (puerto 3001)
│   ├── docs/            → documentación de los servicios y diseño
│   ├── scripts/         → generación de la especificación OpenAPI
│   ├── src/             → código del servicio web
│   └── tests/           → pruebas de los servicios
└── package.json         → workspaces npm + scripts unificados
```

## Requisitos

- Node.js v18 o superior (probado en Node v24 con npm 11).

## Uso

```bash
npm install      # instala frontend + backend (workspaces)
npm run dev      # arranca la API (:3001) y la interfaz (:5173) a la vez
npm run build    # build de producción del frontend
npm test         # ejecuta las 32 pruebas de los servicios web
```

La interfaz consume la API en el mismo origen (`/api/...`) gracias al proxy de
Vite definido en `frontend/vite.config.js`, por lo que el login y el registro
funcionan sin CORS en desarrollo.

## Documentación de la API

| Documento | Contenido |
|---|---|
| [`backend/docs/API.md`](backend/docs/API.md) | Documentación de **cada servicio web** |
| [`backend/docs/DISENO.md`](backend/docs/DISENO.md) | Diseño: entidades, relaciones, estados y arquitectura |
| [`backend/docs/openapi.yaml`](backend/docs/openapi.yaml) | Especificación OpenAPI 3.0 (importable en Postman) |
| `GET /api/documentacion` | Especificación servida por el servicio en caliente |
| `GET /api/servicios` | Catálogo de rutas agrupadas por módulo |

## Usuarios de prueba

| Usuario | Contraseña | Rol |
|---|---|---|
| `administrador` | `Admin123` | Administrador |
| `supervisor` | `Super123` | Supervisor |
| `soporte` | `Soporte123` | Soporte Técnico |

## Versionamiento

El proyecto está versionado con **Git**, con un commit por cada módulo de la
API, de modo que el historial muestra cómo se construyeron los servicios:

```bash
git log --oneline
```
