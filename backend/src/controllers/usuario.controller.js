// Controlador de usuarios del sistema (módulo Administración).
// Gestiona las cuentas internas del software y sus roles.

const userService = require('../services/user.service');
const { creado, exito, listar } = require('../utils/respuesta');
const { capturar } = require('../utils/asyncHandler');

// Lista los usuarios registrados.
const listarUsuarios = capturar(async (req, res) => {
  const { estado, rol, busqueda } = req.query;
  const usuarios = userService.listar({ estado, rol, busqueda });
  return listar(res, 'Listado de usuarios del sistema.', usuarios, { total: usuarios.length });
});

// Devuelve un usuario por identificador.
const obtenerUsuario = capturar(async (req, res) => {
  const usuario = userService.obtenerPorId(req.params.id);
  return exito(res, 200, 'Usuario encontrado.', usuario);
});

// Crea un usuario del sistema.
const crearUsuario = capturar(async (req, res) => {
  const usuario = await userService.crearUsuario(req.body);
  return creado(res, 'Usuario creado correctamente.', usuario);
});

// Actualiza un usuario del sistema.
const actualizarUsuario = capturar(async (req, res) => {
  const usuario = await userService.actualizar(req.params.id, req.body);
  return exito(res, 200, 'Usuario actualizado correctamente.', usuario);
});

// Activa o desactiva un usuario del sistema.
const cambiarEstadoUsuario = capturar(async (req, res) => {
  const { estado } = req.body;
  const usuario = userService.cambiarEstado(req.params.id, estado);
  return exito(res, 200, 'Estado del usuario actualizado correctamente.', usuario);
});

// Elimina un usuario del sistema.
const eliminarUsuario = capturar(async (req, res) => {
  const usuario = userService.eliminar(req.params.id);
  return exito(res, 200, 'Usuario eliminado correctamente.', usuario);
});

module.exports = {
  listarUsuarios,
  obtenerUsuario,
  crearUsuario,
  actualizarUsuario,
  cambiarEstadoUsuario,
  eliminarUsuario,
};
