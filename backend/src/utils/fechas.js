// Utilidades de fecha del servicio web.
// Todo el software trabaja con fechas locales (formato YYYY-MM-DD) para que
// el día que ve el usuario sea el mismo día que calcula el servicio.
// Usar toISOString() directamente devolvería la fecha en UTC, que puede
// diferir en un día respecto a la fecha local (por ejemplo en Colombia UTC-5).

// Convierte una fecha a cadena YYYY-MM-DD usando la zona horaria local.
function aISO(fecha) {
  const año = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${año}-${mes}-${dia}`;
}

// Devuelve la fecha local de hoy en formato YYYY-MM-DD.
function hoyISO() {
  return aISO(new Date());
}

// Construye una fecha local a partir de un texto YYYY-MM-DD.
function desdeISO(texto) {
  return new Date(`${String(texto).trim()}T00:00:00`);
}

// Suma (o resta) días a una fecha y la devuelve en formato YYYY-MM-DD.
function sumarDias(fecha, dias) {
  const nueva = new Date(fecha.getTime());
  nueva.setDate(nueva.getDate() + dias);
  return aISO(nueva);
}

// Cantidad de días completos entre dos fechas (b - a).
function diasEntre(desde, hasta) {
  const inicio = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate());
  const fin = new Date(hasta.getFullYear(), hasta.getMonth(), hasta.getDate());
  return Math.round((fin - inicio) / 86400000);
}

// Fecha local de hoy a medianoche, para comparar solo el día.
function inicioDelDia() {
  const hoy = new Date();
  return new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
}

module.exports = { aISO, hoyISO, desdeISO, sumarDias, diasEntre, inicioDelDia };
