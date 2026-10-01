// Genera el archivo docs/openapi.yaml a partir de la especificación definida
// en src/docs/openapi.js, para que la documentación escrita nunca quede
// desactualizada respecto al código que se ejecuta.
//
//   npm run docs:openapi

const fs = require('node:fs');
const path = require('node:path');
const { documento } = require('../src/docs/openapi');

// Convierte un valor JavaScript en su representación YAML.
function aYaml(valor, sangria = 0) {
  const espacios = '  '.repeat(sangria);

  if (valor === null || valor === undefined) return 'null';

  if (typeof valor === 'boolean' || typeof valor === 'number') return String(valor);

  if (typeof valor === 'string') {
    // Las cadenas siempre van entre comillas: así los textos largos, los
    // acentos y los caracteres especiales no rompen el archivo.
    return `"${valor.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, ' ')}"`;
  }

  if (Array.isArray(valor)) {
    if (valor.length === 0) return '[]';
    // El contenido de cada elemento "- " empieza dos columnas después de la
    // sangria del elemento, por eso los objetos anidados usan sangria + 2.
    const lineas = valor.map((item) => `${espacios}  - ${aYaml(item, sangria + 2).trimStart()}`);
    return `\n${lineas.join('\n')}`;
  }

  const claves = Object.keys(valor);
  if (claves.length === 0) return '{}';

  const lineas = claves.map((clave) => {
    const contenido = aYaml(valor[clave], sangria + 1);
    // Los objetos y arreglos ya empiezan con salto de línea propia.
    if (contenido.startsWith('\n')) return `${espacios}${clave}:${contenido}`;
    return `${espacios}${clave}: ${contenido}`;
  });

  return `\n${lineas.join('\n')}`;
}

function main() {
  const especificacion = documento();
  const encabezado =
    '# Especificación de los servicios web de TelecomHub API.\n' +
    '# Archivo generado con: npm run docs:openapi\n' +
    '# La misma especificación está disponible en http://localhost:3001/api/documentacion\n';

  const salida = `${encabezado}${aYaml(especificacion)}\n`;
  const destino = path.join(__dirname, '..', 'docs', 'openapi.yaml');
  fs.writeFileSync(destino, salida, 'utf8');

  console.log(`Especificación escrita en ${destino}`);
}

main();
