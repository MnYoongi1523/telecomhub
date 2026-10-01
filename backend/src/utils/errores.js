// Errores de negocio de la API.
// Cada error lleva un código HTTP y un identificador para que el controlador
// o el manejador global lo convierta en una respuesta consistente.

class ErrorApi extends Error {
  constructor(estado, mensaje, codigo, detalles) {
    super(mensaje);
    this.estado = estado;
    this.codigo = codigo || 'ERROR';
    // Detalle opcional, por ejemplo la lista de campos que no cumplieron
    // las reglas de validación (lo que el formulario necesita mostrar).
    this.detalles = detalles || null;
  }
}

// 400 - Los datos recibidos no cumplen las reglas de validación.
// `detalles` es un arreglo de { campo, mensaje }.
function peticionInvalida(mensaje, codigo, detalles) {
  return new ErrorApi(400, mensaje, codigo || 'PETICION_INVALIDA', detalles);
}

// 401 - No hay token válido o las credenciales no son correctas.
function noAutorizado(mensaje, codigo) {
  return new ErrorApi(401, mensaje, codigo || 'NO_AUTORIZADO');
}

// 403 - El token es válido pero el rol no tiene permiso.
function sinPermiso(mensaje, codigo) {
  return new ErrorApi(403, mensaje, codigo || 'SIN_PERMISO');
}

// 404 - El recurso solicitado no existe.
function noEncontrado(mensaje, codigo) {
  return new ErrorApi(404, mensaje, codigo || 'NO_ENCONTRADO');
}

// 409 - El recurso ya existe (duplicado).
function conflicto(mensaje, codigo) {
  return new ErrorApi(409, mensaje, codigo || 'CONFLICTO');
}

// 500 - Fallo no controlado del servidor.
function errorInterno(mensaje, codigo) {
  return new ErrorApi(500, mensaje, codigo || 'ERROR_INTERNO');
}

module.exports = {
  ErrorApi,
  peticionInvalida,
  noAutorizado,
  sinPermiso,
  noEncontrado,
  conflicto,
  errorInterno,
};
