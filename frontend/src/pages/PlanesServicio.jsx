import { useState } from 'react'

const planesIniciales = [
  { id: 1, nombre: 'Fibra 100MB', velocidad: 100, precio: 65000, tipo: 'Fibra', estado: 'Activo' },
  { id: 2, nombre: 'Fibra 300MB', velocidad: 300, precio: 89000, tipo: 'Fibra', estado: 'Activo' },
  { id: 3, nombre: 'Fibra 500MB', velocidad: 500, precio: 120000, tipo: 'Fibra', estado: 'Activo' },
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

function PlanesServicio() {
  const [planes, setPlanes] = useState(planesIniciales)
  const [busqueda, setBusqueda] = useState('')
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [errores, setErrores] = useState({})

  const [form, setForm] = useState({
    nombre: '', velocidad: '', precio: '', tipo: 'Fibra', estado: 'Activo',
  })

  function resetForm() {
    setForm({ nombre: '', velocidad: '', precio: '', tipo: 'Fibra', estado: 'Activo' })
    setErrores({})
    setEditandoId(null)
  }

  function abrirNuevo() {
    resetForm()
    setMostrarForm(true)
  }

  function abrirEditar(plan) {
    setForm({
      nombre: plan.nombre,
      velocidad: plan.velocidad,
      precio: plan.precio,
      tipo: plan.tipo,
      estado: plan.estado,
    })
    setEditandoId(plan.id)
    setErrores({})
    setMostrarForm(true)
  }

  function validar() {
    const nuevosErrores = {}

    // Nombre: obligatorio, entre 3 y 40 caracteres, sin caracteres especiales raros
    if (!form.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre del plan es obligatorio'
    } else if (form.nombre.trim().length < 3 || form.nombre.trim().length > 40) {
      nuevosErrores.nombre = 'Debe tener entre 3 y 40 caracteres'
    } else if (/[<>{}$%^*]/.test(form.nombre)) {
      nuevosErrores.nombre = 'El nombre contiene caracteres no permitidos'
    } else {
      // Nombre único (ignorando el que se está editando)
      const existe = planes.some(
        (p) => p.nombre.toLowerCase() === form.nombre.trim().toLowerCase() && p.id !== editandoId
      )
      if (existe) nuevosErrores.nombre = 'Ya existe un plan con ese nombre'
    }

    // Velocidad: numérica, positiva, entre 1 y 2000 Mbps
    const velocidadNum = Number(form.velocidad)
    if (!form.velocidad) {
      nuevosErrores.velocidad = 'La velocidad es obligatoria'
    } else if (isNaN(velocidadNum) || velocidadNum <= 0 || velocidadNum > 2000) {
      nuevosErrores.velocidad = 'Debe ser un número entre 1 y 2000 Mbps'
    }

    // Precio: numérico, positivo, máximo razonable
    const precioNum = Number(form.precio)
    if (!form.precio) {
      nuevosErrores.precio = 'El precio es obligatorio'
    } else if (isNaN(precioNum) || precioNum <= 0 || precioNum > 5000000) {
      nuevosErrores.precio = 'Debe ser un número positivo válido'
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  function guardar(e) {
    e.preventDefault()
    if (!validar()) return

    if (editandoId) {
      setPlanes(planes.map((p) =>
        p.id === editandoId
          ? { ...p, ...form, velocidad: Number(form.velocidad), precio: Number(form.precio) }
          : p
      ))
    } else {
      const nuevoPlan = {
        id: Date.now(),
        ...form,
        velocidad: Number(form.velocidad),
        precio: Number(form.precio),
      }
      setPlanes([...planes, nuevoPlan])
    }
    setMostrarForm(false)
    resetForm()
  }

  function cambiarEstado(id) {
    setPlanes(planes.map((p) =>
      p.id === id ? { ...p, estado: p.estado === 'Activo' ? 'Inactivo' : 'Activo' } : p
    ))
  }

  const planesFiltrados = planes.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif">Planes de Servicio</h1>
        <button
          onClick={abrirNuevo}
          className="bg-gray-800 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          + Nuevo Plan
        </button>
      </div>

      {mostrarForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-serif">{editandoId ? 'Editar Plan' : 'Nuevo Plan'}</h2>
          <form onSubmit={guardar} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Nombre del plan</label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full bg-gray-100 rounded-lg px-3 py-2 outline-none"
                placeholder="Ej: Fibra 200MB"
              />
              {errores.nombre && <p className="text-red-600 text-xs mt-1">{errores.nombre}</p>}
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Velocidad (Mbps)</label>
              <input
                type="number"
                value={form.velocidad}
                onChange={(e) => setForm({ ...form, velocidad: e.target.value })}
                className="w-full bg-gray-100 rounded-lg px-3 py-2 outline-none"
                placeholder="Ej: 200"
              />
              {errores.velocidad && <p className="text-red-600 text-xs mt-1">{errores.velocidad}</p>}
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Precio mensual (COP)</label>
              <input
                type="number"
                value={form.precio}
                onChange={(e) => setForm({ ...form, precio: e.target.value })}
                className="w-full bg-gray-100 rounded-lg px-3 py-2 outline-none"
                placeholder="Ej: 75000"
              />
              {errores.precio && <p className="text-red-600 text-xs mt-1">{errores.precio}</p>}
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Tipo de conexión</label>
              <select
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                className="w-full bg-gray-100 rounded-lg px-3 py-2 outline-none"
              >
                <option value="Fibra">Fibra</option>
                <option value="Cobre">Cobre</option>
                <option value="Inalámbrico">Inalámbrico</option>
              </select>
            </div>

            <div className="sm:col-span-2 flex gap-3 pt-2">
              <button
                type="submit"
                className="bg-gray-800 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-700"
              >
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
          <h2 className="text-xl font-serif">Listado de Planes</h2>
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
              <th className="pb-3 font-semibold text-sm">VELOCIDAD</th>
              <th className="pb-3 font-semibold text-sm">PRECIO</th>
              <th className="pb-3 font-semibold text-sm">TIPO</th>
              <th className="pb-3 font-semibold text-sm">ESTADO</th>
              <th className="pb-3 font-semibold text-sm">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {planesFiltrados.map((plan) => (
              <tr key={plan.id} className="border-b border-gray-100 last:border-0">
                <td className="py-4">{plan.nombre}</td>
                <td className="py-4 text-gray-600">{plan.velocidad} Mbps</td>
                <td className="py-4 text-gray-600">${plan.precio.toLocaleString('es-CO')}</td>
                <td className="py-4 text-gray-600">{plan.tipo}</td>
                <td className="py-4"><EstadoBadge estado={plan.estado} /></td>
                <td className="py-4 space-x-3">
                  <button onClick={() => abrirEditar(plan)} className="text-blue-600 text-sm hover:underline">
                    Editar
                  </button>
                  <button onClick={() => cambiarEstado(plan.id)} className="text-orange-600 text-sm hover:underline">
                    {plan.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                  </button>
                </td>
              </tr>
            ))}
            {planesFiltrados.length === 0 && (
              <tr>
                <td colSpan="6" className="py-6 text-center text-gray-400">
                  No se encontraron planes
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PlanesServicio