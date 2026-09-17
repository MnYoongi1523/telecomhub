// Rutas del servicio web de autenticación.
// Base: /api/auth
// - POST /registro  -> registra un nuevo usuario.
// - POST /login     -> inicia sesión y valida credenciales.

const { Router } = require('express');
const { registrar, iniciarSesion } = require('../controllers/auth.controller');
const { validarCredenciales } = require('../middlewares/validateAuth');

// Crear el enrutador de Express.
const router = Router();

// Ruta de registro: valida campos y luego ejecuta el controlador.
router.post('/registro', validarCredenciales, registrar);

// Ruta de inicio de sesión: valida campos y luego ejecuta el controlador.
router.post('/login', validarCredenciales, iniciarSesion);

module.exports = router;
