"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/client.js"
import Header from "../components/Header.jsx"

export default function Ahorros() {
  const navigate = useNavigate()
  const [showIngreso, setShowIngreso] = useState(false)
  const [showGasto, setShowGasto] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [resumen, setResumen] = useState({ total: 0, porcentaje: 0 })
  const [metas, setMetas] = useState([])
  const [showAhorroModal, setShowAhorroModal] = useState(false)
  const [newMeta, setNewMeta] = useState({ nombre: "", objetivo: "", acumulado: "" })
  const [gasto, setGasto] = useState({ descripcion: "", monto: "", id_tipo: "" })
  const [ingreso, setIngreso] = useState({ monto: "" })
  const [tipos, setTipos] = useState([])
  const [error, setError] = useState("")

  // Carga datos de ahorro
  const loadData = async () => {
    try {
      setLoading(true)
      setLoadError("")
      const [r1, r2] = await Promise.all([
        api.get("/ahorros/resumen"),
        api.get("/ahorros/metas"),
      ])
      setResumen(r1?.data || { total: 0, porcentaje: 0 })
      setMetas(Array.isArray(r2?.data) ? r2.data : [])
    } catch (e) {
      console.error("Error cargando ahorros", e)
      setLoadError(e?.response?.data?.error || "No se pudo cargar la sección de ahorros")
      if (e?.response?.status === 401 || (e?.response?.data?.error || "").toLowerCase().includes("no autenticado")) {
        navigate("/login")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Carga tipos de gasto al abrir modal
  useEffect(() => {
    if (showGasto) {
      api.get("/tipos_gasto").then((r) => setTipos(r.data))
    }
  }, [showGasto])

  // Abrir modal local de creación de meta (también puedes usar la página dedicada)
  const onAgregarAhorro = () => setShowAhorroModal(true)
  const onEditarAhorro = () => navigate("/ahorros/editar")

  const logout = async () => {
    await api.post("/logout")
    navigate("/login")
  }

  // Guardar gasto
  const submitGasto = async (e) => {
    e.preventDefault()
    setError("")
    // Validación: monto debe ser numérico y mayor a 0
    const montoNum = Number(gasto.monto)
    if (isNaN(montoNum) || montoNum <= 0) {
      setError("El monto debe ser mayor a 0")
      return
    }
    try {
      await api.post("/agregar_gasto", { descripcion: gasto.descripcion, monto: gasto.monto, id_tipo: gasto.id_tipo })
      setShowGasto(false)
      setGasto({ descripcion: "", monto: "", id_tipo: "" })
      await loadData()
    } catch (err) {
      setError(err?.response?.data?.error || "Error al guardar gasto")
    }
  }

  // Guardar ingreso
  const submitIngreso = async (e) => {
    e.preventDefault()
    setError("")
    // Validación: monto debe ser numérico y mayor a 0
    const montoNum = Number(ingreso.monto)
    if (isNaN(montoNum) || montoNum <= 0) {
      setError("El monto debe ser mayor a 0")
      return
    }
    try {
      await api.post("/agregar_ingreso", { monto: ingreso.monto })
      setShowIngreso(false)
      setIngreso({ monto: "" })
      await loadData()
    } catch (err) {
      setError(err?.response?.data?.error || "Error al guardar ingreso")
    }
  }

  if (loading) return <div style={{ padding: 20 }}>Cargando...</div>
  if (loadError) return <div style={{ padding: 20 }}>Error: {loadError}</div>

  return (
    <div className="main-content-dashboard">
      <Header
        setShowIngreso={setShowIngreso}
        setShowGasto={setShowGasto}
        logout={logout}
      />

      <section className="summary-card-dashboard">
        <div className="summary-content-dashboard" style={{ alignItems: "center" }}>
          <div className="summary-center-dashboard" style={{ textAlign: "center" }}>
            <div className="available-amount-dashboard">
              Ahorro total acumulado: ${Number(resumen.total).toFixed(2)}
            </div>
            <div className="monthly-stats-dashboard">
              <div>Porcentaje alcanzado: {Number(resumen.porcentaje).toFixed(0)}%</div>
            </div>
          </div>
          <div className="summary-right-dashboard" style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button className="btn-add-dashboard" onClick={onAgregarAhorro}>
                Agregar ahorro
              </button>
              <button className="btn-edit-dashboard" onClick={onEditarAhorro}>
                Editar ahorro
              </button>
              <button className="btn-add-dashboard" onClick={() => navigate("/intereses")}>
                Calcular Interés
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="transactions-section-dashboard" style={{ marginTop: 16 }}>
        <div className="section-header-dashboard">
          <h3 className="section-title-dashboard">Últimas metas de ahorro</h3>
        </div>
        <div className="table-wrapper-ahorros">
          <table className="table-ahorros">
            <thead>
              <tr>
                <th>Meta de ahorro</th>
                <th>Monto objetivo</th>
                <th>Monto acumulado</th>
                <th>Progreso</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {metas.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "#6b7280" }}>
                    No hay metas registradas
                  </td>
                </tr>
              ) : (
                metas.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <span className="chip-green-ahorros">Meta</span> {m.nombre ?? ""}
                    </td>
                    <td>{m.objetivo ?? "-"}</td>
                    <td>{m.acumulado ?? "-"}</td>
                    <td style={{ minWidth: 140 }}>
                      <div className="progress-ahorros">
                        {(() => {
                          const objetivo = Number(m.objetivo || 0)
                          const acumulado = Number(m.acumulado || 0)
                          const progreso = objetivo > 0 ? (acumulado / objetivo) * 100 : 0
                          return (
                            <div
                              className="progress-bar-ahorros"
                              style={{ width: `${Math.max(0, Math.min(100, progreso))}%` }}
                            />
                          )
                        })()}
                      </div>
                    </td>
                    <td>{m.fecha ?? "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showGasto && (
        <div className="modal-expenses" style={{ display: "flex" }}>
          <div className="modal-content-expenses">
            <div className="modal-header-expenses">
              <h3 className="modal-title-expenses">Agregar Gasto</h3>
              <a className="modal-close-expenses" onClick={() => setShowGasto(false)} href="#">
                ×
              </a>
            </div>
            <form className="modal-form-expenses" onSubmit={submitGasto}>
              <div className="form-group-expenses">
                <label className="form-label-expenses">Descripción</label>
                <input
                  className="form-input-expenses"
                  value={gasto.descripcion}
                  onChange={(e) => setGasto({ ...gasto, descripcion: e.target.value })}
                />
              </div>
              <div className="form-group-expenses">
                <label className="form-label-expenses">Monto</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="form-input-expenses"
                  value={gasto.monto}
                  onChange={(e) => setGasto({ ...gasto, monto: e.target.value })}
                />
              </div>
              <div className="form-group-expenses">
                <label className="form-label-expenses">Categoría</label>
                <div className="select-wrapper-expenses">
                  <select
                    className="form-select-expenses"
                    value={gasto.id_tipo}
                    onChange={(e) => setGasto({ ...gasto, id_tipo: e.target.value })}
                  >
                    <option value="">Seleccione</option>
                    {tipos.map((t) => (
                      <option key={t.id_tipo} value={t.id_tipo}>
                        {t.nombre_tipo}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
              <button className="submit-button-expenses" type="submit">
                Guardar
              </button>
            </form>
          </div>
        </div>
      )}

      {showIngreso && (
        <div className="modal-expenses" style={{ display: "flex" }}>
          <div className="modal-content-expenses">
            <div className="modal-header-expenses">
              <h3 className="modal-title-expenses">Agregar Ingreso</h3>
              <a className="modal-close-expenses" onClick={() => setShowIngreso(false)} href="#">
                ×
              </a>
            </div>
            <form className="modal-form-expenses" onSubmit={submitIngreso}>
              <div className="form-group-expenses">
                <label className="form-label-expenses">Monto</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="form-input-expenses"
                  value={ingreso.monto}
                  onChange={(e) => setIngreso({ monto: e.target.value })}
                />
              </div>
              {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
              <button className="submit-button-expenses" type="submit">
                Guardar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal para crear meta de ahorro (local) */}
      {showAhorroModal && (
        <div className="modal-expenses" style={{ display: "flex" }}>
          <div className="modal-content-expenses">
            <div className="modal-header-expenses">
              <h3 className="modal-title-expenses">Nueva Meta de Ahorro</h3>
              <a className="modal-close-expenses" onClick={() => { setShowAhorroModal(false); setError("") }} href="#">
                ×
              </a>
            </div>
            <form
              className="modal-form-expenses"
              onSubmit={(e) => {
                e.preventDefault()
                // Validaciones
                const objetivoNum = Number(newMeta.objetivo)
                const acumuladoNum = Number(newMeta.acumulado || 0)
                if (!newMeta.nombre || !objetivoNum || objetivoNum <= 0) {
                  setError("Nombre y objetivo válido son requeridos")
                  return
                }
                if (acumuladoNum < 0) {
                  setError("El acumulado no puede ser negativo")
                  return
                }
                // Crear meta localmente (id temporal)
                const id = Date.now()
                const progreso = objetivoNum > 0 ? (acumuladoNum / objetivoNum) * 100 : 0
                const meta = {
                  id,
                  nombre: newMeta.nombre,
                  objetivo: objetivoNum,
                  acumulado: acumuladoNum,
                  progreso: Math.max(0, Math.min(100, progreso)),
                  fecha: new Date().toISOString().split("T")[0],
                }
                setMetas((prev) => [meta, ...prev])
                setShowAhorroModal(false)
                setNewMeta({ nombre: "", objetivo: "", acumulado: "" })
                setError("")
              }}
            >
              <div className="form-group-expenses">
                <label className="form-label-expenses">Nombre</label>
                <input
                  className="form-input-expenses"
                  value={newMeta.nombre}
                  onChange={(e) => setNewMeta({ ...newMeta, nombre: e.target.value })}
                />
              </div>
              <div className="form-group-expenses">
                <label className="form-label-expenses">Objetivo</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input-expenses"
                  value={newMeta.objetivo}
                  onChange={(e) => setNewMeta({ ...newMeta, objetivo: e.target.value })}
                />
              </div>
              <div className="form-group-expenses">
                <label className="form-label-expenses">Acumulado</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input-expenses"
                  value={newMeta.acumulado}
                  onChange={(e) => setNewMeta({ ...newMeta, acumulado: e.target.value })}
                />
              </div>
              {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
              <button className="submit-button-expenses" type="submit">
                Guardar Meta
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
