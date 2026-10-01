// Controlador de vendedores.
// Expone los servicios web de gestión del equipo comercial.

const vendedorService = require('../services/vendedor.service');
const { creado, exito, listar } = require('../utils/respuesta');
const { capturar } = require('../utils/asyncHandler');

// Lista los vendedores con filtros opcionales (?estado=&busqueda=).
const listarVendedores = capturar(async (req, res) => {
  const { estado, busqueda } = req.query;
  const vendedores = vendedorService.listar({ estado, busqueda });
  return listar(res, 'Listado de vendedores.', vendedores, { total: vendedores.length });
});

// Devuelve un vendedor por identificador.
const obtenerVendedor = capturar(async (req, res) => {
  const vendedor = vendedorService.obtenerPorId(req.params.id);
  return exito(res, 200, 'Vendedor encontrado.', vendedor);
});

// Registra un vendedor nuevo.
const crearVendedor = capturar(async (req, res) => {
  const vendedor = vendedorService.crear(req.body);
  return creado(res, 'Vendedor registrado correctamente.', vendedor);
});

// Actualiza los datos de un vendedor.
const actualizarVendedor = capturar(async (req, res) => {
  const vendedor = vendedorService.actualizar(req.params.id, req.body);
  return exito(res, 200, 'Vendedor actualizado correctamente.', vendedor);
});

// Activa o inactiva un vendedor.
const cambiarEstadoVendedor = capturar(async (req, res) => {
  const { estado } = req.body;
  const vendedor = vendedorService.cambiarEstado(req.params.id, estado);
  return exito(res, 200, 'Estado del vendedor actualizado correctamente.', vendedor);
});

// Elimina un vendedor.
const eliminarVendedor = capturar(async (req, res) => {
  const vendedor = vendedorService.eliminar(req.params.id);
  return exito(res, 200, 'Vendedor eliminado correctamente.', vendedor);
});

module.exports = {
  listarVendedores,
  obtenerVendedor,
  crearVendedor,
  actualizarVendedor,
  cambiarEstadoVendedor,
  eliminarVendedor,
};
