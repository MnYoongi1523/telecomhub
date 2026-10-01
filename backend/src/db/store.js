// Capa de persistencia en memoria del servicio web.
//
// En un despliegue real esta capa se reemplaza por un motor de base de datos
// (MySQL, PostgreSQL, MongoDB, etc.) sin cambiar los servicios de negocio,
// porque todas las operaciones de lectura y escritura pasan por estas funciones.

const colecciones = {
  usuarios: [],
  planes: [],
  clientes: [],
  vendedores: [],
  contratos: [],
  facturas: [],
  pagos: [],
  tickets: [],
};

// Consecutivo por colección para simular el autoincremento de las tablas.
const consecutivos = {};

// Genera el siguiente identificador de una colección.
function siguienteId(coleccion) {
  consecutivos[coleccion] = (consecutivos[coleccion] || 0) + 1;
  return consecutivos[coleccion];
}

// Inserta un registro y devuelve el objeto completo con su id asignado.
function insertar(coleccion, datos) {
  const registro = { id: siguienteId(coleccion), ...datos };
  colecciones[coleccion].push(registro);
  return registro;
}

// Devuelve una copia del arreglo con todos los registros de la colección.
function obtenerTodos(coleccion) {
  return colecciones[coleccion];
}

// Busca un registro por identificador. Devuelve null si no existe.
function obtenerPorId(coleccion, id) {
  return colecciones[coleccion].find((registro) => registro.id === Number(id)) || null;
}

// Actualiza un registro existente. Devuelve null si no existe.
function actualizar(coleccion, id, cambios) {
  const indice = colecciones[coleccion].findIndex((registro) => registro.id === Number(id));
  if (indice === -1) return null;
  colecciones[coleccion][indice] = { ...colecciones[coleccion][indice], ...cambios };
  return colecciones[coleccion][indice];
}

// Elimina un registro. Devuelve el registro eliminado o null si no existía.
function eliminar(coleccion, id) {
  const indice = colecciones[coleccion].findIndex((registro) => registro.id === Number(id));
  if (indice === -1) return null;
  return colecciones[coleccion].splice(indice, 1)[0];
}

// Vacía todas las colecciones y reinicia los consecutivos.
// Se usa en las pruebas para partir siempre de un estado conocido.
function reiniciar() {
  for (const nombre of Object.keys(colecciones)) {
    colecciones[nombre] = [];
    consecutivos[nombre] = 0;
  }
}

module.exports = {
  colecciones,
  siguienteId,
  insertar,
  obtenerTodos,
  obtenerPorId,
  actualizar,
  eliminar,
  reiniciar,
};
