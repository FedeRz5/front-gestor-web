import { useEffect, useState } from "react"
import api from "../api/client"

export default function ProfileModal({ open, onClose }) {
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState({ nombre: "", apellido: "", email: "", avatar_url: null })
  const [password, setPassword] = useState("")
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarBase64, setAvatarBase64] = useState(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (!open) return
    setError("")
    setSuccess("")
    api.get("/user").then((r) => {
      if (r.data && r.data.user) {
        setUser(r.data.user)
        setAvatarPreview(r.data.user.avatar_url || null)
      }
    }).catch((e) => {
      console.error("Error cargando usuario", e)
    })
  }, [open])

  // add a body class while modal open so we can hide the left menu and prevent visual overlap
  useEffect(() => {
    if (open) {
      document.body.classList.add("profile-modal-open")
    } else {
      document.body.classList.remove("profile-modal-open")
    }
    return () => document.body.classList.remove("profile-modal-open")
  }, [open])

  const onFileChange = (e) => {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => {
      setAvatarPreview(reader.result)
      // reader.result is data URL
      setAvatarBase64(reader.result)
    }
    reader.readAsDataURL(f)
  }

  // Upload file immediately via multipart/form-data for reliability
  const onFileUpload = async (e) => {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    // show local preview immediately
    const reader = new FileReader()
    reader.onload = () => setAvatarPreview(reader.result)
    reader.readAsDataURL(f)

    try {
      const form = new FormData()
      form.append('avatar', f)
      // send to backend multipart endpoint
      const res = await api.post('/user/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      if (res?.data?.avatar_url) {
        // server returns a URL we can use
        setAvatarPreview(res.data.avatar_url)
        setAvatarBase64(null)
      }
    } catch (err) {
      console.error('Error subiendo avatar', err)
      // keep local preview if server upload failed
    }
  }

  const submit = async (ev) => {
    ev.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)
    try {
      const payload = {
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
      }
      if (password) payload.password = password
      if (avatarBase64) payload.avatar_base64 = avatarBase64
      const r = await api.put("/user", payload)
      setSuccess("Perfil actualizado")
      // update avatar url if present
      if (r.data && r.data.user && r.data.user.avatar_url) {
        setAvatarPreview(r.data.user.avatar_url)
      }
      setPassword("")
      // small delay to show success
      setTimeout(() => { setLoading(false); onClose() }, 900)
    } catch (err) {
      console.error(err)
      setLoading(false)
      setError(err?.response?.data?.error || "Error actualizando perfil")
    }
  }

  if (!open) return null

  return (
    <div className="modal-expenses" style={{ display: "flex", zIndex: 2400 }}>
      <div className="modal-content-expenses">
        <div className="modal-header-expenses">
          <h3 className="modal-title-expenses">Mi perfil</h3>
          <a className="modal-close-expenses" onClick={onClose} href="#">×</a>
        </div>
        <div className="modal-form-container">
          <form className="modal-form-expenses" onSubmit={submit}>
          <div style={{ display: "flex", gap: 16, alignItems: 'center', marginBottom: 12 }}>
            <div style={{ minWidth: 96 }}>
              <div style={{ width: 88, height: 88, borderRadius: 12, overflow: 'hidden', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {avatarPreview ? (
                  // if avatarPreview looks like a data URL or absolute path
                  <img
                    src={avatarPreview}
                    alt=""
                    onError={() => setAvatarPreview(null)}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ color: '#94a3b8', fontSize: 14 }}>Sin foto</div>
                )}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <label className="form-label-expenses">Subir foto</label>
              <input type="file" accept="image/*" onChange={(e) => { onFileChange(e); onFileUpload(e); }} />
              <div style={{ height: 8 }} />
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>PNG / JPG. El archivo se guardará en el servidor.</div>
            </div>
          </div>

          <div className="form-group-expenses">
            <label className="form-label-expenses">Nombre</label>
            <input className="form-input-expenses" value={user.nombre || ""} onChange={(e) => setUser({...user, nombre: e.target.value})} />
          </div>

          <div className="form-group-expenses">
            <label className="form-label-expenses">Apellido</label>
            <input className="form-input-expenses" value={user.apellido || ""} onChange={(e) => setUser({...user, apellido: e.target.value})} />
          </div>

          <div className="form-group-expenses">
            <label className="form-label-expenses">Email</label>
            <input className="form-input-expenses" value={user.email || ""} onChange={(e) => setUser({...user, email: e.target.value})} />
          </div>

          <div className="form-group-expenses">
            <label className="form-label-expenses">Cambiar contraseña</label>
            <input type="password" className="form-input-expenses" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Dejar vacío para no cambiar" />
          </div>

          {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
          {success && <div style={{ color: 'var(--success-400)', marginBottom: 8 }}>{success}</div>}

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="submit-button-expenses" type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</button>
            <button className="submit-button-expenses" type="button" onClick={onClose}>Cancelar</button>
          </div>
          </form>
        </div>
      </div>
    </div>
  )
}
