// Middleware de validación para las peticiones de registro e inicio de sesión.
// Garantiza que el servicio siempre reciba "usuario" y "contraseña" válidos.

function validarCredenciales(req, res, next) {
  // Se acepta "username" o "usuario" como nombre del campo por flexibilidad.
  const username = req.body.username ?? req.body.usuario;
  const password = req.body.password ?? req.body.contrasena ?? req.body.contraseña;

  // Validar que el usuario exista y sea texto no vacío.
  if (!username || typeof username !== 'string' || username.trim().length < 3) {
    return res.status(400).json({
      ok: false,
      mensaje: 'Error en la autenticación: el usuario debe tener al menos 3 caracteres.',
    });
  }

  // Validar que la contraseña exista y tenga longitud mínima de 6.
  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({
      ok: false,
      mensaje: 'Error en la autenticación: la contraseña debe tener al menos 6 caracteres.',
    });
  }

  // Normalizar los valores para que el controlador los use directamente.
  req.body.username = username.trim();
  req.body.password = password;

  // Continuar hacia el controlador.
  next();
}

module.exports = { validarCredenciales };
