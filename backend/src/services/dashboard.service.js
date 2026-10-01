// Servicio de indicadores (módulo Dashboard).
// Consolida en un solo servicio web las cifras que la pantalla principal
// muestra: totales, cartera, facturación y estado de las solicitudes.

const store = require('../db/store');
const fechas = require('../utils/fechas');
const contratoService = require('./contrato.service');
const facturaService = require('./factura.service');
const pagoService = require('./pago.service');
const ticketService = require('./ticket.service');
const clienteService = require('./cliente.service');

// Agrupa una lista de elementos por una clave y cuenta cada grupo.
function contarPor(elementos, obtenerClave) {
  return elementos.reduce((acumulador, elemento) => {
    const clave = obtenerClave(elemento);
    acumulador[clave] = (acumulador[clave] || 0) + 1;
    return acumulador;
  }, {});
}

// Suma una propiedad numérica de todos los elementos.
function sumar(elementos, propiedad) {
  return elementos.reduce((total, elemento) => total + Number(elemento[propiedad] || 0), 0);
}

// Calcula los indicadores principales del negocio.
function indicadores() {
  const clientes = store.obtenerTodos('clientes');
  const contratos = store.obtenerTodos('contratos').map(contratoService.presentacion);
  const facturas = store.obtenerTodos('facturas').map(facturaService.presentacion);
  const pagos = store.obtenerTodos('pagos');
  const tickets = store.obtenerTodos('tickets').map(ticketService.presentacion);

  const hoy = fechas.hoyISO();
  const mesActual = hoy.slice(0, 7);
  const pagosDelMes = pagos.filter((p) => p.fecha.startsWith(mesActual));
  const facturasPendientes = facturas.filter((f) => !f.pagada);
  const carteraPorCobrar = sumar(facturasPendientes, 'valor');

  return {
    clientes: {
      total: clientes.length,
      activos: clientes.filter((c) => c.estado === 'Activo').length,
      suspendidos: clientes.filter((c) => c.estado === 'Suspendido').length,
    },
    contratos: {
      total: contratos.length,
      vigentes: contratos.filter((c) => c.estado === 'Vigente').length,
      porVencer: contratos.filter((c) => c.estado === 'Por vencer').length,
      finalizados: contratos.filter((c) => c.estado === 'Finalizado').length,
      cancelados: contratos.filter((c) => c.estado === 'Cancelado').length,
      ingresoMensual: sumar(
        contratos.filter((c) => c.estado === 'Vigente' || c.estado === 'Por vencer'),
        'valorMensual'
      ),
    },
    facturacion: {
      total: facturas.length,
      pendientes: facturasPendientes.length,
      vencidas: facturas.filter((f) => f.estado === 'Vencida').length,
      facturado: sumar(facturas, 'valor'),
      carteraPorCobrar,
    },
    pagos: {
      total: pagos.length,
      delMes: pagosDelMes.length,
      recaudoDelMes: sumar(pagosDelMes, 'valor'),
      recaudoTotal: sumar(pagos, 'valor'),
      porMetodo: contarPor(pagos, (p) => p.metodo),
    },
    soporte: {
      total: tickets.length,
      abiertos: tickets.filter((t) => t.estado === 'Abierto').length,
      enProceso: tickets.filter((t) => t.estado === 'En proceso').length,
      resueltos: tickets.filter((t) => t.estado === 'Resuelto').length,
      porPrioridad: contarPor(tickets.filter((t) => t.estado !== 'Resuelto'), (t) => t.prioridad),
    },
  };
}

// Devuelve los indicadores más los últimos tickets y clientes registrados,
// que son las tablas que aparecen debajo de las tarjetas del dashboard.
function resumen() {
  const ultimosTickets = store
    .obtenerTodos('tickets')
    .map(ticketService.presentacion)
    .sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
    .slice(0, 5);

  const ultimosClientes = store
    .obtenerTodos('clientes')
    .map(clienteService.presentacion)
    .slice(-5)
    .reverse();

  return {
    ...indicadores(),
    ultimosTickets,
    ultimosClientes,
  };
}

// Reporte de ventas por vendedor, usado por el módulo de administración.
function ventasPorVendedor() {
  const vendedores = store.obtenerTodos('vendedores');
  return vendedores.map((vendedor) => {
    const contratos = store
      .obtenerTodos('contratos')
      .filter((c) => c.vendedorId === vendedor.id)
      .map(contratoService.presentacion);
    return {
      vendedor: vendedor.nombre,
      vendedorId: vendedor.id,
      contratos: contratos.length,
      contratosVigentes: contratos.filter((c) => c.estado === 'Vigente' || c.estado === 'Por vencer').length,
      ingresoMensual: sumar(
        contratos.filter((c) => c.estado === 'Vigente' || c.estado === 'Por vencer'),
        'valorMensual'
      ),
    };
  });
}

// Reporte de facturación de un cliente: contrato, facturas y pagos.
function estadoDeCuenta(clienteId) {
  const cliente = clienteService.obtenerPorId(clienteId);
  const contratos = store
    .obtenerTodos('contratos')
    .filter((c) => c.clienteId === cliente.id)
    .map(contratoService.presentacion);
  const facturas = store
    .obtenerTodos('facturas')
    .filter((f) => f.clienteId === cliente.id)
    .map(facturaService.presentacion);
  const pagos = store
    .obtenerTodos('pagos')
    .filter((p) => p.clienteId === cliente.id)
    .map(pagoService.presentacion);

  return {
    cliente,
    contratos,
    facturas,
    pagos,
    totales: {
      facturado: sumar(facturas, 'valor'),
      pagado: sumar(pagos, 'valor'),
      saldo: sumar(facturas, 'valor') - sumar(pagos, 'valor'),
    },
  };
}

module.exports = { indicadores, resumen, ventasPorVendedor, estadoDeCuenta };
