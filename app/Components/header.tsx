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
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <nav className={`header ${scrolled ? "header--scrolled" : ""}`}>
      <div className="header__inner">
        {/* Brand */}
        <div className="header__brand">
          <span className="header__logo">UCC</span>
          <span className="header__brand-text">Portal del Egresado</span>
        </div>

        {/* Links */}
        <ul className={`header__links ${menuOpen ? "header__links--open" : ""}`}>
          <li>
            <a href="/">Inicio</a>
          </li>
          <li>
            <a href="/bolsa-empleo">Bolsa de empleo</a>
          </li>

          {/* Dropdown Diagnóstico */}
          <li className="header__dropdown-wrap" ref={dropRef}>
            <button
              className="header__drop-trigger"
              onClick={() => setDropOpen(!dropOpen)}
              aria-expanded={dropOpen}
            >
              Diagnóstico de estabilidad
              <svg
                className={`header__drop-arrow ${dropOpen ? "header__drop-arrow--open" : ""}`}
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
              >
                <path
                  d="M2 4L6 8L10 4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {dropOpen && (
              <div className="header__dropdown">
                <div className="header__dropdown-header">
                  <span>Diagnóstico laboral</span>
                  <p>Conoce tu posición real en el mercado colombiano.</p>
                </div>
                <ul className="header__dropdown-list">
                  {DIAGNOSTICO_ITEMS.map((item) => (
                    <li key={item.title}>
                      <a href={item.href} className="header__dropdown-item" onClick={() => setDropOpen(false)}>
                        <span className="header__dropdown-icon">{item.icon}</span>
                        <div>
                          <strong>{item.title}</strong>
                          <p>{item.desc}</p>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>

          <li>
            <a href="/planes">Planes</a>
          </li>
        </ul>

        {/* Actions */}
        <div className="header__actions">
          <a href="/login" className="header__btn header__btn--ghost">
            Ingresar
          </a>
          <a href="/registro" className="header__btn header__btn--red">
            Registrarse
          </a>
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