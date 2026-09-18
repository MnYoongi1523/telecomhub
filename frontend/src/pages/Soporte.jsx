const tickets = [
  { id: 1, cliente: 'Carlos Mendoza', asunto: 'Falla de Internet', prioridad: 'Alta', estado: 'Abierto', fecha: '08/07/2026' },
  { id: 2, cliente: 'Ana Gómez', asunto: 'Cambio de Plan', prioridad: 'Baja', estado: 'Resuelto', fecha: '05/07/2026' },
  { id: 3, cliente: 'Luis Torres', asunto: 'Reporte de Caída', prioridad: 'Alta', estado: 'Abierto', fecha: '09/07/2026' },
  { id: 4, cliente: 'María Ortega', asunto: 'Consulta de Factura', prioridad: 'Media', estado: 'En proceso', fecha: '07/07/2026' },
]

function EstadoBadge({ estado }) {
  const estilos = {
    Abierto: 'bg-red-100 text-red-700',
    Resuelto: 'bg-green-100 text-green-700',
    'En proceso': 'bg-blue-100 text-blue-700',
  }

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${estilos[estado]}`}>
      {estado}
    </span>
  )
}

function PrioridadBadge({ prioridad }) {
  const estilos = {
    Alta: 'text-red-600',
    Media: 'text-yellow-600',
    Baja: 'text-gray-500',
  }

  return <span className={`font-medium ${estilos[prioridad]}`}>{prioridad}</span>
}

function Soporte() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif">Soporte</h1>
        <button className="bg-gray-800 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-700 transition-colors">
          + Nuevo Ticket
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-serif">Todos los Tickets</h2>
          <input
            type="text"
            placeholder="Buscar"
            className="bg-gray-200 rounded-full px-4 py-2 text-sm outline-none w-48"
          />
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="pb-3 font-semibold text-sm">CLIENTE</th>
              <th className="pb-3 font-semibold text-sm">ASUNTO</th>
              <th className="pb-3 font-semibold text-sm">PRIORIDAD</th>
              <th className="pb-3 font-semibold text-sm">FECHA</th>
              <th className="pb-3 font-semibold text-sm">ESTADO</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="border-b border-gray-100 last:border-0">
                <td className="py-4">{ticket.cliente}</td>
                <td className="py-4 text-gray-600">{ticket.asunto}</td>
                <td className="py-4">
                  <PrioridadBadge prioridad={ticket.prioridad} />
                </td>
                <td className="py-4 text-gray-600">{ticket.fecha}</td>
                <td className="py-4">
                  <EstadoBadge estado={ticket.estado} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Soporte