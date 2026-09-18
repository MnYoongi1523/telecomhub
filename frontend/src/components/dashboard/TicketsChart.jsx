import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'

const data = [
  { dia: 'lunes', tickets: 12 },
  { dia: 'martes', tickets: 8 },
  { dia: 'miercoles', tickets: 15 },
  { dia: 'jueves', tickets: 22 },
  { dia: 'viernes', tickets: 19 },
]

function TicketsChart() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-xl font-serif mb-6">
        Tendencia de Tickets (Últimos 5 días)
      </h2>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis
            dataKey="dia"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6b7280', fontSize: 14 }}
          />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 14 }} />
          <Line
            type="monotone"
            dataKey="tickets"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: '#3b82f6', r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default TicketsChart
