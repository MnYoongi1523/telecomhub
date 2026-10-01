// Documentación de la API en formato OpenAPI 3.0.
// El servicio la publica en GET /api/documentacion, de modo que la
// especificación siempre está sincronizada con el código que se ejecuta.

const esquemas = {
  Error: {
    type: 'object',
    properties: {
      ok: { type: 'boolean', example: false },
      mensaje: { type: 'string' },
      error: { type: 'string', description: 'Código de error' },
    },
  },
  Cliente: {
    type: 'object',
    properties: {
      id: { type: 'integer', example: 1 },
      nombre: { type: 'string', example: 'Carlos Mendoza' },
      cedula: { type: 'string', example: '1010203040' },
      telefono: { type: 'string', example: '+57 300 123 4567' },
      correo: { type: 'string', example: 'carlos.mendoza@correo.com' },
      planId: { type: 'integer', example: 2 },
      plan: { type: 'string', description: 'Nombre del plan (solo lectura)', example: 'Fibra 300MB' },
      direccion: { type: 'string' },
      estado: { type: 'string', enum: ['Activo', 'Suspendido'] },
      contratosActivos: { type: 'integer' },
    },
  },
  Plan: {
    type: 'object',
    properties: {
      id: { type: 'integer', example: 1 },
      nombre: { type: 'string', example: 'Fibra 100MB' },
      velocidad: { type: 'integer', description: 'Mbps', example: 100 },
      precio: { type: 'number', description: 'Valor mensual en pesos', example: 65000 },
      tipo: { type: 'string', enum: ['Fibra', 'Banda Ancha', 'Cable', 'Inalámbrico'] },
      estado: { type: 'string', enum: ['Activo', 'Inactivo'] },
    },
  },
  Vendedor: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      nombre: { type: 'string' },
      cedula: { type: 'string' },
      telefono: { type: 'string' },
      correo: { type: 'string' },
      estado: { type: 'string', enum: ['Activo', 'Inactivo'] },
    },
  },
  Contrato: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      clienteId: { type: 'integer' },
      planId: { type: 'integer' },
      vendedorId: { type: 'integer' },
      cliente: { type: 'string', description: 'Nombre del cliente (solo lectura)' },
      plan: { type: 'string' },
      vendedor: { type: 'string' },
      inicio: { type: 'string', format: 'date' },
      fin: { type: 'string', format: 'date', description: 'Fecha calculada de finalización' },
      diasRestantes: { type: 'integer' },
      vigenciaMeses: { type: 'integer', enum: [6, 12, 24] },
      valorMensual: { type: 'number' },
      cancelado: { type: 'boolean' },
      estado: {
        type: 'string',
        enum: ['Vigente', 'Por vencer', 'Finalizado', 'Cancelado'],
        description: 'Estado calculado a partir de las fechas',
      },
    },
  },
  Factura: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      contratoId: { type: 'integer' },
      clienteId: { type: 'integer' },
      planId: { type: 'integer' },
      cliente: { type: 'string' },
      plan: { type: 'string' },
      valor: { type: 'number' },
      emision: { type: 'string', format: 'date' },
      vencimiento: { type: 'string', format: 'date' },
      diasParaVencer: { type: 'integer' },
      pagada: { type: 'boolean' },
      estado: { type: 'string', enum: ['Pagada', 'Pendiente', 'Vencida'] },
    },
  },
  Pago: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      facturaId: { type: 'integer' },
      clienteId: { type: 'integer' },
      cliente: { type: 'string' },
      valor: { type: 'number' },
      fecha: { type: 'string', format: 'date' },
      metodo: { type: 'string', enum: ['Efectivo', 'Transferencia', 'Tarjeta'] },
    },
  },
  Ticket: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      clienteId: { type: 'integer' },
      cliente: { type: 'string' },
      asunto: { type: 'string' },
      descripcion: { type: 'string' },
      prioridad: { type: 'string', enum: ['Alta', 'Media', 'Baja'] },
      estado: { type: 'string', enum: ['Abierto', 'En proceso', 'Resuelto'] },
      fecha: { type: 'string', format: 'date' },
    },
  },
  Usuario: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      nombre: { type: 'string' },
      username: { type: 'string' },
      rol: { type: 'string', enum: ['Administrador', 'Supervisor', 'Soporte Técnico'] },
      estado: { type: 'string', enum: ['Activo', 'Inactivo'] },
      creadoEn: { type: 'string', format: 'date-time' },
    },
  },
};

