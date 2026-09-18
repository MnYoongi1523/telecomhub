const tickets = [
  { id: 1, cliente: 'Carlos Mendoza', asunto: 'Falla de Internet', estado: 'Abierto' },
  { id: 2, cliente: 'Ana Gómez', asunto: 'Cambio de Plan', estado: 'Resuelto' },
  { id: 3, cliente: 'Luis Torres', asunto: 'Reporte de Caída', estado: 'Abierto' },
]

function EstadoBadge({ estado }) {
  const estilos = {
    Abierto: 'bg-red-100 text-red-700',
    Resuelto: 'bg-green-100 text-green-700',
  }

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${estilos[estado]}`}>
      {estado}
    </span>
  )
}

function TicketsTable() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-serif">Últimos Tickets de Soporte</h2>
        <input
          type="text"
          placeholder="Buscar"
          className="bg-gray-200 rounded-full px-4 py-2 text-sm outline-none w-40"
        />
      </div>

      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="pb-3 font-semibold text-sm">CLIENTE</th>
            <th className="pb-3 font-semibold text-sm">ASUNTO</th>
            <th className="pb-3 font-semibold text-sm">ESTADO</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id} className="border-b border-gray-100 last:border-0">
              <td className="py-4">{ticket.cliente}</td>
              <td className="py-4">{ticket.asunto}</td>
              <td className="py-4">
                <EstadoBadge estado={ticket.estado} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TicketsTable