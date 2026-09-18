import { useState } from 'react'

const clientesIniciales = [
  { id: 1, nombre: 'Carlos Mendoza', cedula: '1010203040', telefono: '+57 300 123 4567', correo: '[email protected]', plan: 'Fibra 300MB', estado: 'Activo' },
  { id: 2, nombre: 'Ana Gómez', cedula: '1020304050', telefono: '+57 310 987 6543', correo: '[email protected]', plan: 'Fibra 100MB', estado: 'Activo' },
  { id: 3, nombre: 'Luis Torres', cedula: '1030405060', telefono: '+57 320 456 7890', correo: '[email protected]', plan: 'Fibra 500MB', estado: 'Suspendido' },
  { id: 4, nombre: 'María Ortega', cedula: '1040506070', telefono: '+57 315 222 3344', correo: '[email protected]', plan: 'Fibra 300MB', estado: 'Activo' },
]

// Planes disponibles para el selector (en un backend real vendrían de la BD de Planes de Servicio)
const planesDisponibles = ['Fibra 100MB', 'Fibra 300MB', 'Fibra 500MB']

function EstadoBadge({ estado }) {
  const estilos = {
    Activo: 'bg-green-100 text-green-700',
    Suspendido: 'bg-red-100 text-red-700',
  }
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${estilos[estado]}`}>
      {estado}
    </span>
  )
}

function Clientes() {
  const [clientes, setClientes] = useState(clientesIniciales)
  const [busqueda, setBusqueda] = useState('')
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [errores, setErrores] = useState({})

  const [form, setForm] = useState({
    nombre: '', cedula: '', telefono: '', correo: '', plan: planesDisponibles[0], estado: 'Activo',
  })

  function resetForm() {
    setForm({ nombre: '', cedula: '', telefono: '', correo: '', plan: planesDisponibles[0], estado: 'Activo' })
    setErrores({})
    setEditandoId(null)
  }

  function abrirNuevo() {
    resetForm()
    setMostrarForm(true)
  }

  function abrirEditar(c) {
    setForm({ nombre: c.nombre, cedula: c.cedula, telefono: c.telefono, correo: c.correo, plan: c.plan, estado: c.estado })
    setEditandoId(c.id)
    setErrores({})
    setMostrarForm(true)
  }

  function validar() {
    const nuevosErrores = {}

    if (!form.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio'
    } else if (form.nombre.trim().length < 3 || form.nombre.trim().length > 50) {
      nuevosErrores.nombre = 'Debe tener entre 3 y 50 caracteres'
    } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(form.nombre)) {
      nuevosErrores.nombre = 'El nombre solo puede contener letras y espacios'
    }

    if (!form.cedula.trim()) {
      nuevosErrores.cedula = 'La cédula es obligatoria'
    } else if (!/^\d{6,10}$/.test(form.cedula)) {
      nuevosErrores.cedula = 'Debe tener entre 6 y 10 dígitos numéricos'
    } else {
      const existe = clientes.some((c) => c.cedula === form.cedula && c.id !== editandoId)
      if (existe) nuevosErrores.cedula = 'Ya existe un cliente con esa cédula'
    }

    if (!form.telefono.trim()) {
      nuevosErrores.telefono = 'El teléfono es obligatorio'
    } else if (!/^\+57\s?\d{3}\s?\d{3}\s?\d{4}$/.test(form.telefono.trim())) {
      nuevosErrores.telefono = 'Formato esperado: +57 300 123 4567'
    }

    if (!form.correo.trim()) {
      nuevosErrores.correo = 'El correo es obligatorio'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo.trim())) {
      nuevosErrores.correo = 'Correo electrónico no válido'
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  function guardar(e) {
    e.preventDefault()
    if (!validar()) return

    if (editandoId) {
      setClientes(clientes.map((c) => (c.id === editandoId ? { ...c, ...form } : c)))
    } else {
      setClientes([...clientes, { id: Date.now(), ...form }])
    }
    setMostrarForm(false)
    resetForm()
  }

  function cambiarEstado(id) {
    setClientes(clientes.map((c) =>
      c.id === id ? { ...c, estado: c.estado === 'Activo' ? 'Suspendido' : 'Activo' } : c
    ))
  }

  const filtrados = clientes.filter((c) =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif">Clientes</h1>
        <button
          onClick={abrirNuevo}
          className="bg-gray-800 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          + Agregar Cliente
        </button>
      </div>

      {mostrarForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-serif">{editandoId ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
          <form onSubmit={guardar} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Nombre completo</label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full bg-gray-100 rounded-lg px-3 py-2 outline-none"
                placeholder="Ej: Carlos Mendoza"
              />
              {errores.nombre && <p className="text-red-600 text-xs mt-1">{errores.nombre}</p>}
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Cédula</label>
              <input
                type="text"
                value={form.cedula}
                onChange={(e) => setForm({ ...form, cedula: e.target.value })}
                className="w-full bg-gray-100 rounded-lg px-3 py-2 outline-none"
                placeholder="Ej: 1010203040"
              />
              {errores.cedula && <p className="text-red-600 text-xs mt-1">{errores.cedula}</p>}
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Teléfono</label>
              <input
                type="text"
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                className="w-full bg-gray-100 rounded-lg px-3 py-2 outline-none"
                placeholder="+57 300 123 4567"
              />
              {errores.telefono && <p className="text-red-600 text-xs mt-1">{errores.telefono}</p>}
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Correo</label>
              <input
                type="email"
                value={form.correo}
                onChange={(e) => setForm({ ...form, correo: e.target.value })}
                className="w-full bg-gray-100 rounded-lg px-3 py-2 outline-none"
                placeholder="[email protected]"
              />
              {errores.correo && <p className="text-red-600 text-xs mt-1">{errores.correo}</p>}
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Plan</label>
              <select
                value={form.plan}
                onChange={(e) => setForm({ ...form, plan: e.target.value })}
                className="w-full bg-gray-100 rounded-lg px-3 py-2 outline-none"
              >
                {planesDisponibles.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Estado</label>
              <select
                value={form.estado}
                onChange={(e) => setForm({ ...form, estado: e.target.value })}
                className="w-full bg-gray-100 rounded-lg px-3 py-2 outline-none"
              >
                <option value="Activo">Activo</option>
                <option value="Suspendido">Suspendido</option>
              </select>
            </div>

            <div className="sm:col-span-2 flex gap-3 pt-2">
              <button type="submit" className="bg-gray-800 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-700">
                Guardar
              </button>
              <button
                type="button"
                onClick={() => { setMostrarForm(false); resetForm() }}
                className="bg-gray-200 text-gray-700 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-300"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-serif">Listado de Clientes</h2>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar"
            className="bg-gray-200 rounded-full px-4 py-2 text-sm outline-none w-48"
          />
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="pb-3 font-semibold text-sm">NOMBRE</th>
              <th className="pb-3 font-semibold text-sm">TELÉFONO</th>
              <th className="pb-3 font-semibold text-sm">PLAN</th>
              <th className="pb-3 font-semibold text-sm">ESTADO</th>
              <th className="pb-3 font-semibold text-sm">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((c) => (
              <tr key={c.id} className="border-b border-gray-100 last:border-0">
                <td className="py-4">{c.nombre}</td>
                <td className="py-4 text-gray-600">{c.telefono}</td>
                <td className="py-4 text-gray-600">{c.plan}</td>
                <td className="py-4"><EstadoBadge estado={c.estado} /></td>
                <td className="py-4 space-x-3">
                  <button onClick={() => abrirEditar(c)} className="text-blue-600 text-sm hover:underline">
                    Editar
                  </button>
                  <button onClick={() => cambiarEstado(c.id)} className="text-orange-600 text-sm hover:underline">
                    {c.estado === 'Activo' ? 'Suspender' : 'Reactivar'}
                  </button>
                </td>
              </tr>
            ))}
            {filtrados.length === 0 && (
              <tr>
                <td colSpan="5" className="py-6 text-center text-gray-400">
                  No se encontraron clientes
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Clientes