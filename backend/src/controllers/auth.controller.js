// Controlador de autenticación: registro e inicio de sesión.
// Aquí está la lógica que responde al planteamiento:
// 1. Recibir usuario y contraseña.
// 2. Si la autenticación es correcta -> mensaje de autenticación satisfactoria.
// 3. En caso contrario -> error en la autenticación.

const jwt = require('jsonwebtoken');
const userService = require('../services/user.service');

// Secreto JWT tomado de variables de entorno (con valor formativo por defecto).
const JWT_SECRET = process.env.JWT_SECRET || 'telecomhub-secreto-formativo';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

async function registrar(req, res) {
  try {
    // Extraer credenciales ya validadas por el middleware.
    const { username, password } = req.body;

    // Crear el usuario (cifra la contraseña internamente).
    const usuario = await userService.crearUsuario(username, password);

    // Responder con 201 (Created) y mensaje de éxito.
    return res.status(201).json({
      ok: true,
      mensaje: 'Usuario registrado correctamente.',
      usuario,
    });
  } catch (error) {
    // Si el usuario ya existe se devuelve 409 (Conflict).
    if (error.code === 'USUARIO_DUPLICADO') {
      return res.status(409).json({ ok: false, mensaje: error.message });
    }
    // Cualquier otro error se devuelve como 500.
    console.error('Error en registro:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor.' });
  }
}

async function iniciarSesion(req, res) {
  try {
    // Extraer credenciales ya validadas por el middleware.
    const { username, password } = req.body;

    // Buscar el usuario en el "almacén".
    const usuario = await userService.buscarPorUsername(username);

    // Si no existe, devolver error de autenticación (401 Unauthorized).
    // Se usa el mismo mensaje genérico por seguridad (no revelar si existe o no).
    if (!usuario) {
      return res.status(401).json({
        ok: false,
        mensaje: 'Error en la autenticación: usuario o contraseña incorrectos.',
      });
    }

    // Verificar la contraseña contra el hash guardado.
    const esValida = await userService.verificarPassword(password, usuario.passwordHash);
    if (!esValida) {
      return res.status(401).json({
        ok: false,
        mensaje: 'Error en la autenticación: usuario o contraseña incorrectos.',
      });
    }

    // Autenticación correcta: generar un token JWT con id y username.
    const token = jwt.sign(
      { id: usuario.id, username: usuario.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Responder con mensaje de autenticación satisfactoria.
    return res.status(200).json({
      ok: true,
      mensaje: 'Autenticación satisfactoria. Bienvenido.',
      token,
      usuario: { id: usuario.id, username: usuario.username },
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor.' });
  }
}

module.exports = { registrar, iniciarSesion };
