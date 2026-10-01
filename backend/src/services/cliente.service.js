// Servicio de clientes.
// Gestiona a los usuarios finales del servicio de internet: sus datos de
// contacto, el plan contratado y su estado (Activo / Suspendido).

const store = require('../db/store');
const errores = require('../utils/errores');
const v = require('../utils/validadores');

const ESTADOS = ['Activo', 'Suspendido'];

// Arma la respuesta de un cliente agregando el nombre del plan,
// que es lo que muestra la interfaz.
function presentacion(cliente) {
  const plan = store.obtenerPorId('planes', cliente.planId);
  const contratos = store.obtenerTodos('contratos').filter((c) => c.clienteId === cliente.id);
  return {
    ...cliente,
    plan: plan ? plan.nombre : null,
    contratosActivos: contratos.filter((c) => !c.cancelado).length,
  };
}

// Valida los datos de un cliente y devuelve { errores, datos }.
function validarCampos({ nombre, cedula, telefono, correo, planId, direccion, estado }, { parcial = false } = {}) {
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

  if (!parcial || planId !== undefined) {
    const plan = store.obtenerPorId('planes', planId);
    if (!plan) {
      listaErrores.push({ campo: 'planId', mensaje: 'El plan de servicio seleccionado no existe' });
    } else if (plan.estado === 'Inactivo') {
      listaErrores.push({ campo: 'planId', mensaje: 'El plan de servicio seleccionado está inactivo' });
    } else {
      datos.planId = plan.id;
    }
  }

  if (direccion !== undefined) {
    if (direccion !== null && direccion !== '' && !v.esTexto(direccion)) {
      listaErrores.push({ campo: 'direccion', mensaje: 'La dirección no es válida' });
    } else if (v.esTexto(direccion)) {
      if (direccion.trim().length > 120) {
        listaErrores.push({ campo: 'direccion', mensaje: 'La dirección no puede superar 120 caracteres' });
      } else {
        datos.direccion = v.sinEspacios(direccion);
      }
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

// Crea un cliente nuevo.
function crear(datosEntrada) {
  const { errores: listaErrores, datos } = validarCampos(datosEntrada);
  if (listaErrores.length > 0) throw errores.peticionInvalida('Los datos del cliente no son válidos.', 'VALIDACION', listaErrores);

  const repetido = store.obtenerTodos('clientes').find((c) => c.cedula === datos.cedula);
  if (repetido) throw errores.conflicto('Ya existe un cliente con esa cédula.', 'CEDULA_DUPLICADA');

  return presentacion(store.insertar('clientes', datos));
}

// Lista los clientes con filtros opcionales.
function listar(filtros = {}) {
  let clientes = store.obtenerTodos('clientes');

  if (filtros.estado) clientes = clientes.filter((c) => c.estado === filtros.estado);
  if (filtros.planId) clientes = clientes.filter((c) => c.planId === Number(filtros.planId));
  if (filtros.busqueda) {
    const termino = v.minusculas(filtros.busqueda);
    clientes = clientes.filter(
      (c) => v.minusculas(c.nombre).includes(termino) || c.cedula.includes(termino)
    );
  }

  return clientes.map(presentacion);
}

// Devuelve un cliente por identificador.
function obtenerPorId(id) {
  const cliente = store.obtenerPorId('clientes', id);
  if (!cliente) throw errores.noEncontrado('El cliente solicitado no existe.');
  return presentacion(cliente);
}

// Actualiza los datos de un cliente.
function actualizar(id, cambios) {
  obtenerPorId(id);
  const { errores: listaErrores, datos } = validarCampos(cambios, { parcial: true });
  if (listaErrores.length > 0) throw errores.peticionInvalida('Los datos del cliente no son válidos.', 'VALIDACION', listaErrores);

  const actual = store.obtenerPorId('clientes', id);
  if (datos.cedula && datos.cedula !== actual.cedula) {
    const repetido = store.obtenerTodos('clientes').find((c) => c.cedula === datos.cedula && c.id !== actual.id);
    if (repetido) throw errores.conflicto('Ya existe un cliente con esa cédula.', 'CEDULA_DUPLICADA');
  }

  return presentacion(store.actualizar('clientes', id, datos));
}

// Suspende o reactiva un cliente.
function cambiarEstado(id, estado) {
  if (!ESTADOS.includes(estado)) {
    throw errores.peticionInvalida(`El estado debe ser uno de: ${ESTADOS.join(', ')}`);
  }
  obtenerPorId(id);
  return presentacion(store.actualizar('clientes', id, { estado }));
}

// Elimina un cliente. No se permite si tiene contratos o facturas.
function eliminar(id) {
  const cliente = obtenerPorId(id);
  const contratos = store.obtenerTodos('contratos').filter((c) => c.clienteId === cliente.id);
  const facturas = store.obtenerTodos('facturas').filter((f) => f.clienteId === cliente.id);
  if (contratos.length > 0 || facturas.length > 0) {
    throw errores.conflicto(
      'El cliente no se puede eliminar porque tiene contratos o facturas asociadas.',
      'CLIENTE_EN_USO'
    );
  }
  store.eliminar('clientes', id);
  return presentacion(cliente);
}

module.exports = { ESTADOS, presentacion, crear, listar, obtenerPorId, actualizar, cambiarEstado, eliminar };
