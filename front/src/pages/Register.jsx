import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import api from "../api/client"

export default function Register() {
  const [nombre, setNombre] = useState("")
  const [apellido, setApellido] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setError("")
    try {
      await api.post("/register", {
        nombre,
        apellido,
        email,
        password,
        confirm_password: confirmPassword,
      })
      navigate("/login")
    } catch (err) {
      setError(err?.response?.data?.error || "Error al registrarse")
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Logo arriba */}
        <img src="/img/gestor-logo4.png" alt="Gestor Logo" className="auth-logo" />

        <h2 className="auth-title">Registro</h2>

        <form onSubmit={onSubmit}>
          <div className="form-group-expenses">
            <label className="form-label-expenses">Nombre</label>
            <input
              className="form-input-expenses"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div className="form-group-expenses">
            <label className="form-label-expenses">Apellido</label>
            <input
              className="form-input-expenses"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              required
            />
          </div>

          <div className="form-group-expenses">
            <label className="form-label-expenses">Email</label>
            <input
              type="email"
              className="form-input-expenses"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group-expenses">
            <label className="form-label-expenses">Contraseña</label>
            <input
              type="password"
              className="form-input-expenses"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          <div className="form-group-expenses">
            <label className="form-label-expenses">Confirmar contraseña</label>
            <input
              type="password"
              className="form-input-expenses"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button className="btn-auth" type="submit">
            Registrarse
          </button>
        </form>

        <p className="auth-footer">
          ¿Ya tenés cuenta?{" "}
          <Link to="/login" className="auth-link">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
