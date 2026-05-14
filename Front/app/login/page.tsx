"use client";

import { useEffect, useState } from "react";
import "../css/Auth/auth.css";

// ── Icons ──────────────────────────────────────────────────────────────────
const Icons = {
  Mail: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-10 11"/><path d="m22 2-7 20-4-9-9-4Z"/></svg>,
  Lock: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  Eye: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>,
  EyeOff: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>,
  ArrowRight: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>,
  Info: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg>,
};

export default function LoginPage() {
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  // Estados para OTP
  const [otpMode, setOtpMode] = useState(false);
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(120); // 2 minutos en segundos
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval: any;
    if (otpMode && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [otpMode, timer]);

  useEffect(() => {
    const saved = sessionStorage.getItem('ucc_user');
    if (saved) {
      try {
        const user = JSON.parse(saved);
        const rolId = Number(user.profile?.rol_id);
        if (rolId === 4) window.location.href = "/dashboard-admin";
        else if (rolId === 2) window.location.href = "/dashboard-externo";
        else if (rolId === 3) window.location.href = "/dashboard-empresa";
        else window.location.href = "/dashboard";
      } catch (e) {
        sessionStorage.clear();
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://proyecto-ia-production-b7d6.up.railway.app';
      const res = await fetch(`${backendUrl}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      // Login directo sin esperas
      completeLogin(data);

    } catch (err: any) {
      console.error("Error en login:", err);
      setErrorMsg(err.message || "Credenciales incorrectas.");
      setLoading(false);
    }
  };

  const completeLogin = (data: any) => {
    sessionStorage.setItem('ucc_session', JSON.stringify(data.session));
    sessionStorage.setItem('ucc_user', JSON.stringify(data.user));

    const rolId = Number(data.user.profile?.rol_id);
    if (rolId === 4) window.location.href = "/dashboard-admin";
    else if (rolId === 2) window.location.href = "/dashboard-externo";
    else if (rolId === 3) window.location.href = "/dashboard-empresa";
    else window.location.href = "/dashboard";
  };

  return (
    <div className="auth-page">
      <div className="auth-page__bg-grid" />
      <div className="auth-page__blob auth-page__blob--1" />
      <div className="auth-page__blob auth-page__blob--2" />
      <div className="auth-page__blob auth-page__blob--3" />

      <a href="/" className="auth-home-link">
        ← Volver al inicio
      </a>

      <div className="auth-card">
        <div className="auth-card__brand">
          <span className="auth-card__logo">UCC</span>
          <span className="auth-card__brand-text">Portal del Egresado</span>
        </div>

        <h1 className="auth-card__title">Bienvenido</h1>
        <p className="auth-card__subtitle">
          Ingresa tus credenciales para acceder a la plataforma
        </p>

        <form className="auth-form" onSubmit={handleLogin}>
          {successMsg && (
            <div className="auth-message auth-message--success">
              <Icons.Info /> {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="auth-message auth-message--error">
              <Icons.Info /> {errorMsg}
            </div>
          )}

          <div className="auth-field">
            <label className="auth-field__label" htmlFor="login-email">
              Correo electrónico
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                <Icons.Mail />
              </span>
              <input
                id="login-email"
                className="auth-field__input"
                style={{ paddingLeft: '48px' }}
                type="email"
                placeholder="nombre@ejemplo.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="auth-field__label" htmlFor="login-password">
                Contraseña
              </label>
              <div className="auth-form__forgot">
                <a href="/recuperar">¿Olvidaste tu contraseña?</a>
              </div>
            </div>
            <div className="auth-field__password-wrap" style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1 }}>
                <Icons.Lock />
              </span>
              <input
                id="login-password"
                className="auth-field__input"
                style={{ paddingLeft: '48px' }}
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
                {showPw ? <Icons.EyeOff /> : <Icons.Eye />}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-form__submit" disabled={loading}>
            {loading ? "Ingresando..." : (
              <>
                Ingresar <Icons.ArrowRight />
              </>
            )}
          </button>
        </form>

        <div className="auth-divider">
          <div className="auth-divider__line" />
          <span className="auth-divider__text">o</span>
          <div className="auth-divider__line" />
        </div>

        <p className="auth-card__link">
          ¿No tienes cuenta?{" "}
          <a href="/registro">Regístrate ahora</a>
        </p>
      </div>
    </div>
  );
}
