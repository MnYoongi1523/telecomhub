// Rutas del servicio web de indicadores y reportes.
// Base: /api/dashboard
// GET /                     -> resumen con tarjetas, últimos tickets y clientes
// GET /indicadores          -> solo los indicadores numéricos
// GET /ventas-vendedores    -> reporte de ventas por vendedor
// GET /clientes/:clienteId/estado-cuenta -> estado de cuenta de un cliente

const { Router } = require('express');
const {
  obtenerResumen,
  obtenerIndicadores,
  obtenerVentasPorVendedor,
  obtenerEstadoDeCuenta,
} = require('../controllers/dashboard.controller');
const { verificarToken } = require('../middlewares/verificarToken');
const { autorizarRoles } = require('../middlewares/autorizarRoles');

const router = Router();
const soloAdministracion = autorizarRoles(['Administrador', 'Supervisor']);

router.get('/', verificarToken, obtenerResumen);
router.get('/indicadores', verificarToken, obtenerIndicadores);
router.get('/ventas-vendedores', verificarToken, soloAdministracion, obtenerVentasPorVendedor);
router.get(
  '/clientes/:clienteId/estado-cuenta',
  verificarToken,
  soloAdministracion,
  obtenerEstadoDeCuenta
);

module.exports = router;
