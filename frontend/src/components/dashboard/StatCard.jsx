function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <p className="text-gray-500 text-sm mb-2">{title}</p>
      <p className="text-3xl font-serif">{value}</p>
    </div>
  )
}

export default StatCard