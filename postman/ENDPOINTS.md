# ENDPOINTS de las API — TelecomHub
Evidencia: testing de las API con Postman (AA5).
Base local: `http://localhost:3001` — todas las respuestas son JSON `{ok, mensaje, data/total}`.
Autenticación: JWT Bearer (login `POST /api/auth/login` → `data.token`). Usuarios: `administrador/Admin123`, `supervisor/Super123`, `soporte/Soporte123`.

| # | Método | Endpoint | Auth | Descripción | Cuerpo ejemplo |
|---|--------|----------|------|-------------|----------------|
| 1 | GET | /api/salud | No | Estado del servicio | — |
| 2 | GET | /api/documentacion | No | OpenAPI 3.0.3 | — |
| 3 | POST | /api/auth/registro | No | Registro de usuario | `{"username":"testing1","password":"Clave123","nombre":"Usuario Testing"}` |
| 4 | POST | /api/auth/login | No | Inicio de sesión (200 OK / 401 error) | `{"username":"administrador","password":"Admin123"}` |
| 5 | GET | /api/auth/perfil | Sí | Perfil del usuario autenticado | — |
| 6 | GET | /api/servicios | Sí | Catálogo de rutas por módulo | — |
| 7 | GET | /api/planes | Sí | Listar planes (?estado=&tipo=&busqueda=) | — |
| 8 | GET | /api/planes/:id | Sí | Consultar un plan | — |
| 9 | POST | /api/planes | Sí (Admin/Supervisor) | Crear plan | `{"nombre":"Fibra 700MB","velocidad":700,"precio":150000,"tipo":"Fibra","estado":"Activo"}` |
| 10 | PUT | /api/planes/:id | Sí (Admin/Supervisor) | Actualizar plan | `{"precio":75000}` |
| 11 | PATCH | /api/planes/:id/estado | Sí (Admin/Supervisor) | Activar/inactivar | `{"estado":"Inactivo"}` |
| 12 | DELETE | /api/planes/:id | Sí (Admin) | Eliminar (409 si tiene clientes) | — |
| 13 | GET | /api/clientes | Sí | Listar (?estado=&busqueda=&planId=) | — |
| 14 | GET | /api/clientes/:id | Sí | Consultar cliente | — |
| 15 | POST | /api/clientes | Sí (Admin/Supervisor) | Crear cliente | `{"nombre":"Cliente Testing","cedula":"105061234","telefono":"+57 301 555 6677","correo":"testing@correo.com","planId":1,"direccion":"Carrera 7 # 10-20","estado":"Activo"}` |
| 16 | PUT | /api/clientes/:id | Sí (Admin/Supervisor) | Actualizar cliente | — |
| 17 | PATCH | /api/clientes/:id/estado | Sí (Admin/Supervisor) | Suspender/reactivar | `{"estado":"Suspendido"}` |
| 18 | DELETE | /api/clientes/:id | Sí (Admin) | Eliminar cliente | — |
| 19 | GET | /api/vendedores | Sí | Listar vendedores | — |
| 20 | GET | /api/vendedores/:id | Sí | Consultar vendedor | — |
| 21 | POST | /api/vendedores | Sí (Admin/Supervisor) | Crear vendedor | `{"nombre":"Diego Pardo","cedula":"1099887766","telefono":"+57 316 777 8899","correo":"diego.pardo@telecomhub.com","estado":"Activo"}` |
| 22 | PUT | /api/vendedores/:id | Sí (Admin/Supervisor) | Actualizar | — |
| 23 | PATCH | /api/vendedores/:id/estado | Sí (Admin/Supervisor) | Activar/inactivar | `{"estado":"Inactivo"}` |
| 24 | DELETE | /api/vendedores/:id | Sí (Admin) | Eliminar | — |
| 25 | GET | /api/contratos | Sí | Listar contratos | — |
| 26 | GET | /api/contratos/:id | Sí | Consultar contrato | — |
| 27 | POST | /api/contratos | Sí (Admin/Supervisor) | Crear contrato | `{"clienteId":4,"planId":1,"vendedorId":2,"inicio":"2026-03-01","vigenciaMeses":12}` |
| 28 | PUT | /api/contratos/:id | Sí (Admin/Supervisor) | Actualizar | — |
| 29 | PATCH | /api/contratos/:id/cancelar | Sí (Admin/Supervisor) | Cancelar | — |
| 30 | PATCH | /api/contratos/:id/reactivar | Sí (Admin/Supervisor) | Reactivar | — |
| 31 | DELETE | /api/contratos/:id | Sí (Admin) | Eliminar | — |
| 32 | GET | /api/facturas | Sí | Listar facturas | — |
| 33 | GET | /api/facturas/:id | Sí | Consultar factura | — |
| 34 | POST | /api/facturas | Sí (Admin/Supervisor) | Emitir factura | `{"contratoId":1,"emision":"2026-07-01","vencimiento":"2026-07-15"}` |
| 35 | PUT | /api/facturas/:id | Sí (Admin/Supervisor) | Actualizar fechas | — |
| 36 | DELETE | /api/facturas/:id | Sí (Admin) | Eliminar (sin pagos) | — |
| 37 | GET | /api/pagos | Sí | Listar pagos | — |
| 38 | GET | /api/pagos/:id | Sí | Consultar pago | — |
| 39 | GET | /api/pagos/facturas-pendientes | Sí | Facturas sin pago (formulario) | — |
| 40 | POST | /api/pagos | Sí (Admin/Supervisor) | Registrar pago | `{"facturaId":2,"fecha":"2026-10-09","metodo":"Tarjeta"}` |
| 41 | DELETE | /api/pagos/:id | Sí (Admin) | Eliminar pago (libera factura) | — |
| 42 | GET | /api/soporte | Sí | Listar tickets | — |
| 43 | GET | /api/soporte/:id | Sí | Consultar ticket | — |
| 44 | POST | /api/soporte | Sí | Crear ticket | `{"clienteId":2,"asunto":"Sin senal","descripcion":"El servicio se cae cada noche.","prioridad":"Alta","estado":"Abierto"}` |
| 45 | PUT | /api/soporte/:id | Sí | Actualizar ticket | — |
| 46 | PATCH | /api/soporte/:id/estado | Sí | Cambiar estado | `{"estado":"En proceso"}` |
| 47 | DELETE | /api/soporte/:id | Sí | Eliminar ticket | — |
| 48 | GET | /api/dashboard | Sí | Resumen del negocio | — |
| 49 | GET | /api/dashboard/indicadores | Sí | Indicadores numéricos | — |
| 50 | GET | /api/dashboard/ventas-vendedores | Sí (Admin/Supervisor) | Ventas por vendedor | — |
| 51 | GET | /api/dashboard/clientes/:id/estado-cuenta | Sí | Estado de cuenta del cliente | — |
| 52 | GET | /api/usuarios | Sí | Listar usuarios | — |
| 53 | GET | /api/usuarios/:id | Sí | Consultar usuario | — |
| 54 | POST | /api/usuarios | Sí (Admin) | Crear usuario | `{"nombre":"Nuevo Usuario","username":"nuevo1","password":"Clave123","rol":"Supervisor","estado":"Activo"}` |
| 55 | PUT | /api/usuarios/:id | Sí (Admin) | Actualizar | — |
| 56 | PATCH | /api/usuarios/:id/estado | Sí (Admin) | Activar/desactivar | `{"estado":"Inactivo"}` |
| 57 | DELETE | /api/usuarios/:id | Sí (Admin) | Eliminar | — |

Casos negativos probados: login 401, perfil 401 sin token, validación 400 (plan/cliente), duplicados 409 (registro/plan en uso), ruta 404.
Colección Postman: `postman/TelecomHub-API.postman_collection.json` (34 requests, 34 assertions) + entorno `postman/TelecomHub-Local.postman_environment.json`.
