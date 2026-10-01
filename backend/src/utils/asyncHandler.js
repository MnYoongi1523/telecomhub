// Envoltorio para controladores asíncronos.
// Evita repetir try/catch en cada controlador: si la función lanza un error
// (incluidos los errores de negocio), Express la recibe en next() y la
// resuelve el manejador global de errores.

function capturar(fn) {
  return function Involucrado(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { capturar };
