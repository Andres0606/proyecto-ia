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

import { createClient } from "@/utils/supabase/client";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    async function getUser() {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    }
    getUser();
  }, []);

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
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

        {/* Links */}
        <ul className={`header__links ${menuOpen ? "header__links--open" : ""}`}>
          <li>
            <a href="/#funciones">Inicio</a>
          </li>
          <li>
            <a href="/Bolsa_Empleo">Bolsa de empleo</a>
          </li>

          <li>
            <a href="/diagnostico">Diagnóstico de estabilidad</a>
          </li>

          <li>
            <a href="/planes">Planes</a>
          </li>
          
          {user && (
            <li>
              <a href="/dashboard" style={{ color: 'var(--ucc-green)', fontWeight: 'bold' }}>Mi Dashboard</a>
            </li>
          )}
        </ul>

        {/* Actions */}
        <div className="header__actions">
          {loading ? (
             <div style={{ width: '100px' }} /> 
          ) : user ? (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <a href="/perfil" className="header__btn header__btn--ghost" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>👤</span> Mi Perfil
              </a>
              <button 
                onClick={handleLogout} 
                className="header__btn header__btn--red"
                style={{ cursor: 'pointer', padding: '8px 15px', minWidth: 'auto' }}
                title="Cerrar Sesión"
              >
                ✕
              </button>
            </div>
          ) : (
            <>
              <a href="/login" className="header__btn header__btn--ghost">
                Ingresar
              </a>
              <a href="/registro" className="header__btn header__btn--red">
                Registrarse
              </a>
            </>
          )}
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