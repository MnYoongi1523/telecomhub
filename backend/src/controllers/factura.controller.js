// Controlador de facturas.
// Expone los servicios web de emisión y consulta de la facturación mensual.

const facturaService = require('../services/factura.service');
const { creado, exito, listar } = require('../utils/respuesta');
const { capturar } = require('../utils/asyncHandler');

// Lista las facturas con filtros opcionales
// (?clienteId=&contratoId=&estado=&pagada=&busqueda=).
const listarFacturas = capturar(async (req, res) => {
  const { clienteId, contratoId, estado, pagada, busqueda } = req.query;
  const facturas = facturaService.listar({ clienteId, contratoId, estado, pagada, busqueda });
  return listar(res, 'Listado de facturas.', facturas, { total: facturas.length });
});

// Devuelve una factura por identificador.
const obtenerFactura = capturar(async (req, res) => {
  const factura = facturaService.obtenerPorId(req.params.id);
  return exito(res, 200, 'Factura encontrada.', factura);
});

// Emite una factura para un contrato.
const crearFactura = capturar(async (req, res) => {
  const factura = facturaService.crear(req.body);
  return creado(res, 'Factura generada correctamente.', factura);
});

// Actualiza las fechas de una factura pendiente.
const actualizarFactura = capturar(async (req, res) => {
  const factura = facturaService.actualizar(req.params.id, req.body);
  return exito(res, 200, 'Factura actualizada correctamente.', factura);
});

// Elimina una factura sin pagos registrados.
const eliminarFactura = capturar(async (req, res) => {
  const factura = facturaService.eliminar(req.params.id);
  return exito(res, 200, 'Factura eliminada correctamente.', factura);
});

module.exports = { listarFacturas, obtenerFactura, crearFactura, actualizarFactura, eliminarFactura };
