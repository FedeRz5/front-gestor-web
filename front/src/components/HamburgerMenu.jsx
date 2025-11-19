"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

export default function HamburgerMenu({ onLogout, userName = "Usuario" }) {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  const toggleMenu = () => setIsOpen(v => !v)

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
  };


  // Bloquear scroll cuando el menú está abierto
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [isOpen])


  return (
    <>
      <button
        className="hamburger-button"
        onClick={toggleMenu}
        aria-label="Abrir menú"
        aria-expanded={isOpen}
        aria-controls="sidebar-menu"
      >
        <div className={`hamburger-icon ${isOpen ? "open" : ""}`}>
          <span></span><span></span><span></span>
        </div>
      </button>

      {isOpen && <div className="menu-overlay" onClick={() => setIsOpen(false)} />}

      <aside id="sidebar-menu" className={`header-menu ${isOpen ? "open" : ""}`} role="dialog" aria-modal="true">
        <div className="menu-section-header">
          <div className="user-profile">
            <div className="user-avatar">{userName.charAt(0).toUpperCase()}</div>
            <div className="user-info">
              <div className="user-name">{userName}</div>
              <div className="user-email">usuario@gestor.com</div>
            </div>
          </div>
        </div>

        <nav className="menu-section">
          <button className="btn-header btn-income-header"  onClick={() => handleNavigation("/agregar-ingreso")}>
            <span className="menu-item-icon">💰</span> Agregar ingreso</button>

          <button className="btn-header btn-expense-header" onClick={() => handleNavigation("/agregar-gasto")}>
            <span className="menu-item-icon">💸</span> Agregar gasto</button>

          <button className="btn-header btn-view-header" onClick={() => handleNavigation("/detalle/ingresos")}>
            <span className="menu-item-icon">📊</span> Ver ingresos</button>

          <button className="btn-header btn-view-header" onClick={() => handleNavigation("/detalle/egresos")}>
            <span className="menu-item-icon">📉</span> Ver egresos</button>

          <button className="btn-header btn-success-header" onClick={() => handleNavigation("/ahorros")}>
            <span className="menu-item-icon">🏦</span> Mis Ahorros</button>

          <button className="btn-header btn-success-header" onClick={() => handleNavigation("/calendario")}>
            <span className="menu-item-icon">🏦</span> Calendario</button>

          <div className="menu-section"></div>

          <button
            className="btn-header btn-neutral-header"
            onClick={() => { onLogout(); setIsOpen(false) }}
          >
            <span className="menu-item-icon">🚪</span> Salir
          </button>
        </nav>
      </aside>
    </>
  )
}