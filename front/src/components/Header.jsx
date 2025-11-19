import { Link, useNavigate } from "react-router-dom"
import { useState, useRef, useEffect } from "react"
import ProfileModal from "./ProfileModal.jsx"

export default function Header({ setShowIngreso, setShowGasto, logout }) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const menuRef = useRef(null)

  const toggleMenu = () => setMenuOpen((s) => !s)

  // Close on Escape key only (overlay handles outside clicks)
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape" && menuOpen) setMenuOpen(false)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [menuOpen])

  // If the profile modal is opened, ensure the menu is closed to avoid overlapping X icons
  useEffect(() => {
    if (profileOpen && menuOpen) {
      setMenuOpen(false)
    }
  }, [profileOpen, menuOpen])

  return (
    <header className="header-dashboard">
      <div className="header-logo">
        <button
          className="logo-button-large"
          onClick={() => navigate("/")}
          aria-label="Ir al inicio"
        >
          <img src="/img/gestor.png" alt="Gestor Logo" width="213" height="71" />
        </button>
      </div>

      {/* Hamburger button - visible on small screens */}
      <button
        className={`hamburger-button ${menuOpen ? "open" : ""}`}
        onClick={toggleMenu}
        aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={menuOpen}
      >
        <span className="hamburger-box">
          <span className="hamburger-inner" />
        </span>
      </button>

  {/* overlay captures outside clicks and darkens the page */}
  {menuOpen && <div className="menu-overlay" onClick={() => setMenuOpen(false)} />}

      <div ref={menuRef} className={`header-menu ${menuOpen ? "open" : ""}`} id="main-menu" role="menu" aria-hidden={!menuOpen}>
        <div className="menu-header">
          <button className="menu-close-button" onClick={() => setMenuOpen(false)} aria-label="Cerrar menú">×</button>
        </div>
        <div className="menu-section" role="group" aria-labelledby="menu-gastos">
          <h4 id="menu-gastos" className="menu-section-title">Gastos</h4>
          <button
            className="menu-item menu-button"
            onClick={() => { setShowGasto?.(true); setMenuOpen(false); }}
            role="menuitem"
          >
            <span className="menu-item-icon" aria-hidden>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10h-6"/><path d="M3 6h18v12H3z"/></svg>
            </span>
            <span className="menu-item-text">Agregar gasto</span>
          </button>
          <Link to="/detalle/egresos" onClick={() => setMenuOpen(false)}>
            <button className="menu-item menu-button" role="menuitem">
              <span className="menu-item-icon" aria-hidden>
                {/* eye icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
              </span>
              <span className="menu-item-text">Ver gastos</span>
            </button>
          </Link>
        </div>

        <div className="menu-section" role="group" aria-labelledby="menu-ingresos">
          <h4 id="menu-ingresos" className="menu-section-title">Ingresos</h4>
          <button
            className="menu-item menu-button"
            onClick={() => { setShowIngreso?.(true); setMenuOpen(false); }}
            role="menuitem"
          >
            <span className="menu-item-icon" aria-hidden>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18"/><path d="M12 3v18"/></svg>
            </span>
            <span className="menu-item-text">Agregar ingreso</span>
          </button>
          <Link to="/detalle/ingresos" onClick={() => setMenuOpen(false)}>
            <button className="menu-item menu-button" role="menuitem">
              <span className="menu-item-icon" aria-hidden>
                {/* eye icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
              </span>
              <span className="menu-item-text">Ver ingresos</span>
            </button>
          </Link>
        </div>

        <div className="menu-section" role="group" aria-labelledby="menu-sesion">
          <h4 id="menu-sesion" className="menu-section-title">Cuenta</h4>
          <button
            className="menu-item menu-button"
            onClick={() => { setProfileOpen(true); setMenuOpen(false); }}
            role="menuitem"
          >
            <span className="menu-item-icon" aria-hidden>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </span>
            <span className="menu-item-text">Perfil</span>
          </button>
          <button
            className="menu-item menu-button"
            onClick={() => { logout(); setMenuOpen(false); }}
            role="menuitem"
          >
            <span className="menu-item-icon" aria-hidden>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>
            </span>
            <span className="menu-item-text">Salir</span>
          </button>
        </div>
      </div>
      {/* Profile modal rendered outside menu so it overlays entire app */}
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </header>
  )
}