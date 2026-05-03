"use client";

import { useState } from "react";
import Header from "../Components/header";
import Footer from "../Components/footer";
import "../css/Diagnostico/diagnostico.css";

// ── Tipos ────────────────────────────────────────────────────────────────────
interface FormData {
  nivel_formacion: string;
  programa_academico: string;
  sector_economico: string;
  area_desempeno: string;
  estrato: string;
  estado_civil: string;
  numero_hijos: string;
  ingreso_mensual: string;
  emprendimiento: string;
}

interface ResultadoAPI {
  estabilidad?: number;
  resultado_estabilidad?: number;
  nivel?: string;
  mensaje?: string;
  [key: string]: unknown;
}

const INITIAL: FormData = {
  nivel_formacion: "",
  programa_academico: "",
  sector_economico: "",
  area_desempeno: "",
  estrato: "",
  estado_civil: "",
  numero_hijos: "",
  ingreso_mensual: "",
  emprendimiento: "",
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const CIRCUMFERENCE = 2 * Math.PI * 44; // radio 44 en SVG 100x100

function getScore(res: ResultadoAPI): number {
  const raw = res.estabilidad ?? res.resultado_estabilidad ?? null;
  if (raw === null) return 0;
  // Si viene en escala 0-1 lo convertimos a 0-100
  return raw <= 1 ? Math.round(raw * 100) : Math.round(raw);
}

function getNivel(score: number): "alta" | "media" | "baja" {
  if (score >= 70) return "alta";
  if (score >= 45) return "media";
  return "baja";
}

const NIVEL_LABELS = {
  alta: "Estabilidad Alta",
  media: "Estabilidad Media",
  baja: "Estabilidad Baja",
};

const NIVEL_TIPS: Record<"alta" | "media" | "baja", { icon: string; iconClass: string; title: string; desc: string }[]> = {
  alta: [
    { icon: "✓", iconClass: "diag-result__row-icon--green", title: "Perfil sólido", desc: "Tu combinación de formación, experiencia y sector te posiciona muy bien en el mercado." },
    { icon: "→", iconClass: "diag-result__row-icon--blue", title: "Siguiente paso", desc: "Considera certificaciones avanzadas o roles de mayor responsabilidad para seguir creciendo." },
  ],
  media: [
    { icon: "!", iconClass: "diag-result__row-icon--yellow", title: "Potencial de mejora", desc: "Hay áreas en tu perfil que puedes fortalecer para aumentar tu empleabilidad." },
    { icon: "→", iconClass: "diag-result__row-icon--blue", title: "Recomendación", desc: "Enfócate en actualizar habilidades técnicas y ampliar tu red profesional en el sector." },
  ],
  baja: [
    { icon: "!", iconClass: "diag-result__row-icon--red", title: "Atención requerida", desc: "Tu perfil actual presenta brechas importantes frente a las demandas del mercado laboral." },
    { icon: "→", iconClass: "diag-result__row-icon--blue", title: "Plan de acción", desc: "Te recomendamos revisar tu formación, explorar nuevas áreas y considerar programas de actualización." },
  ],
};

// ── Componente de resultado ───────────────────────────────────────────────────
function ResultCard({ resultado }: { resultado: ResultadoAPI }) {
  const score = getScore(resultado);
  const nivel = getNivel(score);
  const dashoffset = CIRCUMFERENCE * (1 - score / 100);

  return (
    <div className="diag-result">
      <div className="diag-result__header">
        <div>
          <div className="diag-result__title">Resultado de tu diagnóstico</div>
          <div className="diag-result__subtitle">
            Calculado por el modelo de IA de estabilidad laboral UCC
          </div>
        </div>
      </div>

      <div className="diag-result__body">
        {/* Score ring */}
        <div className="diag-score">
          <div className="diag-score__ring">
            <svg className="diag-score__svg" viewBox="0 0 100 100">
              <circle className="diag-score__track" cx="50" cy="50" r="44" />
              <circle
                className={`diag-score__fill diag-score__fill--${nivel}`}
                cx="50" cy="50" r="44"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={dashoffset}
              />
            </svg>
            <div className="diag-score__number">
              {score}
              <small>/ 100</small>
            </div>
          </div>
          <span className={`diag-score__label diag-score__label--${nivel}`}>
            {NIVEL_LABELS[nivel]}
          </span>
        </div>

        {/* Info rows */}
        <div className="diag-result__info">
          {NIVEL_TIPS[nivel].map((tip, i) => (
            <div className="diag-result__row" key={i}>
              <div className={`diag-result__row-icon ${tip.iconClass}`}>
                {tip.icon}
              </div>
              <div className="diag-result__row-text">
                <strong>{tip.title}</strong>
                <p>{tip.desc}</p>
              </div>
            </div>
          ))}
          {resultado.mensaje && (
            <div className="diag-result__row">
              <div className="diag-result__row-icon diag-result__row-icon--blue">i</div>
              <div className="diag-result__row-text">
                <strong>Nota del modelo</strong>
                <p>{resultado.mensaje}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page principal ────────────────────────────────────────────────────────────
export default function DiagnosticoPage() {
  const [form, setForm] = useState<FormData>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<ResultadoAPI | null>(null);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResultado(null);
    setError(null);

    try {
      const payload = {
        ...form,
        estrato: Number(form.estrato),
        numero_hijos: Number(form.numero_hijos),
        ingreso_mensual: Number(form.ingreso_mensual),
        emprendimiento: form.emprendimiento === "true",
      };

      const res = await fetch("/api/diagnostico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? `Error ${res.status}`);
      } else {
        setResultado(data);
        // Scroll al resultado
        setTimeout(() =>
          document.getElementById("diag-result")?.scrollIntoView({ behavior: "smooth" }),
          100
        );
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="diag-page">
      <Header />

      {/* Hero */}
      <section className="diag-hero">
        <div className="diag-hero__grid" />
        <div className="diag-hero__blob diag-hero__blob--1" />
        <div className="diag-hero__blob diag-hero__blob--2" />
        <div className="diag-hero__content">
          <span className="diag-hero__badge">Modelo de IA · UCC</span>
          <h1 className="diag-hero__title">
            Diagnóstico de
            <br />
            <span className="diag-hero__accent">estabilidad laboral</span>
          </h1>
          <p className="diag-hero__sub">
            Completa el formulario con tu información profesional y nuestro
            modelo de inteligencia artificial calculará tu índice de
            estabilidad laboral en segundos.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="diag-form-section">
        <div className="diag-form-wrap">
          <form onSubmit={handleSubmit}>

            {/* ── Card 1: Formación ── */}
            <div className="diag-card" style={{ marginBottom: "1.5rem" }}>
              <div className="diag-card__header">
                <div className="diag-card__step-dot">1</div>
                <div className="diag-card__header-text">
                  <h3>Formación académica</h3>
                  <p>Datos sobre tu nivel educativo y programa</p>
                </div>
              </div>
              <div className="diag-card__body">
                <div className="diag-grid">
                  <div className="diag-field">
                    <label className="diag-field__label" htmlFor="nivel_formacion">
                      Nivel de formación
                    </label>
                    <select
                      id="nivel_formacion"
                      className="diag-field__select"
                      value={form.nivel_formacion}
                      onChange={set("nivel_formacion")}
                      required
                    >
                      <option value="">Seleccionar...</option>
                      <option value="tecnico">Técnico</option>
                      <option value="tecnologico">Tecnológico</option>
                      <option value="profesional">Profesional</option>
                      <option value="especializacion">Especialización</option>
                      <option value="maestria">Maestría</option>
                      <option value="doctorado">Doctorado</option>
                    </select>
                  </div>

                  <div className="diag-field">
                    <label className="diag-field__label" htmlFor="programa_academico">
                      Programa académico
                    </label>
                    <input
                      id="programa_academico"
                      className="diag-field__input"
                      type="text"
                      placeholder="Ej: Ingeniería de Sistemas"
                      value={form.programa_academico}
                      onChange={set("programa_academico")}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Card 2: Información laboral ── */}
            <div className="diag-card" style={{ marginBottom: "1.5rem" }}>
              <div className="diag-card__header">
                <div className="diag-card__step-dot">2</div>
                <div className="diag-card__header-text">
                  <h3>Información laboral</h3>
                  <p>Tu sector y área de desempeño actual o más reciente</p>
                </div>
              </div>
              <div className="diag-card__body">
                <div className="diag-grid">
                  <div className="diag-field">
                    <label className="diag-field__label" htmlFor="sector_economico">
                      Sector económico
                    </label>
                    <select
                      id="sector_economico"
                      className="diag-field__select"
                      value={form.sector_economico}
                      onChange={set("sector_economico")}
                      required
                    >
                      <option value="">Seleccionar...</option>
                      <option value="tecnologia">Tecnología</option>
                      <option value="salud">Salud</option>
                      <option value="educacion">Educación</option>
                      <option value="finanzas">Finanzas y Banca</option>
                      <option value="construccion">Construcción</option>
                      <option value="comercio">Comercio</option>
                      <option value="manufactura">Manufactura</option>
                      <option value="servicios">Servicios</option>
                      <option value="gobierno">Gobierno</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>

                  <div className="diag-field">
                    <label className="diag-field__label" htmlFor="area_desempeno">
                      Área de desempeño
                    </label>
                    <input
                      id="area_desempeno"
                      className="diag-field__input"
                      type="text"
                      placeholder="Ej: Desarrollo de software"
                      value={form.area_desempeno}
                      onChange={set("area_desempeno")}
                      required
                    />
                  </div>

                  <div className="diag-field">
                    <label className="diag-field__label" htmlFor="ingreso_mensual">
                      Ingreso mensual (COP)
                    </label>
                    <input
                      id="ingreso_mensual"
                      className="diag-field__input"
                      type="number"
                      placeholder="Ej: 3000000"
                      min="0"
                      value={form.ingreso_mensual}
                      onChange={set("ingreso_mensual")}
                      required
                    />
                  </div>

                  <div className="diag-field">
                    <label className="diag-field__label" htmlFor="emprendimiento">
                      ¿Tienes emprendimiento?
                    </label>
                    <select
                      id="emprendimiento"
                      className="diag-field__select"
                      value={form.emprendimiento}
                      onChange={set("emprendimiento")}
                      required
                    >
                      <option value="">Seleccionar...</option>
                      <option value="true">Sí</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Card 3: Datos personales ── */}
            <div className="diag-card">
              <div className="diag-card__header">
                <div className="diag-card__step-dot">3</div>
                <div className="diag-card__header-text">
                  <h3>Datos personales</h3>
                  <p>Contexto socioeconómico para el análisis</p>
                </div>
              </div>
              <div className="diag-card__body">
                <div className="diag-grid diag-grid--3">
                  <div className="diag-field">
                    <label className="diag-field__label" htmlFor="estrato">
                      Estrato
                    </label>
                    <select
                      id="estrato"
                      className="diag-field__select"
                      value={form.estrato}
                      onChange={set("estrato")}
                      required
                    >
                      <option value="">Selec...</option>
                      {[1,2,3,4,5,6].map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>

                  <div className="diag-field">
                    <label className="diag-field__label" htmlFor="estado_civil">
                      Estado civil
                    </label>
                    <select
                      id="estado_civil"
                      className="diag-field__select"
                      value={form.estado_civil}
                      onChange={set("estado_civil")}
                      required
                    >
                      <option value="">Selec...</option>
                      <option value="soltero">Soltero/a</option>
                      <option value="casado">Casado/a</option>
                      <option value="union_libre">Unión libre</option>
                      <option value="divorciado">Divorciado/a</option>
                      <option value="viudo">Viudo/a</option>
                    </select>
                  </div>

                  <div className="diag-field">
                    <label className="diag-field__label" htmlFor="numero_hijos">
                      Número de hijos
                    </label>
                    <input
                      id="numero_hijos"
                      className="diag-field__input"
                      type="number"
                      placeholder="0"
                      min="0"
                      max="20"
                      value={form.numero_hijos}
                      onChange={set("numero_hijos")}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="diag-submit-wrap">
                <button
                  type="submit"
                  className="diag-submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="diag-submit__spinner" />
                      Calculando...
                    </>
                  ) : (
                    "Calcular mi índice"
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Error */}
          {error && (
            <div className="diag-error" style={{ marginTop: "1.5rem" }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Resultado */}
          {resultado && (
            <div id="diag-result">
              <ResultCard resultado={resultado} />
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
