import { useState } from 'react'

const contratosDisponibles = [
  { id: 1, cliente: 'Carlos Mendoza', plan: 'Fibra 300MB', precio: 89000 },
  { id: 2, cliente: 'Ana Gómez', plan: 'Fibra 100MB', precio: 65000 },
  { id: 3, cliente: 'Luis Torres', plan: 'Fibra 500MB', precio: 120000 },
]

const facturasIniciales = [
  { id: 1, contratoId: 1, cliente: 'Carlos Mendoza', plan: 'Fibra 300MB', valor: 89000, emision: '2026-07-01', vencimiento: '2026-07-15', pagada: false },
  { id: 2, contratoId: 2, cliente: 'Ana Gómez', plan: 'Fibra 100MB', valor: 65000, emision: '2026-06-01', vencimiento: '2026-06-15', pagada: true },
]

function calcularEstado(factura) {
  if (factura.pagada) return 'Pagada'
  const hoy = new Date()
  const vencimiento = new Date(factura.vencimiento)
  return hoy > vencimiento ? 'Vencida' : 'Pendiente'
}

function EstadoBadge({ estado }) {
  const estilos = {
    Pagada: 'bg-green-100 text-green-700',
    Pendiente: 'bg-yellow-100 text-yellow-700',
    Vencida: 'bg-red-100 text-red-700',
  }
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${estilos[estado]}`}>
      {estado}
    </span>
  )
}

function Facturas() {
  const [facturas, setFacturas] = useState(facturasIniciales)
  const [busqueda, setBusqueda] = useState('')
  const [mostrarForm, setMostrarForm] = useState(false)
  const [errores, setErrores] = useState({})

  const [form, setForm] = useState({
    contratoId: contratosDisponibles[0].id,
    emision: '',
    vencimiento: '',
  })

  function resetForm() {
    setForm({ contratoId: contratosDisponibles[0].id, emision: '', vencimiento: '' })
    setErrores({})
  }

  function abrirNuevo() {
    resetForm()
    setMostrarForm(true)
  }

  function validar() {
    const nuevosErrores = {}

    if (!form.contratoId) nuevosErrores.contratoId = 'Debes seleccionar un contrato'

    if (!form.emision) {
      nuevosErrores.emision = 'La fecha de emisión es obligatoria'
    }

    if (!form.vencimiento) {
      nuevosErrores.vencimiento = 'La fecha de vencimiento es obligatoria'
    } else if (form.emision && new Date(form.vencimiento) <= new Date(form.emision)) {
      nuevosErrores.vencimiento = 'Debe ser posterior a la fecha de emisión'
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  function guardar(e) {
    e.preventDefault()
    if (!validar()) return

    const contrato = contratosDisponibles.find((c) => c.id === Number(form.contratoId))
    setFacturas([
      ...facturas,
      {
        id: Date.now(),
        contratoId: contrato.id,
        cliente: contrato.cliente,
        plan: contrato.plan,
        valor: contrato.precio,
        emision: form.emision,
        vencimiento: form.vencimiento,
        pagada: false,
      },
    ])
    setMostrarForm(false)
    resetForm()
  }

  const filtradas = facturas.filter((f) =>
    f.cliente.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif">Facturas</h1>
        <button
          onClick={abrirNuevo}
          className="bg-gray-800 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          + Generar Factura
        </button>
      </div>

      {mostrarForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-serif">Generar Factura</h2>
          <form onSubmit={guardar} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Contrato (cliente / plan)</label>
              <select
                value={form.contratoId}
                onChange={(e) => setForm({ ...form, contratoId: e.target.value })}
                className="w-full bg-gray-100 rounded-lg px-3 py-2 outline-none"
              >
                {contratosDisponibles.map((c) => (
                  <option key={c.id} value={c.id}>{c.cliente} — {c.plan} (${c.precio.toLocaleString('es-CO')})</option>
                ))}
              </select>
              {errores.contratoId && <p className="text-red-600 text-xs mt-1">{errores.contratoId}</p>}
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Fecha de emisión</label>
              <input
                type="date"
                value={form.emision}
                onChange={(e) => setForm({ ...form, emision: e.target.value })}
                className="w-full bg-gray-100 rounded-lg px-3 py-2 outline-none"
              />
              {errores.emision && <p className="text-red-600 text-xs mt-1">{errores.emision}</p>}
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Fecha de vencimiento</label>
              <input
                type="date"
                value={form.vencimiento}
                onChange={(e) => setForm({ ...form, vencimiento: e.target.value })}
                className="w-full bg-gray-100 rounded-lg px-3 py-2 outline-none"
              />
              {errores.vencimiento && <p className="text-red-600 text-xs mt-1">{errores.vencimiento}</p>}
            </div>

            <div className="sm:col-span-2 flex gap-3 pt-2">
              <button type="submit" className="bg-gray-800 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-700">
                Generar
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
          <h2 className="text-xl font-serif">Facturas</h2>
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
              <th className="pb-3 font-semibold text-sm">CLIENTE</th>
              <th className="pb-3 font-semibold text-sm">PLAN</th>
              <th className="pb-3 font-semibold text-sm">VALOR</th>
              <th className="pb-3 font-semibold text-sm">EMISIÓN</th>
              <th className="pb-3 font-semibold text-sm">VENCIMIENTO</th>
              <th className="pb-3 font-semibold text-sm">ESTADO</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.map((f) => (
              <tr key={f.id} className="border-b border-gray-100 last:border-0">
                <td className="py-4">{f.cliente}</td>
                <td className="py-4 text-gray-600">{f.plan}</td>
                <td className="py-4 text-gray-600">${f.valor.toLocaleString('es-CO')}</td>
                <td className="py-4 text-gray-600">{f.emision}</td>
                <td className="py-4 text-gray-600">{f.vencimiento}</td>
                <td className="py-4"><EstadoBadge estado={calcularEstado(f)} /></td>
              </tr>
            ))}
            {filtradas.length === 0 && (
              <tr>
                <td colSpan="6" className="py-6 text-center text-gray-400">
                  No se encontraron facturas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Facturas