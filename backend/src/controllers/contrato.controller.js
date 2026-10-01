// Controlador de contratos.
// Expone los servicios web de captura y seguimiento de contratos.

const contratoService = require('../services/contrato.service');
const { creado, exito, listar } = require('../utils/respuesta');
const { capturar } = require('../utils/asyncHandler');

// Lista los contratos con filtros opcionales
// (?clienteId=&vendedorId=&planId=&estado=&busqueda=).
const listarContratos = capturar(async (req, res) => {
  const { clienteId, vendedorId, planId, estado, busqueda } = req.query;
  const contratos = contratoService.listar({ clienteId, vendedorId, planId, estado, busqueda });
  return listar(res, 'Listado de contratos.', contratos, { total: contratos.length });
});

// Devuelve un contrato por identificador.
const obtenerContrato = capturar(async (req, res) => {
  const contrato = contratoService.obtenerPorId(req.params.id);
  return exito(res, 200, 'Contrato encontrado.', contrato);
});

// Registra un contrato nuevo.
const crearContrato = capturar(async (req, res) => {
  const contrato = contratoService.crear(req.body);
  return creado(res, 'Contrato registrado correctamente.', contrato);
});

// Actualiza un contrato vigente.
const actualizarContrato = capturar(async (req, res) => {
  const contrato = contratoService.actualizar(req.params.id, req.body);
  return exito(res, 200, 'Contrato actualizado correctamente.', contrato);
});

// Cancela un contrato.
const cancelarContrato = capturar(async (req, res) => {
  const contrato = contratoService.cancelar(req.params.id);
  return exito(res, 200, 'Contrato cancelado correctamente.', contrato);
});

// Reactiva un contrato cancelado.
const reactivarContrato = capturar(async (req, res) => {
  const contrato = contratoService.reactivar(req.params.id);
  return exito(res, 200, 'Contrato reactivado correctamente.', contrato);
});

// Elimina un contrato.
const eliminarContrato = capturar(async (req, res) => {
  const contrato = contratoService.eliminar(req.params.id);
  return exito(res, 200, 'Contrato eliminado correctamente.', contrato);
});

module.exports = {
  listarContratos,
  obtenerContrato,
  crearContrato,
  actualizarContrato,
  cancelarContrato,
  reactivarContrato,
  eliminarContrato,
};
