"use client"

import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import api from "../api/client"
import { AgChartsReact } from "ag-charts-react"
import Header from "../components/Header.jsx"

export default function Dashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [tipos, setTipos] = useState([])
  const [showGasto, setShowGasto] = useState(false)
  const [showIngreso, setShowIngreso] = useState(false)
  const [gasto, setGasto] = useState({ descripcion: "", monto: "", id_tipo: "" })
  const [ingreso, setIngreso] = useState({ monto: "" })
  const [error, setError] = useState("")
  const [usdRate, setUsdRate] = useState(null)
  const [eurRate, setEurRate] = useState(null)
  const [usdOficialRate, setUsdOficialRate] = useState(null)

  const [loadError, setLoadError] = useState("")
  const loadSummary = async () => {
    try {
      setLoadError("")
      const r = await api.get("/summary")
      if (r && r.data && typeof r.data === "object") {
        setData(r.data)
      } else {
        setData({
          semana: {
            categorias: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"],
            ingresos: [0, 0, 0, 0, 0, 0, 0],
            egresos: [0, 0, 0, 0, 0, 0, 0],
          },
          torta: { etiquetas: ["Alquiler", "Alimentos", "Transporte", "Otros"], valores: [0, 0, 0, 0] },
          totales: { ingresos: 0, egresos: 0, disponible: 0 },
          recientes: { ingresos: [], gastos: [] },
        })
      }
    } catch (e) {
      setLoadError(e?.response?.data?.error || "No se pudo cargar el resumen")
      if (e?.response?.status === 401 || (e?.response?.data?.error || "").toLowerCase().includes("no autenticado")) {
        navigate("/login")
      }
    }
  }

  const fetchUSDRate = async () => {
    try {
      const response = await fetch("https://api.bluelytics.com.ar/v2/latest")
      const data = await response.json()
      setUsdRate(data.blue.value_sell)
    } catch (error) {
      console.error("Error fetching USD rate:", error)
      setUsdRate(null)
    }
  }
  
  const fetchUSDOficialRate = async () => {
    try {
      const response = await fetch("https://dolarapi.com/v1/dolares/oficial")
      const data = await response.json()
      setUsdOficialRate(data.venta)
    } catch (error) {
      console.error("Error fetching USD rate:", error)
      setUsdOficialRate(null)
    }
  }

  const fetchEURRate = async () => {
    try {
      const response = await fetch("https://api.bluelytics.com.ar/v2/latest")
      const data = await response.json()
      setEurRate(data.blue_euro.value_sell)
    } catch (error) {
      console.error("Error fetching EUR rate:", error)
      setEurRate(null)
    }
  }

  useEffect(() => {
    loadSummary()
    fetchUSDRate()
    fetchEURRate()
    fetchUSDOficialRate()
    const interval = setInterval(() => {
      fetchUSDRate()
      fetchEURRate()
      fetchUSDOficialRate()
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (showGasto) {
      api.get("/tipos_gasto").then((r) => setTipos(r.data))
    }
  }, [showGasto])

  const logout = async () => {
    await api.post("/logout")
    navigate("/login")
  }

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
      await loadSummary()
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
      await api.post("/agregar_ingreso", { monto: ingreso.monto })
      setShowIngreso(false)
      setIngreso({ monto: "" })
      await loadSummary()
    } catch (err) {
      setError(err?.response?.data?.error || "Error al guardar ingreso")
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const barOptions = useMemo(() => {
    if (!data) return null
    const categorias = data.semana.categorias
    const rows = categorias.map((c, i) => ({
      dia: c,
      ingresos: data.semana.ingresos[i] || 0,
      egresos: data.semana.egresos[i] || 0,
    }))
    return {
      data: rows,
      title: {
        text: "Transacciones de la semana",
        color: "#ffffff",
      },
      legend: {
        enabled: true,
        item: {
          label: {
            color: "#ffffff",
          },
        },
      },
      background: {
        fill: "#1e293b",
      },
      axes: [
        {
          type: "category",
          position: "bottom",
          title: {
            text: "Día",
            color: "#ffffff",
          },
          label: {
            color: "#ffffff",
          },
        },
        {
          type: "number",
          position: "left",
          title: {
            text: "Monto",
            color: "#ffffff",
          },
          label: {
            color: "#ffffff",
          },
        },
      ],
      series: [
        { type: "bar", xKey: "dia", yKey: "ingresos", yName: "Ingresos" },
        { type: "bar", xKey: "dia", yKey: "egresos", yName: "Egresos" },
      ],
      height: 300,
    }
  }, [data])

  const pieOptions = useMemo(() => {
    if (!data) return null
    const { etiquetas, valores } = data.torta
    return {
      data: etiquetas.map((e, i) => ({ categoria: e, valor: valores[i] })),
      series: [
        {
          type: "pie",
          angleKey: "valor",
          calloutLabelKey: "categoria",
          calloutLabel: {
            color: "#ffffff",
          },
        },
      ],
      title: {
        text: "Distribución de Egresos",
        color: "#ffffff",
      },
      legend: {
        enabled: true,
        item: {
          label: {
            color: "#ffffff",
          },
        },
      },
      background: {
        fill: "#1e293b",
      },
      height: 300,
    }
  }, [data])

  const hasBarData = useMemo(() => {
    if (!data) return false
    return data.semana?.ingresos?.some((v) => v > 0) || data.semana?.egresos?.some((v) => v > 0)
  }, [data])

  const hasPieData = useMemo(() => {
    if (!data) return false
    return data.torta?.valores?.some((v) => v > 0)
  }, [data])

  if (!data) return <div style={{ padding: 20 }}>{loadError ? `Error: ${loadError}` : "Cargando..."}</div>

  return (
    <div className="main-content-dashboard">
      <Header
        setShowIngreso={setShowIngreso}
        setShowGasto={setShowGasto}
        logout={logout}
      />


      <section className="summary-card-dashboard">
        <div className="summary-content-dashboard">
          <div className="summary-center-dashboard">
            <div
              className="available-amount-dashboard"
              style={{ color: data.totales.disponible < 0 ? "var(--danger-400)" : "inherit" }}
            >
              Disponible: {formatCurrency(data.totales.disponible)}
            </div>
            <div className="monthly-stats-dashboard">
              <div>Ingresos: {formatCurrency(data.totales.ingresos)}</div>
              <div>Egresos: {formatCurrency(data.totales.egresos)}</div>
            </div>
          </div>
          <div className="summary-right-dashboard" style={{ gridTemplateColumns: '1fr 1fr 1fr', display: 'grid' }}>
            <div className="usd-rate-container">
              <div className="usd-rate-title">USD Blue</div>
              <div className="usd-rate-value">{usdRate ? `$${usdRate.toLocaleString("es-AR")}` : "Cargando..."}</div>
              <div className="usd-rate-subtitle">Tiempo real</div>
            </div>
            <div className="usd-rate-container">
              <div className="usd-rate-title">USD Oficial</div>
              <div className="usd-rate-value">{usdOficialRate ? `$${usdOficialRate.toLocaleString("es-AR")}` : "Cargando..."}</div>
              <div className="eur-rate-subtitle">Tiempo real</div>
            </div>
            <div className="eur-rate-container">
              <div className="eur-rate-title">EUR Blue</div>
              <div className="eur-rate-value">{eurRate ? `$${eurRate.toLocaleString("es-AR")}` : "Cargando..."}</div>
              <div className="eur-rate-subtitle">Tiempo real</div>
            </div>
          </div>
        </div>
      </section>

      <div className="dashboard-grid-dashboard">
        <div className="chart-section-dashboard">
          <div className="section-header-dashboard">
            <h3 className="section-title-dashboard">Semana</h3>
          </div>
          <div className="chart-container-dashboard">
            {hasBarData ? (
              barOptions && <AgChartsReact options={barOptions} containerStyle={{ width: "100%", height: "100%" }} />
            ) : (
              <div id="chart-placeholder-dashboard">Sin datos para mostrar</div>
            )}
          </div>
        </div>
        <div className="chart-section-dashboard">
          <div className="section-header-dashboard">
            <h3 className="section-title-dashboard">Gastos</h3>
          </div>
          <div className="chart-container-dashboard">
            {hasPieData ? (
              pieOptions && <AgChartsReact options={pieOptions} containerStyle={{ width: "100%", height: "100%" }} />
            ) : (
              <div id="chart-placeholder-dashboard">Sin datos para mostrar</div>
            )}
          </div>
        </div>
      </div>

      <section className="transactions-section-dashboard" style={{ marginTop: 24 }}>
        <div className="section-header-dashboard">
          <h3 className="section-title-dashboard">Últimos movimientos</h3>
        </div>
        <div className="transactions-list-dashboard">
          {data.recientes.ingresos.map((t) => (
            <div key={`ing-${t.id_transaccion}`} className="transaction-item-dashboard">
              <span>Ingreso</span>
              <span className="amount-income-dashboard">+{formatCurrency(Number(t.monto))}</span>
            </div>
          ))}
          {data.recientes.gastos.map((t) => (
            <div key={`gas-${t.id_transaccion}`} className="transaction-item-dashboard">
              <span>Gasto - {t.descripcion || "---"}</span>
              <span className="amount-expense-dashboard">-{formatCurrency(Number(t.monto))}</span>
            </div>
          ))}
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
              <div className="form-group-expenses">
                <label className="form-label-expenses">Descripción</label>
                <input
                  className="form-input-expenses"
                  value={ingreso.descripcion || ""}
                  onChange={(e) => setIngreso({ ...ingreso, descripcion: e.target.value })}
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
    </div>
  )
}