// Respuestas de error reutilizadas por todos los servicios web.
const respuestasComunes = {
  400: {
    description: 'Los datos enviados no cumplen las reglas de validación',
    content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
  },
  401: {
    description: 'Falta el token de autenticación o las credenciales no son válidas',
    content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
  },
  403: {
    description: 'El rol del usuario no tiene permiso para la operación',
    content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
  },
  404: {
    description: 'El recurso solicitado no existe',
    content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
  },
  409: {
    description: 'Conflicto: el recurso ya existe o está en uso',
    content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
  },
};

// Construye la respuesta de éxito de una lista.
function lista(schemaRef, descripcion) {
  return {
    description: descripcion,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            ok: { type: 'boolean', example: true },
            mensaje: { type: 'string' },
            total: { type: 'integer' },
            data: { type: 'array', items: { $ref: schemaRef } },
          },
        },
      },
    },
  };
}

// Construye la respuesta de éxito de un recurso individual.
function recurso(schemaRef, descripcion) {
  return {
    description: descripcion,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            ok: { type: 'boolean', example: true },
            mensaje: { type: 'string' },
            data: { $ref: schemaRef },
          },
        },
      },
    },
  };
}

// Construye el cuerpo de una petición de creación.
function cuerpoCrear(propiedades, requeridos) {
  return {
    required: true,
    content: {
      'application/json': {
        schema: { type: 'object', properties: propiedades, required: requeridos },
      },
    },
  };
}

