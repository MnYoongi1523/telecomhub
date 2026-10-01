// Pruebas automáticas de los servicios web de TelecomHub API.
// Se ejecutan con el módulo nativo de Node (sin dependencias externas):
//   npm test
//
// Cada prueba arranca la aplicación en memoria, siembra los datos iniciales y
// verifica el contrato de los servicios web: rutas, códigos de estado,
// validaciones y reglas de negocio.

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');

const app = require('../src/index');
const store = require('../src/db/store');
const { sembrar } = require('../src/db/seed');
const fechas = require('../src/utils/fechas');

// Dirección base del servidor de pruebas (se asigna al iniciar).
let base = 'http://localhost';
let servidor = null;

// Envío una petición al servicio y devuelve estado y cuerpo.
async function pedir(metodo, ruta, { cuerpo, token } = {}) {
  const cabeceras = { 'Content-Type': 'application/json' };
  if (token) cabeceras.Authorization = `Bearer ${token}`;

  const respuesta = await fetch(`${base}${ruta}`, {
    method: metodo,
    headers: cabeceras,
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });

  const texto = await respuesta.text();
  return {
    estado: respuesta.status,
    cuerpo: texto ? JSON.parse(texto) : null,
  };
}

// Inicia sesión con el administrador sembrado y devuelve su token.
async function tokenAdministrador() {
  const { cuerpo } = await pedir('POST', '/api/auth/login', {
    cuerpo: { username: 'administrador', password: 'Admin123' },
  });
  return cuerpo.data.token;
}

before(async () => {
  // Se levanta el servidor real en un puerto libre para probarlo por HTTP.
  store.reiniciar();
  await sembrar();

  servidor = app.listen(0);
  await new Promise((resolver) => servidor.once('listening', resolver));
  base = `http://127.0.0.1:${servidor.address().port}`;
});

after(() => {
  if (servidor) servidor.close();
});

test('GET /api/salud responde que el servicio está en línea', async () => {
  const { estado, cuerpo } = await pedir('GET', '/api/salud');
  assert.equal(estado, 200);
  assert.equal(cuerpo.ok, true);
  assert.match(cuerpo.mensaje, /en línea/i);
});

test('GET /api/documentacion entrega la especificación OpenAPI', async () => {
  const { estado, cuerpo } = await pedir('GET', '/api/documentacion');
  assert.equal(estado, 200);
  assert.equal(cuerpo.openapi, '3.0.3');
  assert.equal(cuerpo.info.title, 'TelecomHub API');
  // La documentación debe cubrir todos los módulos del software.
  for (const ruta of [
    '/api/auth/login',
    '/api/clientes',
    '/api/planes',
    '/api/vendedores',
    '/api/contratos',
    '/api/facturas',
    '/api/pagos',
    '/api/soporte',
    '/api/usuarios',
    '/api/dashboard',
  ]) {
    assert.ok(cuerpo.paths[ruta], `Falta documentada la ruta ${ruta}`);
  }
});

test('GET /api/servicios lista los servicios web por módulo', async () => {
  const token = await tokenAdministrador();
  const { estado, cuerpo } = await pedir('GET', '/api/servicios', { token });
  assert.equal(estado, 200);
  assert.ok(cuerpo.data.clientes.includes('GET /api/clientes'));
  assert.ok(cuerpo.data.soporte.includes('POST /api/soporte'));
});

test('POST /api/auth/login autentica con credenciales correctas', async () => {
  const { estado, cuerpo } = await pedir('POST', '/api/auth/login', {
    cuerpo: { username: 'administrador', password: 'Admin123' },
  });
  assert.equal(estado, 200);
  assert.equal(cuerpo.mensaje, 'Autenticación satisfactoria. Bienvenido.');
  assert.ok(cuerpo.data.token);
  // La contraseña nunca debe devolverse, ni en texto plano ni cifrada.
  assert.equal(cuerpo.data.usuario.passwordHash, undefined);
});

test('POST /api/auth/login rechaza credenciales incorrectas', async () => {
  const { estado, cuerpo } = await pedir('POST', '/api/auth/login', {
    cuerpo: { username: 'administrador', password: 'ClaveIncorrecta1' },
  });
  assert.equal(estado, 401);
  assert.equal(cuerpo.ok, false);
  assert.match(cuerpo.mensaje, /Error en la autenticación/i);
});

