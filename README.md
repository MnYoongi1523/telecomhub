# TelecomHub — Desarrollo único (monorepo)

Repositorio consolidado del proyecto. `frontend` es el desarrollo principal
(`telecomhub-ui`, React + Vite) y `backend` es su dependencia de servicios
(`telecomhub-api`, Express: registro e inicio de sesión).

## Estructura

```
telecomhub/
├── frontend/   → app React (puerto 5173, proxy /api → :3001)
├── backend/    → API Express (puerto 3001, historial Git preservado)
└── package.json → workspaces npm + scripts unificados
```

## Requisitos

- Node.js v24 + npm 11 (instalado a nivel usuario en este equipo).

## Uso

```bash
npm install      # instala frontend + backend (workspaces)
npm run dev      # arranca API (:3001) y UI (:5173) a la vez
npm run build    # build de producción del frontend
```

El frontend consume la API en mismo origen (`/api/...`) gracias al proxy de
Vite definido en `frontend/vite.config.js`, por lo que login/registro
funcionan sin CORS en desarrollo.

## Versionamiento

- El historial del API se importó con `git subtree` bajo `backend/` (se
  conservan sus 3 commits originales).
- El frontend se integró como `frontend/` (su `.git` local no tenía commits).
