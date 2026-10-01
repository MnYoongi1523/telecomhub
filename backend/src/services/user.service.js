// Servicio de usuarios del sistema (módulo Administración).
// Gestiona el registro, el inicio de sesión, los roles y los permisos
// de las personas que operan el software TelecomHub.

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const store = require('../db/store');
const config = require('../config');
const errores = require('../utils/errores');
const v = require('../utils/validadores');

const ROLES = ['Administrador', 'Supervisor', 'Soporte Técnico'];
const ESTADOS = ['Activo', 'Inactivo'];

// Proyecta el usuario sin exponer el hash de la contraseña.
function sinPasswordHash(usuario) {
  if (!usuario) return null;
  const { passwordHash, ...resto } = usuario;
  return resto;
}

// Valida los datos de un usuario y devuelve { errores, datos }.
function validarCampos({ nombre, username, password, rol, estado }, { parcial = false } = {}) {
  const listaErrores = [];
  const datos = {};

  if (!parcial || nombre !== undefined) {
    const error = v.nombre(nombre);
    if (error) listaErrores.push({ campo: 'nombre', mensaje: error });
    else datos.nombre = v.sinEspacios(nombre);
  }

  if (!parcial || username !== undefined) {
    const error = v.nombre(username, { min: 4, max: 30, soloLetras: false });
    if (error) listaErrores.push({ campo: 'username', mensaje: 'El usuario debe tener entre 4 y 30 caracteres' });
    else datos.username = v.minusculas(username);
  }

  if (!parcial || password !== undefined) {
    if (!v.esTexto(password) || password.length < 6) {
      listaErrores.push({ campo: 'password', mensaje: 'La contraseña debe tener al menos 6 caracteres' });
    } else {
      datos.password = password;
    }
  }

  if (!parcial || rol !== undefined) {
    if (!ROLES.includes(rol)) {
      listaErrores.push({ campo: 'rol', mensaje: `El rol debe ser uno de: ${ROLES.join(', ')}` });
    } else {
      datos.rol = rol;
    }
  }

  if (!parcial || estado !== undefined) {
    if (!ESTADOS.includes(estado)) {
      listaErrores.push({ campo: 'estado', mensaje: `El estado debe ser uno de: ${ESTADOS.join(', ')}` });
    } else {
      datos.estado = estado;
    }
  }

  return { errores: listaErrores, datos };
}

// Crea un usuario nuevo con la contraseña cifrada.
async function crearUsuario(datosEntrada) {
  const { errores: listaErrores, datos } = validarCampos(datosEntrada);
  if (listaErrores.length > 0) throw errores.peticionInvalida('Los datos del usuario no son válidos.', 'VALIDACION', listaErrores);

  if (buscarPorUsername(datos.username)) {
    throw errores.conflicto('El usuario ya se encuentra registrado.', 'USUARIO_DUPLICADO');
  }

  const passwordHash = await bcrypt.hash(datos.password, config.bcryptRondas);
  const nuevo = store.insertar('usuarios', {
    nombre: datos.nombre,
    username: datos.username,
    passwordHash,
    rol: datos.rol,
    estado: datos.estado,
    creadoEn: new Date().toISOString(),
  });

  return sinPasswordHash(nuevo);
}

// Busca un usuario por su nombre de usuario (insensible a mayúsculas).
function buscarPorUsername(username) {
  if (!v.esTexto(username)) return null;
  const limpio = v.minusculas(username);
  return store.obtenerTodos('usuarios').find((u) => u.username === limpio) || null;
}

// Busca un usuario por identificador, sin exponer el hash.
function obtenerPorId(id) {
  return sinPasswordHash(store.obtenerPorId('usuarios', id));
}

