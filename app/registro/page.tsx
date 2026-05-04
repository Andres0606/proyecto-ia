"use client";

import { useState } from "react";
import "../css/Auth/auth.css";
import { createClient } from "@/utils/supabase/client";

// ── Tipos ────────────────────────────────────────────────────────────────────
type RolType = "egresado" | "externo" | "empresa" | null;

const ROLES = [
  {
    id: "egresado" as RolType,
    icon: "E",
    iconClass: "auth-role-card__icon--egresado",
    title: "Egresado UCC",
    desc: "Graduado de la Universidad Cooperativa de Colombia.",
    badge: "Gratis",
  },
  {
    id: "externo" as RolType,
    icon: "U",
    iconClass: "auth-role-card__icon--externo",
    title: "Usuario externo",
    desc: "Profesional de otra universidad o institución.",
    badge: null,
  },
  {
    id: "empresa" as RolType,
    icon: "Emp",
    iconClass: "auth-role-card__icon--empresa",
    title: "Empresa",
    desc: "Publica vacantes y encuentra talento UCC.",
    badge: null,
  },
];

const GENEROS = [
  { value: "", label: "Seleccionar..." },
  { value: "masculino", label: "Hombre" },
  { value: "femenino", label: "Mujer" },
];

const SECTORES = [
  { value: "", label: "Seleccionar..." },
  { value: "tecnologia", label: "Tecnología" },
  { value: "salud", label: "Salud" },
  { value: "educacion", label: "Educación" },
  { value: "finanzas", label: "Finanzas y Banca" },
  { value: "construccion", label: "Construcción" },
  { value: "comercio", label: "Comercio" },
  { value: "manufactura", label: "Manufactura" },
  { value: "servicios", label: "Servicios" },
  { value: "gobierno", label: "Gobierno" },
  { value: "otro", label: "Otro" },
];

const TAMANOS = [
  { value: "", label: "Seleccionar..." },
  { value: "microempresa", label: "Microempresa (1-10)" },
  { value: "pequena", label: "Pequeña (11-50)" },
  { value: "mediana", label: "Mediana (51-200)" },
  { value: "grande", label: "Grande (200+)" },
];

