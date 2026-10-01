// Servicio de contratos.
// Un contrato relaciona a un cliente con un plan de servicio y el vendedor
// que lo captó, con una vigencia en meses. El estado (Vigente, Por vencer,
// Finalizado, Cancelado) se calcula comparando fechas, no se almacena.

const store = require('../db/store');
const errores = require('../utils/errores');
const v = require('../utils/validadores');
const fechas = require('../utils/fechas');

const VIGENCIAS = [6, 12, 24];
const DIAS_POR_VENCER = 30;

// Calcula la fecha de finalización sumando los meses de vigencia.
function calcularFechaFin(inicio, vigenciaMeses) {
  const fecha = fechas.desdeISO(inicio);
  fecha.setMonth(fecha.getMonth() + Number(vigenciaMeses));
  return fechas.aISO(fecha);
}

// Determina el estado real del contrato a partir de sus fechas.
function calcularEstado(contrato, hoy = new Date()) {
  if (contrato.cancelado) return 'Cancelado';

  const fin = fechas.desdeISO(calcularFechaFin(contrato.inicio, contrato.vigenciaMeses));
  const diasRestantes = fechas.diasEntre(fechas.inicioDelDia(), fin);

  if (diasRestantes < 0) return 'Finalizado';
  if (diasRestantes <= DIAS_POR_VENCER) return 'Por vencer';
  return 'Vigente';
}

// Arma la respuesta del contrato con los datos relacionados y su estado.
function presentacion(contrato) {
  const cliente = store.obtenerPorId('clientes', contrato.clienteId);
  const plan = store.obtenerPorId('planes', contrato.planId);
  const vendedor = store.obtenerPorId('vendedores', contrato.vendedorId);
  const fin = calcularFechaFin(contrato.inicio, contrato.vigenciaMeses);

  return {
    ...contrato,
    cliente: cliente ? cliente.nombre : null,
    plan: plan ? plan.nombre : null,
    vendedor: vendedor ? vendedor.nombre : null,
    fin,
    diasRestantes: fechas.diasEntre(fechas.inicioDelDia(), fechas.desdeISO(fin)),
    estado: calcularEstado(contrato),
  };
}

// Valida los datos de un contrato y devuelve { errores, datos }.
function validarCampos({ clienteId, planId, vendedorId, inicio, vigenciaMeses }, { parcial = false } = {}) {
  const listaErrores = [];
  const datos = {};

  if (!parcial || clienteId !== undefined) {
    if (!store.obtenerPorId('clientes', clienteId)) {
      listaErrores.push({ campo: 'clienteId', mensaje: 'El cliente seleccionado no existe' });
    } else {
      datos.clienteId = Number(clienteId);
    }
  }

  if (!parcial || planId !== undefined) {
    if (!store.obtenerPorId('planes', planId)) {
      listaErrores.push({ campo: 'planId', mensaje: 'El plan de servicio seleccionado no existe' });
    } else {
      datos.planId = Number(planId);
    }
  }

  if (!parcial || vendedorId !== undefined) {
    if (!store.obtenerPorId('vendedores', vendedorId)) {
      listaErrores.push({ campo: 'vendedorId', mensaje: 'El vendedor seleccionado no existe' });
    } else {
      datos.vendedorId = Number(vendedorId);
    }
  }

  if (!parcial || inicio !== undefined) {
    const error = v.fechaIso(inicio);
    if (error) {
      listaErrores.push({ campo: 'inicio', mensaje: error });
    } else {
      const limpio = String(inicio).trim();
      const fecha = fechas.desdeISO(limpio);
      const unAnioAtras = new Date();
      unAnioAtras.setFullYear(unAnioAtras.getFullYear() - 1);

      if (fecha > fechas.inicioDelDia()) {
        listaErrores.push({ campo: 'inicio', mensaje: 'La fecha de inicio no puede ser futura' });
      } else if (fecha < unAnioAtras) {
        listaErrores.push({ campo: 'inicio', mensaje: 'La fecha es demasiado antigua (máx. 1 año atrás)' });
      } else {
        datos.inicio = limpio;
      }
    }
  }

  if (!parcial || vigenciaMeses !== undefined) {
    const vigencia = Number(vigenciaMeses);
    if (!VIGENCIAS.includes(vigencia)) {
      listaErrores.push({ campo: 'vigenciaMeses', mensaje: `La vigencia debe ser uno de: ${VIGENCIAS.join(', ')} meses` });
    } else {
      datos.vigenciaMeses = vigencia;
    }
  }

  return { errores: listaErrores, datos };
}

