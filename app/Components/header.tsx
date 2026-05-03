"use client";

import { useState, useEffect } from "react";
import "../css/Header.css";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
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
          <li><a href="#funciones">Funciones</a></li>
          <li><a href="#como-funciona">¿Cómo funciona?</a></li>
          <li><a href="#testimonios">Testimonios</a></li>
          <li><a href="#estadisticas">Estadísticas</a></li>
        </ul>

        {/* Actions */}
        <div className="header__actions">
          <a href="/login" className="header__btn header__btn--ghost">Ingresar</a>
          <a href="/registro" className="header__btn header__btn--red">Registrarse</a>
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