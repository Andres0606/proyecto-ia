"use client";

import { useState } from "react";
import "../css/Auth/auth.css";

import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    if (!supabase) {
      setErrorMsg("La configuración de Supabase no se encontró. Verifica las variables de entorno.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      window.location.href = "/dashboard";
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
