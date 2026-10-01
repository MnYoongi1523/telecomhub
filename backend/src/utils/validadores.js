// Validadores reutilizables del servicio web.
// Contienen las reglas de negocio que el software TelecomHub exige para cada
// entidad. Las mismas reglas están aplicadas en el frontend, por lo que el
// servicio queda protegido aunque el cliente no las valide.

const RE_TELEFONO = /^\+57\s?\d{3}\s?\d{3}\s?\d{4}$/;
const RE_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RE_CEDULA = /^\d{6,10}$/;
const RE_LETRAS_Y_ESPACIOS = /^[a-zA-ZÀ-ÿ\s]+$/;
const RE_CARACTERES_ESPECIALES = /[<>{}$%^*]/;
const RE_FECHA = /^\d{4}-\d{2}-\d{2}$/;

// --- Verificaciones básicas ---

function esTexto(valor) {
  return typeof valor === 'string' && valor.trim().length > 0;
}

function esNumero(valor) {
  return typeof valor === 'number' && Number.isFinite(valor);
}

// --- Validadores de campo (devuelven el mensaje de error o null) ---

function nombre(valor, { min = 3, max = 50, soloLetras = true } = {}) {
  if (!esTexto(valor)) return 'El nombre es obligatorio';
  const limpio = valor.trim();
  if (limpio.length < min || limpio.length > max) {
    return `Debe tener entre ${min} y ${max} caracteres`;
  }
  if (soloLetras && !RE_LETRAS_Y_ESPACIOS.test(limpio)) {
    return 'El nombre solo puede contener letras y espacios';
  }
  return null;
}

function cedula(valor) {
  if (!esTexto(valor)) return 'La cédula es obligatoria';
  if (!RE_CEDULA.test(valor.trim())) return 'Debe tener entre 6 y 10 dígitos numéricos';
  return null;
}

function telefono(valor) {
  if (!esTexto(valor)) return 'El teléfono es obligatorio';
  if (!RE_TELEFONO.test(valor.trim())) return 'Formato esperado: +57 300 123 4567';
  return null;
}

function correo(valor) {
  if (!esTexto(valor)) return 'El correo es obligatorio';
  if (!RE_CORREO.test(valor.trim())) return 'Correo electrónico no válido';
  return null;
}

function fechaIso(valor) {
  if (!esTexto(valor) || !RE_FECHA.test(valor.trim())) return 'La fecha debe tener el formato YYYY-MM-DD';
  const fecha = new Date(`${valor.trim()}T00:00:00`);
  if (Number.isNaN(fecha.getTime())) return 'La fecha no es válida';
  return null;
}

function numeroEnRango(valor, min, max, mensajeFueraDeRango) {
  if (valor === undefined || valor === null || valor === '') return 'El valor es obligatorio';
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return 'Debe ser un valor numérico';
  if (numero < min || numero > max) return mensajeFueraDeRango;
  return null;
}

// --- Normalizadores (limpian el valor antes de guardarlo) ---

function soloDigitos(valor) {
  return String(valor).replace(/\D/g, '');
}

function sinEspacios(valor) {
  return String(valor).trim().replace(/\s+/g, ' ');
}

function minusculas(valor) {
  return String(valor).trim().toLowerCase();
}

module.exports = {
  RE_TELEFONO,
  RE_CORREO,
  RE_CEDULA,
  RE_LETRAS_Y_ESPACIOS,
  RE_CARACTERES_ESPECIALES,
  RE_FECHA,
  esTexto,
  esNumero,
  nombre,
  cedula,
  telefono,
  correo,
  fechaIso,
  numeroEnRango,
  soloDigitos,
  sinEspacios,
  minusculas,
};
