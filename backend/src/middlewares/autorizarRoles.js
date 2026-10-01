// Middleware de autorización por rol.
// Restringe un servicio web a determinados perfiles del software TelecomHub
// (Administrador, Supervisor, Soporte Técnico).

const { sinPermiso } = require('../utils/errores');

function autorizarRoles(rolesPermitidos) {
  return function revisarRol(req, res, next) {
    // verificarToken siempre se ejecuta antes, por eso req.usuario existe.
    if (!req.usuario) {
      return next(sinPermiso('Debe iniciar sesión para realizar esta operación.'));
    }
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return next(
        sinPermiso(
          `No tiene permisos para esta operación. Se requiere el rol: ${rolesPermitidos.join(' o ')}.`,
          'ROL_SIN_PERMISO'
        )
      );
    }
    return next();
  };
}

module.exports = { autorizarRoles };