// ── Stepper ──────────────────────────────────────────────────────────────────
function Stepper({ step, rol }: { step: number; rol: RolType }) {
  const totalSteps = rol === "empresa" ? 3 : 2;
  const steps =
    rol === "empresa"
      ? [
          { num: 1, label: "Tipo de cuenta" },
          { num: 2, label: "Datos personales" },
          { num: 3, label: "Datos empresa" },
        ]
      : [
          { num: 1, label: "Tipo de cuenta" },
          { num: 2, label: "Datos personales" },
        ];

  return (
    <div className="auth-stepper">
      {steps.map((s, i) => (
        <div key={s.num} style={{ display: "flex", alignItems: "center" }}>
          <div className="auth-stepper__step">
            <span
              className={`auth-stepper__circle ${
                step === s.num
                  ? "auth-stepper__circle--active"
                  : step > s.num
                  ? "auth-stepper__circle--done"
                  : ""
              }`}
            >
              {step > s.num ? "✓" : s.num}
            </span>
            <span
              className={`auth-stepper__label ${
                step >= s.num ? "auth-stepper__label--active" : ""
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`auth-stepper__connector ${
                step > s.num ? "auth-stepper__connector--done" : ""
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Step 1: Role Selection ───────────────────────────────────────────────────
function StepRol({
  rol,
  onSelect,
  onNext,
}: {
  rol: RolType;
  onSelect: (r: RolType) => void;
  onNext: () => void;
}) {
  return (
    <div className="auth-step">
      <div className="auth-roles">
        {ROLES.map((r) => (
          <div
            key={r.id}
            className={`auth-role-card ${
              rol === r.id ? "auth-role-card--selected" : ""
            }`}
            onClick={() => onSelect(r.id)}
          >
            {r.badge && (
              <span className="auth-role-card__badge">{r.badge}</span>
            )}
            <div className={`auth-role-card__icon ${r.iconClass}`}>
              {r.icon}
            </div>
            <div className="auth-role-card__info">
              <div className="auth-role-card__title">{r.title}</div>
              <div className="auth-role-card__desc">{r.desc}</div>
            </div>
            <div className="auth-role-card__radio" />
          </div>
        ))}
      </div>

      <button
        className="auth-form__submit"
        style={{ marginTop: "1.2rem" }}
        disabled={!rol}
        onClick={onNext}
      >
        Continuar →
      </button>
    </div>
  );
}

// ── Step 2: Personal Data ────────────────────────────────────────────────────
function StepDatosPersonales({
  onBack,
  onNext,
  isLastStep,
  formData,
  setFormData,
  loading,
}: {
  onBack: () => void;
  onNext: () => void;
  isLastStep: boolean;
  formData: any;
  setFormData: (d: any) => void;
  loading: boolean;
}) {
  const { password: pw1, confirmPassword: pw2 } = formData;
  const isMatch = pw1.length > 0 && pw1 === pw2;


  return (
    <div className="auth-step">
      <div className="auth-form" style={{ gap: "1rem" }}>
        {/* Nombre completo */}
        <div className="auth-field">
          <label className="auth-field__label" htmlFor="reg-nombre">
            Nombre completo
          </label>
            <input
              id="reg-nombre"
              className="auth-field__input"
              type="text"
              placeholder="Juan Pérez López"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
            />
          </div>

          {/* Correo & Teléfono */}
          <div className="auth-form__row">
            <div className="auth-field">
              <label className="auth-field__label" htmlFor="reg-correo">
                Correo electrónico
              </label>
              <input
                id="reg-correo"
                className="auth-field__input"
                type="email"
                placeholder="tucorreo@ejemplo.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="auth-field">
              <label className="auth-field__label" htmlFor="reg-telefono">
                Teléfono
              </label>
              <input
                id="reg-telefono"
                className="auth-field__input"
                type="tel"
                placeholder="Ej: 3001234567"
                minLength={10}
                maxLength={10}
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                required
              />
          </div>
        </div>

        {/* Cédula & Fecha nacimiento */}
        <div className="auth-form__row">
          <div className="auth-field">
            <label className="auth-field__label" htmlFor="reg-cedula">
              Cédula
            </label>
            <input
              id="reg-cedula"
              className="auth-field__input"
              type="text"
              placeholder="1.234.567.890"
            />
          </div>
          <div className="auth-field">
            <label className="auth-field__label" htmlFor="reg-fecha">
              Fecha de nacimiento
            </label>
            <input
              id="reg-fecha"
              className="auth-field__input"
              type="date"
            />
          </div>
        </div>

        {/* Género */}
        <div className="auth-field">
          <label className="auth-field__label" htmlFor="reg-genero">
            Género
          </label>
          <select id="reg-genero" className="auth-field__select">
            {GENEROS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </div>

        {/* Contraseña */}
        <div className="auth-field">
          <label className="auth-field__label" htmlFor="reg-password">
            Contraseña
          </label>
          <input
            id="reg-password"
            className="auth-field__input"
            type="password"
            placeholder="Mínimo 8 caracteres"
            value={pw1}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            style={isMatch ? { borderColor: '#10b981', boxShadow: '0 0 0 1px #10b981' } : {}}
            required
            minLength={8}
          />
        </div>

        {/* Confirmar contraseña */}
        <div className="auth-field">
          <label className="auth-field__label" htmlFor="reg-password2">
            Confirmar contraseña
          </label>
          <input
            id="reg-password2"
            className="auth-field__input"
            type="password"
            placeholder="Repite tu contraseña"
            onPaste={(e) => e.preventDefault()}
            value={pw2}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            style={isMatch ? { borderColor: '#10b981', boxShadow: '0 0 0 1px #10b981' } : {}}
            required
          />
          {isMatch && (
            <p style={{ color: '#10b981', fontSize: '0.75rem', marginTop: '4px', fontWeight: 600 }}>
              ✓ Las contraseñas coinciden
            </p>
          )}
        </div>

        {/* Navigation */}
        <div className="auth-form__nav">
          <button className="auth-form__back" type="button" onClick={onBack} disabled={loading}>
            ← Atrás
          </button>
          <button className="auth-form__next" type="button" onClick={onNext} disabled={loading || (isLastStep && !isMatch)}>
            {loading ? "Registrando..." : isLastStep ? "Crear cuenta" : "Continuar →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Step 3: Empresa Data (only for empresas) ─────────────────────────────────
function StepDatosEmpresa({
  onBack,
  onSubmit,
}: {
  onBack: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="auth-step">
      <div className="auth-form" style={{ gap: "1rem" }}>
        {/* Razón social & NIT */}
        <div className="auth-form__row">
          <div className="auth-field">
            <label className="auth-field__label" htmlFor="reg-razon">
              Razón social
            </label>
            <input
              id="reg-razon"
              className="auth-field__input"
              type="text"
              placeholder="Mi Empresa S.A.S"
            />
          </div>
          <div className="auth-field">
            <label className="auth-field__label" htmlFor="reg-nit">
              NIT
            </label>
            <input
              id="reg-nit"
              className="auth-field__input"
              type="text"
              placeholder="900.123.456-7"
            />
          </div>
        </div>

        {/* Sector económico */}
        <div className="auth-field">
          <label className="auth-field__label" htmlFor="reg-sector">
            Sector económico
          </label>
          <select id="reg-sector" className="auth-field__select">
            {SECTORES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tamaño & Tipo */}
        <div className="auth-form__row">
          <div className="auth-field">
            <label className="auth-field__label" htmlFor="reg-tamano">
              Tamaño de empresa
            </label>
            <select id="reg-tamano" className="auth-field__select">
              {TAMANOS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="auth-field">
            <label className="auth-field__label" htmlFor="reg-tipo-emp">
              Tipo de empresa
            </label>
            <select id="reg-tipo-emp" className="auth-field__select">
              <option value="">Seleccionar...</option>
              <option value="publica">Pública</option>
              <option value="privada">Privada</option>
              <option value="mixta">Mixta</option>
              <option value="ong">ONG / Fundación</option>
            </select>
          </div>
        </div>

        {/* Ciudad */}
        <div className="auth-field">
          <label className="auth-field__label" htmlFor="reg-ciudad">
            Ciudad
          </label>
          <input
            id="reg-ciudad"
            className="auth-field__input"
            type="text"
            placeholder="Bogotá, Medellín, Cali..."
          />
        </div>

        {/* Navigation */}
        <div className="auth-form__nav">
          <button className="auth-form__back" type="button" onClick={onBack}>
            ← Atrás
          </button>
          <button className="auth-form__next" type="button" onClick={onSubmit}>
            Crear cuenta
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// MAIN REGISTRO PAGE
// ══════════════════════════════════════════════════════

export default function RegistroPage() {
  const [step, setStep] = useState(1);
  const [rol, setRol] = useState<RolType>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Form states
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nombre: "",
    telefono: "",
  });

  const email = formData.email;
  const password = formData.password;
  const nombre = formData.nombre;

  const supabase = createClient();


  const handleRegister = async () => {
    setLoading(true);
    setErrorMsg("");

    if (!supabase) {
      setErrorMsg("Error: Supabase no está configurado correctamente.");
      setLoading(false);
      return;
    }

    // 1. Auth Signup
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: nombre,
          role: rol,
          phone: formData.telefono,
        }
      }
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    // 2. Success! (Profile is created by DB Trigger)
    setLoading(false);
    window.location.href = "/login?registered=true";
  };

  const totalSteps = rol === "empresa" ? 3 : 2;
  const isLastPersonalStep = rol !== "empresa";

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = handleRegister;


  const subtitles: Record<number, string> = {
    1: "Selecciona el tipo de cuenta que deseas crear",
    2: "Completa tus datos personales para continuar",
    3: "Ingresa los datos de tu empresa",
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
      <div className="auth-card auth-card--wide">
        {/* Brand */}
        <div className="auth-card__brand">
          <span className="auth-card__logo">UCC</span>
          <span className="auth-card__brand-text">Portal del Egresado</span>
        </div>

        <h1 className="auth-card__title">Crear cuenta</h1>
        <p className="auth-card__subtitle">{subtitles[step]}</p>

        {errorMsg && (
          <div style={{ color: '#e53e3e', background: '#fff5f5', padding: '0.8rem', borderRadius: '8px', fontSize: '0.85rem', border: '1px solid #feb2b2', marginBottom: '1rem' }}>
            ⚠ {errorMsg}
          </div>
        )}

        {/* Stepper */}
        <Stepper step={step} rol={rol} />

        {/* Steps */}
        {step === 1 && (
          <StepRol rol={rol} onSelect={setRol} onNext={handleNext} />
        )}

        {step === 2 && (
          <StepDatosPersonales
            onBack={handleBack}
            onNext={isLastPersonalStep ? handleSubmit : handleNext}
            isLastStep={isLastPersonalStep}
            formData={formData}
            setFormData={setFormData}
            loading={loading}
          />
        )}

        {step === 3 && rol === "empresa" && (
          <StepDatosEmpresa onBack={handleBack} onSubmit={handleSubmit} />
        )}

        {/* Divider + link */}
        <div className="auth-divider" style={{ marginTop: "1rem" }}>
          <div className="auth-divider__line" />
          <span className="auth-divider__text">o</span>
          <div className="auth-divider__line" />
        </div>

        <p className="auth-card__link">
          ¿Ya tienes cuenta?{" "}
          <a href="/login">Ingresa aquí</a>
        </p>
      </div>
    </div>
  );
}
