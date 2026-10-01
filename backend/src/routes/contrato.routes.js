// Rutas del servicio web de contratos.
// Base: /api/contratos
// GET    /             -> lista contratos (?clienteId=&vendedorId=&planId=&estado=&busqueda=)
// GET    /:id          -> consulta un contrato
// POST   /             -> registra un contrato
// PUT    /:id          -> actualiza un contrato
// PATCH  /:id/cancelar -> cancela un contrato
// PATCH  /:id/reactivar-> reactiva un contrato cancelado
// DELETE /:id          -> elimina un contrato

const { Router } = require('express');
const {
  listarContratos,
  obtenerContrato,
  crearContrato,
  actualizarContrato,
  cancelarContrato,
  reactivarContrato,
  eliminarContrato,
} = require('../controllers/contrato.controller');
const { verificarToken } = require('../middlewares/verificarToken');
const { autorizarRoles } = require('../middlewares/autorizarRoles');

const router = Router();
const escritura = autorizarRoles(['Administrador', 'Supervisor']);
const eliminacion = autorizarRoles(['Administrador']);

router.get('/', verificarToken, listarContratos);
router.get('/:id', verificarToken, obtenerContrato);
router.post('/', verificarToken, escritura, crearContrato);
router.put('/:id', verificarToken, escritura, actualizarContrato);
router.patch('/:id/cancelar', verificarToken, escritura, cancelarContrato);
router.patch('/:id/reactivar', verificarToken, escritura, reactivarContrato);
router.delete('/:id', verificarToken, eliminacion, eliminarContrato);

module.exports = router;
