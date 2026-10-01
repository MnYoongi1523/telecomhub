// Rutas del servicio web de soporte (tickets).
// Base: /api/soporte
// GET    /            -> lista tickets (?clienteId=&prioridad=&estado=&busqueda=)
// GET    /:id         -> consulta un ticket
// POST   /            -> registra un ticket
// PUT    /:id         -> actualiza un ticket
// PATCH  /:id/estado  -> cambia el estado de seguimiento
// DELETE /:id         -> elimina un ticket

const { Router } = require('express');
const {
  listarTickets,
  obtenerTicket,
  crearTicket,
  actualizarTicket,
  cambiarEstadoTicket,
  eliminarTicket,
} = require('../controllers/ticket.controller');
const { verificarToken } = require('../middlewares/verificarToken');
const { autorizarRoles } = require('../middlewares/autorizarRoles');

const router = Router();
const escritura = autorizarRoles(['Administrador', 'Supervisor', 'Soporte Técnico']);

router.get('/', verificarToken, listarTickets);
router.get('/:id', verificarToken, obtenerTicket);
router.post('/', verificarToken, escritura, crearTicket);
router.put('/:id', verificarToken, escritura, actualizarTicket);
router.patch('/:id/estado', verificarToken, escritura, cambiarEstadoTicket);
router.delete('/:id', verificarToken, escritura, eliminarTicket);

module.exports = router;
