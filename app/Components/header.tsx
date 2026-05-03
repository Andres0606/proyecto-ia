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

          <li>
            <a href="/diagnostico">Diagnóstico de estabilidad</a>
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

        {/* Hamburgereeeee */}
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