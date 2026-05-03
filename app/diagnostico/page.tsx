"use client";

import { useState } from "react";
import Header from "../Components/header";
import Footer from "../Components/footer";
import "../css/Diagnostico/diagnostico.css";

// ── Tipos ────────────────────────────────────────────────────────────────────
interface FormData {
  Programa: string;
  Genero: string;
  Edad: string;
  Estrato: string;
  EstadoCivil: string;
  Hijos: string;
  Formacion: string;
  Emprendimiento: string;
  TipoOrg: string;
  Area: string;
  Tamano: string;
  Sector: string;
  Ingreso: string;
}

interface ResultadoAPI {
  estabilidad?: number;
  resultado_estabilidad?: number;
  Larga?: number;
  Corta?: number;
  nivel?: string;
  mensaje?: string;
  prediction?: string | number;
  [key: string]: unknown;
}

const INITIAL: FormData = {
  Programa: "",
  Genero: "",
  Edad: "",
  Estrato: "",
  EstadoCivil: "",
  Hijos: "",
  Formacion: "",
  Emprendimiento: "",
  TipoOrg: "",
  Area: "",
  Tamano: "",
  Sector: "",
  Ingreso: "",
};

// ── Opciones de los campos ──────────────────────────────────────────────────
const OPTIONS = {
  Programa: [
    "Derecho", "Contaduria Publica", "Ingenieria Civil", "Ciencias Economicas",
    "Medicina", "Psicologia", "Odontologia", "Enfermeria", "Ingenieria de Sistemas",
    "Medicina Veterinaria y Zootecnia", "Especializacion", "Tecnico Auxiliar en Enfermeria"
  ],
  Genero: ["M", "F"],
  Edad: [
    { val: "1", label: "21 - 25" }, { val: "2", label: "26 - 30" }, { val: "3", label: "31 - 35" },
    { val: "4", label: "36 - 40" }, { val: "5", label: "41 - 45" }, { val: "6", label: "46 - 50" },
    { val: "7", label: "51 - 55" }, { val: "8", label: "56 - 60" }, { val: "9", label: "61 - 69" }
  ],
  Estrato: ["Uno", "Dos", "Tres", "Cuatro", "Cinco", "Seis"],
  EstadoCivil: ["Casado", "Union libre", "Soltero", "Separado", "Viudo"],
  Hijos: ["Cero", "Uno", "Dos", "Tres", "Cuatro", "Cinco"],
  Formacion: ["Profesional", "Especialista", "Magister", "Doctorado", "Tecnico Profesional"],
  Emprendimiento: ["Si", "No"],
  TipoOrg: ["Privada", "Publica", "Solidaria", "Trabaja Independiente"],
  Area: [
    "Servicios", "Administrativa", "Salud", "Financiera", "Industrial",
    "Economica", "Gestion Humana", "Educacion", "Comercial", "Contable", "Sistemas"
  ],
  Tamano: [
    "10 o menos empleados", "11 y 50 empleados", "51 y 200 empleados", "Mas de 200 empleados"
  ],
  Sector: ["Servicios", "Comercial", "Industrial"],
  Ingreso: ["1 SML o menos", "2-3 SML", "3-5 SML", "5 SML o mas"]
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const CIRCUMFERENCE = 2 * Math.PI * 44;

function getPredictionData(res: ResultadoAPI) {
  // Si la API devuelve ambas probabilidades Corta y Larga
  if (res.Corta !== undefined && res.Larga !== undefined) {
    const c = res.Corta <= 1 ? res.Corta * 100 : res.Corta;
    const l = res.Larga <= 1 ? res.Larga * 100 : res.Larga;
    
    const details = { corta: c.toFixed(2), larga: l.toFixed(2) };

    if (l >= c) {
      return { score: Math.round(l), cssClass: "alta", label: "Estabilidad Larga", tipsKey: "alta" as const, details };
    } else {
      return { score: Math.round(c), cssClass: "baja", label: "Estabilidad Corta", tipsKey: "baja" as const, details };
    }
  }

  // Fallback si no tiene el formato Corta/Larga
  const raw = res.estabilidad ?? res.resultado_estabilidad ?? res.prediction ?? res.Larga ?? null;
  const num = raw === null ? 0 : (typeof raw === "string" ? parseFloat(raw) : raw);
  const score = num <= 1 ? Math.round(num * 100) : Math.round(num);
  
  if (score >= 70) return { score, cssClass: "alta", label: "Estabilidad Alta", tipsKey: "alta" as const, details: null };
  if (score >= 40) return { score, cssClass: "media", label: "Estabilidad Media", tipsKey: "media" as const, details: null };
  return { score, cssClass: "baja", label: "Estabilidad Baja", tipsKey: "baja" as const, details: null };
}

const NIVEL_TIPS: Record<"alta" | "media" | "baja", { icon: string; iconClass: string; title: string; desc: string }[]> = {
  alta: [
    { icon: "✓", iconClass: "diag-result__row-icon--green", title: "Perfil sólido", desc: "Tu combinación de formación, experiencia y sector te posiciona con una probabilidad alta de estabilidad prolongada." },
    { icon: "→", iconClass: "diag-result__row-icon--blue", title: "Siguiente paso", desc: "Considera certificaciones avanzadas o roles de mayor responsabilidad para seguir creciendo." },
  ],
  media: [
    { icon: "!", iconClass: "diag-result__row-icon--yellow", title: "Potencial de mejora", desc: "Hay áreas en tu perfil que puedes fortalecer para aumentar tu empleabilidad a largo plazo." },
    { icon: "→", iconClass: "diag-result__row-icon--blue", title: "Recomendación", desc: "Enfócate en actualizar habilidades técnicas y ampliar tu red profesional en el sector." },
  ],
  baja: [
    { icon: "!", iconClass: "diag-result__row-icon--red", title: "Atención requerida", desc: "Tu perfil actual tiene una tendencia a la rotación o estabilidad a corto plazo frente a las demandas del mercado." },
    { icon: "→", iconClass: "diag-result__row-icon--blue", title: "Plan de acción", desc: "Te recomendamos revisar tu formación, explorar nuevas áreas y considerar programas de actualización." },
  ],
};

// ── Componentes ───────────────────────────────────────────────────────────────
function PillGroup({ label, options, value, onChange }: { label: string; options: (string | { val: string; label: string })[]; value: string; onChange: (val: string) => void }) {
  return (
    <div className="diag-field">
      <label className="diag-field__label">{label}</label>
      <div className="diag-pills">
        {options.map((opt) => {
          const val = typeof opt === "string" ? opt : opt.val;
          const text = typeof opt === "string" ? opt : opt.label;
          return (
            <button
              key={val}
              type="button"
              className={`diag-pill ${value === val ? "diag-pill--active" : ""}`}
              onClick={() => onChange(val)}
            >
              {text}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ResultCard({ resultado }: { resultado: ResultadoAPI }) {
  const { score, cssClass, label, tipsKey, details } = getPredictionData(resultado);
  const dashoffset = CIRCUMFERENCE * (1 - score / 100);

  return (
    <div className="diag-result">
      <div className="diag-result__header">
        <div>
          <div className="diag-result__title">Resultado de tu diagnóstico</div>
          <div className="diag-result__subtitle">Calculado por el modelo de IA de estabilidad laboral UCC</div>
        </div>
      </div>
      <div className="diag-result__body">
        <div className="diag-score">
          <div className="diag-score__ring">
            <svg className="diag-score__svg" viewBox="0 0 100 100">
              <circle className="diag-score__track" cx="50" cy="50" r="44" />
              <circle
                className={`diag-score__fill diag-score__fill--${cssClass}`}
                cx="50" cy="50" r="44"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={dashoffset}
              />
            </svg>
            <div className="diag-score__number">{score}<small>% Confianza</small></div>
          </div>
          <span className={`diag-score__label diag-score__label--${cssClass}`}>{label}</span>
          
          {details && (
            <div className="diag-score__details" style={{ marginTop: '14px', fontSize: '0.85rem', fontWeight: 600, color: '#475569', background: '#f1f5f9', padding: '8px 16px', borderRadius: '50px', letterSpacing: '0.5px' }}>
              <span style={{ color: '#15803d' }}>Larga: {details.larga}%</span> <span style={{ margin: '0 8px', color: '#cbd5e1' }}>|</span> <span style={{ color: '#b91c1c' }}>Corta: {details.corta}%</span>
            </div>
          )}
        </div>
        <div className="diag-result__info">
          {NIVEL_TIPS[tipsKey].map((tip, i) => (
            <div className="diag-result__row" key={i}>
              <div className={`diag-result__row-icon ${tip.iconClass}`}>{tip.icon}</div>
              <div className="diag-result__row-text"><strong>{tip.title}</strong><p>{tip.desc}</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DiagnosticoPage() {
  const [form, setForm] = useState<FormData>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<ResultadoAPI | null>(null);
  const [error, setError] = useState<string | null>(null);

  const update = (k: keyof FormData, val: string) => setForm(f => ({ ...f, [k]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validar que todo esté lleno
    const incomplete = Object.values(form).some(v => v === "");
    if (incomplete) {
      setError("Por favor completa todos los campos antes de predecir.");
      return;
    }

    setLoading(true);
    setResultado(null);
    setError(null);

    try {
      const res = await fetch("/api/diagnostico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) setError(data.error ?? `Error ${res.status}`);
      else {
        setResultado(data);
        setTimeout(() => document.getElementById("diag-result")?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="diag-page">
      <Header />
      <section className="diag-hero">
        <div className="diag-hero__grid" />
        <div className="diag-hero__blob diag-hero__blob--1" />
        <div className="diag-hero__blob diag-hero__blob--2" />
        <div className="diag-hero__content">
          <span className="diag-hero__badge">Modelo de IA · UCC</span>
          <h1 className="diag-hero__title">Diagnóstico de<br /><span className="diag-hero__accent">estabilidad laboral</span></h1>
          <p className="diag-hero__sub">Selecciona las opciones que mejor describen tu perfil profesional para obtener tu predicción.</p>
        </div>
      </section>

      <section className="diag-form-section">
        <div className="diag-form-wrap">
          <form onSubmit={handleSubmit}>
            {/* ── Card 1: Perfil Personal ── */}
            <div className="diag-card">
              <div className="diag-card__header">
                <div className="diag-card__step-dot">1</div>
                <div className="diag-card__header-text"><h3>Perfil Personal</h3><p>Información básica sociodemográfica</p></div>
              </div>
              <div className="diag-card__body">
                <PillGroup label="Programa" options={OPTIONS.Programa} value={form.Programa} onChange={(v) => update("Programa", v)} />
                <PillGroup label="Género" options={OPTIONS.Genero} value={form.Genero} onChange={(v) => update("Genero", v)} />
                <PillGroup label="Edad" options={OPTIONS.Edad} value={form.Edad} onChange={(v) => update("Edad", v)} />
                <PillGroup label="Estrato" options={OPTIONS.Estrato} value={form.Estrato} onChange={(v) => update("Estrato", v)} />
                <PillGroup label="Estado Civil" options={OPTIONS.EstadoCivil} value={form.EstadoCivil} onChange={(v) => update("EstadoCivil", v)} />
                <PillGroup label="Número de Hijos" options={OPTIONS.Hijos} value={form.Hijos} onChange={(v) => update("Hijos", v)} />
              </div>
            </div>

            {/* ── Card 2: Formación y Emprendimiento ── */}
            <div className="diag-card">
              <div className="diag-card__header">
                <div className="diag-card__step-dot">2</div>
                <div className="diag-card__header-text"><h3>Formación y Emprendimiento</h3><p>Nivel educativo y proyectos personales</p></div>
              </div>
              <div className="diag-card__body">
                <PillGroup label="Nivel de Formación" options={OPTIONS.Formacion} value={form.Formacion} onChange={(v) => update("Formacion", v)} />
                <PillGroup label="¿Tienes Emprendimiento?" options={OPTIONS.Emprendimiento} value={form.Emprendimiento} onChange={(v) => update("Emprendimiento", v)} />
              </div>
            </div>

            {/* ── Card 3: Entorno Laboral ── */}
            <div className="diag-card">
              <div className="diag-card__header">
                <div className="diag-card__step-dot">3</div>
                <div className="diag-card__header-text"><h3>Entorno Laboral</h3><p>Detalles sobre tu situación laboral actual</p></div>
              </div>
              <div className="diag-card__body">
                <PillGroup label="Tipo de Organización" options={OPTIONS.TipoOrg} value={form.TipoOrg} onChange={(v) => update("TipoOrg", v)} />
                <PillGroup label="Área" options={OPTIONS.Area} value={form.Area} onChange={(v) => update("Area", v)} />
                <PillGroup label="Tamaño de Organización" options={OPTIONS.Tamano} value={form.Tamano} onChange={(v) => update("Tamano", v)} />
                <PillGroup label="Sector" options={OPTIONS.Sector} value={form.Sector} onChange={(v) => update("Sector", v)} />
                <PillGroup label="Rango de Ingreso" options={OPTIONS.Ingreso} value={form.Ingreso} onChange={(v) => update("Ingreso", v)} />
              </div>

              <div className="diag-submit-wrap">
                <span className="diag-submit-wrap__hint">Asegúrate de responder todos los campos.</span>
                <button type="submit" className="diag-submit" disabled={loading}>
                  {loading ? <><span className="diag-submit__spinner" />Calculando...</> : "Predecir Estabilidad"}
                </button>
              </div>
            </div>
          </form>

          {error && <div className="diag-error"><strong>Atención:</strong> {error}</div>}
          {resultado && <div id="diag-result"><ResultCard resultado={resultado} /></div>}
        </div>
      </section>
      <Footer />
    </div>
  );
}
