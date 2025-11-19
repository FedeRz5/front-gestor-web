import React, { useEffect, useState } from "react"
import { Routes, Route, Navigate, useLocation } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import Detalle from "./pages/Detalle"
import Ahorros from "./pages/ahorros"       
import AhorroForm from "./pages/AhorroForm" 
import QRDownload from "./pages/QRdownload"
import api from "./api/client"

function RequireAuth({ children }) {
  const [loading, setLoading] = useState(true)
  const [auth, setAuth] = useState(false)
  const location = useLocation()

  useEffect(() => {
    let mounted = true
    api.get("/user")
      .then((r) => { if (mounted) setAuth(!!r.data?.authenticated) })
      .catch(() => setAuth(false))
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [location.pathname])

  if (loading) return <div style={{ padding: 20 }}>Cargando...</div>
  if (!auth) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Privadas */}
      <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/detalle/:caso" element={<RequireAuth><Detalle /></RequireAuth>} />

      {/* Ahorros */}
      <Route path="/ahorros" element={<RequireAuth><Ahorros /></RequireAuth>} />
      <Route path="/ahorros/nuevo" element={<RequireAuth><AhorroForm mode="create" /></RequireAuth>} />
      <Route path="/ahorros/editar/:id?" element={<RequireAuth><AhorroForm mode="edit" /></RequireAuth>} />

      {/* QR */}
      <Route path="/qr" element={<RequireAuth><QRDownload /></RequireAuth>} />
      <Route path="/qrdownload" element={<RequireAuth><QRDownload /></RequireAuth>} />
      <Route path="/download" element={<RequireAuth><QRDownload /></RequireAuth>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
