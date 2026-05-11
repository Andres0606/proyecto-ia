"use client";

import { useState } from "react";
import "../css/Auth/auth.css";

// ── Icons ──────────────────────────────────────────────────────────────────
const Icons = {
  User: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Mail: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
  Phone: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  Id: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 21v-4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4"/><circle cx="12" cy="11" r="3"/><path d="M7 3h10"/></svg>,
  Lock: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  Check: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>,
  ArrowRight: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>,
  ArrowLeft: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>,
  GraduationCap: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
  Briefcase: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  Building: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01"/></svg>,
};

// ── Tipos ────────────────────────────────────────────────────────────────────
type RolType = "egresado" | "externo" | "empresa" | null;

const ROLES = [
  {
    id: "egresado" as RolType,
    icon: <Icons.GraduationCap />,
    iconClass: "auth-role-card__icon--egresado",
    title: "Egresado UCC",
    desc: "Accede a beneficios exclusivos para graduados de nuestra red UCC.",
    badge: "Gratuito",
  },
  {
    id: "externo" as RolType,
    icon: <Icons.Briefcase />,
    iconClass: "auth-role-card__icon--externo",
    title: "Usuario externo",
    desc: "Conéctate con las mejores oportunidades laborales del país.",
    badge: null,
  },
  {
    id: "empresa" as RolType,
    icon: <Icons.Building />,
    iconClass: "auth-role-card__icon--empresa",
    title: "Empresa",
    desc: "Encuentra el talento ideal para tus vacantes en nuestra comunidad.",
    badge: null,
  },
];

const SECTORES = [
  { value: "", label: "Seleccionar sector..." },
  { value: "tecnologia", label: "Tecnología e Innovación" },
  { value: "salud", label: "Salud y Medicina" },
  { value: "educacion", label: "Educación y Academia" },
  { value: "finanzas", label: "Finanzas y Banca" },
  { value: "construccion", label: "Construcción e Inmobiliaria" },
  { value: "comercio", label: "Comercio y Retail" },
  { value: "manufactura", label: "Manufactura e Industria" },
  { value: "servicios", label: "Servicios Profesionales" },
  { value: "gobierno", label: "Sector Público / Gobierno" },
  { value: "otro", label: "Otros Sectores" },
];

const TAMANOS = [
  { value: "", label: "Seleccionar tamaño..." },
  { value: "microempresa", label: "Microempresa (1-10 empleados)" },
  { value: "pequena", label: "Pequeña (11-50 empleados)" },
  { value: "mediana", label: "Mediana (51-200 empleados)" },
  { value: "grande", label: "Grande (+200 empleados)" },
];

