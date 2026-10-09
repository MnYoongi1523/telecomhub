# Guion del video — Testing de las API con Postman (AA5)
Duración sugerida: 6–9 min, con voz y pantalla completa.

## 0. Preparación (antes de grabar)
1. `cd backend` + `node src/index.js` (mostrar consola "en línea").
2. Abrir Postman 12.x. Tener importados:
   - `postman/TelecomHub-API.postman_collection.json`
   - `postman/TelecomHub-Local.postman_environment.json`
   - Entorno seleccionado: `TelecomHub-Local` (arriba a la derecha).

## 1. Intro (30 s)
- "Testing de las API del proyecto TelecomHub, evidencia AA5 (a partir de AA5-EV03), con Postman. Base http://localhost:3001."

## 2. Salud y documentación (1 min)
- `00-General → GET Salud → Send`: mostrar `200 {"ok":true,"mensaje":"Servicio TelecomHub API en línea."}`.
- `GET Documentacion OpenAPI → Send`: mostrar `openapi 3.0.3`, pestaña Tests en verde.

## 3. Autenticación (2 min) — corazón de la evidencia
- `POST Registro usuario testing → Send`: 201.
- `POST Login admin → Send`: 200 `"Autenticación satisfactoria. Bienvenido."` + token. Mostrar pestaña Tests: "Login 200 + token" (el script guarda `{{token}}`).
- `POST Login error → Send`: 401 `"Error en la autenticación"`.
- `GET Perfil sin token` (quitar token en Auth → No Auth): 401.
- `GET Perfil con token`: 200 rol Administrador.

## 4. Módulos (2–3 min, recorrido rápido)
- 02-Planes: GET lista, POST válido (201/409 si ya existe), POST inválido (400 validación).
- 03-Clientes: GET + filtro `?estado=Activo`, POST válido 201.
- 04: GET vendedores/contratos + POST contrato.
- 05: GET facturas/pagos/pendientes + POST pago (201 o 400 "ya fue pagada").
- 06: POST ticket, GET dashboard/indicadores/ventas/estado-cuenta, GET usuarios, DELETE plan en uso → 409.
- En cada uno mostrar Body JSON + Tests ✔.

## 5. Runner — prueba completa (1 min)
- Clic en la colección `··· → Run collection` → Run: mostrar `34 requests, 34/34 assertions passed`.
- Cerrar con: "34/34 en verde; detalle en newman-resumen.json".

## 6. Cierre (20 s)
- Mostrar archivos: colección, entorno, ENDPOINTS, documento con pruebas, ZIP de entrega.
- Grabar con Xbox Game Bar (`Win+G`) o OBS, exportar MP4 `Video-Testing-Postman-TelecomHub.mp4` y meterlo al ZIP.
