import { useState } from 'react'

const clientesDisponibles = ['Carlos Mendoza', 'Ana Gómez', 'Luis Torres', 'María Ortega']
const planesDisponibles = ['Fibra 100MB', 'Fibra 300MB', 'Fibra 500MB']
const vendedoresDisponibles = ['Julián Rojas', 'Camila Suárez']
const vigenciasDisponibles = [6, 12, 24]

const contratosIniciales = [
  { id: 1, cliente: 'Carlos Mendoza', plan: 'Fibra 300MB', vendedor: 'Julián Rojas', inicio: '2025-01-15', vigenciaMeses: 12, cancelado: false },
  { id: 2, cliente: 'Ana Gómez', plan: 'Fibra 100MB', vendedor: 'Camila Suárez', inicio: '2025-03-03', vigenciaMeses: 12, cancelado: false },
  { id: 3, cliente: 'Luis Torres', plan: 'Fibra 500MB', vendedor: 'Julián Rojas', inicio: '2024-11-20', vigenciaMeses: 6, cancelado: false },
]

// Calcula el estado real del contrato comparando fechas
function calcularEstado(contrato) {
  if (contrato.cancelado) return 'Cancelado'

  const inicio = new Date(contrato.inicio)
  const fin = new Date(inicio)
  fin.setMonth(fin.getMonth() + contrato.vigenciaMeses)

  const hoy = new Date()
  const diasParaVencer = (fin - hoy) / (1000 * 60 * 60 * 24)

  if (diasParaVencer < 0) return 'Finalizado'
  if (diasParaVencer <= 30) return 'Por vencer'
  return 'Vigente'
}

