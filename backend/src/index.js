// Punto de entrada del servicio web TelecomHub API.
// Tecnologías: Node.js + Express (componente "Construcción API").
// Funcionalidad: registro e inicio de sesión con usuario y contraseña.

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');

// Puerto configurable por variable de entorno (3001 por defecto).
const PORT = process.env.PORT || 3001;

// Crear la aplicación Express.
const app = express();

// Middleware para permitir peticiones de otros orígenes (útil para el frontend React).
app.use(cors());

// Middleware para interpretar cuerpos JSON en las peticiones.
app.use(express.json());

// Ruta de salud: permite verificar que el servicio está en línea.
app.get('/api/salud', (req, res) => {
  res.json({ ok: true, mensaje: 'Servicio TelecomHub API en línea.' });
});

// Montar las rutas de autenticación bajo el prefijo /api/auth.
app.use('/api/auth', authRoutes);

// Manejador para rutas no encontradas (404).
app.use((req, res) => {
  res.status(404).json({ ok: false, mensaje: 'Ruta no encontrada.' });
});

// Iniciar el servidor y mostrar la URL en consola.
app.listen(PORT, () => {
  console.log(`Servidor TelecomHub API escuchando en http://localhost:${PORT}`);
});
