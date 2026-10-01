// Rutas del servicio web de autenticación.
// Base: /api/auth
// - POST /registro  -> registra un nuevo usuario.
// - POST /login     -> inicia sesión y valida credenciales.
// - GET  /perfil    -> devuelve el usuario autenticado (requiere token).

const { Router } = require('express');
const { registrar, iniciarSesion, perfil } = require('../controllers/auth.controller');
const { validarCredenciales } = require('../middlewares/validateAuth');
const { verificarToken } = require('../middlewares/verificarToken');

const router = Router();

// Ruta de registro: valida campos y luego ejecuta el controlador.
router.post('/registro', validarCredenciales, registrar);

// Ruta de inicio de sesión: valida campos y luego ejecuta el controlador.
router.post('/login', validarCredenciales, iniciarSesion);

// Ruta de perfil: exige token válido.
router.get('/perfil', verificarToken, perfil);

module.exports = router;
