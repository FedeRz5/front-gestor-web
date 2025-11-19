import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import api from "../api/client"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setError("")
    try {
      await api.post("/login", { email, password })
      navigate("/")
    } catch (err) {
      setError(err?.response?.data?.error || "Error al iniciar sesión")
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Logo arriba */}
        <img src="/img/gestor.png" alt="Gestor Logo" className="auth-logo" />

        <h2 className="auth-title">Iniciar sesión</h2>

        <form onSubmit={onSubmit}>
          <div className="form-group-expenses">
            <label className="form-label-expenses" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="form-input-expenses"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group-expenses">
            <label className="form-label-expenses" htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              className="form-input-expenses"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button className="btn-auth" type="submit">Entrar</button>
        </form>

        <p className="auth-footer">
          ¿No tenés cuenta?{" "}
          <Link to="/register" className="auth-link">Registrate</Link>
        </p>
      </div>
    </div>
  )
}
