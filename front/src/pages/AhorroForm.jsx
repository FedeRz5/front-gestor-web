"use client"

import { useEffect, useState } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import api from "../api/client"

export default function AhorroForm({ mode = "create" }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = mode === "edit" && !!id

  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    nombre: "",
    objetivo: "",
    acumulado: "",
    saldo: "",
    progreso: 0,
    fecha: "",
  })

  useEffect(() => {
    const fetchOne = async () => {
      if (!isEdit) return
      try {
        setLoading(true)
        setError("")
        const r = await api.get(`/ahorros/metas/${id}`)
        const d = r?.data || {}
        setForm({
          nombre: d.nombre ?? "",
          objetivo: d.objetivo ?? "",
          acumulado: d.acumulado ?? "",
          saldo: d.saldo ?? "",
          progreso: Number(d.progreso ?? 0),
          fecha: d.fecha ?? "",
        })
      } catch (e) {
        setError(e?.response?.data?.error || "No se pudo cargar la meta")
      } finally {
        setLoading(false)
      }
    }
    fetchOne()
  }, [id, isEdit])

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      setError("")
      if (isEdit) {
        await api.put(`/ahorros/metas/${id}`, form)
      } else {
        await api.post("/ahorros/metas", form)
      }
      navigate("/ahorros")
    } catch (e) {
      setError(e?.response?.data?.error || "No se pudo guardar la meta")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div style={{ padding: 20 }}>Cargando...</div>

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: 600 }}>
        <img src="/img/gestor.png" alt="Gestor Logo" className="auth-logo" />
        <h2 className="auth-title">{isEdit ? "Editar meta de ahorro" : "Nueva meta de ahorro"}</h2>

        <form onSubmit={onSubmit}>
          <div className="form-group-expenses">
            <label className="form-label-expenses" htmlFor="nombre">Nombre</label>
            <input
              id="nombre" name="nombre"
              className="form-input-expenses"
              value={form.nombre}
              onChange={onChange}
              required
            />
          </div>

          <div className="form-group-expenses">
            <label className="form-label-expenses" htmlFor="objetivo">Monto objetivo</label>
            <input
              id="objetivo" name="objetivo" type="number" step="0.01"
              className="form-input-expenses"
              value={form.objetivo}
              onChange={onChange}
              required
            />
          </div>

          <div className="form-group-expenses">
            <label className="form-label-expenses" htmlFor="acumulado">Monto acumulado</label>
            <input
              id="acumulado" name="acumulado" type="number" step="0.01"
              className="form-input-expenses"
              value={form.acumulado}
              onChange={onChange}
            />
          </div>

          <div className="form-group-expenses">
            <label className="form-label-expenses" htmlFor="progreso">Progreso (%)</label>
            <input
              id="progreso" name="progreso" type="number" min="0" max="100"
              className="form-input-expenses"
              value={form.progreso}
              onChange={onChange}
            />
          </div>

          <div className="form-group-expenses">
            <label className="form-label-expenses" htmlFor="fecha">Fecha</label>
            <input
              id="fecha" name="fecha" type="date"
              className="form-input-expenses"
              value={form.fecha}
              onChange={onChange}
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button className="btn-auth" type="submit" disabled={saving}>
            {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear meta"}
          </button>

          <div className="auth-footer" style={{ marginTop: 12 }}>
            <Link className="auth-link" to="/ahorros">Volver</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