function EstadoBadge({ estado }) {
  const estilos = {
    Vigente: 'bg-green-100 text-green-700',
    'Por vencer': 'bg-yellow-100 text-yellow-700',
    Finalizado: 'bg-gray-200 text-gray-600',
    Cancelado: 'bg-red-100 text-red-700',
  }
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${estilos[estado]}`}>
      {estado}
    </span>
  )
}

function Contratos() {
  const [contratos, setContratos] = useState(contratosIniciales)
  const [busqueda, setBusqueda] = useState('')
  const [mostrarForm, setMostrarForm] = useState(false)
  const [errores, setErrores] = useState({})

  const [form, setForm] = useState({
    cliente: clientesDisponibles[0],
    plan: planesDisponibles[0],
    vendedor: vendedoresDisponibles[0],
    inicio: '',
    vigenciaMeses: 12,
  })

  function resetForm() {
    setForm({
      cliente: clientesDisponibles[0],
      plan: planesDisponibles[0],
      vendedor: vendedoresDisponibles[0],
      inicio: '',
      vigenciaMeses: 12,
    })
    setErrores({})
  }

  function abrirNuevo() {
    resetForm()
    setMostrarForm(true)
  }

  function validar() {
    const nuevosErrores = {}

    if (!form.cliente) nuevosErrores.cliente = 'Debes seleccionar un cliente'
    if (!form.plan) nuevosErrores.plan = 'Debes seleccionar un plan'
    if (!form.vendedor) nuevosErrores.vendedor = 'Debes seleccionar un vendedor'

    if (!form.inicio) {
      nuevosErrores.inicio = 'La fecha de inicio es obligatoria'
    } else {
      const fechaInicio = new Date(form.inicio)
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)
      const unAnioAtras = new Date()
      unAnioAtras.setFullYear(unAnioAtras.getFullYear() - 1)

      if (fechaInicio > hoy) {
        nuevosErrores.inicio = 'La fecha de inicio no puede ser futura'
      } else if (fechaInicio < unAnioAtras) {
        nuevosErrores.inicio = 'La fecha es demasiado antigua (máx. 1 año atrás)'
      }
    }

    if (!vigenciasDisponibles.includes(Number(form.vigenciaMeses))) {
      nuevosErrores.vigenciaMeses = 'Selecciona una vigencia válida'
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  function guardar(e) {
    e.preventDefault()
    if (!validar()) return

    setContratos([
      ...contratos,
      { id: Date.now(), ...form, vigenciaMeses: Number(form.vigenciaMeses), cancelado: false },
    ])
    setMostrarForm(false)
    resetForm()
  }

  function cancelarContrato(id) {
    setContratos(contratos.map((c) => (c.id === id ? { ...c, cancelado: true } : c)))
  }

  const filtrados = contratos.filter((c) =>
    c.cliente.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif">Contratos</h1>
        <button
          onClick={abrirNuevo}
          className="bg-gray-800 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          + Nuevo Contrato
        </button>
      </div>

      {mostrarForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-serif">Nuevo Contrato</h2>
          <form onSubmit={guardar} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Cliente</label>
              <select
                value={form.cliente}
                onChange={(e) => setForm({ ...form, cliente: e.target.value })}
                className="w-full bg-gray-100 rounded-lg px-3 py-2 outline-none"
              >
                {clientesDisponibles.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errores.cliente && <p className="text-red-600 text-xs mt-1">{errores.cliente}</p>}
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Plan</label>
              <select
                value={form.plan}
                onChange={(e) => setForm({ ...form, plan: e.target.value })}
                className="w-full bg-gray-100 rounded-lg px-3 py-2 outline-none"
              >
                {planesDisponibles.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              {errores.plan && <p className="text-red-600 text-xs mt-1">{errores.plan}</p>}
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Vendedor</label>
              <select
                value={form.vendedor}
                onChange={(e) => setForm({ ...form, vendedor: e.target.value })}
                className="w-full bg-gray-100 rounded-lg px-3 py-2 outline-none"
              >
                {vendedoresDisponibles.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
              {errores.vendedor && <p className="text-red-600 text-xs mt-1">{errores.vendedor}</p>}
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Vigencia</label>
              <select
                value={form.vigenciaMeses}
                onChange={(e) => setForm({ ...form, vigenciaMeses: e.target.value })}
                className="w-full bg-gray-100 rounded-lg px-3 py-2 outline-none"
              >
                {vigenciasDisponibles.map((v) => <option key={v} value={v}>{v} meses</option>)}
              </select>
              {errores.vigenciaMeses && <p className="text-red-600 text-xs mt-1">{errores.vigenciaMeses}</p>}
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Fecha de inicio</label>
              <input
                type="date"
                value={form.inicio}
                onChange={(e) => setForm({ ...form, inicio: e.target.value })}
                className="w-full bg-gray-100 rounded-lg px-3 py-2 outline-none"
              />
              {errores.inicio && <p className="text-red-600 text-xs mt-1">{errores.inicio}</p>}
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
          <h2 className="text-xl font-serif">Contratos</h2>
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
              <th className="pb-3 font-semibold text-sm">VENDEDOR</th>
              <th className="pb-3 font-semibold text-sm">INICIO</th>
              <th className="pb-3 font-semibold text-sm">VIGENCIA</th>
              <th className="pb-3 font-semibold text-sm">ESTADO</th>
              <th className="pb-3 font-semibold text-sm">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((c) => {
              const estado = calcularEstado(c)
              return (
                <tr key={c.id} className="border-b border-gray-100 last:border-0">
                  <td className="py-4">{c.cliente}</td>
                  <td className="py-4 text-gray-600">{c.plan}</td>
                  <td className="py-4 text-gray-600">{c.vendedor}</td>
                  <td className="py-4 text-gray-600">{c.inicio}</td>
                  <td className="py-4 text-gray-600">{c.vigenciaMeses} meses</td>
                  <td className="py-4"><EstadoBadge estado={estado} /></td>
                  <td className="py-4">
                    {estado !== 'Cancelado' && estado !== 'Finalizado' && (
                      <button onClick={() => cancelarContrato(c.id)} className="text-red-600 text-sm hover:underline">
                        Cancelar
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
            {filtrados.length === 0 && (
              <tr>
                <td colSpan="7" className="py-6 text-center text-gray-400">
                  No se encontraron contratos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Contratos