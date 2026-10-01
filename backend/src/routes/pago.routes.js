// Rutas del servicio web de pagos.
// Base: /api/pagos
// GET  /                  -> lista pagos (?clienteId=&facturaId=&metodo=&desde=&hasta=&busqueda=)
// GET  /facturas-pendientes -> facturas que aún no tienen pago
// GET  /:id               -> consulta un pago
// POST /                  -> registra el pago de una factura
// DELETE /:id             -> elimina un pago y libera la factura

const { Router } = require('express');
const {
  listarPagos,
  obtenerPago,
  registrarPago,
  eliminarPago,
  listarFacturasPendientes,
} = require('../controllers/pago.controller');
const { verificarToken } = require('../middlewares/verificarToken');
const { autorizarRoles } = require('../middlewares/autorizarRoles');

const router = Router();
const escritura = autorizarRoles(['Administrador', 'Supervisor', 'Soporte Técnico']);
const eliminacion = autorizarRoles(['Administrador', 'Supervisor']);

// Esta ruta debe declararse antes que "/:id" para no ser capturada por ella.
router.get('/facturas-pendientes', verificarToken, listarFacturasPendientes);

router.get('/', verificarToken, listarPagos);
router.get('/:id', verificarToken, obtenerPago);
router.post('/', verificarToken, escritura, registrarPago);
router.delete('/:id', verificarToken, eliminacion, eliminarPago);

module.exports = router;
