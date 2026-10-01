// Servicio de vendedores.
// Registra a los asesores comerciales que captan los contratos del software.

const store = require('../db/store');
const errores = require('../utils/errores');
const v = require('../utils/validadores');

const ESTADOS = ['Activo', 'Inactivo'];

// Valida los datos de un vendedor y devuelve { errores, datos }.
function validarCampos({ nombre, cedula, telefono, correo, estado }, { parcial = false } = {}) {
  const listaErrores = [];
  const datos = {};

  if (!parcial || nombre !== undefined) {
    const error = v.nombre(nombre);
    if (error) listaErrores.push({ campo: 'nombre', mensaje: error });
    else datos.nombre = v.sinEspacios(nombre);
  }

  if (!parcial || cedula !== undefined) {
    const error = v.cedula(cedula);
    if (error) listaErrores.push({ campo: 'cedula', mensaje: error });
    else datos.cedula = v.soloDigitos(cedula);
  }

  if (!parcial || telefono !== undefined) {
    const error = v.telefono(telefono);
    if (error) listaErrores.push({ campo: 'telefono', mensaje: error });
    else datos.telefono = v.sinEspacios(telefono);
  }

  if (!parcial || correo !== undefined) {
    const error = v.correo(correo);
    if (error) listaErrores.push({ campo: 'correo', mensaje: error });
    else datos.correo = v.minusculas(correo);
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

// Crea un vendedor nuevo.
function crear(datosEntrada) {
  const { errores: listaErrores, datos } = validarCampos(datosEntrada);
  if (listaErrores.length > 0) throw errores.peticionInvalida('Los datos del vendedor no son válidos.', 'VALIDACION', listaErrores);

  const repetido = store.obtenerTodos('vendedores').find((x) => x.cedula === datos.cedula);
  if (repetido) throw errores.conflicto('Ya existe un vendedor con esa cédula.', 'CEDULA_DUPLICADA');

  return store.insertar('vendedores', datos);
}

// Lista los vendedores con filtros opcionales.
function listar(filtros = {}) {
  let vendedores = store.obtenerTodos('vendedores');

  if (filtros.estado) vendedores = vendedores.filter((x) => x.estado === filtros.estado);
  if (filtros.busqueda) {
    const termino = v.minusculas(filtros.busqueda);
    vendedores = vendedores.filter(
      (x) => v.minusculas(x.nombre).includes(termino) || x.cedula.includes(termino)
    );
  }

  return vendedores;
}

// Devuelve un vendedor por identificador.
function obtenerPorId(id) {
  const vendedor = store.obtenerPorId('vendedores', id);
  if (!vendedor) throw errores.noEncontrado('El vendedor solicitado no existe.');
  return vendedor;
}

// Actualiza los datos de un vendedor.
function actualizar(id, cambios) {
  obtenerPorId(id);
  const { errores: listaErrores, datos } = validarCampos(cambios, { parcial: true });
  if (listaErrores.length > 0) throw errores.peticionInvalida('Los datos del vendedor no son válidos.', 'VALIDACION', listaErrores);

  const actual = store.obtenerPorId('vendedores', id);
  if (datos.cedula && datos.cedula !== actual.cedula) {
    const repetido = store.obtenerTodos('vendedores').find((x) => x.cedula === datos.cedula && x.id !== actual.id);
    if (repetido) throw errores.conflicto('Ya existe un vendedor con esa cédula.', 'CEDULA_DUPLICADA');
  }

  return store.actualizar('vendedores', id, datos);
}

// Activa o inactiva un vendedor.
function cambiarEstado(id, estado) {
  if (!ESTADOS.includes(estado)) {
    throw errores.peticionInvalida(`El estado debe ser uno de: ${ESTADOS.join(', ')}`);
  }
  obtenerPorId(id);
  return store.actualizar('vendedores', id, { estado });
}

// Elimina un vendedor. No se permite si tiene contratos asociados.
function eliminar(id) {
  const vendedor = obtenerPorId(id);
  const contratos = store.obtenerTodos('contratos').filter((c) => c.vendedorId === vendedor.id);
  if (contratos.length > 0) {
    throw errores.conflicto(
      'El vendedor no se puede eliminar porque tiene contratos asociados.',
      'VENDEDOR_EN_USO'
    );
  }
  return store.eliminar('vendedores', id);
}

module.exports = { ESTADOS, crear, listar, obtenerPorId, actualizar, cambiarEstado, eliminar };
