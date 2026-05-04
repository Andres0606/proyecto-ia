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
            <div className="header__profile-container" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {/* Botón Mi Perfil (que lleva al Dashboard) */}
              <a href="/dashboard" className="header__btn header__btn--ghost" style={{ fontWeight: '600' }}>
                👤 {user.profile?.nombre_completo.split(' ')[0]} - Mi Perfil
              </a>
              
              {/* Botón Cerrar Sesión */}
              <button 
                onClick={handleLogout} 
                className="header__btn header__btn--red"
                style={{ cursor: 'pointer', padding: '8px 12px', minWidth: 'auto' }}
                title="Cerrar Sesión"
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