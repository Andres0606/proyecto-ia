"use client";

import { useState, useEffect } from "react";
import "../css/Header.css";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Escuchar el scroll
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);

    // Cargar usuario de localStorage
    const savedUser = localStorage.getItem("ucc_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("ucc_session");
    localStorage.removeItem("ucc_user");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <nav className={`header ${scrolled ? "header--scrolled" : ""}`}>
      <div className="header__inner">
        {/* Brand */}
        <a href="/" className="header__brand" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span className="header__logo">UCC</span>
          <span className="header__brand-text">Portal del Egresado</span>
        </a>

        {/* Links Principales (Limpios) */}
        <ul className={`header__links ${menuOpen ? "header__links--open" : ""}`}>
          <li><a href="/">Inicio</a></li>
          <li><a href="/Bolsa_Empleo">Bolsa de empleo</a></li>
          <li><a href="/diagnostico">Diagnóstico de estabilidad</a></li>
          <li><a href="/planes">Planes</a></li>
        </ul>

        {/* Acciones de Usuario */}
        <div className="header__actions">
          {user ? (
            <div className="header__profile-container" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {/* Botón Mi Perfil Estilo Cápsula */}
              <a href="/dashboard" className="header__profile-badge" style={{ 
                textDecoration: 'none',
                background: 'rgba(0, 102, 204, 0.1)', 
                color: 'var(--ucc-navy)',
                padding: '8px 20px',
                borderRadius: '50px',
                fontSize: '0.9rem',
                fontWeight: '600',
                border: '1px solid rgba(0, 102, 204, 0.2)',
                transition: 'all 0.3s ease'
              }}>
                Mi Perfil: <span style={{ color: 'var(--ucc-red)' }}>
                  {(user.profile?.nombre_completo || user.user_metadata?.full_name || 'Egresado').split(' ')[0]}
                </span>
              </a>
              
              {/* Botón Cerrar Sesión con Estilo */}
              <button 
                onClick={handleLogout} 
                className="header__logout-btn"
                style={{ 
                  background: 'rgba(229, 62, 62, 0.1)',
                  border: '1px solid rgba(229, 62, 62, 0.2)',
                  color: '#e53e3e',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  padding: '6px 14px',
                  borderRadius: '50px',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#e53e3e';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(229, 62, 62, 0.1)';
                  e.currentTarget.style.color = '#e53e3e';
                }}
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <>
              <a href="/login" className="header__btn header__btn--ghost">Ingresar</a>
              <a href="/registro" className="header__btn header__btn--red">Registrarse</a>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button
          className={`header__hamburger ${menuOpen ? "header__hamburger--open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menú"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  );
}