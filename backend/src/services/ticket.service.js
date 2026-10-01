// Servicio de soporte (tickets).
// Registra y sigue las solicitudes de los clientes: fallas, cambios de plan,
// consultas de factura, etc.

const store = require('../db/store');
const errores = require('../utils/errores');
const v = require('../utils/validadores');
const fechas = require('../utils/fechas');

const PRIORIDADES = ['Alta', 'Media', 'Baja'];
const ESTADOS = ['Abierto', 'En proceso', 'Resuelto'];

// Arma la respuesta del ticket con el nombre del cliente.
function presentacion(ticket) {
  const cliente = store.obtenerPorId('clientes', ticket.clienteId);
  return { ...ticket, cliente: cliente ? cliente.nombre : null };
}

// Valida los datos de un ticket y devuelve { errores, datos }.
function validarCampos({ clienteId, asunto, descripcion, prioridad, estado }, { parcial = false } = {}) {
  const listaErrores = [];
  const datos = {};

  if (!parcial || clienteId !== undefined) {
    if (!store.obtenerPorId('clientes', clienteId)) {
      listaErrores.push({ campo: 'clienteId', mensaje: 'El cliente seleccionado no existe' });
    } else {
      datos.clienteId = Number(clienteId);
    }
  }

  if (!parcial || asunto !== undefined) {
    if (!v.esTexto(asunto)) {
      listaErrores.push({ campo: 'asunto', mensaje: 'El asunto es obligatorio' });
    } else {
      const limpio = v.sinEspacios(asunto);
      if (limpio.length < 4 || limpio.length > 80) {
        listaErrores.push({ campo: 'asunto', mensaje: 'Debe tener entre 4 y 80 caracteres' });
      } else {
        datos.asunto = limpio;
      }
    }
  }

  if (!parcial || descripcion !== undefined) {
    if (!v.esTexto(descripcion)) {
      listaErrores.push({ campo: 'descripcion', mensaje: 'La descripción es obligatoria' });
    } else if (String(descripcion).trim().length < 10) {
      listaErrores.push({ campo: 'descripcion', mensaje: 'La descripción debe tener al menos 10 caracteres' });
    } else {
      datos.descripcion = v.sinEspacios(descripcion);
    }
  }

  if (!parcial || prioridad !== undefined) {
    if (!PRIORIDADES.includes(prioridad)) {
      listaErrores.push({ campo: 'prioridad', mensaje: `La prioridad debe ser una de: ${PRIORIDADES.join(', ')}` });
    } else {
      datos.prioridad = prioridad;
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

// Crea un ticket de soporte.
function crear(datosEntrada) {
  const { errores: listaErrores, datos } = validarCampos(datosEntrada);
  if (listaErrores.length > 0) throw errores.peticionInvalida('Los datos del ticket no son válidos.', 'VALIDACION', listaErrores);

  return presentacion(store.insertar('tickets', { ...datos, fecha: fechas.hoyISO() }));
}

// Lista los tickets con filtros opcionales.
function listar(filtros = {}) {
  let resultados = store.obtenerTodos('tickets').map(presentacion);

  if (filtros.clienteId) resultados = resultados.filter((t) => t.clienteId === Number(filtros.clienteId));
  if (filtros.prioridad) resultados = resultados.filter((t) => t.prioridad === filtros.prioridad);
  if (filtros.estado) resultados = resultados.filter((t) => t.estado === filtros.estado);
  if (filtros.busqueda) {
    const termino = v.minusculas(filtros.busqueda);
    resultados = resultados.filter(
      (t) => v.minusculas(t.asunto).includes(termino) || v.minusculas(t.cliente || '').includes(termino)
    );
  }

  return resultados;
}

// Devuelve un ticket por identificador.
function obtenerPorId(id) {
  const ticket = store.obtenerPorId('tickets', id);
  if (!ticket) throw errores.noEncontrado('El ticket solicitado no existe.');
  return presentacion(ticket);
}

// Actualiza los datos de un ticket.
function actualizar(id, cambios) {
  obtenerPorId(id);
  const { errores: listaErrores, datos } = validarCampos(cambios, { parcial: true });
  if (listaErrores.length > 0) throw errores.peticionInvalida('Los datos del ticket no son válidos.', 'VALIDACION', listaErrores);
  return presentacion(store.actualizar('tickets', id, datos));
}

// Cambia el estado de seguimiento del ticket (Abierto / En proceso / Resuelto).
function cambiarEstado(id, estado) {
  if (!ESTADOS.includes(estado)) {
    throw errores.peticionInvalida(`El estado debe ser uno de: ${ESTADOS.join(', ')}`);
  }
  obtenerPorId(id);
  return presentacion(store.actualizar('tickets', id, { estado }));
}

// Elimina un ticket.
function eliminar(id) {
  const ticket = obtenerPorId(id);
  store.eliminar('tickets', id);
  return presentacion(ticket);
}

module.exports = {
  PRIORIDADES,
  ESTADOS,
  presentacion,
  crear,
  listar,
  obtenerPorId,
  actualizar,
  cambiarEstado,
  eliminar,
};
