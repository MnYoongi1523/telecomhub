// Controlador de autenticación: registro e inicio de sesión.
// Aquí está la lógica que responde al planteamiento:
// 1. Recibir usuario y contraseña.
// 2. Si la autenticación es correcta -> mensaje de autenticación satisfactoria.
// 3. En caso contrario -> error en la autenticación.

const userService = require('../services/user.service');
const { creado, exito } = require('../utils/respuesta');
const { capturar } = require('../utils/asyncHandler');

// Registra un usuario nuevo en el sistema.
const registrar = capturar(async (req, res) => {
  const { username, password, nombre, rol, estado } = req.body;

  // El nombre, el rol y el estado son opcionales en el registro público:
  // si no llegan se asignan los valores por defecto de un administrador.
  const usuario = await userService.crearUsuario({
    nombre: nombre || username,
    username,
    password,
    rol: rol || 'Administrador',
    estado: estado || 'Activo',
  });

  return creado(res, 'Usuario registrado correctamente.', usuario);
});

// Inicia sesión: valida las credenciales y devuelve el token de acceso.
const iniciarSesion = capturar(async (req, res) => {
  const { username, password } = req.body;
  const { token, usuario } = await userService.autenticar(username, password);

  return exito(res, 200, 'Autenticación satisfactoria. Bienvenido.', { token, usuario });
});

// Devuelve los datos del usuario autenticado en la petición.
const perfil = capturar(async (req, res) => {
  const usuario = userService.obtenerPorId(req.usuario.id);
  return exito(res, 200, 'Perfil del usuario autenticado.', usuario);
});

module.exports = { registrar, iniciarSesion, perfil };