test('POST /api/auth/login valida el formato de las credenciales', async () => {
  const { estado } = await pedir('POST', '/api/auth/login', {
    cuerpo: { username: 'ab', password: '123' },
  });
  assert.equal(estado, 400);
});

test('GET /api/auth/perfil exige un token válido', async () => {
  const sinToken = await pedir('GET', '/api/auth/perfil');
  assert.equal(sinToken.estado, 401);

  const tokenInvalido = await pedir('GET', '/api/auth/perfil', { token: 'abc.def.ghi' });
  assert.equal(tokenInvalido.estado, 401);

  const token = await tokenAdministrador();
  const conToken = await pedir('GET', '/api/auth/perfil', { token });
  assert.equal(conToken.estado, 200);
  assert.equal(conToken.cuerpo.data.rol, 'Administrador');
});

test('POST /api/auth/registro crea un usuario y detecta duplicados', async () => {
  const datos = { username: 'operador1', password: 'Clave123', nombre: 'Operador Uno' };

  const creado = await pedir('POST', '/api/auth/registro', { cuerpo: datos });
  assert.equal(creado.estado, 201);
  assert.equal(creado.cuerpo.data.username, 'operador1');

  const duplicado = await pedir('POST', '/api/auth/registro', { cuerpo: datos });
  assert.equal(duplicado.estado, 409);
  assert.equal(duplicado.cuerpo.error, 'USUARIO_DUPLICADO');
});

test('GET /api/planes devuelve el catálogo inicial', async () => {
  const token = await tokenAdministrador();
  const { estado, cuerpo } = await pedir('GET', '/api/planes', { token });
  assert.equal(estado, 200);
  assert.equal(cuerpo.total, 4);
  assert.ok(cuerpo.data.some((p) => p.nombre === 'Fibra 300MB'));
});

test('POST /api/planes aplica las reglas de validación del software', async () => {
  const token = await tokenAdministrador();

  const invalido = await pedir('POST', '/api/planes', {
    token,
    cuerpo: { nombre: 'Fi', velocidad: 5000, precio: -10, tipo: 'Satélite', estado: 'Activo' },
  });
  assert.equal(invalido.estado, 400);

  const valido = await pedir('POST', '/api/planes', {
    token,
    cuerpo: { nombre: 'Fibra 700MB', velocidad: 700, precio: 150000, tipo: 'Fibra', estado: 'Activo' },
  });
  assert.equal(valido.estado, 201);
  assert.equal(valido.cuerpo.data.velocidad, 700);
});

test('PUT /api/planes actualiza y PATCH cambia el estado', async () => {
  const token = await tokenAdministrador();
  const creado = await pedir('POST', '/api/planes', {
    token,
    cuerpo: { nombre: 'Cable 200MB', velocidad: 200, precio: 70000, tipo: 'Cable', estado: 'Activo' },
  });
  const id = creado.cuerpo.data.id;

  const actualizado = await pedir('PUT', `/api/planes/${id}`, { token, cuerpo: { precio: 75000 } });
  assert.equal(actualizado.estado, 200);
  assert.equal(actualizado.cuerpo.data.precio, 75000);

  const inactivo = await pedir('PATCH', `/api/planes/${id}/estado`, {
    token,
    cuerpo: { estado: 'Inactivo' },
  });
  assert.equal(inactivo.estado, 200);
  assert.equal(inactivo.cuerpo.data.estado, 'Inactivo');

  const eliminado = await pedir('DELETE', `/api/planes/${id}`, { token });
  assert.equal(eliminado.estado, 200);
});

test('DELETE /api/planes no borra un plan con clientes asociados', async () => {
  const token = await tokenAdministrador();
  const { estado, cuerpo } = await pedir('DELETE', '/api/planes/2', { token });
  assert.equal(estado, 409);
  assert.equal(cuerpo.error, 'PLAN_EN_USO');
});

