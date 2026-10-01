// Controlador de clientes.
// Expone los servicios web de consulta, registro, edición, suspensión y
// eliminación de clientes del software TelecomHub.

const clienteService = require('../services/cliente.service');
const { creado, exito, listar } = require('../utils/respuesta');
const { capturar } = require('../utils/asyncHandler');

// Lista los clientes con filtros opcionales (?estado=&busqueda=&planId=).
const listarClientes = capturar(async (req, res) => {
  const { estado, busqueda, planId } = req.query;
  const clientes = clienteService.listar({ estado, busqueda, planId });
  return listar(res, 'Listado de clientes.', clientes, { total: clientes.length });
});

// Devuelve un cliente por identificador.
const obtenerCliente = capturar(async (req, res) => {
  const cliente = clienteService.obtenerPorId(req.params.id);
  return exito(res, 200, 'Cliente encontrado.', cliente);
});

// Registra un cliente nuevo.
const crearCliente = capturar(async (req, res) => {
  const cliente = clienteService.crear(req.body);
  return creado(res, 'Cliente registrado correctamente.', cliente);
});

// Actualiza los datos de un cliente.
const actualizarCliente = capturar(async (req, res) => {
  const cliente = clienteService.actualizar(req.params.id, req.body);
  return exito(res, 200, 'Cliente actualizado correctamente.', cliente);
});

// Suspende o reactiva el servicio de un cliente.
const cambiarEstadoCliente = capturar(async (req, res) => {
  const { estado } = req.body;
  const cliente = clienteService.cambiarEstado(req.params.id, estado);
  return exito(res, 200, `Cliente actualizado a estado ${estado}.`, cliente);
});

// Elimina un cliente.
const eliminarCliente = capturar(async (req, res) => {
  const cliente = clienteService.eliminar(req.params.id);
  return exito(res, 200, 'Cliente eliminado correctamente.', cliente);
});

module.exports = {
  listarClientes,
  obtenerCliente,
  crearCliente,
  actualizarCliente,
  cambiarEstadoCliente,
  eliminarCliente,
};
