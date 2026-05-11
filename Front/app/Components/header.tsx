"use client";

import { useState, useEffect } from "react";
import "../css/Header.css";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);

    const savedUser = sessionStorage.getItem("ucc_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("ucc_session");
    sessionStorage.removeItem("ucc_user");
    setUser(null);
    window.location.href = "/";
  };

  const checkAccess = (e: React.MouseEvent, type: 'diagnostico' | 'bolsa') => {
    if (!user) {
      e.preventDefault();
      alert("Por favor inicia sesión para acceder.");
      return;
    }

    const rol = Number(user.profile?.rol_id);
    const plan = user.profile?.suscripcion?.tipo_plan || 'Gratuito';

    // Roles 1 y 4 tienen acceso total
    if (rol === 1 || rol === 4) return;

    // Lógica para Empresa (Rol 3)
    if (rol === 3) {
      if (type === 'diagnostico') {
        e.preventDefault();
        alert("Este módulo es exclusivo para Egresados y Usuarios Externos. Como empresa, tu función es publicar vacantes.");
        return;
      }
    }

    // Lógica para Externos (Rol 2)
    if (rol === 2) {
      if (type === 'diagnostico') {
        if (plan === 'Gratuito') {
          e.preventDefault();
          alert("El Diagnóstico de Estabilidad IA es un beneficio exclusivo del plan 'Acceso al Modelo' o superior. ¡Actualiza tu plan para descubrir tu futuro laboral!");
          return;
        }
      } else if (type === 'bolsa') {
        // Permitimos la entrada a todos los externos para visualizar, 
        // la restricción de postulación se hace dentro de la página de Bolsa.
        return;
      }
    }
  };

  const dashboardUrl = user
    ? Number(user.profile?.rol_id) === 4 ? "/dashboard-admin"
    : Number(user.profile?.rol_id) === 2 ? "/dashboard-externo"
    : Number(user.profile?.rol_id) === 3 ? "/dashboard-empresa"
    : "/dashboard"
    : "/login";

  const userFirstName = user
    ? (user.profile?.nombre_completo || user.user_metadata?.full_name || 'Usuario').split(' ')[0]
    : '';

  // Shared action buttons (rendered in both desktop and mobile)
  const ActionButtons = () => (
    <>
      {user ? (
        <div className="header__auth-buttons">
          <a href={dashboardUrl} className="header__btn header__btn--ghost">
            Mi Perfil: <span style={{ color: '#e53e3e', marginLeft: '4px' }}>{userFirstName}</span>
          </a>
          <button onClick={handleLogout} className="header__btn header__btn--logout">
            Cerrar sesión
          </button>
        </div>
      ) : (
        <div className="header__auth-buttons">
          <a href="/login" className="header__btn header__btn--ghost">Ingresar</a>
          <a href="/registro" className="header__btn header__btn--red">Registrarse</a>
        </div>
      )}
    </>
  );

  return (
    <nav className={`header ${scrolled ? "header--scrolled" : ""}`}>
      <div className="header__inner">
        {/* Brand */}
        <a href="/" className="header__brand" style={{ textDecoration: 'none', color: 'inherit' }}>
          <img src="/ucc (1).png" alt="UCC Logo" className="header__logo-img" />
          <span className="header__brand-text">Portal del Egresado</span>
        </a>

        {/* Links + Actions en el mismo contenedor para mobile */}
        <ul className={`header__links ${menuOpen ? "header__links--open" : ""}`}>
          <li><a href="/">Inicio</a></li>
          <li><a href="/Bolsa_Empleo" onClick={(e) => checkAccess(e, 'bolsa')}>Bolsa de empleo</a></li>
          <li><a href="/diagnostico" onClick={(e) => checkAccess(e, 'diagnostico')}>Diagnóstico de estabilidad</a></li>
          <li><a href="/planes">Planes</a></li>
          {/* Botones dentro del menú mobile */}
          <li className="header__mobile-actions">
            <ActionButtons />
          </li>
        </ul>

        {/* Acciones Desktop (fuera del menú) */}
        <div className="header__actions">
          <ActionButtons />
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