test('POST /api/clientes registra un cliente y rechaza cédulas repetidas', async () => {
  const token = await tokenAdministrador();

  const invalido = await pedir('POST', '/api/clientes', {
    token,
    cuerpo: {
      nombre: '1234',
      cedula: 'abc',
      telefono: '300123',
      correo: 'correo-malo',
      planId: 1,
      estado: 'Activo',
    },
  });
  assert.equal(invalido.estado, 400);

  const nuevo = await pedir('POST', '/api/clientes', {
    token,
    cuerpo: {
      nombre: 'Pedro Ramírez',
      cedula: '1050607080',
      telefono: '+57 301 555 6677',
      correo: 'pedro.ramirez@correo.com',
      planId: 1,
      direccion: 'Carrera 7 # 10-20',
      estado: 'Activo',
    },
  });
  assert.equal(nuevo.estado, 201);
  // La respuesta incluye el nombre del plan, que es lo que muestra la interfaz.
  assert.equal(nuevo.cuerpo.data.plan, 'Fibra 100MB');

  const duplicado = await pedir('POST', '/api/clientes', {
    token,
    cuerpo: {
      nombre: 'Otro Cliente',
      cedula: '1050607080',
      telefono: '+57 301 555 6678',
      correo: 'otro@correo.com',
      planId: 1,
      estado: 'Activo',
    },
  });
  assert.equal(duplicado.estado, 409);
});

test('GET /api/clientes filtra por estado y por búsqueda', async () => {
  const token = await tokenAdministrador();

  const activos = await pedir('GET', '/api/clientes?estado=Activo', { token });
  assert.equal(activos.estado, 200);
  assert.ok(activos.cuerpo.data.every((c) => c.estado === 'Activo'));

  const busqueda = await pedir('GET', '/api/clientes?busqueda=carlos', { token });
  assert.equal(busqueda.cuerpo.total, 1);
  assert.equal(busqueda.cuerpo.data[0].nombre, 'Carlos Mendoza');
});

test('PATCH /api/clientes/:id/estado suspende y reactiva un cliente', async () => {
  const token = await tokenAdministrador();

  const suspendido = await pedir('PATCH', '/api/clientes/1/estado', {
    token,
    cuerpo: { estado: 'Suspendido' },
  });
  assert.equal(suspendido.cuerpo.data.estado, 'Suspendido');

  const reactivado = await pedir('PATCH', '/api/clientes/1/estado', {
    token,
    cuerpo: { estado: 'Activo' },
  });
  assert.equal(reactivado.cuerpo.data.estado, 'Activo');
});

test('POST /api/vendedores registra un asesor comercial', async () => {
  const token = await tokenAdministrador();
  const { estado, cuerpo } = await pedir('POST', '/api/vendedores', {
    token,
    cuerpo: {
      nombre: 'Diego)Pardo',
      cedula: '1099887766',
      telefono: '+57 316 777 8899',
      correo: 'diego.pardo@telecomhub.com',
      estado: 'Activo',
    },
  });
  assert.equal(estado, 400, 'El nombre con dígitos debe rechazarse');

  const valido = await pedir('POST', '/api/vendedores', {
    token,
    cuerpo: {
      nombre: 'Diego Pardo',
      cedula: '1099887766',
      telefono: '+57 316 777 8899',
      correo: 'diego.pardo@telecomhub.com',
      estado: 'Activo',
    },
  });
  assert.equal(valido.estado, 201);
});

test('POST /api/contratos calcula el estado a partir de las fechas', async () => {
  const token = await tokenAdministrador();

  // 6 meses de vigencia equivalen a unos 184 días: si el contrato começou
  // hace 170 días le quedan 14 días, es decir, está por vencer.
  const inicio = new Date();
  inicio.setDate(inicio.getDate() - 170);
  const { estado, cuerpo } = await pedir('POST', '/api/contratos', {
    token,
    cuerpo: {
      clienteId: 4,
      planId: 1,
      vendedorId: 2,
      inicio: fechas.aISO(inicio),
      vigenciaMeses: 6,
    },
  });
  assert.equal(estado, 201);
  // Quedan menos de 30 días para el vencimiento.
  assert.equal(cuerpo.data.estado, 'Por vencer');
  assert.equal(cuerpo.data.cliente, 'María Ortega');
  assert.equal(cuerpo.data.valorMensual, 65000);
});

