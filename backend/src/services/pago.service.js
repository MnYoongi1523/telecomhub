// Servicio de pagos.
// Registra el pago de una factura y marca la factura como pagada.
// Ambas operaciones se realizan juntas para que no queden facturas pagadas
// sin su pago correspondiente.

const store = require('../db/store');
const errores = require('../utils/errores');
const v = require('../utils/validadores');
const fechas = require('../utils/fechas');
const facturaService = require('./factura.service');

const METODOS = ['Efectivo', 'Transferencia', 'Tarjeta'];

// Arma la respuesta del pago con el nombre del cliente.
function presentacion(pago) {
  const cliente = store.obtenerPorId('clientes', pago.clienteId);
  const factura = store.obtenerPorId('facturas', pago.facturaId);
  return {
    ...pago,
    cliente: cliente ? cliente.nombre : null,
    facturaEstado: factura ? factura.pagada ? 'Pagada' : 'Pendiente' : null,
  };
}

// Valida los datos de un pago y devuelve { errores, datos }.
function validarCampos({ facturaId, fecha, metodo }) {
  const listaErrores = [];
  const datos = {};

  const factura = store.obtenerPorId('facturas', facturaId);
  if (!factura) {
    listaErrores.push({ campo: 'facturaId', mensaje: 'Factura no válida' });
  } else if (factura.pagada) {
    listaErrores.push({ campo: 'facturaId', mensaje: 'Esta factura ya fue pagada' });
  } else {
    datos.facturaId = factura.id;
  }

  const errorFecha = v.fechaIso(fecha);
  if (errorFecha) {
    listaErrores.push({ campo: 'fecha', mensaje: 'La fecha de pago es obligatoria y debe tener el formato YYYY-MM-DD' });
  } else {
    const limpio = String(fecha).trim();
    const fechaPago = fechas.desdeISO(limpio);
    // El pago no puede registrarse antes de emitir la factura ni en el futuro.
    const limiteSuperior = new Date();
    limiteSuperior.setHours(23, 59, 59, 999);

    if (factura && fechaPago < fechas.desdeISO(factura.emision)) {
      listaErrores.push({ campo: 'fecha', mensaje: 'No puede ser anterior a la fecha de emisión de la factura' });
    } else if (fechaPago > limiteSuperior) {
      listaErrores.push({ campo: 'fecha', mensaje: 'La fecha de pago no puede ser futura' });
    } else {
      datos.fecha = limpio;
    }
  }

  if (!METODOS.includes(metodo)) {
    listaErrores.push({ campo: 'metodo', mensaje: `El método de pago debe ser uno de: ${METODOS.join(', ')}` });
  } else {
    datos.metodo = metodo;
  }

  return { errores: listaErrores, datos };
}

// Registra el pago de una factura y la marca como pagada.
function registrar(datosEntrada) {
  const { errores: listaErrores, datos } = validarCampos(datosEntrada);
  if (listaErrores.length > 0) throw errores.peticionInvalida('Los datos del pago no son válidos.', 'VALIDACION', listaErrores);

  const factura = store.obtenerPorId('facturas', datos.facturaId);
  const pago = store.insertar('pagos', {
    facturaId: factura.id,
    clienteId: factura.clienteId,
    valor: factura.valor,
    fecha: datos.fecha,
    metodo: datos.metodo,
  });
  store.actualizar('facturas', factura.id, { pagada: true });

  return presentacion(pago);
}

// Lista los pagos con filtros opcionales.
function listar(filtros = {}) {
  let pagos = store.obtenerTodos('pagos');

  if (filtros.facturaId) pagos = pagos.filter((p) => p.facturaId === Number(filtros.facturaId));
  if (filtros.clienteId) pagos = pagos.filter((p) => p.clienteId === Number(filtros.clienteId));
  if (filtros.metodo) pagos = pagos.filter((p) => p.metodo === filtros.metodo);
  if (filtros.desde) pagos = pagos.filter((p) => p.fecha >= filtros.desde);
  if (filtros.hasta) pagos = pagos.filter((p) => p.fecha <= filtros.hasta);

  let resultados = pagos.map(presentacion);

  if (filtros.busqueda) {
    const termino = v.minusculas(filtros.busqueda);
    resultados = resultados.filter((p) => v.minusculas(p.cliente || '').includes(termino));
  }

  return resultados;
}

// Devuelve un pago por identificador.
function obtenerPorId(id) {
  const pago = store.obtenerPorId('pagos', id);
  if (!pago) throw errores.noEncontrado('El pago solicitado no existe.');
  return presentacion(pago);
}

// Elimina un pago y devuelve la factura a estado pendiente.
function eliminar(id) {
  const pago = obtenerPorId(id);
  store.eliminar('pagos', id);
  store.actualizar('facturas', pago.facturaId, { pagada: false });
  return presentacion(pago);
}

// Devuelve las facturas que todavía no tienen pago, para el formulario de la
// interfaz "Registrar Pago".
function listarFacturasPendientes() {
  return store
    .obtenerTodos('facturas')
    .filter((f) => !f.pagada)
    .map(facturaService.presentacion);
}

module.exports = {
  METODOS,
  presentacion,
  registrar,
  listar,
  obtenerPorId,
  eliminar,
  listarFacturasPendientes,
};

