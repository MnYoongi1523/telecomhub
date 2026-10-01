// Rutas del servicio web de planes de servicio.
// Base: /api/planes
// GET    /            -> lista planes (?estado=&tipo=&busqueda=)
// GET    /:id         -> consulta un plan
// POST   /            -> crea un plan
// PUT    /:id         -> actualiza un plan
// PATCH  /:id/estado  -> activa o inactiva un plan
// DELETE /:id         -> elimina un plan

const { Router } = require('express');
const {
  listarPlanes,
  obtenerPlan,
  crearPlan,
  actualizarPlan,
  cambiarEstadoPlan,
  eliminarPlan,
} = require('../controllers/plan.controller');
const { verificarToken } = require('../middlewares/verificarToken');
const { autorizarRoles } = require('../middlewares/autorizarRoles');

const router = Router();
const escritura = autorizarRoles(['Administrador', 'Supervisor']);
const eliminacion = autorizarRoles(['Administrador']);

router.get('/', verificarToken, listarPlanes);
router.get('/:id', verificarToken, obtenerPlan);
router.post('/', verificarToken, escritura, crearPlan);
router.put('/:id', verificarToken, escritura, actualizarPlan);
router.patch('/:id/estado', verificarToken, escritura, cambiarEstadoPlan);
router.delete('/:id', verificarToken, eliminacion, eliminarPlan);

module.exports = router;
