// Controlador de planes de servicio.
// Expone los servicios web del catálogo comercial de TelecomHub.

const planService = require('../services/plan.service');
const { creado, exito, listar } = require('../utils/respuesta');
const { capturar } = require('../utils/asyncHandler');

// Lista los planes con filtros opcionales (?estado=&tipo=&busqueda=).
const listarPlanes = capturar(async (req, res) => {
  const { estado, tipo, busqueda } = req.query;
  const planes = planService.listar({ estado, tipo, busqueda });
  return listar(res, 'Listado de planes de servicio.', planes, { total: planes.length });
});

// Devuelve un plan por identificador.
const obtenerPlan = capturar(async (req, res) => {
  const plan = planService.obtenerPorId(req.params.id);
  return exito(res, 200, 'Plan de servicio encontrado.', plan);
});

// Crea un plan de servicio nuevo.
const crearPlan = capturar(async (req, res) => {
  const plan = planService.crear(req.body);
  return creado(res, 'Plan de servicio creado correctamente.', plan);
});

// Actualiza un plan de servicio.
const actualizarPlan = capturar(async (req, res) => {
  const plan = planService.actualizar(req.params.id, req.body);
  return exito(res, 200, 'Plan de servicio actualizado correctamente.', plan);
});

// Activa o inactiva un plan de servicio.
const cambiarEstadoPlan = capturar(async (req, res) => {
  const { estado } = req.body;
  const plan = planService.cambiarEstado(req.params.id, estado);
  return exito(res, 200, 'Estado del plan actualizado correctamente.', plan);
});

// Elimina un plan de servicio.
const eliminarPlan = capturar(async (req, res) => {
  const plan = planService.eliminar(req.params.id);
  return exito(res, 200, 'Plan de servicio eliminado correctamente.', plan);
});

module.exports = {
  listarPlanes,
  obtenerPlan,
  crearPlan,
  actualizarPlan,
  cambiarEstadoPlan,
  eliminarPlan,
};
