"use client";

import { useEffect, useState } from "react";
import "../css/Auth/auth.css";

import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
      const res = await fetch(`${backendUrl}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      // Guardar sesión y datos del usuario
      sessionStorage.setItem('ucc_session', JSON.stringify(data.session));
      sessionStorage.setItem('ucc_user', JSON.stringify(data.user));

      // Redirigir según el rol
      const rolId = data.user.profile?.rol_id;
      if (rolId === 4) {
        window.location.href = "/dashboard-admin";
      } else if (rolId === 2) {
        window.location.href = "/dashboard-externo";
      } else if (rolId === 3) {
        window.location.href = "/dashboard-empresa";
      } else {
        window.location.href = "/dashboard";
      }

    } catch (err: any) {
      console.error("Error en login:", err);
      setErrorMsg(err.message || "Credenciales incorrectas.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Background */}
      <div className="auth-page__bg-grid" />
      <div className="auth-page__blob auth-page__blob--1" />
      <div className="auth-page__blob auth-page__blob--2" />
      <div className="auth-page__blob auth-page__blob--3" />

      {/* Back link */}
      <a href="/" className="auth-home-link">
        ← Volver al inicio
      </a>

      {/* Card */}
      <div className="auth-card">
        {/* Brand */}
        <div className="auth-card__brand">
          <span className="auth-card__logo">UCC</span>
          <span className="auth-card__brand-text">Portal del Egresado</span>
        </div>

        <h1 className="auth-card__title">Bienvenido de vuelta</h1>
        <p className="auth-card__subtitle">
          Ingresa tus credenciales para acceder a tu cuenta
        </p>

        {/* Form */}
        <form className="auth-form" onSubmit={handleLogin}>
          {successMsg && (
            <div style={{ background: '#dcfce7', color: '#166534', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', border: '1px solid #bbf7d0', textAlign: 'center' }}>
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div style={{ color: '#e53e3e', background: '#fff5f5', padding: '0.8rem', borderRadius: '8px', fontSize: '0.85rem', border: '1px solid #feb2b2' }}>
              ⚠ {errorMsg}
            </div>
          )}

          <div className="auth-field">
            <label className="auth-field__label" htmlFor="login-email">
              Correo electrónico
            </label>
            <input
              id="login-email"
              className="auth-field__input"
              type="email"
              placeholder="tucorreo@ejemplo.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-field__label" htmlFor="login-password">
              Contraseña
            </label>
            <div className="auth-field__password-wrap">
              <input
                id="login-password"
                className="auth-field__input"
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="auth-field__toggle-pw"
                onClick={() => setShowPw(!showPw)}
                aria-label={showPw ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPw ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </div>

          <div className="auth-form__forgot">
            <a href="/recuperar">¿Olvidaste tu contraseña?</a>
          </div>

          <button type="submit" className="auth-form__submit" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        {/* Divider */}
        <div className="auth-divider">
          <div className="auth-divider__line" />
          <span className="auth-divider__text">o</span>
          <div className="auth-divider__line" />
        </div>

        {/* Link to register */}
        <p className="auth-card__link">
          ¿No tienes cuenta?{" "}
          <a href="/registro">Regístrate aquí</a>
        </p>
      </div>
    </div>
  );
}
