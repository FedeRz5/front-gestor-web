"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../api/client"
import Header from "../components/Header.jsx"

export default function Detalle() {
  const navigate = useNavigate()
  const { caso } = useParams()
  const isIngresos = caso === "ingresos"
  const isEgresos = caso === "egresos"

  const [rows, setRows] = useState([])
  const [totales, setTotales] = useState({ ingresos: 0, egresos: 0, disponible: 0 })

  // 👇 Estados para modales y formularios
  const [showIngreso, setShowIngreso] = useState(false)
  const [showGasto, setShowGasto] = useState(false)
  const [gasto, setGasto] = useState({ descripcion: "", monto: "", id_tipo: "" })
  const [ingreso, setIngreso] = useState({ monto: "" })
  const [tipos, setTipos] = useState([])
  const [error, setError] = useState("")
  const [showEdit, setShowEdit] = useState(false)
  const [editingTransaccion, setEditingTransaccion] = useState(null)
  const [editMonto, setEditMonto] = useState("")
  const [editDescripcion, setEditDescripcion] = useState("")
  const [editIdTipo, setEditIdTipo] = useState("")

  const loadDetalle = async () => {
    try {
      const r = await api.get("/detalle", { params: { caso } })
      setRows(r.data.lista || [])
      setTotales(r.data.totales || { ingresos: 0, egresos: 0, disponible: 0 })
    } catch (e) {
      console.error("Error cargando detalle:", e)
      if (e?.response?.status === 401 || (e?.response?.data?.error || "").toLowerCase().includes("no autenticado")) {
        navigate("/login")
      }
    }
  }

  useEffect(() => {
    loadDetalle()
  }, [caso])

  // Cargar tipos de gasto al abrir modal
  useEffect(() => {
    if (showGasto) {
      api.get("/tipos_gasto").then((r) => setTipos(r.data))
    }
  }, [showGasto])

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
      await loadDetalle()
    } catch (err) {
      setError(err?.response?.data?.error || "Error al guardar gasto")
    }
  }

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
      await api.post("/agregar_ingreso", { monto: ingreso.monto, descripcion: ingreso.descripcion })
      setShowIngreso(false)
      setIngreso({ monto: "", descripcion: "" })
      await loadDetalle()
    } catch (err) {
      setError(err?.response?.data?.error || "Error al guardar ingreso")
    }
  }

  return (
    <div className="main-content-dashboard">
      <Header
        setShowIngreso={setShowIngreso}
        setShowGasto={setShowGasto}
        logout={async () => {
          await api.post("/logout")
          navigate("/login")
        }}
      />

      <section className="summary-card-dashboard">
        <div className="summary-content-dashboard">
          <div className="summary-left-dashboard">
            <h2 className="greeting-title-dashboard">
              {isIngresos ? "💰 Ingresos" : "💸 Gastos"}
            </h2>
            <p className="greeting-text-dashboard">
              {isIngresos
                ? "Aquí puedes ver todos tus ingresos registrados"
                : "Aquí puedes ver todos tus gastos registrados"}
            </p>
            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
              
            </div>
          </div>

          <div className="summary-center-dashboard">
            <div
              className="available-amount-dashboard"
              style={{
                color: totales.disponible < 0 ? "var(--danger-400)" : "inherit",
              }}
            >
              Disponible: ${totales.disponible?.toFixed(2) || "0.00"}
            </div>
            <div className="monthly-stats-dashboard">
              <div>Ingresos: ${totales.ingresos?.toFixed(2) || "0.00"}</div>
              <div>Gastos: ${totales.egresos?.toFixed(2) || "0.00"}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="transactions-section-dashboard">
        <div className="section-header-dashboard">
          <h3 className="section-title-dashboard">
            {isIngresos ? "Últimos ingresos" : "Últimos gastos"}
          </h3>
        </div>

        <div className="table-wrapper-ahorros">
          <table className="table-ahorros">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Categoría</th>
                <th>Descripción</th>
                <th>Monto</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", color: "#6b7280" }}>
                    {isIngresos
                      ? "No hay ingresos registrados"
                      : "No hay gastos registrados"}
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => (
                  <tr key={index}>
                    <td>{row.fecha}</td>
                    <td>
                      <span
                        className={`chip-${isIngresos ? "green" : "red"}-ahorros`}
                      >
                        {row.categoria}
                      </span>
                    </td>
                    <td>{row.descripcion}</td>
                    <td
                      style={{
                        color: isIngresos
                          ? "var(--success-400)"
                          : "var(--danger-400)",
                        fontWeight: "700",
                      }}
                    >
                      ${Number(row.monto).toFixed(2)}
                    </td>
                    <td style={{ display: "flex", gap: 8 }}>
                      <button
                        className="btn-auth-editar"
                        onClick={() => {
                          setEditingTransaccion(row)
                          setEditMonto(String(row.monto))
                          setEditDescripcion(row.descripcion || "")
                          setEditIdTipo(row.id_tipo || "")
                          setShowEdit(true)
                        }}
                      >
                        <img src="/img/editar.png" alt="editar" width="20" height="20" />
                      </button>
                      <button
                        className="btn-auth-eliminar btn-danger"
                        onClick={async () => {
                          if (!confirm("¿Eliminar esta transacción?")) return
                          try {
                            await api.delete(`/transaccion/${row.id_transaccion}`)
                            await loadDetalle()
                          } catch (err) {
                            console.error(err)
                            alert(err?.response?.data?.error || "Error al eliminar")
                          }
                        }}
                      >
                         <img src="/img/eliminar.png" alt="eliminar" width="20" height="20" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 👇 Modales */}
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
              <button className="submit-button-expenses" type="submit">Guardar</button>
            </form>
          </div>
        </div>
      )}

      {showIngreso && (
        <div className="modal-expenses" style={{ display: "flex" }}>
          <div className="modal-content-expenses">
            <div className="modal-header-expenses">
              <h3 className="modal-title-expenses">Agregar Ingreso</h3>
              <a className="modal-close-expenses" onClick={() => setShowIngreso(false)} href="#">×</a>
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
                  onChange={(e) => setIngreso({ ...ingreso, monto: e.target.value })}
                />
              </div>
              <div className="form-group-expenses">
                <label className="form-label-expenses">Descripción</label>
                <input
                  className="form-input-expenses"
                  value={ingreso.descripcion || ""}
                  onChange={(e) => setIngreso({ ...ingreso, descripcion: e.target.value })}
                />
              </div>
              {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
              <button className="submit-button-expenses" type="submit">Guardar</button>
            </form>
          </div>
        </div>
      )}

      {showEdit && editingTransaccion && (
        <div className="modal-expenses" style={{ display: "flex" }}>
          <div className="modal-content-expenses">
            <div className="modal-header-expenses">
              <h3 className="modal-title-expenses">Editar transacción</h3>
              <a className="modal-close-expenses" onClick={() => setShowEdit(false)} href="#">×</a>
            </div>
            <form
              className="modal-form-expenses"
              onSubmit={async (e) => {
                  e.preventDefault()
                  // Validación: monto debe ser numérico y mayor a 0
                  const montoNum = Number(editMonto)
                  if (isNaN(montoNum) || montoNum <= 0) {
                    alert("El monto debe ser mayor a 0")
                    return
                  }
                  try {
                    await api.put(`/transaccion/${editingTransaccion.id_transaccion}`, {
                      monto: editMonto,
                      descripcion: editDescripcion,
                      id_tipo: editIdTipo || null,
                    })
                    setShowEdit(false)
                    setEditingTransaccion(null)
                    await loadDetalle()
                  } catch (err) {
                    console.error("Error editando transacción", err)
                    alert(err?.response?.data?.error || "Error editando transacción")
                  }
                }}
            >
              <div className="form-group-expenses">
                <label className="form-label-expenses">Monto</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="form-input-expenses"
                  value={editMonto}
                  onChange={(e) => setEditMonto(e.target.value)}
                  required
                />
              </div>
              <div className="form-group-expenses">
                <label className="form-label-expenses">Descripción</label>
                <input
                  className="form-input-expenses"
                  value={editDescripcion}
                  onChange={(e) => setEditDescripcion(e.target.value)}
                />
              </div>
              <div className="form-group-expenses">
                <label className="form-label-expenses">Categoría</label>
                <div className="select-wrapper-expenses">
                  <select
                    className="form-select-expenses"
                    value={editIdTipo}
                    onChange={(e) => setEditIdTipo(e.target.value)}
                  >
                    <option value="">Seleccione</option>
                    {tipos.map((t) => (
                      <option key={t.id_tipo} value={t.id_tipo}>{t.nombre_tipo}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button className="submit-button-expenses" type="submit">Guardar</button>
                <button className="submit-button-expenses" type="button" onClick={() => setShowEdit(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
