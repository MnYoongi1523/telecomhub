// Rutas del servicio web de vendedores.
// Base: /api/vendedores
// GET    /            -> lista vendedores (?estado=&busqueda=)
// GET    /:id         -> consulta un vendedor
// POST   /            -> registra un vendedor
// PUT    /:id         -> actualiza un vendedor
// PATCH  /:id/estado  -> activa o inactiva un vendedor
// DELETE /:id         -> elimina un vendedor

const { Router } = require('express');
const {
  listarVendedores,
  obtenerVendedor,
  crearVendedor,
  actualizarVendedor,
  cambiarEstadoVendedor,
  eliminarVendedor,
} = require('../controllers/vendedor.controller');
const { verificarToken } = require('../middlewares/verificarToken');
const { autorizarRoles } = require('../middlewares/autorizarRoles');

const router = Router();
const escritura = autorizarRoles(['Administrador', 'Supervisor']);
const eliminacion = autorizarRoles(['Administrador']);

router.get('/', verificarToken, listarVendedores);
router.get('/:id', verificarToken, obtenerVendedor);
router.post('/', verificarToken, escritura, crearVendedor);
router.put('/:id', verificarToken, escritura, actualizarVendedor);
router.patch('/:id/estado', verificarToken, escritura, cambiarEstadoVendedor);
router.delete('/:id', verificarToken, eliminacion, eliminarVendedor);

module.exports = router;