// Crea un contrato nuevo. El valor mensual se toma del plan contratado.
function crear(datosEntrada) {
  const { errores: listaErrores, datos } = validarCampos(datosEntrada);
  if (listaErrores.length > 0) throw errores.peticionInvalida('Los datos del contrato no son válidos.', 'VALIDACION', listaErrores);

  const plan = store.obtenerPorId('planes', datos.planId);
  return presentacion(
    store.insertar('contratos', { ...datos, valorMensual: plan.precio, cancelado: false })
  );
}

// Lista los contratos con filtros opcionales.
function listar(filtros = {}) {
  let contratos = store.obtenerTodos('contratos');

  if (filtros.clienteId) contratos = contratos.filter((c) => c.clienteId === Number(filtros.clienteId));
  if (filtros.vendedorId) contratos = contratos.filter((c) => c.vendedorId === Number(filtros.vendedorId));
  if (filtros.planId) contratos = contratos.filter((c) => c.planId === Number(filtros.planId));

  let resultados = contratos.map(presentacion);

  if (filtros.estado) resultados = resultados.filter((c) => c.estado === filtros.estado);
  if (filtros.busqueda) {
    const termino = v.minusculas(filtros.busqueda);
    resultados = resultados.filter((c) => v.minusculas(c.cliente || '').includes(termino));
  }

  return resultados;
}

// Devuelve un contrato por identificador.
function obtenerPorId(id) {
  const contrato = store.obtenerPorId('contratos', id);
  if (!contrato) throw errores.noEncontrado('El contrato solicitado no existe.');
  return presentacion(contrato);
}

// Actualiza los datos de un contrato que aún no está cancelado.
function actualizar(id, cambios) {
  obtenerPorId(id);
  const actual = store.obtenerPorId('contratos', id);
  if (actual.cancelado) {
    throw errores.conflicto('No se puede modificar un contrato cancelado.', 'CONTRATO_CANCELADO');
  }

  const { errores: listaErrores, datos } = validarCampos(cambios, { parcial: true });
  if (listaErrores.length > 0) throw errores.peticionInvalida('Los datos del contrato no son válidos.', 'VALIDACION', listaErrores);

  if (datos.planId) datos.valorMensual = store.obtenerPorId('planes', datos.planId).precio;

  return presentacion(store.actualizar('contratos', id, datos));
}

// Cancela un contrato. Un contrato finalizado no se puede cancelar.
function cancelar(id) {
  obtenerPorId(id);
  const actual = store.obtenerPorId('contratos', id);
  if (actual.cancelado) throw errores.conflicto('El contrato ya se encuentra cancelado.', 'CONTRATO_CANCELADO');

  const estado = calcularEstado(actual);
  if (estado === 'Finalizado') {
    throw errores.conflicto('El contrato ya está finalizado por fecha.', 'CONTRATO_FINALIZADO');
  }

  return presentacion(store.actualizar('contratos', id, { cancelado: true }));
}

// Reactiva un contrato cancelado.
function reactivar(id) {
  obtenerPorId(id);
  const actual = store.obtenerPorId('contratos', id);
  if (!actual.cancelado) throw errores.conflicto('El contrato no se encuentra cancelado.', 'CONTRATO_ACTIVO');
  return presentacion(store.actualizar('contratos', id, { cancelado: false }));
}

// Elimina un contrato. Solo se permite si no tiene facturas emitidas.
function eliminar(id) {
  const contrato = obtenerPorId(id);
  const facturas = store.obtenerTodos('facturas').filter((f) => f.contratoId === contrato.id);
  if (facturas.length > 0) {
    throw errores.conflicto(
      'El contrato no se puede eliminar porque tiene facturas emitidas.',
      'CONTRATO_EN_USO'
    );
  }
  store.eliminar('contratos', id);
  return presentacion(contrato);
}

module.exports = {
  VIGENCIAS,
  DIAS_POR_VENCER,
  calcularFechaFin,
  calcularEstado,
  presentacion,
  crear,
  listar,
  obtenerPorId,
  actualizar,
  cancelar,
  reactivar,
  eliminar,
};
