// Controlador de pagos.
// Expone los servicios web de registro y consulta de pagos de facturas.

const pagoService = require('../services/pago.service');
const { creado, exito, listar } = require('../utils/respuesta');
const { capturar } = require('../utils/asyncHandler');

// Lista los pagos con filtros opcionales
// (?clienteId=&facturaId=&metodo=&desde=&hasta=&busqueda=).
const listarPagos = capturar(async (req, res) => {
  const { clienteId, facturaId, metodo, desde, hasta, busqueda } = req.query;
  const pagos = pagoService.listar({ clienteId, facturaId, metodo, desde, hasta, busqueda });
  return listar(res, 'Listado de pagos.', pagos, { total: pagos.length });
});

// Devuelve un pago por identificador.
const obtenerPago = capturar(async (req, res) => {
  const pago = pagoService.obtenerPorId(req.params.id);
  return exito(res, 200, 'Pago encontrado.', pago);
});

// Registra el pago de una factura y la marca como pagada.
const registrarPago = capturar(async (req, res) => {
  const pago = pagoService.registrar(req.body);
  return creado(res, 'Pago registrado correctamente.', pago);
});

// Elimina un pago y devuelve la factura a estado pendiente.
const eliminarPago = capturar(async (req, res) => {
  const pago = pagoService.eliminar(req.params.id);
  return exito(res, 200, 'Pago eliminado correctamente. La factura quedó pendiente.', pago);
});

// Lista las facturas que aún no tienen pago, para el formulario de la interfaz.
const listarFacturasPendientes = capturar(async (req, res) => {
  const facturas = pagoService.listarFacturasPendientes();
  return listar(res, 'Facturas pendientes de pago.', facturas, { total: facturas.length });
});

module.exports = {
  listarPagos,
  obtenerPago,
  registrarPago,
  eliminarPago,
  listarFacturasPendientes,
};