test('POST /api/contratos rechaza vigencias no permitidas', async () => {
  const token = await tokenAdministrador();
  const { estado } = await pedir('POST', '/api/contratos', {
    token,
    cuerpo: { clienteId: 1, planId: 1, vendedorId: 1, inicio: '2026-01-15', vigenciaMeses: 18 },
  });
  assert.equal(estado, 400);
});

test('PATCH /api/contratos/:id/cancelar y reactivar controlan el contrato', async () => {
  const token = await tokenAdministrador();

  const cancelado = await pedir('PATCH', '/api/contratos/2/cancelar', { token });
  assert.equal(cancelado.cuerpo.data.estado, 'Cancelado');

  const otraVez = await pedir('PATCH', '/api/contratos/2/cancelar', { token });
  assert.equal(otraVez.estado, 409);

  const reactivado = await pedir('PATCH', '/api/contratos/2/reactivar', { token });
  assert.equal(reactivado.cuerpo.data.estado, 'Vigente');
});

test('POST /api/facturas emite la factura del contrato', async () => {
  const token = await tokenAdministrador();
  const { estado, cuerpo } = await pedir('POST', '/api/facturas', {
    token,
    cuerpo: { contratoId: 1, emision: '2026-07-01', vencimiento: '2026-07-15' },
  });
  assert.equal(estado, 201);
  assert.equal(cuerpo.data.valor, 89000);
  assert.equal(cuerpo.data.estado, 'Vencida', 'La factura venció según la fecha de vencimiento');
});

test('POST /api/facturas exige vencimiento posterior a la emisión', async () => {
  const token = await tokenAdministrador();
  const { estado } = await pedir('POST', '/api/facturas', {
    token,
    cuerpo: { contratoId: 1, emision: '2026-07-15', vencimiento: '2026-07-01' },
  });
  assert.equal(estado, 400);
});

test('POST /api/pagos marca la factura como pagada', async () => {
  const token = await tokenAdministrador();
  const hoy = fechas.hoyISO();

  const { estado, cuerpo } = await pedir('POST', '/api/pagos', {
    token,
    cuerpo: { facturaId: 1, fecha: hoy, metodo: 'Tarjeta' },
  });
  assert.equal(estado, 201);
  assert.equal(cuerpo.data.valor, 89000);

  const factura = await pedir('GET', '/api/facturas/1', { token });
  assert.equal(factura.cuerpo.data.pagada, true);
  assert.equal(factura.cuerpo.data.estado, 'Pagada');
});

test('POST /api/pagos no permite pagar dos veces la misma factura', async () => {
  const token = await tokenAdministrador();
  const { estado, cuerpo } = await pedir('POST', '/api/pagos', {
    token,
    cuerpo: { facturaId: 1, fecha: fechas.hoyISO(), metodo: 'Efectivo' },
  });
  assert.equal(estado, 400);
  // El detalle por campo permite que el formulario muestre el error.
  assert.ok(cuerpo.detalles.some((d) => d.campo === 'facturaId' && /ya fue pagada/i.test(d.mensaje)));
});

test('DELETE /api/pagos/:id devuelve la factura a estado pendiente', async () => {
  const token = await tokenAdministrador();

  // Se localiza el pago registrado para la factura 1.
  const pagos = await pedir('GET', '/api/pagos?facturaId=1', { token });
  const idPago = pagos.cuerpo.data[0].id;

  const { estado } = await pedir('DELETE', `/api/pagos/${idPago}`, { token });
  assert.equal(estado, 200);

  const factura = await pedir('GET', '/api/facturas/1', { token });
  assert.equal(factura.cuerpo.data.pagada, false);
  assert.equal(factura.cuerpo.data.estado, 'Pendiente');
});

test('GET /api/pagos/facturas-pendientes alimenta el formulario de cobro', async () => {
  const token = await tokenAdministrador();
  const { estado, cuerpo } = await pedir('GET', '/api/pagos/facturas-pendientes', { token });
  assert.equal(estado, 200);
  assert.ok(cuerpo.total >= 1);
  assert.ok(cuerpo.data.every((f) => f.pagada === false));
});