function documento() {
  return {
    openapi: '3.0.3',
    info: {
      title: 'TelecomHub API',
      version: '1.0.0',
      description:
        'Servicios web del software de gestión TelecomHub: autenticación, clientes, ' +
        'planes de servicio, vendedores, contratos, facturación, pagos, soporte e indicadores.',
    },
    servers: [{ url: 'http://localhost:3001', description: 'Servidor local de desarrollo' }],
    tags: [
      { name: 'General', description: 'Estado del servicio y documentación' },
      { name: 'Autenticación', description: 'Registro, inicio de sesión y perfil' },
      { name: 'Dashboard', description: 'Indicadores y reportes' },
      { name: 'Administración', description: 'Usuarios del sistema y roles' },
      { name: 'Planes', description: 'Catálogo de planes de servicio' },
      { name: 'Clientes', description: 'Clientes del servicio de internet' },
      { name: 'Vendedores', description: 'Asesores comerciales' },
      { name: 'Contratos', description: 'Contratos de servicio' },
      { name: 'Facturas', description: 'Facturación mensual' },
      { name: 'Pagos', description: 'Pagos de facturas' },
      { name: 'Soporte', description: 'Tickets de soporte' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: esquemas,
    },
    security: [{ bearerAuth: [] }],
    paths: {
      '/api/salud': {
        get: {
          tags: ['General'],
          summary: 'Verificar que el servicio está en línea',
          security: [],
          responses: {
            200: {
              description: 'Servicio disponible',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      ok: { type: 'boolean' },
                      mensaje: { type: 'string' },
                      version: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/documentacion': {
        get: {
          tags: ['General'],
          summary: 'Especificación OpenAPI de todos los servicios',
          security: [],
          responses: { 200: { description: 'Documentación en formato OpenAPI 3.0' } },
        },
      },
      '/api/servicios': {
        get: {
          tags: ['General'],
          summary: 'Catálogo de servicios web agrupados por módulo',
          responses: { 200: { description: 'Listado de rutas disponibles' } },
        },
      },
      '/api/auth/registro': {
        post: {
          tags: ['Autenticación'],
          summary: 'Registrar un usuario en el sistema',
          security: [],
          requestBody: cuerpoCrear(
            {
              username: { type: 'string', minLength: 3, example: 'operador' },
              password: { type: 'string', minLength: 6, example: 'Clave123' },
              nombre: { type: 'string', example: 'Operador de pruebas' },
              rol: { type: 'string', enum: ['Administrador', 'Supervisor', 'Soporte Técnico'] },
            },
            ['username', 'password']
          ),
          responses: {
            201: recurso('#/components/schemas/Usuario', 'Usuario creado'),
            ...respuestasComunes,
          },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['Autenticación'],
          summary: 'Iniciar sesión con usuario y contraseña',
          security: [],
          requestBody: cuerpoCrear(
            {
              username: { type: 'string', example: 'administrador' },
              password: { type: 'string', example: 'Admin123' },
            },
            ['username', 'password']
          ),
          responses: {
            200: {
              description: 'Autenticación satisfactoria, devuelve el token de acceso',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      ok: { type: 'boolean' },
                      mensaje: { type: 'string', example: 'Autenticación satisfactoria. Bienvenido.' },
                      data: {
                        type: 'object',
                        properties: {
                          token: { type: 'string' },
                          usuario: { $ref: '#/components/schemas/Usuario' },
                        },
                      },
                    },
                  },
                },
              },
            },
            ...respuestasComunes,
          },
        },
      },
      '/api/auth/perfil': {
        get: {
          tags: ['Autenticación'],
          summary: 'Consultar el perfil del usuario autenticado',
          responses: { 200: recurso('#/components/schemas/Usuario', 'Perfil del usuario'), ...respuestasComunes },
        },
      },
      '/api/dashboard': {
        get: {
          tags: ['Dashboard'],
          summary: 'Resumen de gestión para la pantalla principal',
          responses: { 200: recurso('#/components/schemas/Error', 'Indicadores y últimas novedades'), ...respuestasComunes },
        },
      },
      '/api/dashboard/indicadores': {
        get: {
          tags: ['Dashboard'],
          summary: 'Indicadores numéricos del negocio',
          responses: { 200: { description: 'Totales de clientes, contratos, facturación, pagos y soporte' }, ...respuestasComunes },
        },
      },
      '/api/dashboard/ventas-vendedores': {
        get: {
          tags: ['Dashboard'],
          summary: 'Reporte de ventas por vendedor',
          responses: { 200: { description: 'Contratos e ingreso mensual por vendedor' }, ...respuestasComunes },
        },
      },
      '/api/dashboard/clientes/{clienteId}/estado-cuenta': {
        get: {
          tags: ['Dashboard'],
          summary: 'Estado de cuenta de un cliente',
          parameters: [{ name: 'clienteId', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Contratos, facturas, pagos y saldos del cliente' }, ...respuestasComunes },
        },
      },
      '/api/usuarios': {
        get: {
          tags: ['Administración'],
          summary: 'Listar usuarios del sistema',
          parameters: [
            { name: 'estado', in: 'query', schema: { type: 'string', enum: ['Activo', 'Inactivo'] } },
            { name: 'rol', in: 'query', schema: { type: 'string' } },
            { name: 'busqueda', in: 'query', schema: { type: 'string' } },
          ],
          responses: { 200: lista('#/components/schemas/Usuario', 'Usuarios del sistema'), ...respuestasComunes },
        },
        post: {
          tags: ['Administración'],
          summary: 'Crear un usuario del sistema (solo Administrador)',
          requestBody: cuerpoCrear(
            {
              nombre: { type: 'string' },
              username: { type: 'string', minLength: 4 },
              password: { type: 'string', minLength: 6 },
              rol: { type: 'string', enum: ['Administrador', 'Supervisor', 'Soporte Técnico'] },
              estado: { type: 'string', enum: ['Activo', 'Inactivo'] },
            },
            ['nombre', 'username', 'password', 'rol', 'estado']
          ),
          responses: { 201: recurso('#/components/schemas/Usuario', 'Usuario creado'), ...respuestasComunes },
        },
      },
      '/api/usuarios/{id}': {
        get: {
          tags: ['Administración'],
          summary: 'Consultar un usuario',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: recurso('#/components/schemas/Usuario', 'Usuario encontrado'), ...respuestasComunes },
        },
        put: {
          tags: ['Administración'],
          summary: 'Actualizar un usuario',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: cuerpoCrear(
            { nombre: { type: 'string' }, username: { type: 'string' }, password: { type: 'string' }, rol: { type: 'string' }, estado: { type: 'string' } },
            []
          ),
          responses: { 200: recurso('#/components/schemas/Usuario', 'Usuario actualizado'), ...respuestasComunes },
        },
        delete: {
          tags: ['Administración'],
          summary: 'Eliminar un usuario',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: recurso('#/components/schemas/Usuario', 'Usuario eliminado'), ...respuestasComunes },
        },
      },
      '/api/usuarios/{id}/estado': {
        patch: {
          tags: ['Administración'],
          summary: 'Activar o desactivar un usuario',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: cuerpoCrear({ estado: { type: 'string', enum: ['Activo', 'Inactivo'] } }, ['estado']),
          responses: { 200: recurso('#/components/schemas/Usuario', 'Estado actualizado'), ...respuestasComunes },
        },
      },
      '/api/planes': {
        get: {
          tags: ['Planes'],
          summary: 'Listar planes de servicio',
          parameters: [
            { name: 'estado', in: 'query', schema: { type: 'string', enum: ['Activo', 'Inactivo'] } },
            { name: 'tipo', in: 'query', schema: { type: 'string' } },
            { name: 'busqueda', in: 'query', schema: { type: 'string' } },
          ],
          responses: { 200: lista('#/components/schemas/Plan', 'Planes de servicio'), ...respuestasComunes },
        },
        post: {
          tags: ['Planes'],
          summary: 'Crear un plan de servicio',
          requestBody: cuerpoCrear(
            {
              nombre: { type: 'string', minLength: 3, maxLength: 40 },
              velocidad: { type: 'integer', minimum: 1, maximum: 2000 },
              precio: { type: 'number', minimum: 1, maximum: 5000000 },
              tipo: { type: 'string', enum: ['Fibra', 'Banda Ancha', 'Cable', 'Inalámbrico'] },
              estado: { type: 'string', enum: ['Activo', 'Inactivo'] },
            },
            ['nombre', 'velocidad', 'precio', 'tipo', 'estado']
          ),
          responses: { 201: recurso('#/components/schemas/Plan', 'Plan creado'), ...respuestasComunes },
        },
      },
      '/api/planes/{id}': {
        get: {
          tags: ['Planes'],
          summary: 'Consultar un plan de servicio',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: recurso('#/components/schemas/Plan', 'Plan encontrado'), ...respuestasComunes },
        },
        put: {
          tags: ['Planes'],
          summary: 'Actualizar un plan de servicio',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: cuerpoCrear(
            { nombre: { type: 'string' }, velocidad: { type: 'integer' }, precio: { type: 'number' }, tipo: { type: 'string' }, estado: { type: 'string' } },
            []
          ),
          responses: { 200: recurso('#/components/schemas/Plan', 'Plan actualizado'), ...respuestasComunes },
        },
        delete: {
          tags: ['Planes'],
          summary: 'Eliminar un plan de servicio',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: recurso('#/components/schemas/Plan', 'Plan eliminado'), ...respuestasComunes },
        },
      },
      '/api/planes/{id}/estado': {
        patch: {
          tags: ['Planes'],
          summary: 'Activar o inactivar un plan de servicio',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: cuerpoCrear({ estado: { type: 'string', enum: ['Activo', 'Inactivo'] } }, ['estado']),
          responses: { 200: recurso('#/components/schemas/Plan', 'Estado actualizado'), ...respuestasComunes },
        },
      },
      '/api/clientes': {
        get: {
          tags: ['Clientes'],
          summary: 'Listar clientes',
          parameters: [
            { name: 'estado', in: 'query', schema: { type: 'string', enum: ['Activo', 'Suspendido'] } },
            { name: 'planId', in: 'query', schema: { type: 'integer' } },
            { name: 'busqueda', in: 'query', schema: { type: 'string' } },
          ],
          responses: { 200: lista('#/components/schemas/Cliente', 'Clientes registrados'), ...respuestasComunes },
        },
        post: {
          tags: ['Clientes'],
          summary: 'Registrar un cliente',
          requestBody: cuerpoCrear(
            {
              nombre: { type: 'string', minLength: 3, maxLength: 50 },
              cedula: { type: 'string', description: 'Entre 6 y 10 dígitos' },
              telefono: { type: 'string', example: '+57 300 123 4567' },
              correo: { type: 'string', format: 'email' },
              planId: { type: 'integer' },
              direccion: { type: 'string', maxLength: 120 },
              estado: { type: 'string', enum: ['Activo', 'Suspendido'] },
            },
            ['nombre', 'cedula', 'telefono', 'correo', 'planId', 'estado']
          ),
          responses: { 201: recurso('#/components/schemas/Cliente', 'Cliente registrado'), ...respuestasComunes },
        },
      },
      '/api/clientes/{id}': {
        get: {
          tags: ['Clientes'],
          summary: 'Consultar un cliente',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: recurso('#/components/schemas/Cliente', 'Cliente encontrado'), ...respuestasComunes },
        },
        put: {
          tags: ['Clientes'],
          summary: 'Actualizar un cliente',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: cuerpoCrear(
            { nombre: { type: 'string' }, cedula: { type: 'string' }, telefono: { type: 'string' }, correo: { type: 'string' }, planId: { type: 'integer' }, direccion: { type: 'string' }, estado: { type: 'string' } },
            []
          ),
          responses: { 200: recurso('#/components/schemas/Cliente', 'Cliente actualizado'), ...respuestasComunes },
        },
        delete: {
          tags: ['Clientes'],
          summary: 'Eliminar un cliente sin contratos ni facturas',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: recurso('#/components/schemas/Cliente', 'Cliente eliminado'), ...respuestasComunes },
        },
      },
      '/api/clientes/{id}/estado': {
        patch: {
          tags: ['Clientes'],
          summary: 'Suspender o reactivar un cliente',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: cuerpoCrear({ estado: { type: 'string', enum: ['Activo', 'Suspendido'] } }, ['estado']),
          responses: { 200: recurso('#/components/schemas/Cliente', 'Estado actualizado'), ...respuestasComunes },
        },
      },
      '/api/vendedores': {
        get: {
          tags: ['Vendedores'],
          summary: 'Listar vendedores',
          parameters: [
            { name: 'estado', in: 'query', schema: { type: 'string', enum: ['Activo', 'Inactivo'] } },
            { name: 'busqueda', in: 'query', schema: { type: 'string' } },
          ],
          responses: { 200: lista('#/components/schemas/Vendedor', 'Vendedores'), ...respuestasComunes },
        },
        post: {
          tags: ['Vendedores'],
          summary: 'Registrar un vendedor',
          requestBody: cuerpoCrear(
            {
              nombre: { type: 'string' },
              cedula: { type: 'string' },
              telefono: { type: 'string' },
              correo: { type: 'string', format: 'email' },
              estado: { type: 'string', enum: ['Activo', 'Inactivo'] },
            },
            ['nombre', 'cedula', 'telefono', 'correo', 'estado']
          ),
          responses: { 201: recurso('#/components/schemas/Vendedor', 'Vendedor registrado'), ...respuestasComunes },
        },
      },
      '/api/vendedores/{id}': {
        get: {
          tags: ['Vendedores'],
          summary: 'Consultar un vendedor',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: recurso('#/components/schemas/Vendedor', 'Vendedor encontrado'), ...respuestasComunes },
        },
        put: {
          tags: ['Vendedores'],
          summary: 'Actualizar un vendedor',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: cuerpoCrear(
            { nombre: { type: 'string' }, cedula: { type: 'string' }, telefono: { type: 'string' }, correo: { type: 'string' }, estado: { type: 'string' } },
            []
          ),
          responses: { 200: recurso('#/components/schemas/Vendedor', 'Vendedor actualizado'), ...respuestasComunes },
        },
        delete: {
          tags: ['Vendedores'],
          summary: 'Eliminar un vendedor sin contratos',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: recurso('#/components/schemas/Vendedor', 'Vendedor eliminado'), ...respuestasComunes },
        },
      },
      '/api/vendedores/{id}/estado': {
        patch: {
          tags: ['Vendedores'],
          summary: 'Activar o inactivar un vendedor',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: cuerpoCrear({ estado: { type: 'string', enum: ['Activo', 'Inactivo'] } }, ['estado']),
          responses: { 200: recurso('#/components/schemas/Vendedor', 'Estado actualizado'), ...respuestasComunes },
        },
      },
      '/api/contratos': {
        get: {
          tags: ['Contratos'],
          summary: 'Listar contratos',
          parameters: [
            { name: 'clienteId', in: 'query', schema: { type: 'integer' } },
            { name: 'vendedorId', in: 'query', schema: { type: 'integer' } },
            { name: 'planId', in: 'query', schema: { type: 'integer' } },
            { name: 'estado', in: 'query', schema: { type: 'string', enum: ['Vigente', 'Por vencer', 'Finalizado', 'Cancelado'] } },
            { name: 'busqueda', in: 'query', schema: { type: 'string' } },
          ],
          responses: { 200: lista('#/components/schemas/Contrato', 'Contratos'), ...respuestasComunes },
        },
        post: {
          tags: ['Contratos'],
          summary: 'Registrar un contrato',
          requestBody: cuerpoCrear(
            {
              clienteId: { type: 'integer' },
              planId: { type: 'integer' },
              vendedorId: { type: 'integer' },
              inicio: { type: 'string', format: 'date', description: 'No puede ser futura ni mayor a un año' },
              vigenciaMeses: { type: 'integer', enum: [6, 12, 24] },
            },
            ['clienteId', 'planId', 'vendedorId', 'inicio', 'vigenciaMeses']
          ),
          responses: { 201: recurso('#/components/schemas/Contrato', 'Contrato registrado'), ...respuestasComunes },
        },
      },
      '/api/contratos/{id}': {
        get: {
          tags: ['Contratos'],
          summary: 'Consultar un contrato',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: recurso('#/components/schemas/Contrato', 'Contrato encontrado'), ...respuestasComunes },
        },
        put: {
          tags: ['Contratos'],
          summary: 'Actualizar un contrato vigente',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: cuerpoCrear(
            { clienteId: { type: 'integer' }, planId: { type: 'integer' }, vendedorId: { type: 'integer' }, inicio: { type: 'string', format: 'date' }, vigenciaMeses: { type: 'integer' } },
            []
          ),
          responses: { 200: recurso('#/components/schemas/Contrato', 'Contrato actualizado'), ...respuestasComunes },
        },
        delete: {
          tags: ['Contratos'],
          summary: 'Eliminar un contrato sin facturas',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: recurso('#/components/schemas/Contrato', 'Contrato eliminado'), ...respuestasComunes },
        },
      },
      '/api/contratos/{id}/cancelar': {
        patch: {
          tags: ['Contratos'],
          summary: 'Cancelar un contrato vigente',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: recurso('#/components/schemas/Contrato', 'Contrato cancelado'), ...respuestasComunes },
        },
      },
      '/api/contratos/{id}/reactivar': {
        patch: {
          tags: ['Contratos'],
          summary: 'Reactivar un contrato cancelado',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: recurso('#/components/schemas/Contrato', 'Contrato reactivado'), ...respuestasComunes },
        },
      },
      '/api/facturas': {
        get: {
          tags: ['Facturas'],
          summary: 'Listar facturas',
          parameters: [
            { name: 'clienteId', in: 'query', schema: { type: 'integer' } },
            { name: 'contratoId', in: 'query', schema: { type: 'integer' } },
            { name: 'estado', in: 'query', schema: { type: 'string', enum: ['Pagada', 'Pendiente', 'Vencida'] } },
            { name: 'pagada', in: 'query', schema: { type: 'boolean' } },
            { name: 'busqueda', in: 'query', schema: { type: 'string' } },
          ],
          responses: { 200: lista('#/components/schemas/Factura', 'Facturas'), ...respuestasComunes },
        },
        post: {
          tags: ['Facturas'],
          summary: 'Emitir una factura para un contrato',
          requestBody: cuerpoCrear(
            {
              contratoId: { type: 'integer' },
              emision: { type: 'string', format: 'date' },
              vencimiento: { type: 'string', format: 'date', description: 'Debe ser posterior a la emisión' },
            },
            ['contratoId', 'emision', 'vencimiento']
          ),
          responses: { 201: recurso('#/components/schemas/Factura', 'Factura generada'), ...respuestasComunes },
        },
      },
      '/api/facturas/{id}': {
        get: {
          tags: ['Facturas'],
          summary: 'Consultar una factura',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: recurso('#/components/schemas/Factura', 'Factura encontrada'), ...respuestasComunes },
        },
        put: {
          tags: ['Facturas'],
          summary: 'Actualizar las fechas de una factura pendiente',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: cuerpoCrear({ emision: { type: 'string', format: 'date' }, vencimiento: { type: 'string', format: 'date' } }, []),
          responses: { 200: recurso('#/components/schemas/Factura', 'Factura actualizada'), ...respuestasComunes },
        },
        delete: {
          tags: ['Facturas'],
          summary: 'Eliminar una factura sin pagos',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: recurso('#/components/schemas/Factura', 'Factura eliminada'), ...respuestasComunes },
        },
      },
      '/api/pagos': {
        get: {
          tags: ['Pagos'],
          summary: 'Listar pagos',
          parameters: [
            { name: 'clienteId', in: 'query', schema: { type: 'integer' } },
            { name: 'facturaId', in: 'query', schema: { type: 'integer' } },
            { name: 'metodo', in: 'query', schema: { type: 'string', enum: ['Efectivo', 'Transferencia', 'Tarjeta'] } },
            { name: 'desde', in: 'query', schema: { type: 'string', format: 'date' } },
            { name: 'hasta', in: 'query', schema: { type: 'string', format: 'date' } },
            { name: 'busqueda', in: 'query', schema: { type: 'string' } },
          ],
          responses: { 200: lista('#/components/schemas/Pago', 'Pagos registrados'), ...respuestasComunes },
        },
        post: {
          tags: ['Pagos'],
          summary: 'Registrar el pago de una factura',
          description: 'Al registrar el pago, la factura queda marcada como pagada.',
          requestBody: cuerpoCrear(
            {
              facturaId: { type: 'integer' },
              fecha: { type: 'string', format: 'date', description: 'Entre la emisión de la factura y hoy' },
              metodo: { type: 'string', enum: ['Efectivo', 'Transferencia', 'Tarjeta'] },
            },
            ['facturaId', 'fecha', 'metodo']
          ),
          responses: { 201: recurso('#/components/schemas/Pago', 'Pago registrado'), ...respuestasComunes },
        },
      },
      '/api/pagos/facturas-pendientes': {
        get: {
          tags: ['Pagos'],
          summary: 'Listar las facturas que aún no tienen pago',
          responses: { 200: lista('#/components/schemas/Factura', 'Facturas pendientes'), ...respuestasComunes },
        },
      },
      '/api/pagos/{id}': {
        get: {
          tags: ['Pagos'],
          summary: 'Consultar un pago',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: recurso('#/components/schemas/Pago', 'Pago encontrado'), ...respuestasComunes },
        },
        delete: {
          tags: ['Pagos'],
          summary: 'Eliminar un pago y liberar la factura',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: recurso('#/components/schemas/Pago', 'Pago eliminado'), ...respuestasComunes },
        },
      },
      '/api/soporte': {
        get: {
          tags: ['Soporte'],
          summary: 'Listar tickets de soporte',
          parameters: [
            { name: 'clienteId', in: 'query', schema: { type: 'integer' } },
            { name: 'prioridad', in: 'query', schema: { type: 'string', enum: ['Alta', 'Media', 'Baja'] } },
            { name: 'estado', in: 'query', schema: { type: 'string', enum: ['Abierto', 'En proceso', 'Resuelto'] } },
            { name: 'busqueda', in: 'query', schema: { type: 'string' } },
          ],
          responses: { 200: lista('#/components/schemas/Ticket', 'Tickets'), ...respuestasComunes },
        },
        post: {
          tags: ['Soporte'],
          summary: 'Registrar un ticket de soporte',
          requestBody: cuerpoCrear(
            {
              clienteId: { type: 'integer' },
              asunto: { type: 'string', minLength: 4, maxLength: 80 },
              descripcion: { type: 'string', minLength: 10 },
              prioridad: { type: 'string', enum: ['Alta', 'Media', 'Baja'] },
              estado: { type: 'string', enum: ['Abierto', 'En proceso', 'Resuelto'] },
            },
            ['clienteId', 'asunto', 'descripcion', 'prioridad', 'estado']
          ),
          responses: { 201: recurso('#/components/schemas/Ticket', 'Ticket registrado'), ...respuestasComunes },
        },
      },
      '/api/soporte/{id}': {
        get: {
          tags: ['Soporte'],
          summary: 'Consultar un ticket',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: recurso('#/components/schemas/Ticket', 'Ticket encontrado'), ...respuestasComunes },
        },
        put: {
          tags: ['Soporte'],
          summary: 'Actualizar un ticket',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: cuerpoCrear(
            { clienteId: { type: 'integer' }, asunto: { type: 'string' }, descripcion: { type: 'string' }, prioridad: { type: 'string' }, estado: { type: 'string' } },
            []
          ),
          responses: { 200: recurso('#/components/schemas/Ticket', 'Ticket actualizado'), ...respuestasComunes },
        },
        delete: {
          tags: ['Soporte'],
          summary: 'Eliminar un ticket',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: recurso('#/components/schemas/Ticket', 'Ticket eliminado'), ...respuestasComunes },
        },
      },
      '/api/soporte/{id}/estado': {
        patch: {
          tags: ['Soporte'],
          summary: 'Cambiar el estado de seguimiento del ticket',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: cuerpoCrear({ estado: { type: 'string', enum: ['Abierto', 'En proceso', 'Resuelto'] } }, ['estado']),
          responses: { 200: recurso('#/components/schemas/Ticket', 'Estado actualizado'), ...respuestasComunes },
        },
      },
    },
  };
}

module.exports = { documento };
