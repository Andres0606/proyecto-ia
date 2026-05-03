"use client";

import { useState } from "react";
import "../css/Auth/auth.css";

export default function LoginPage() {
  const [showPw, setShowPw] = useState(false);

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
        <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
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
              />
              <button
                type="button"
                className="auth-field__toggle-pw"
                onClick={() => setShowPw(!showPw)}
                aria-label={showPw ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPw ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div className="auth-form__forgot">
            <a href="/recuperar">¿Olvidaste tu contraseña?</a>
          </div>

          <button type="submit" className="auth-form__submit">
            Ingresar
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
