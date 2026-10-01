// Rutas del servicio web de usuarios del sistema (módulo Administración).
// Base: /api/usuarios
// Todas las rutas requieren token; las de escritura son exclusivas del
// rol Administrador.

const { Router } = require('express');
const {
  listarUsuarios,
  obtenerUsuario,
  crearUsuario,
  actualizarUsuario,
  cambiarEstadoUsuario,
  eliminarUsuario,
} = require('../controllers/usuario.controller');
const { verificarToken } = require('../middlewares/verificarToken');
const { autorizarRoles } = require('../middlewares/autorizarRoles');

const router = Router();
const soloAdministrador = autorizarRoles(['Administrador']);

// Lectura: disponible para todos los perfiles autenticados.
router.get('/', verificarToken, listarUsuarios);
router.get('/:id', verificarToken, obtenerUsuario);

// Escritura: solo Administrador.
router.post('/', verificarToken, soloAdministrador, crearUsuario);
router.put('/:id', verificarToken, soloAdministrador, actualizarUsuario);
router.patch('/:id/estado', verificarToken, soloAdministrador, cambiarEstadoUsuario);
router.delete('/:id', verificarToken, soloAdministrador, eliminarUsuario);

module.exports = router;
