# TelecomHub API — Registro e Inicio de Sesión

Proyecto del componente formativo **“Construcción API”**.

## 1. Diseño del servicio

**Objetivo:** exponer un servicio web que reciba `usuario` y `contraseña`:
- Si la autenticación es correcta → mensaje de **autenticación satisfactoria**.
- En caso contrario → **error en la autenticación**.

**Arquitectura (por capas):**

```
Cliente (frontend / Postman / curl)
        │  JSON por HTTP
        ▼
src/index.js            → servidor Express + CORS + JSON
src/routes/auth.routes.js → define POST /registro y POST /login
src/middlewares/validateAuth.js → valida usuario (≥3) y contraseña (≥6)
src/controllers/auth.controller.js → orquesta registro/login + JWT
src/services/user.service.js → almacén en memoria + bcrypt
```

**Modelo Usuario:**

| Campo | Tipo | Descripción |
|---|---|---|
| id | number | Consecutivo autoincremental |
| username | string | Normalizado a minúsculas, único |
| passwordHash | string | Hash bcrypt (nunca texto plano) |
| creadoEn | string | Fecha ISO de creación |

**Endpoints:**

| Método | Ruta | Entrada | Éxito | Error |
|---|---|---|---|---|
| GET | `/api/salud` | — | `200` servicio en línea | — |
| POST | `/api/auth/registro` | `{ "username": "admin", "password": "123456" }` | `201` Usuario registrado correctamente | `400` datos inválidos, `409` duplicado |
| POST | `/api/auth/login` | `{ "username": "admin", "password": "123456" }` | `200` Autenticación satisfactoria + `token` | `401` usuario o contraseña incorrectos |

El campo `username` acepta también el alias `usuario`, y `password` acepta `contrasena`/`contraseña`.

**Ejemplo login correcto:**

```json
{
  "ok": true,
  "mensaje": "Autenticación satisfactoria. Bienvenido.",
  "token": "<JWT>",
  "usuario": { "id": 1, "username": "admin" }
}
```

**Ejemplo error:**

```json
{
  "ok": false,
  "mensaje": "Error en la autenticación: usuario o contraseña incorrectos."
}
```

## 2. Ejecución

```bash
npm install
npm start
# Servicio en http://localhost:3001
```

Prueba rápida (PowerShell):

```powershell
Invoke-RestMethod -Uri http://localhost:3001/api/salud
Invoke-RestMethod -Method Post -Uri http://localhost:3001/api/auth/registro `
  -ContentType "application/json" -Body '{"username":"admin","password":"123456"}'
Invoke-RestMethod -Method Post -Uri http://localhost:3001/api/auth/login `
  -ContentType "application/json" -Body '{"username":"admin","password":"123456"}'
```

## 3. Versionamiento con Git

```bash
git init
git add .
git commit -m "feat: servicio web registro y login"
git log --oneline
```

## 4. Notas de seguridad

- Contraseñas cifradas con `bcryptjs`.
- Login retorna `JWT` firmado (`JWT_SECRET`, expira en `1h`).
- Mensajes de error genéricos para no revelar si el usuario existe.
- Almacén en memoria: al reiniciar se borra (para producción conectar BD).
