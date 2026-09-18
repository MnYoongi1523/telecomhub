import { useState } from 'react'

const facturasDisponibles = [
  { id: 1, cliente: 'Carlos Mendoza', plan: 'Fibra 300MB', valor: 89000, emision: '2026-07-01', pagada: false },
  { id: 2, cliente: 'Ana Gómez', plan: 'Fibra 100MB', valor: 65000, emision: '2026-06-01', pagada: true },
]

const metodosDisponibles = ['Efectivo', 'Transferencia', 'Tarjeta']

const pagosIniciales = [
  { id: 1, facturaId: 2, cliente: 'Ana Gómez', valor: 65000, fecha: '2026-06-10', metodo: 'Transferencia' },
]

function Pagos() {
  const [facturas, setFacturas] = useState(facturasDisponibles)
  const [pagos, setPagos] = useState(pagosIniciales)
  const [busqueda, setBusqueda] = useState('')
  const [mostrarForm, setMostrarForm] = useState(false)
  const [errores, setErrores] = useState({})

  const facturasPendientes = facturas.filter((f) => !f.pagada)

  const [form, setForm] = useState({
    facturaId: facturasPendientes[0]?.id || '',
    fecha: '',
    metodo: metodosDisponibles[0],
  })

  function resetForm() {
    setForm({ facturaId: facturasPendientes[0]?.id || '', fecha: '', metodo: metodosDisponibles[0] })
    setErrores({})
  }

  function abrirNuevo() {
    resetForm()
    setMostrarForm(true)
  }

  function validar() {
    const nuevosErrores = {}
    const factura = facturas.find((f) => f.id === Number(form.facturaId))

    if (!form.facturaId) {
      nuevosErrores.facturaId = 'Debes seleccionar una factura'
    } else if (!factura) {
      nuevosErrores.facturaId = 'Factura no válida'
    } else if (factura.pagada) {
      nuevosErrores.facturaId = 'Esta factura ya fue pagada'
    }

    if (!form.fecha) {
      nuevosErrores.fecha = 'La fecha de pago es obligatoria'
    } else if (factura && new Date(form.fecha) < new Date(factura.emision)) {
      nuevosErrores.fecha = 'No puede ser anterior a la fecha de emisión de la factura'
    } else if (new Date(form.fecha) > new Date()) {
      nuevosErrores.fecha = 'La fecha de pago no puede ser futura'
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  function guardar(e) {
    e.preventDefault()
    if (!validar()) return

    const factura = facturas.find((f) => f.id === Number(form.facturaId))

    setPagos([
      ...pagos,
      {
        id: Date.now(),
        facturaId: factura.id,
        cliente: factura.cliente,
        valor: factura.valor,
        fecha: form.fecha,
        metodo: form.metodo,
      },
    ])

    // Marcar la factura como pagada
    setFacturas(facturas.map((f) => (f.id === factura.id ? { ...f, pagada: true } : f)))

    setMostrarForm(false)
    resetForm()
  }

  const filtrados = pagos.filter((p) =>
    p.cliente.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif">Pagos</h1>
        <button
          onClick={abrirNuevo}
          disabled={facturasPendientes.length === 0}
          className="bg-gray-800 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          + Registrar Pago
        </button>
      </div>

      {mostrarForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-serif">Registrar Pago</h2>
          <form onSubmit={guardar} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Factura pendiente</label>
              <select
                value={form.facturaId}
                onChange={(e) => setForm({ ...form, facturaId: e.target.value })}
                className="w-full bg-gray-100 rounded-lg px-3 py-2 outline-none"
              >
                {facturasPendientes.map((f) => (
                  <option key={f.id} value={f.id}>{f.cliente} — ${f.valor.toLocaleString('es-CO')}</option>
                ))}
              </select>
              {errores.facturaId && <p className="text-red-600 text-xs mt-1">{errores.facturaId}</p>}
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Método de pago</label>
              <select
                value={form.metodo}
                onChange={(e) => setForm({ ...form, metodo: e.target.value })}
                className="w-full bg-gray-100 rounded-lg px-3 py-2 outline-none"
              >
                {metodosDisponibles.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Fecha de pago</label>
              <input
                type="date"
                value={form.fecha}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                className="w-full bg-gray-100 rounded-lg px-3 py-2 outline-none"
              />
              {errores.fecha && <p className="text-red-600 text-xs mt-1">{errores.fecha}</p>}
            </div>

            <div className="sm:col-span-2 flex gap-3 pt-2">
              <button type="submit" className="bg-gray-800 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-700">
                Registrar
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
          <h2 className="text-xl font-serif">Historial de Pagos</h2>
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
              <th className="pb-3 font-semibold text-sm">VALOR</th>
              <th className="pb-3 font-semibold text-sm">FECHA</th>
              <th className="pb-3 font-semibold text-sm">MÉTODO</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((p) => (
              <tr key={p.id} className="border-b border-gray-100 last:border-0">
                <td className="py-4">{p.cliente}</td>
                <td className="py-4 text-gray-600">${p.valor.toLocaleString('es-CO')}</td>
                <td className="py-4 text-gray-600">{p.fecha}</td>
                <td className="py-4 text-gray-600">{p.metodo}</td>
              </tr>
            ))}
            {filtrados.length === 0 && (
              <tr>
                <td colSpan="4" className="py-6 text-center text-gray-400">
                  No hay pagos registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Pagos