// Servicio encargado de la gestión de usuarios en memoria.
// En un proyecto productivo esto se reemplazaría por una base de datos
// (MySQL, PostgreSQL, MongoDB, etc.). Para el componente formativo
// "Construcción API" se usa un arreglo para simplificar el diseño.

const bcrypt = require('bcryptjs');

// Arreglo que simula la tabla de usuarios.
// Cada usuario tiene: id, username y passwordHash (nunca texto plano).
const usuarios = [];
let consecutivoId = 1;

async function crearUsuario(username, password) {
  // Normalizar el nombre de usuario (quitar espacios y pasar a minúsculas
  // para evitar duplicados como "Admin" y "admin ").
  const limpio = username.trim().toLowerCase();

  // Validar que el usuario no exista previamente.
  const existe = usuarios.find((u) => u.username === limpio);
  if (existe) {
    // Se lanza un error controlado que el controlador convierte en 409.
    const error = new Error('El usuario ya se encuentra registrado.');
    error.code = 'USUARIO_DUPLICADO';
    throw error;
  }

  // Cifrar la contraseña con bcrypt (10 rondas de sal por defecto).
  // Nunca se almacena la contraseña original.
  const passwordHash = await bcrypt.hash(password, 10);

  // Crear el objeto usuario y guardarlo en memoria.
  const nuevo = {
    id: consecutivoId++,
    username: limpio,
    passwordHash,
    creadoEn: new Date().toISOString(),
  };
  usuarios.push(nuevo);

  // Devolver el usuario sin el hash por seguridad.
  return { id: nuevo.id, username: nuevo.username, creadoEn: nuevo.creadoEn };
}

async function buscarPorUsername(username) {
  // Búsqueda insensible a mayúsculas y espacios.
  const limpio = username.trim().toLowerCase();
  return usuarios.find((u) => u.username === limpio) || null;
}

async function verificarPassword(passwordPlana, passwordHash) {
  // Comparar la contraseña recibida contra el hash almacenado.
  return bcrypt.compare(passwordPlana, passwordHash);
}

module.exports = { crearUsuario, buscarPorUsername, verificarPassword };
