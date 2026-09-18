import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import Topbar from './components/layout/Topbar'
import Dashboard from './pages/Dashboard'
import Clientes from './pages/Clientes'
import Contratos from './pages/Contratos'
import Soporte from './pages/Soporte'
import Administracion from './pages/Administracion'
import PlanesServicio from './pages/PlanesServicio'
import Vendedores from './pages/Vendedores'
import Facturas from './pages/Facturas'
import Pagos from './pages/Pagos'

function App() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 min-h-screen bg-gray-100">
        <Topbar />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/contratos" element={<Contratos />} />
            <Route path="/planes" element={<PlanesServicio />} />
            <Route path="/soporte" element={<Soporte />} />
            <Route path="/administracion" element={<Administracion />} />
            <Route path="/vendedores" element={<Vendedores />} />
            <Route path="/facturas" element={<Facturas />} />
            <Route path="/pagos" element={<Pagos />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App