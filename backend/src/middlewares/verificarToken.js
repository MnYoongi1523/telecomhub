// Middleware de autenticación por token.
// Exige que la petición incluya la cabecera "Authorization: Bearer <token>".
// El token se firma al iniciar sesión y viaja en cada llamada a los servicios
// web protegidos.

const jwt = require('jsonwebtoken');
const config = require('../config');
const userService = require('../services/user.service');
const { noAutorizado } = require('../utils/errores');

function verificarToken(req, res, next) {
  // Extraer el valor de la cabecera Authorization.
  const cabecera = req.headers.authorization || '';

  if (!cabecera.startsWith('Bearer ')) {
    return next(
      noAutorizado('Se requiere un token de autenticación en la cabecera Authorization.', 'TOKEN_AUSENTE')
    );
  }

  const token = cabecera.slice(7).trim();

  try {
    // Verificar la firma y la vigencia del token.
    const datos = jwt.verify(token, config.jwtSecreto);

    // Confirmar que el usuario siga existiendo y activo en el sistema.
    const usuario = userService.buscarPorUsername(datos.username);
    if (!usuario || usuario.estado === 'Inactivo') {
      return next(noAutorizado('El token no corresponde a un usuario activo.', 'TOKEN_INVALIDO'));
    }

    // Dejar los datos del usuario disponibles para los controladores.
    req.usuario = { id: usuario.id, username: usuario.username, rol: usuario.rol };
    return next();
  } catch (error) {
    const mensaje =
      error.name === 'TokenExpiredError'
        ? 'El token de autenticación expiró. Inicie sesión nuevamente.'
        : 'El token de autenticación no es válido.';
    return next(noAutorizado(mensaje, 'TOKEN_INVALIDO'));
  }
}

module.exports = { verificarToken };
