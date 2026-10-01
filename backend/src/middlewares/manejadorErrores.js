// Manejador global de errores.
// Convierte cualquier error lanzado por un servicio o controlador en una
// respuesta JSON uniforme, de modo que el cliente siempre reciba:
//   { ok: false, mensaje: "...", error: "CODIGO", detalles: [...] }

const { ErrorApi } = require('../utils/errores');

function manejadorErrores(error, req, res, next) {
  // Si la respuesta ya se envió, no se intenta responder otra vez.
  if (res.headersSent) return next(error);

  // Los errores de negocio ya traen su estado HTTP y su código.
  if (error instanceof ErrorApi) {
    const cuerpo = {
      ok: false,
      mensaje: error.message,
      error: error.codigo,
    };
    // Si el error viene con el detalle de cada campo, se agrega a la respuesta.
    if (error.detalles) cuerpo.detalles = error.detalles;
    return res.status(error.estado).json(cuerpo);
  }

  // Un cuerpo JSON mal formado lo reporta express.json().
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      ok: false,
      mensaje: 'El cuerpo de la petición no es un JSON válido.',
      error: 'JSON_INVALIDO',
    });
  }

  // Cualquier otro fallo se registra en consola y se responde genérico,
  // sin filtrar detalles internos al cliente.
  console.error('Error no controlado en el servicio web:', error);
  return res.status(500).json({
    ok: false,
    mensaje: 'Error interno del servidor.',
    error: 'ERROR_INTERNO',
  });
}

module.exports = { manejadorErrores };
