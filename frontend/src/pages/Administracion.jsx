const usuarios = [
  { id: 1, nombre: 'Santiago Ramírez', rol: 'Administrador', estado: 'Activo' },
  { id: 2, nombre: 'María Ortega', rol: 'Soporte Técnico', estado: 'Activo' },
  { id: 3, nombre: 'Fernando Forero', rol: 'Supervisor', estado: 'Activo' },
]

function EstadoBadge({ estado }) {
  const estilos = {
    Activo: 'bg-green-100 text-green-700',
    Inactivo: 'bg-gray-200 text-gray-600',
  }

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${estilos[estado]}`}>
      {estado}
    </span>
  )
}

function SeccionCard({ titulo, descripcion }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <h3 className="text-lg font-serif mb-2">{titulo}</h3>
      <p className="text-sm text-gray-500">{descripcion}</p>
    </div>
  )
}

function Administracion() {
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-serif">Administración</h1>

      {/* Secciones de acceso rápido */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <SeccionCard
          titulo="Usuarios del Sistema"
          descripcion="Gestiona los usuarios internos y sus permisos"
        />
        <SeccionCard
          titulo="Roles y Permisos"
          descripcion="Configura qué puede hacer cada tipo de usuario"
        />
        <SeccionCard
          titulo="Configuración General"
          descripcion="Ajustes de la plataforma TelecomHub"
        />
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-serif">Usuarios del Sistema</h2>
          <button className="bg-gray-800 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-700 transition-colors">
            + Agregar Usuario
          </button>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="pb-3 font-semibold text-sm">NOMBRE</th>
              <th className="pb-3 font-semibold text-sm">ROL</th>
              <th className="pb-3 font-semibold text-sm">ESTADO</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id} className="border-b border-gray-100 last:border-0">
                <td className="py-4">{usuario.nombre}</td>
                <td className="py-4 text-gray-600">{usuario.rol}</td>
                <td className="py-4">
                  <EstadoBadge estado={usuario.estado} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Administracion