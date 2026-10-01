// Datos iniciales del sistema TelecomHub.
// Se cargan al arrancar el servicio para que los módulos del software
// (Clientes, Planes, Contratos, Facturas, Pagos, Vendedores, Soporte y
// Administración) tengan información con la que operar desde el primer momento.

const bcrypt = require('bcryptjs');
const store = require('./store');
const config = require('../config');
const fechas = require('../utils/fechas');

// Fecha de hoy en formato YYYY-MM-DD (usada para emitir y vencer facturas).
function hoyISO() {
  return fechas.hoyISO();
}

// Resta una cantidad de días a la fecha actual y la devuelve en formato ISO.
function diasAtrasISO(dias) {
  return fechas.sumarDias(new Date(), -dias);
}

// Suma una cantidad de días a la fecha actual y la devuelve en formato ISO.
function diasAdelanteISO(dias) {
  return fechas.sumarDias(new Date(), dias);
}

// Carga los datos iniciales en la capa de persistencia.
async function sembrar() {
  // Si ya hay información no se siembra nuevamente (evita duplicados al
  // reiniciar el proceso dentro de la misma ejecución).
  if (store.obtenerTodos('planes').length > 0) return;

  // --- Usuarios del sistema (módulo Administración) ---
  const usuarios = [
    {
      nombre: 'Santiago Ramírez',
      username: 'administrador',
      password: 'Admin123',
      rol: 'Administrador',
      estado: 'Activo',
    },
    {
      nombre: 'Fernando Forero',
      username: 'supervisor',
      password: 'Super123',
      rol: 'Supervisor',
      estado: 'Activo',
    },
    {
      nombre: 'María Ortega',
      username: 'soporte',
      password: 'Soporte123',
      rol: 'Soporte Técnico',
      estado: 'Activo',
    },
  ];

  for (const usuario of usuarios) {
    const passwordHash = await bcrypt.hash(usuario.password, config.bcryptRondas);
    store.insertar('usuarios', {
      nombre: usuario.nombre,
      username: usuario.username,
      passwordHash,
      rol: usuario.rol,
      estado: usuario.estado,
      creadoEn: new Date().toISOString(),
    });
  }

  // --- Planes de servicio ---
  const planes = [
    { nombre: 'Fibra 100MB', velocidad: 100, precio: 65000, tipo: 'Fibra', estado: 'Activo' },
    { nombre: 'Fibra 300MB', velocidad: 300, precio: 89000, tipo: 'Fibra', estado: 'Activo' },
    { nombre: 'Fibra 500MB', velocidad: 500, precio: 120000, tipo: 'Fibra', estado: 'Activo' },
    { nombre: 'Banda Ancha 80MB', velocidad: 80, precio: 55000, tipo: 'Banda Ancha', estado: 'Activo' },
  ];
  for (const plan of planes) store.insertar('planes', plan);

  // --- Vendedores ---
  const vendedores = [
    {
      nombre: 'Julián Rojas',
      cedula: '1098765432',
      telefono: '+57 300 111 2233',
      correo: 'julian.rojas@telecomhub.com',
      estado: 'Activo',
    },
    {
      nombre: 'Camila Suárez',
      cedula: '1023456789',
      telefono: '+57 315 444 5566',
      correo: 'camila.suarez@telecomhub.com',
      estado: 'Activo',
    },
  ];
  for (const vendedor of vendedores) store.insertar('vendedores', vendedor);

  // --- Clientes ---
  const clientes = [
    {
      nombre: 'Carlos Mendoza',
      cedula: '1010203040',
      telefono: '+57 300 123 4567',
      correo: 'carlos.mendoza@correo.com',
      planId: 2,
      direccion: 'Calle 45 # 12-30, Bogotá',
      estado: 'Activo',
    },
    {
      nombre: 'Ana Gómez',
      cedula: '1020304050',
      telefono: '+57 310 987 6543',
      correo: 'ana.gomez@correo.com',
      planId: 1,
      direccion: 'Carrera 8 # 22-15, Medellín',
      estado: 'Activo',
    },
    {
      nombre: 'Luis Torres',
      cedula: '1030405060',
      telefono: '+57 320 456 7890',
      correo: 'luis.torres@correo.com',
      planId: 3,
      direccion: 'Avenida 6 # 33-18, Cali',
      estado: 'Suspendido',
    },
    {
      nombre: 'María Ortega',
      cedula: '1040506070',
      telefono: '+57 315 222 3344',
      correo: 'maria.ortega@correo.com',
      planId: 2,
      direccion: 'Calle 10 # 5-44, Barranquilla',
      estado: 'Activo',
    },
  ];
  for (const cliente of clientes) store.insertar('clientes', cliente);

  // --- Contratos ---
  const contratos = [
    { clienteId: 1, planId: 2, vendedorId: 1, inicio: diasAtrasISO(120), vigenciaMeses: 12 },
    { clienteId: 2, planId: 1, vendedorId: 2, inicio: diasAtrasISO(60), vigenciaMeses: 12 },
    { clienteId: 3, planId: 3, vendedorId: 1, inicio: diasAtrasISO(200), vigenciaMeses: 6 },
  ];
  for (const contrato of contratos) {
    const plan = store.obtenerPorId('planes', contrato.planId);
    store.insertar('contratos', { ...contrato, valorMensual: plan.precio, cancelado: false });
  }

  // --- Facturas ---
  const facturas = [
    {
      contratoId: 1,
      emision: diasAtrasISO(30),
      vencimiento: diasAdelanteISO(15),
    },
    {
      contratoId: 2,
      emision: diasAtrasISO(40),
      vencimiento: diasAtrasISO(25),
    },
  ];
  for (const factura of facturas) {
    const contrato = store.obtenerPorId('contratos', factura.contratoId);
    const cliente = store.obtenerPorId('clientes', contrato.clienteId);
    const plan = store.obtenerPorId('planes', contrato.planId);
    store.insertar('facturas', {
      contratoId: contrato.id,
      clienteId: cliente.id,
      planId: plan.id,
      valor: contrato.valorMensual,
      emision: factura.emision,
      vencimiento: factura.vencimiento,
      pagada: false,
    });
  }

  // --- Pagos (la segunda factura queda pagada) ---
  const facturaPagada = store.obtenerPorId('facturas', 2);
  store.insertar('pagos', {
    facturaId: facturaPagada.id,
    clienteId: facturaPagada.clienteId,
    valor: facturaPagada.valor,
    fecha: diasAtrasISO(20),
    metodo: 'Transferencia',
  });
  store.actualizar('facturas', facturaPagada.id, { pagada: true });

  // --- Tickets de soporte ---
  const tickets = [
    { clienteId: 1, asunto: 'Falla de Internet', descripcion: 'Sin señal desde la madrugada.', prioridad: 'Alta', estado: 'Abierto' },
    { clienteId: 2, asunto: 'Cambio de Plan', descripcion: 'Solicita pasar a Fibra 300MB.', prioridad: 'Baja', estado: 'Resuelto' },
    { clienteId: 3, asunto: 'Reporte de Caída', descripcion: 'Intermitencias durante la tarde.', prioridad: 'Alta', estado: 'Abierto' },
    { clienteId: 4, asunto: 'Consulta de Factura', descripcion: 'Duda sobre el valor facturado.', prioridad: 'Media', estado: 'En proceso' },
  ];
  for (const ticket of tickets) {
    store.insertar('tickets', { ...ticket, fecha: hoyISO() });
  }

  console.log('Datos iniciales cargados en el almacén en memoria.');
}

module.exports = { sembrar };
