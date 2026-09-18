import { Search } from 'lucide-react'

function Topbar() {
  return (
    <header className="bg-gray-200 px-8 py-4">
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
        <input
          type="text"
          placeholder="Buscar"
          className="w-full bg-gray-300 rounded-full pl-11 pr-4 py-3 text-gray-700 outline-none placeholder:text-gray-600"
        />
      </div>
    </header>
  )
}

export default Topbar