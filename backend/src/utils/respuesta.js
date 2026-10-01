// Utilidades de respuesta: todos los servicios contestan con el mismo formato
// para que el frontend (o cualquier cliente) siempre lea las mismas llaves.
//
//   Éxito  → { ok: true,  mensaje: "...", data: {...} }
//   Error  → { ok: false, mensaje: "...", error: "CODIGO", detalles: {...} }

function exito(res, estado, mensaje, data) {
  return res.status(estado).json({ ok: true, mensaje, data });
}

function creado(res, mensaje, data) {
  return exito(res, 201, mensaje, data);
}

function listar(res, mensaje, data, extra) {
  return res.status(200).json({ ok: true, mensaje, data, ...extra });
}

module.exports = { exito, creado, listar };