// ── Stepper ──────────────────────────────────────────────────────────────────
function Stepper({ step, rol }: { step: number; rol: RolType }) {
  const steps =
    rol === "empresa"
      ? [
          { num: 1, label: "Cuenta" },
          { num: 2, label: "Perfil" },
          { num: 3, label: "Empresa" },
        ]
      : [
          { num: 1, label: "Cuenta" },
          { num: 2, label: "Perfil" },
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
              {step > s.num ? <Icons.Check /> : s.num}
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
  loading,
}: {
  rol: RolType;
  onSelect: (r: RolType) => void;
  onNext: () => void;
  loading: boolean;
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
        style={{ marginTop: "2rem" }}
        disabled={!rol || loading}
        onClick={onNext}
      >
        {loading ? "Cargando..." : "Continuar"} <Icons.ArrowRight />
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
  const isMatch = pw1.length >= 8 && pw1 === pw2;

  return (
    <div className="auth-step">
      <div className="auth-form">
        <div className="auth-field">
          <label className="auth-field__label">Nombre completo</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}><Icons.User /></span>
            <input
              className="auth-field__input"
              style={{ paddingLeft: '48px' }}
              type="text"
              placeholder="Juan Pérez"
              value={formData.nombre}
              onChange={(e) => {
                const val = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
                setFormData({ ...formData, nombre: val });
              }}
              required
            />
          </div>
        </div>

        <div className="auth-form__row">
          <div className="auth-field">
            <label className="auth-field__label">Correo electrónico</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}><Icons.Mail /></span>
              <input
                className="auth-field__input"
                style={{ paddingLeft: '48px' }}
                type="email"
                placeholder="juan@ejemplo.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="auth-field">
            <label className="auth-field__label">Teléfono</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: formData.telefono && !/^\d+$/.test(formData.telefono) ? '#ef4444' : '#94a3b8' }}><Icons.Phone /></span>
              <input
                className="auth-field__input"
                style={{ 
                  paddingLeft: '48px', 
                  borderColor: formData.telefono && !/^\d+$/.test(formData.telefono) ? '#ef4444' : '' 
                }}
                type="text"
                placeholder="Solo números"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                required
              />
            </div>
            {formData.telefono && !/^\d+$/.test(formData.telefono) && (
              <span style={{ color: '#ef4444', fontSize: '10px', fontWeight: '700', marginTop: '2px' }}>Formato inválido (solo números)</span>
            )}
          </div>
        </div>

        <div className="auth-form__row">
          <div className="auth-field">
            <label className="auth-field__label">Identificación (C.C.)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: formData.cedula && !/^\d+$/.test(formData.cedula) ? '#ef4444' : '#94a3b8' }}><Icons.Id /></span>
              <input
                className="auth-field__input"
                style={{ 
                  paddingLeft: '48px',
                  borderColor: formData.cedula && !/^\d+$/.test(formData.cedula) ? '#ef4444' : ''
                }}
                type="text"
                placeholder="Número de cédula"
                value={formData.cedula}
                onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                required
              />
            </div>
            {formData.cedula && !/^\d+$/.test(formData.cedula) && (
              <span style={{ color: '#ef4444', fontSize: '10px', fontWeight: '700', marginTop: '2px' }}>Formato inválido (solo números)</span>
            )}
          </div>
          <div className="auth-field">
            <label className="auth-field__label">Nacimiento</label>
            <input
              className="auth-field__input"
              type="date"
              value={formData.fecha_nacimiento}
              onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="auth-form__row">
          <div className="auth-field">
            <label className="auth-field__label">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}><Icons.Lock /></span>
              <input
                className="auth-field__input"
                style={{ 
                  paddingLeft: '48px',
                  borderColor: formData.password && !/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(formData.password) ? '#ef4444' : (formData.password ? '#10b981' : '')
                }}
                type="password"
                placeholder="Mayús, núm, especial"
                value={pw1}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            {formData.password && !/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(formData.password) && (
              <span style={{ color: '#ef4444', fontSize: '9px', fontWeight: '700', marginTop: '2px' }}>Requiere: Mayús, Núm y Especial (@$!...)</span>
            )}
          </div>
          <div className="auth-field">
            <label className="auth-field__label">Confirmar</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}><Icons.Lock /></span>
              <input
                className="auth-field__input"
                style={{ 
                  paddingLeft: '48px', 
                  borderColor: pw2 ? (isMatch ? '#10b981' : '#ef4444') : '' 
                }}
                type="password"
                placeholder="Repite contraseña"
                value={pw2}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>
            {pw2 && !isMatch && (
              <span style={{ color: '#ef4444', fontSize: '10px', fontWeight: '700', marginTop: '2px' }}>Las contraseñas no coinciden</span>
            )}
          </div>
        </div>

        <div className="auth-form__nav">
          <button className="auth-form__back" type="button" onClick={onBack} disabled={loading}>
            <Icons.ArrowLeft /> Atrás
          </button>
          <button className="auth-form__next" type="button" onClick={onNext} disabled={loading || (isLastStep && !isMatch)}>
            {loading ? "Procesando..." : isLastStep ? "Finalizar Registro" : "Continuar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Step 3: Empresa Data (only for empresas) ─────────────────────────────────
function StepDatosEmpresa({ onBack, onSubmit, formData, setFormData, loading }: any) {
  return (
    <div className="auth-step">
      <div className="auth-form">
        <div className="auth-form__row">
          <div className="auth-field">
            <label className="auth-field__label">Razón Social</label>
            <input
              className="auth-field__input"
              type="text"
              placeholder="Ej: Tech Solutions S.A.S"
              value={formData.razon_social}
              onChange={(e) => setFormData({ ...formData, razon_social: e.target.value })}
              required
            />
          </div>
          <div className="auth-field">
            <label className="auth-field__label">NIT</label>
            <input
              className="auth-field__input"
              type="text"
              placeholder="900.000.000-0"
              value={formData.nit}
              onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="auth-field">
          <label className="auth-field__label">Sector Económico</label>
          <select className="auth-field__select" value={formData.sector_economico} onChange={(e) => setFormData({ ...formData, sector_economico: e.target.value })}>
            {SECTORES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        <div className="auth-form__row">
          <div className="auth-field">
            <label className="auth-field__label">Tamaño</label>
            <select className="auth-field__select" value={formData.tamano_empresa} onChange={(e) => setFormData({ ...formData, tamano_empresa: e.target.value })}>
              {TAMANOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="auth-field">
            <label className="auth-field__label">Ubicación</label>
            <input
              className="auth-field__input"
              type="text"
              placeholder="Ciudad, País"
              value={formData.ciudad}
              onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="auth-form__nav">
          <button className="auth-form__back" type="button" onClick={onBack} disabled={loading}>
            <Icons.ArrowLeft /> Atrás
          </button>
          <button className="auth-form__next" type="button" onClick={onSubmit} disabled={loading}>
            {loading ? "Registrando..." : "Crear Empresa"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RegistroPage() {
  const [step, setStep] = useState(1);
  const [rol, setRol] = useState<RolType>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    email: "", password: "", confirmPassword: "", nombre: "", telefono: "", cedula: "", fecha_nacimiento: "", genero: "masculino",
    razon_social: "", nit: "", sector_economico: "", tamano_empresa: "", tipo_empresa: "privada", ciudad: "",
  });

  const validateFields = () => {
    if (formData.telefono.length < 7) {
      setErrorMsg("El teléfono debe tener al menos 7 dígitos.");
      return false;
    }
    if (formData.cedula.length < 5) {
      setErrorMsg("La identificación (C.C.) debe tener al menos 5 dígitos numéricos.");
      return false;
    }
    
    // Contraseña robusta: Mayúscula, Número, Carácter especial
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setErrorMsg("La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial.");
      return false;
    }
    return true;
  };

  const checkDuplicates = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
      const params = new URLSearchParams({
        email: formData.email,
        telefono: formData.telefono,
        cedula: formData.cedula
      });
      const res = await fetch(`${backendUrl}/api/users/check-duplicates?${params}`);
      const data = await res.json();
      
      if (data.success) {
        if (data.emailExists) return "Este correo electrónico ya está registrado.";
        if (data.telefonoExists) return "Este número de teléfono ya está registrado.";
        if (data.cedulaExists) return "Este número de cédula ya está registrado.";
      }
      return null;
    } catch (err) {
      console.error("Error checking duplicates:", err);
      return null;
    }
  };

  const handleRegister = async () => {
    if (!validateFields()) return;
    
    setLoading(true);
    setErrorMsg("");

    const duplicateError = await checkDuplicates();
    if (duplicateError) {
      setErrorMsg(duplicateError);
      setLoading(false);
      return;
    }

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
      const res = await fetch(`${backendUrl}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          nombre_completo: formData.nombre,
          telefono: formData.telefono,
          cedula: formData.cedula,
          fecha_nacimiento: formData.fecha_nacimiento,
          genero: formData.genero,
          rol_id: rol === "egresado" ? 1 : rol === "externo" ? 2 : 3,
          extraData: formData
        })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Error en el registro');
      window.location.href = "/login?registered=true";
    } catch (err: any) {
      setErrorMsg(err.message || "Error inesperado.");
      setLoading(false);
    }
  };

  const handleNextStep2 = async () => {
    if (!validateFields()) return;
    
    setLoading(true);
    setErrorMsg("");

    const duplicateError = await checkDuplicates();
    if (duplicateError) {
      setErrorMsg(duplicateError);
      setLoading(false);
      return;
    }

    setLoading(false);
    if (isLastPersonalStep) {
      handleRegister();
    } else {
      setStep(3);
    }
  };

  const totalSteps = rol === "empresa" ? 3 : 2;
  const isLastPersonalStep = rol !== "empresa";

  return (
    <div className="auth-page">
      <div className="auth-page__bg-grid" />
      <div className="auth-page__blob auth-page__blob--1" />
      <div className="auth-page__blob auth-page__blob--2" />
      <div className="auth-page__blob auth-page__blob--3" />

      <a href="/" className="auth-home-link">← Inicio</a>

      <div className="auth-card auth-card--wide">
        <div className="auth-card__brand">
          <span className="auth-card__logo">UCC</span>
          <span className="auth-card__brand-text">Portal del Egresado</span>
        </div>

        <h1 className="auth-card__title">Únete a la Red</h1>
        <p className="auth-card__subtitle">Empieza hoy tu camino profesional con nosotros</p>

        {errorMsg && <div className="auth-message auth-message--error">⚠️ {errorMsg}</div>}

        <Stepper step={step} rol={rol} />

        {step === 1 && <StepRol rol={rol} onSelect={setRol} onNext={() => setStep(2)} loading={loading} />}
        {step === 2 && (
          <StepDatosPersonales
            onBack={() => setStep(1)}
            onNext={handleNextStep2}
            isLastStep={isLastPersonalStep}
            formData={formData}
            setFormData={setFormData}
            loading={loading}
          />
        )}
        {step === 3 && rol === "empresa" && (
          <StepDatosEmpresa onBack={() => setStep(2)} onSubmit={handleRegister} formData={formData} setFormData={setFormData} loading={loading} />
        )}

        <div className="auth-divider">
          <div className="auth-divider__line" />
          <span className="auth-divider__text">o</span>
          <div className="auth-divider__line" />
        </div>

        <p className="auth-card__link">
          ¿Ya tienes una cuenta? <a href="/login">Inicia sesión</a>
        </p>
      </div>
    </div>
  );
}
