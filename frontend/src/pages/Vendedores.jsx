import { useState } from 'react'

const vendedoresIniciales = [
  { id: 1, nombre: 'Julián Rojas', cedula: '1098765432', telefono: '+57 300 111 2233', correo: '[email protected]', estado: 'Activo' },
  { id: 2, nombre: 'Camila Suárez', cedula: '1023456789', telefono: '+57 315 444 5566', correo: '[email protected]', estado: 'Activo' },
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

function Vendedores() {
  const [vendedores, setVendedores] = useState(vendedoresIniciales)
  const [busqueda, setBusqueda] = useState('')
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [errores, setErrores] = useState({})

  const [form, setForm] = useState({
    nombre: '', cedula: '', telefono: '', correo: '', estado: 'Activo',
  })

  function resetForm() {
    setForm({ nombre: '', cedula: '', telefono: '', correo: '', estado: 'Activo' })
    setErrores({})
    setEditandoId(null)
  }

  function abrirNuevo() {
    resetForm()
    setMostrarForm(true)
  }

  function abrirEditar(v) {
    setForm({ nombre: v.nombre, cedula: v.cedula, telefono: v.telefono, correo: v.correo, estado: v.estado })
    setEditandoId(v.id)
    setErrores({})
    setMostrarForm(true)
  }

  function validar() {
    const nuevosErrores = {}

    // Nombre: obligatorio, solo letras y espacios, 3-50 caracteres
    if (!form.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio'
    } else if (form.nombre.trim().length < 3 || form.nombre.trim().length > 50) {
      nuevosErrores.nombre = 'Debe tener entre 3 y 50 caracteres'
    } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(form.nombre)) {
      nuevosErrores.nombre = 'El nombre solo puede contener letras y espacios'
    }

    // Cédula: obligatoria, solo números, entre 6 y 10 dígitos
    if (!form.cedula.trim()) {
      nuevosErrores.cedula = 'La cédula es obligatoria'
    } else if (!/^\d{6,10}$/.test(form.cedula)) {
      nuevosErrores.cedula = 'Debe tener entre 6 y 10 dígitos numéricos'
    } else {
      const existe = vendedores.some((v) => v.cedula === form.cedula && v.id !== editandoId)
      if (existe) nuevosErrores.cedula = 'Ya existe un vendedor con esa cédula'
    }

    // Teléfono: formato colombiano +57 XXX XXX XXXX
    if (!form.telefono.trim()) {
      nuevosErrores.telefono = 'El teléfono es obligatorio'
    } else if (!/^\+57\s?\d{3}\s?\d{3}\s?\d{4}$/.test(form.telefono.trim())) {
      nuevosErrores.telefono = 'Formato esperado: +57 300 123 4567'
    }

    // Correo: formato válido
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
      setVendedores(vendedores.map((v) => (v.id === editandoId ? { ...v, ...form } : v)))
    } else {
      setVendedores([...vendedores, { id: Date.now(), ...form }])
    }
    setMostrarForm(false)
    resetForm()
  }

  function cambiarEstado(id) {
    setVendedores(vendedores.map((v) =>
      v.id === id ? { ...v, estado: v.estado === 'Activo' ? 'Inactivo' : 'Activo' } : v
    ))
  }

  const filtrados = vendedores.filter((v) =>
    v.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif">Vendedores</h1>
        <button
          onClick={abrirNuevo}
          className="bg-gray-800 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          + Nuevo Vendedor
        </button>
      </div>

      {mostrarForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-serif">{editandoId ? 'Editar Vendedor' : 'Nuevo Vendedor'}</h2>
          <form onSubmit={guardar} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Nombre completo</label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full bg-gray-100 rounded-lg px-3 py-2 outline-none"
                placeholder="Ej: Julián Rojas"
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
                placeholder="Ej: 1098765432"
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
          <h2 className="text-xl font-serif">Listado de Vendedores</h2>
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
              <th className="pb-3 font-semibold text-sm">CÉDULA</th>
              <th className="pb-3 font-semibold text-sm">TELÉFONO</th>
              <th className="pb-3 font-semibold text-sm">CORREO</th>
              <th className="pb-3 font-semibold text-sm">ESTADO</th>
              <th className="pb-3 font-semibold text-sm">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((v) => (
              <tr key={v.id} className="border-b border-gray-100 last:border-0">
                <td className="py-4">{v.nombre}</td>
                <td className="py-4 text-gray-600">{v.cedula}</td>
                <td className="py-4 text-gray-600">{v.telefono}</td>
                <td className="py-4 text-gray-600">{v.correo}</td>
                <td className="py-4"><EstadoBadge estado={v.estado} /></td>
                <td className="py-4 space-x-3">
                  <button onClick={() => abrirEditar(v)} className="text-blue-600 text-sm hover:underline">
                    Editar
                  </button>
                  <button onClick={() => cambiarEstado(v.id)} className="text-orange-600 text-sm hover:underline">
                    {v.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                  </button>
                </td>
              </tr>
            ))}
            {filtrados.length === 0 && (
              <tr>
                <td colSpan="6" className="py-6 text-center text-gray-400">
                  No se encontraron vendedores
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Vendedores