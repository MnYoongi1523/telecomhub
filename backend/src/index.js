// Punto de entrada del servicio web TelecomHub API.
// Tecnologías: Node.js + Express (componente "Diseño y desarrollo de servicios web").
// Funcionalidad: todos los servicios que requiere el software de gestión
// TelecomHub (clientes, planes, vendedores, contratos, facturas, pagos,
// soporte, usuarios e indicadores).

const express = require('express');
const cors = require('cors');
const config = require('./config');
const rutas = require('./routes');
const { documento } = require('./docs/openapi');
const { manejadorErrores } = require('./middlewares/manejadorErrores');
const { sembrar } = require('./db/seed');

const app = express();

// Middleware para permitir peticiones de otros orígenes (frontend React en :5173).
app.use(cors());

// Middleware para interpretar cuerpos JSON en las peticiones.
app.use(express.json());

// Ruta de salud: permite verificar que el servicio está en línea.
app.get('/api/salud', (req, res) => {
  res.status(200).json({
    ok: true,
    mensaje: 'Servicio TelecomHub API en línea.',
    version: '1.0.0',
  });
});

// Ruta de documentación: entrega la especificación OpenAPI 3.0 de todos los
// servicios web. Puede importarse en Postman o Swagger Editor.
app.get('/api/documentacion', (req, res) => {
  res.status(200).json(documento());
});

// Montar todos los servicios web de la API bajo el prefijo /api.
app.use('/api', rutas);

// Manejador de rutas no encontradas (404).
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    mensaje: 'Ruta no encontrada.',
    error: 'RUTA_NO_ENCONTRADA',
  });
});

// Manejador global de errores: siempre responde en formato JSON.
app.use(manejadorErrores);

// Cargar los datos iniciales y levantar el servidor.
// Se exporta la aplicación para que las pruebas puedan usarla sin abrir un puerto.
async function iniciar() {
  await sembrar();

  app.listen(config.puerto, () => {
    console.log(`Servidor TelecomHub API escuchando en http://localhost:${config.puerto}`);
    console.log(`Documentación de servicios: http://localhost:${config.puerto}/api/documentacion`);
  });
}

if (require.main === module) {
  iniciar();
}

module.exports = app;
