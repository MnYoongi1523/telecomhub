import StatCard from '../components/dashboard/StatCard'
import TicketsChart from '../components/dashboard/TicketsChart'
import TicketsTable from '../components/dashboard/TicketsTable'

function Dashboard() {
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-serif">Resumen de Gestión de TelecomHub</h1>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Clientes Totales" value="455" />
        <StatCard title="Contratos Activos" value="189" />
        <StatCard title="Tickets Abiertos" value="33" />
        <StatCard title="Ventas del Mes" value="$2,980" />
      </div>

      {/* Gráfica de tendencia */}
      <TicketsChart />

      {/* Tabla de tickets recientes */}
      <TicketsTable />
    </div>
  )
}

export default Dashboard