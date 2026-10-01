// Servicio de planes de servicio.
// Catálogo comercial que el software TelecomHub ofrece a los clientes:
// nombre, velocidad Mbps, precio mensual, tipo de tecnología y estado.

const store = require('../db/store');
const errores = require('../utils/errores');
const v = require('../utils/validadores');

const ESTADOS = ['Activo', 'Inactivo'];
const TIPOS = ['Fibra', 'Banda Ancha', 'Cable', 'Inalámbrico'];

// Valida los datos de un plan y devuelve { errores, datos }.
function validarCampos({ nombre, velocidad, precio, tipo, estado }, { parcial = false } = {}) {
  const listaErrores = [];
  const datos = {};

  if (!parcial || nombre !== undefined) {
    if (!v.esTexto(nombre)) {
      listaErrores.push({ campo: 'nombre', mensaje: 'El nombre del plan es obligatorio' });
    } else {
      const limpio = v.sinEspacios(nombre);
      if (limpio.length < 3 || limpio.length > 40) {
        listaErrores.push({ campo: 'nombre', mensaje: 'Debe tener entre 3 y 40 caracteres' });
      } else if (v.RE_CARACTERES_ESPECIALES.test(limpio)) {
        listaErrores.push({ campo: 'nombre', mensaje: 'El nombre contiene caracteres no permitidos' });
      } else {
        datos.nombre = limpio;
      }
    }
  }

  if (!parcial || velocidad !== undefined) {
    const error = v.numeroEnRango(velocidad, 1, 2000, 'Debe ser un número entre 1 y 2000 Mbps');
    if (error) listaErrores.push({ campo: 'velocidad', mensaje: error });
    else datos.velocidad = Number(velocidad);
  }

  if (!parcial || precio !== undefined) {
    const error = v.numeroEnRango(precio, 1, 5000000, 'Debe ser un número positivo válido');
    if (error) listaErrores.push({ campo: 'precio', mensaje: error });
    else datos.precio = Number(precio);
  }

  if (!parcial || tipo !== undefined) {
    if (!TIPOS.includes(tipo)) {
      listaErrores.push({ campo: 'tipo', mensaje: `El tipo debe ser uno de: ${TIPOS.join(', ')}` });
    } else {
      datos.tipo = tipo;
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

// Crea un plan de servicio nuevo.
function crear(datosEntrada) {
  const { errores: listaErrores, datos } = validarCampos(datosEntrada);
  if (listaErrores.length > 0) throw errores.peticionInvalida('Los datos del plan no son válidos.', 'VALIDACION', listaErrores);

  const repetido = store
    .obtenerTodos('planes')
    .find((p) => v.minusculas(p.nombre) === v.minusculas(datos.nombre));
  if (repetido) throw errores.conflicto('Ya existe un plan con ese nombre.', 'PLAN_DUPLICADO');

  return store.insertar('planes', datos);
}

// Lista los planes con filtros opcionales.
function listar(filtros = {}) {
  let planes = store.obtenerTodos('planes');

  if (filtros.estado) planes = planes.filter((p) => p.estado === filtros.estado);
  if (filtros.tipo) planes = planes.filter((p) => p.tipo === filtros.tipo);
  if (filtros.busqueda) {
    const termino = v.minusculas(filtros.busqueda);
    planes = planes.filter((p) => v.minusculas(p.nombre).includes(termino));
  }

  return planes;
}

// Devuelve un plan por identificador.
function obtenerPorId(id) {
  const plan = store.obtenerPorId('planes', id);
  if (!plan) throw errores.noEncontrado('El plan de servicio solicitado no existe.');
  return plan;
}

// Actualiza un plan de servicio.
function actualizar(id, cambios) {
  obtenerPorId(id);
  const { errores: listaErrores, datos } = validarCampos(cambios, { parcial: true });
  if (listaErrores.length > 0) throw errores.peticionInvalida('Los datos del plan no son válidos.', 'VALIDACION', listaErrores);

  const actual = store.obtenerPorId('planes', id);
  if (datos.nombre && v.minusculas(datos.nombre) !== v.minusculas(actual.nombre)) {
    const repetido = store
      .obtenerTodos('planes')
      .find((p) => v.minusculas(p.nombre) === v.minusculas(datos.nombre) && p.id !== actual.id);
    if (repetido) throw errores.conflicto('Ya existe un plan con ese nombre.', 'PLAN_DUPLICADO');
  }

  return store.actualizar('planes', id, datos);
}

// Activa o inactiva un plan de servicio.
function cambiarEstado(id, estado) {
  if (!ESTADOS.includes(estado)) {
    throw errores.peticionInvalida(`El estado debe ser uno de: ${ESTADOS.join(', ')}`);
  }
  obtenerPorId(id);
  return store.actualizar('planes', id, { estado });
}

// Elimina un plan. No se permite borrar si hay clientes o contratos asociados.
function eliminar(id) {
  const plan = obtenerPorId(id);
  const clientes = store.obtenerTodos('clientes').filter((c) => c.planId === plan.id);
  const contratos = store.obtenerTodos('contratos').filter((c) => c.planId === plan.id);
  if (clientes.length > 0 || contratos.length > 0) {
    throw errores.conflicto(
      'El plan no se puede eliminar porque tiene clientes o contratos asociados.',
      'PLAN_EN_USO'
    );
  }
  return store.eliminar('planes', id);
}

module.exports = { ESTADOS, TIPOS, crear, listar, obtenerPorId, actualizar, cambiarEstado, eliminar };
