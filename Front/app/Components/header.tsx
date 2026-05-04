"use client";

import { useState, useEffect, useRef } from "react";
import "../css/Header.css";

const DIAGNOSTICO_ITEMS = [
  {
    icon: "📊",
    title: "Ver mi índice",
    desc: "Consulta tu nivel de empleabilidad actual.",
    href: "/diagnostico",
  },
  {
    icon: "🔍",
    title: "Análisis de perfil",
    desc: "Compara tus habilidades con el mercado.",
    href: "/diagnostico/analisis",
  },
  {
    icon: "📈",
    title: "Historial de resultados",
    desc: "Revisa cómo ha evolucionado tu índice.",
    href: "/diagnostico/historial",
  },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name: string } | null>(null);

  const handleLogout = () => setUser(null);

  return (
    <header className="header">
      <div className="header__inner">
        {/* Logo */}
        <div className="header__logo">
          <a href="/">
            <img src="/logo-ucc.png" alt="UCC Logo" className="header__logo-img" />
          </a>
        </div>

        {/* Nav */}
        <nav className="header__nav">
          <ul className={`header__links ${menuOpen ? "header__links--open" : ""}`}>
            <li><a href="/" className="header__link">Inicio</a></li>
            <li><a href="/Bolsa_Empleo" className="header__link">Bolsa de Empleo</a></li>
            <li><a href="/diagnostico" className="header__link">Diagnóstico IA</a></li>
            <li><a href="/dashboard" className="header__link">Mi Dashboard</a></li>
          </ul>
        </nav>

        {/* Actions */}
        <div className="header__actions">
          {user ? (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <a href="/perfil" className="header__btn header__btn--ghost" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                👤 Mi Perfil
              </a>
              <button onClick={handleLogout} className="header__btn header__btn--red" style={{ cursor: 'pointer', padding: '8px 15px', minWidth: 'auto' }}>✕</button>
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
    </header>
  );
}