test('POST /api/soporte registra y actualiza un ticket', async () => {
  const token = await tokenAdministrador();

  const { estado, cuerpo } = await pedir('POST', '/api/soporte', {
    token,
    cuerpo: {
      clienteId: 2,
      asunto: 'Sin señal',
      descripcion: 'El servicio se cae cada noche desde las ocho.',
      prioridad: 'Alta',
      estado: 'Abierto',
    },
  });
  assert.equal(estado, 201);
  assert.equal(cuerpo.data.cliente, 'Ana Gómez');

  const enProceso = await pedir('PATCH', `/api/soporte/${cuerpo.data.id}/estado`, {
    token,
    cuerpo: { estado: 'En proceso' },
  });
  assert.equal(enProceso.cuerpo.data.estado, 'En proceso');

  // El filtro debe devolver el ticket recién actualizado, no los de la semilla.
  const delCliente = await pedir('GET', '/api/soporte?estado=En proceso&clienteId=2', { token });
  assert.equal(delCliente.cuerpo.total, 1);
  assert.equal(delCliente.cuerpo.data[0].asunto, 'Sin señal');
});

test('GET /api/dashboard devuelve los indicadores del negocio', async () => {
  const token = await tokenAdministrador();
  const { estado, cuerpo } = await pedir('GET', '/api/dashboard', { token });
  assert.equal(estado, 200);
  assert.ok(cuerpo.data.clientes.total >= 5);
  assert.ok(cuerpo.data.contratos.total >= 4);
  assert.ok(cuerpo.data.soporte.total >= 5);
  assert.ok(Array.isArray(cuerpo.data.ultimosTickets));
});

test('GET /api/dashboard/ventas-venciones no existe: se responde 404', async () => {
  const token = await tokenAdministrador();
  const { estado } = await pedir('GET', '/api/dashboard/ventas-venciones', { token });
  assert.equal(estado, 404);
});

test('GET /api/dashboard/ventas-vendedores agrupa la producción comercial', async () => {
  const token = await tokenAdministrador();
  const { estado, cuerpo } = await pedir('GET', '/api/dashboard/ventas-vendedores', { token });
  assert.equal(estado, 200);
  assert.equal(cuerpo.data.length, 3);
  const total = cuerpo.data.reduce((suma, v) => suma + v.contratos, 0);
  assert.ok(total >= 4);
});

test('GET /api/usuarios solo permite escribir al rol Administrador', async () => {
  const token = await tokenAdministrador();

  const listar = await pedir('GET', '/api/usuarios', { token });
  assert.equal(listar.estado, 200);
  assert.equal(listar.cuerpo.data.length, 4);

  const soporte = await pedir('POST', '/api/auth/login', {
    cuerpo: { username: 'soporte', password: 'Soporte123' },
  });
  const tokenSoporte = soporte.cuerpo.data.token;

  const prohibido = await pedir('POST', '/api/usuarios', {
    token: tokenSoporte,
    cuerpo: { nombre: 'Nuevo Usuario', username: 'nuevo1', password: 'Clave123', rol: 'Supervisor', estado: 'Activo' },
  });
  assert.equal(prohibido.estado, 403);
  assert.equal(prohibido.cuerpo.error, 'ROL_SIN_PERMISO');

  const permitido = await pedir('POST', '/api/usuarios', {
    token,
    cuerpo: { nombre: 'Nuevo Usuario', username: 'nuevo1', password: 'Clave123', rol: 'Supervisor', estado: 'Activo' },
  });
  assert.equal(permitido.estado, 201);
});

test('Un usuario desactivado no puede iniciar sesión', async () => {
  const token = await tokenAdministrador();
  await pedir('PATCH', '/api/usuarios/3/estado', { token, cuerpo: { estado: 'Inactivo' } });

  const { estado } = await pedir('POST', '/api/auth/login', {
    cuerpo: { username: 'soporte', password: 'Soporte123' },
  });
  assert.equal(estado, 401);
});

test('Rutas inexistentes responden 404 en formato JSON', async () => {
  const { estado, cuerpo } = await pedir('GET', '/api/modulo-inexistente');
  assert.equal(estado, 404);
  assert.equal(cuerpo.ok, false);
  assert.equal(cuerpo.error, 'RUTA_NO_ENCONTRADA');
});
