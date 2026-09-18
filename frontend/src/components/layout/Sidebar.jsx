import { NavLink } from 'react-router-dom'

function Sidebar(){
    const menuItems = [ 
    { label: 'Dashboard', path: '/' },
    { label: 'Clientes', path: '/clientes' },
    { label: 'contratos', path: '/contratos' },
    { label: 'Planes de Servicio', path: '/planes' },
    { label: 'Soporte', path: '/soporte' },
    { label: 'Administración', path: '/administracion' },
    { label: 'Vendedores', path: '/vendedores' },
    { label: 'Facturas', path: '/facturas' },
    { label: 'Pagos', path: '/pagos' },
  ]

   return (
    <aside className="w-64 min-h-screen bg-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-300">
        <h1 className="text-2xl font-serif">
          telecom<span className="text-orange-500">Hub</span>
        </h1>
        <p className="text-[10px] tracking-widest text-gray-500 mt-1">
          TU CONEXIÓN TOTAL
        </p>
      </div>

      {/* Menú de navegación */}
      <nav className="flex-1 py-6">
        <ul className="space-y-1 px-4">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-md text-lg font-serif transition-colors ${
                    isActive
                      ? 'bg-gray-400 text-gray-900'
                      : 'text-gray-700 hover:bg-gray-300'
                  }`
                }
                 >
                  {item.label}
                </NavLink>
             </li>
           ))}
         </ul>
       </nav>
     </aside>
  )
}

export default Sidebar

