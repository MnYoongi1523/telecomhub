// Rutas del servicio web de clientes.
// Base: /api/clientes
// GET    /            -> lista clientes (?estado=&busqueda=&planId=)
// GET    /:id         -> consulta un cliente
// POST   /            -> registra un cliente
// PUT    /:id         -> actualiza un cliente
// PATCH  /:id/estado  -> suspende o reactiva un cliente
// DELETE /:id         -> elimina un cliente

const { Router } = require('express');
const {
  listarClientes,
  obtenerCliente,
  crearCliente,
  actualizarCliente,
  cambiarEstadoCliente,
  eliminarCliente,
} = require('../controllers/cliente.controller');
const { verificarToken } = require('../middlewares/verificarToken');
const { autorizarRoles } = require('../middlewares/autorizarRoles');

const router = Router();

// Captación y edición: Administrador y Supervisor.
const escritura = autorizarRoles(['Administrador', 'Supervisor']);
// La eliminación es una tarea crítica: solo Administrador.
const eliminacion = autorizarRoles(['Administrador']);

router.get('/', verificarToken, listarClientes);
router.get('/:id', verificarToken, obtenerCliente);
router.post('/', verificarToken, escritura, crearCliente);
router.put('/:id', verificarToken, escritura, actualizarCliente);
router.patch('/:id/estado', verificarToken, escritura, cambiarEstadoCliente);
router.delete('/:id', verificarToken, eliminacion, eliminarCliente);

module.exports = router;
