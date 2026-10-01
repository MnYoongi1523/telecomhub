// Enrutador principal de la API: agrupa los servicios web por módulo del
// software TelecomHub. Cada módulo se monta bajo su propio prefijo /api.

const { Router } = require('express');
const { verificarToken } = require('../middlewares/verificarToken');

const authRoutes = require('./auth.routes');
const usuarioRoutes = require('./usuario.routes');
const planRoutes = require('./plan.routes');
const clienteRoutes = require('./cliente.routes');
const vendedorRoutes = require('./vendedor.routes');
const contratoRoutes = require('./contrato.routes');
const facturaRoutes = require('./factura.routes');
const pagoRoutes = require('./pago.routes');
const ticketRoutes = require('./ticket.routes');
const dashboardRoutes = require('./dashboard.routes');

const router = Router();

// Módulo: Autenticación (público, salvo /perfil).
router.use('/auth', authRoutes);

// Módulo: Dashboard e indicadores (requiere token).
router.use('/dashboard', verificarToken, dashboardRoutes);

// Módulo: Administración de usuarios (requiere token).
router.use('/usuarios', verificarToken, usuarioRoutes);

// Módulo: Planes de servicio.
router.use('/planes', planRoutes);

// Módulo: Clientes.
router.use('/clientes', clienteRoutes);

// Módulo: Vendedores.
router.use('/vendedores', vendedorRoutes);

// Módulo: Contratos.
router.use('/contratos', contratoRoutes);

// Módulo: Facturación.
router.use('/facturas', facturaRoutes);

// Módulo: Pagos.
router.use('/pagos', pagoRoutes);

// Módulo: Soporte (tickets).
router.use('/soporte', ticketRoutes);

// Catálogo de serviços web: útil para descubrir qué expone la API.
router.get('/servicios', verificarToken, (req, res) => {
  res.status(200).json({
    ok: true,
    mensaje: 'Servicios web disponibles en TelecomHub API.',
    data: {
      autenticacion: ['POST /api/auth/registro', 'POST /api/auth/login', 'GET /api/auth/perfil'],
      dashboard: [
        'GET /api/dashboard',
        'GET /api/dashboard/indicadores',
        'GET /api/dashboard/ventas-vendedores',
        'GET /api/dashboard/clientes/:id/estado-cuenta',
      ],
      administracion: [
        'GET /api/usuarios',
        'POST /api/usuarios',
        'PUT /api/usuarios/:id',
        'PATCH /api/usuarios/:id/estado',
        'DELETE /api/usuarios/:id',
      ],
      planes: [
        'GET /api/planes',
        'POST /api/planes',
        'PUT /api/planes/:id',
        'PATCH /api/planes/:id/estado',
        'DELETE /api/planes/:id',
      ],
      clientes: [
        'GET /api/clientes',
        'POST /api/clientes',
        'PUT /api/clientes/:id',
        'PATCH /api/clientes/:id/estado',
        'DELETE /api/clientes/:id',
      ],
      vendedores: [
        'GET /api/vendedores',
        'POST /api/vendedores',
        'PUT /api/vendedores/:id',
        'PATCH /api/vendedores/:id/estado',
        'DELETE /api/vendedores/:id',
      ],
      contratos: [
        'GET /api/contratos',
        'POST /api/contratos',
        'PUT /api/contratos/:id',
        'PATCH /api/contratos/:id/cancelar',
        'PATCH /api/contratos/:id/reactivar',
        'DELETE /api/contratos/:id',
      ],
      facturas: [
        'GET /api/facturas',
        'POST /api/facturas',
        'PUT /api/facturas/:id',
        'DELETE /api/facturas/:id',
      ],
      pagos: [
        'GET /api/pagos',
        'GET /api/pagos/facturas-pendientes',
        'POST /api/pagos',
        'DELETE /api/pagos/:id',
      ],
      soporte: [
        'GET /api/soporte',
        'POST /api/soporte',
        'PUT /api/soporte/:id',
        'PATCH /api/soporte/:id/estado',
        'DELETE /api/soporte/:id',
      ],
      general: ['GET /api/salud', 'GET /api/documentacion'],
    },
  });
});

module.exports = router;
