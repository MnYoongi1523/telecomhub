// Controlador de indicadores del módulo Dashboard y reportes de administración.

const dashboardService = require('../services/dashboard.service');
const { exito } = require('../utils/respuesta');
const { capturar } = require('../utils/asyncHandler');

// Devuelve las tarjetas de estadísticas y las tablas de soporte del dashboard.
const obtenerResumen = capturar(async (req, res) => {
  const resumen = dashboardService.resumen();
  return exito(res, 200, 'Resumen de gestión de TelecomHub.', resumen);
});

// Devuelve solo los indicadores numéricos del negocio.
const obtenerIndicadores = capturar(async (req, res) => {
  const indicadores = dashboardService.indicadores();
  return exito(res, 200, 'Indicadores del negocio.', indicadores);
});

// Reporte de ventas por vendedor.
const obtenerVentasPorVendedor = capturar(async (req, res) => {
  const reporte = dashboardService.ventasPorVendedor();
  return exito(res, 200, 'Reporte de ventas por vendedor.', reporte);
});

// Estado de cuenta de un cliente: contrato, facturas, pagos y saldos.
const obtenerEstadoDeCuenta = capturar(async (req, res) => {
  const cuenta = dashboardService.estadoDeCuenta(req.params.clienteId);
  return exito(res, 200, `Estado de cuenta de ${cuenta.cliente.nombre}.`, cuenta);
});

module.exports = { obtenerResumen, obtenerIndicadores, obtenerVentasPorVendedor, obtenerEstadoDeCuenta };
