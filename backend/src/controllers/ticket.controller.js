// Controlador de soporte (tickets).
// Expone los servicios web de registro y seguimiento de solicitudes.

const ticketService = require('../services/ticket.service');
const { creado, exito, listar } = require('../utils/respuesta');
const { capturar } = require('../utils/asyncHandler');

// Lista los tickets con filtros opcionales
// (?clienteId=&prioridad=&estado=&busqueda=).
const listarTickets = capturar(async (req, res) => {
  const { clienteId, prioridad, estado, busqueda } = req.query;
  const tickets = ticketService.listar({ clienteId, prioridad, estado, busqueda });
  return listar(res, 'Listado de tickets de soporte.', tickets, { total: tickets.length });
});

// Devuelve un ticket por identificador.
const obtenerTicket = capturar(async (req, res) => {
  const ticket = ticketService.obtenerPorId(req.params.id);
  return exito(res, 200, 'Ticket encontrado.', ticket);
});

// Registra un ticket nuevo.
const crearTicket = capturar(async (req, res) => {
  const ticket = ticketService.crear(req.body);
  return creado(res, 'Ticket registrado correctamente.', ticket);
});

// Actualiza los datos de un ticket.
const actualizarTicket = capturar(async (req, res) => {
  const ticket = ticketService.actualizar(req.params.id, req.body);
  return exito(res, 200, 'Ticket actualizado correctamente.', ticket);
});

// Cambia el estado de seguimiento del ticket.
const cambiarEstadoTicket = capturar(async (req, res) => {
  const { estado } = req.body;
  const ticket = ticketService.cambiarEstado(req.params.id, estado);
  return exito(res, 200, 'Estado del ticket actualizado correctamente.', ticket);
});

// Elimina un ticket.
const eliminarTicket = capturar(async (req, res) => {
  const ticket = ticketService.eliminar(req.params.id);
  return exito(res, 200, 'Ticket eliminado correctamente.', ticket);
});

module.exports = {
  listarTickets,
  obtenerTicket,
  crearTicket,
  actualizarTicket,
  cambiarEstadoTicket,
  eliminarTicket,
};
