// Rutas del servicio web de facturas.
// Base: /api/facturas
// GET    /            -> lista facturas (?clienteId=&contratoId=&estado=&pagada=&busqueda=)
// GET    /:id         -> consulta una factura
// POST   /            -> emite una factura para un contrato
// PUT    /:id         -> actualiza las fechas de una factura pendiente
// DELETE /:id         -> elimina una factura sin pagos

const { Router } = require('express');
const {
  listarFacturas,
  obtenerFactura,
  crearFactura,
  actualizarFactura,
  eliminarFactura,
} = require('../controllers/factura.controller');
const { verificarToken } = require('../middlewares/verificarToken');
const { autorizarRoles } = require('../middlewares/autorizarRoles');

const router = Router();
const escritura = autorizarRoles(['Administrador', 'Supervisor']);
const eliminacion = autorizarRoles(['Administrador']);

router.get('/', verificarToken, listarFacturas);
router.get('/:id', verificarToken, obtenerFactura);
router.post('/', verificarToken, escritura, crearFactura);
router.put('/:id', verificarToken, escritura, actualizarFactura);
router.delete('/:id', verificarToken, eliminacion, eliminarFactura);

module.exports = router;