// Lista todos los usuarios con filtros opcionales.
function listar(filtros = {}) {
  let usuarios = store.obtenerTodos('usuarios').map(sinPasswordHash);

  if (filtros.estado) {
    usuarios = usuarios.filter((u) => u.estado === filtros.estado);
  }
  if (filtros.rol) {
    usuarios = usuarios.filter((u) => u.rol === filtros.rol);
  }
  if (filtros.busqueda) {
    const termino = v.minusculas(filtros.busqueda);
    usuarios = usuarios.filter(
      (u) => v.minusculas(u.nombre).includes(termino) || u.username.includes(termino)
    );
  }

  return usuarios;
}

// Actualiza los datos de un usuario. `password` llega cifrada por el servicio.
async function actualizar(id, cambios) {
  const usuario = store.obtenerPorId('usuarios', id);
  if (!usuario) throw errores.noEncontrado('El usuario solicitado no existe.');

  const { errores: listaErrores, datos } = validarCampos(cambios, { parcial: true });
  if (listaErrores.length > 0) throw errores.peticionInvalida('Los datos del usuario no son válidos.', 'VALIDACION', listaErrores);

  // No se permite repetir el nombre de usuario de otro usuario.
  if (datos.username && datos.username !== usuario.username) {
    const repetido = store
      .obtenerTodos('usuarios')
      .find((u) => u.username === datos.username && u.id !== usuario.id);
    if (repetido) throw errores.conflicto('El usuario ya se encuentra registrado.', 'USUARIO_DUPLICADO');
  }

  const actualizacion = { ...datos };
  if (datos.password) {
    actualizacion.passwordHash = await bcrypt.hash(datos.password, config.bcryptRondas);
    delete actualizacion.password;
  }

  return sinPasswordHash(store.actualizar('usuarios', id, actualizacion));
}

// Activa o desactiva un usuario.
function cambiarEstado(id, estado) {
  if (!ESTADOS.includes(estado)) {
    throw errores.peticionInvalida(`El estado debe ser uno de: ${ESTADOS.join(', ')}`);
  }
  const usuario = store.obtenerPorId('usuarios', id);
  if (!usuario) throw errores.noEncontrado('El usuario solicitado no existe.');
  return sinPasswordHash(store.actualizar('usuarios', id, { estado }));
}

// Elimina un usuario del sistema.
function eliminar(id) {
  const usuario = store.eliminar('usuarios', id);
  if (!usuario) throw errores.noEncontrado('El usuario solicitado no existe.');
  return sinPasswordHash(usuario);
}

// Compara la contraseña received contra el hash almacenado.
async function verificarPassword(passwordPlana, passwordHash) {
  return bcrypt.compare(passwordPlana, passwordHash);
}

// Autentica al usuario y genera el token de acceso.
async function autenticar(username, password) {
  const usuario = buscarPorUsername(username);

  // Mismo mensaje para usuario inexistente y contraseña incorrecta:
  // así no se revela qué cuentas están registradas.
  if (!usuario) {
    throw errores.noAutorizado('Error en la autenticación: usuario o contraseña incorrectos.', 'CREDENCIALES_INVALIDAS');
  }
  if (usuario.estado === 'Inactivo') {
    throw errores.noAutorizado('Error en la autenticación: el usuario está inactivo.', 'USUARIO_INACTIVO');
  }

  const esValida = await verificarPassword(password, usuario.passwordHash);
  if (!esValida) {
    throw errores.noAutorizado('Error en la autenticación: usuario o contraseña incorrectos.', 'CREDENCIALES_INVALIDAS');
  }

  const token = jwt.sign(
    { id: usuario.id, username: usuario.username, rol: usuario.rol },
    config.jwtSecreto,
    { expiresIn: config.jwtExpiraEn }
  );

  return { token, usuario: sinPasswordHash(usuario) };
}

module.exports = {
  ROLES,
  ESTADOS,
  sinPasswordHash,
  crearUsuario,
  buscarPorUsername,
  obtenerPorId,
  listar,
  actualizar,
  cambiarEstado,
  eliminar,
  verificarPassword,
  autenticar,
};
