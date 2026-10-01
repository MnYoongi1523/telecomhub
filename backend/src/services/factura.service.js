// Servicio de facturación.
// Emite la factura mensual de un contrato. El valor se copia del plan para
// que la factura no cambie si después se edita el precio del plan.

const store = require('../db/store');
const errores = require('../utils/errores');
const v = require('../utils/validadores');
const fechas = require('../utils/fechas');

// Determina el estado de la factura: Pagada, Pendiente o Vencida.
function calcularEstado(factura) {
  if (factura.pagada) return 'Pagada';
  return fechas.inicioDelDia() > fechas.desdeISO(factura.vencimiento) ? 'Vencida' : 'Pendiente';
}

// Arma la respuesta de la factura con los datos del cliente y su estado.
function presentacion(factura) {
  const cliente = store.obtenerPorId('clientes', factura.clienteId);
  const plan = store.obtenerPorId('planes', factura.planId);

  return {
    ...factura,
    cliente: cliente ? cliente.nombre : null,
    plan: plan ? plan.nombre : null,
    diasParaVencer: fechas.diasEntre(fechas.inicioDelDia(), fechas.desdeISO(factura.vencimiento)),
    estado: calcularEstado(factura),
  };
}

// Valida los datos de una factura y devuelve { errores, datos }.
function validarCampos({ contratoId, emision, vencimiento }, { parcial = false } = {}) {
  const listaErrores = [];
  const datos = {};

  if (!parcial || contratoId !== undefined) {
    if (!store.obtenerPorId('contratos', contratoId)) {
      listaErrores.push({ campo: 'contratoId', mensaje: 'El contrato seleccionado no existe' });
    } else {
      datos.contratoId = Number(contratoId);
    }
  }

  if (!parcial || emision !== undefined) {
    const error = v.fechaIso(emision);
    if (error) listaErrores.push({ campo: 'emision', mensaje: 'La fecha de emisión es obligatoria y debe tener el formato YYYY-MM-DD' });
    else datos.emision = String(emision).trim();
  }

  if (!parcial || vencimiento !== undefined) {
    const error = v.fechaIso(vencimiento);
    if (error) {
      listaErrores.push({ campo: 'vencimiento', mensaje: 'La fecha de vencimiento es obligatoria y debe tener el formato YYYY-MM-DD' });
    } else {
      const limpio = String(vencimiento).trim();
      // Solo se compara contra la emisión cuando viene en la misma petición;
      // en una actualización parcial se valida en la función actualizar().
      if (datos.emision && limpio <= datos.emision) {
        listaErrores.push({ campo: 'vencimiento', mensaje: 'Debe ser posterior a la fecha de emisión' });
      } else {
        datos.vencimiento = limpio;
      }
    }
  }

  return { errores: listaErrores, datos };
}

// Emite una factura para un contrato vigente.
function crear(datosEntrada) {
  const { errores: listaErrores, datos } = validarCampos(datosEntrada);
  if (listaErrores.length > 0) throw errores.peticionInvalida('Los datos de la factura no son válidos.', 'VALIDACION', listaErrores);

  // La comparación de fechas se repite aquí porque el vencimiento se valida
  // contra la emisión recibida en la misma petición.
  if (datos.vencimiento <= datos.emision) {
    throw errores.peticionInvalida('Debe ser posterior a la fecha de emisión', 'VALIDACION', [
      { campo: 'vencimiento', mensaje: 'Debe ser posterior a la fecha de emisión' },
    ]);
  }

  const contrato = store.obtenerPorId('contratos', datos.contratoId);
  const plan = store.obtenerPorId('planes', contrato.planId);

  return presentacion(
    store.insertar('facturas', {
      contratoId: contrato.id,
      clienteId: contrato.clienteId,
      planId: plan.id,
      valor: contrato.valorMensual,
      emision: datos.emision,
      vencimiento: datos.vencimiento,
      pagada: false,
    })
  );
}

// Lista las facturas con filtros opcionales.
function listar(filtros = {}) {
  let facturas = store.obtenerTodos('facturas');

  if (filtros.clienteId) facturas = facturas.filter((f) => f.clienteId === Number(filtros.clienteId));
  if (filtros.contratoId) facturas = facturas.filter((f) => f.contratoId === Number(filtros.contratoId));
  if (filtros.pagada !== undefined) {
    const pagada = filtros.pagada === 'true' || filtros.pagada === true;
    facturas = facturas.filter((f) => f.pagada === pagada);
  }

  let resultados = facturas.map(presentacion);

  if (filtros.estado) resultados = resultados.filter((f) => f.estado === filtros.estado);
  if (filtros.busqueda) {
    const termino = v.minusculas(filtros.busqueda);
    resultados = resultados.filter((f) => v.minusculas(f.cliente || '').includes(termino));
  }

  return resultados;
}

// Devuelve una factura por identificador.
function obtenerPorId(id) {
  const factura = store.obtenerPorId('facturas', id);
  if (!factura) throw errores.noEncontrado('La factura solicitada no existe.');
  return presentacion(factura);
}

// Actualiza las fechas de una factura que todavía no está pagada.
function actualizar(id, cambios) {
  obtenerPorId(id);
  const actual = store.obtenerPorId('facturas', id);
  if (actual.pagada) {
    throw errores.conflicto('No se puede modificar una factura pagada.', 'FACTURA_PAGADA');
  }

  const { errores: listaErrores, datos } = validarCampos(cambios, { parcial: true });
  if (listaErrores.length > 0) throw errores.peticionInvalida('Los datos de la factura no son válidos.', 'VALIDACION', listaErrores);

  const emision = datos.emision || actual.emision;
  const vencimiento = datos.vencimiento || actual.vencimiento;
  if (vencimiento <= emision) {
    throw errores.peticionInvalida('Debe ser posterior a la fecha de emisión', 'VALIDACION', [
      { campo: 'vencimiento', mensaje: 'Debe ser posterior a la fecha de emisión' },
    ]);
  }

  return presentacion(store.actualizar('facturas', id, datos));
}

// Elimina una factura. Las facturas con pagos registrados no se pueden borrar.
function eliminar(id) {
  const factura = obtenerPorId(id);
  const pagos = store.obtenerTodos('pagos').filter((p) => p.facturaId === factura.id);
  if (pagos.length > 0) {
    throw errores.conflicto('La factura no se puede eliminar porque tiene pagos registrados.', 'FACTURA_EN_USO');
  }
  store.eliminar('facturas', id);
  return presentacion(factura);
}

module.exports = {
  calcularEstado,
  presentacion,
  crear,
  listar,
  obtenerPorId,
  actualizar,
  eliminar,
};
