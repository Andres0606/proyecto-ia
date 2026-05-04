"use client";

import { useState, useEffect, useRef } from "react";
import Header from "../Components/header";
import Footer from "../Components/footer";
import "../css/Inicio/inicio.css";

// ── Datos ────────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: "🎯",
    title: "Ofertas a tu medida",
    desc: "Vacantes filtradas por tu programa académico, ciudad y nivel de experiencia.",
  },
  {
    icon: "📊",
    title: "Índice de estabilidad laboral",
    desc: "Diagnostica tu nivel de estabilidad laboral.",
  },
  {
    icon: "📄",
    title: "Hoja de vida segura",
    desc: "Sube tu CV en PDF con acceso mediante enlace firmado — solo las empresas autorizadas lo ven.",
  },
  {
    icon: "🔔",
    title: "Alertas de empleo",
    desc: "Recibe notificaciones cuando aparezcan vacantes que encajan con tu perfil.",
  },
  {
    icon: "🏢",
    title: "Red de empresas UCC",
    desc: "Accede a nuestra red de más de 540 empresas aliadas que priorizan egresados UCC.",
  },
  {
    icon: "📈",
    title: "Seguimiento de postulaciones",
    desc: "Visualiza el estado de cada aplicación en tiempo real desde tu dashboard.",
  },
];

const PASOS = [
  {
    num: "01",
    titulo: "Regístrate con tu código UCC",
    desc: "Verifica tu cuenta con tu correo institucional de egresado.",
  },
  {
    num: "02",
    titulo: "Completa tu perfil",
    desc: "Sube tu foto y tu hoja de vida en PDF de forma segura.",
  },
  {
    num: "03",
    titulo: "Explora ofertas",
    desc: "Filtra vacantes por área, ciudad y modalidad de trabajo.",
  },
  {
    num: "04",
    titulo: "Postúlate y haz seguimiento",
    desc: "Aplica con un clic y monitorea cada etapa del proceso.",
  },
];

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero() {
  const [scrollOp, setScrollOp] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const newOpacity = Math.max(1 - scrollY / 300, 0);
      setScrollOp(newOpacity);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="hero">
      <div className="hero__bg-grid" />
      <div className="hero__blob hero__blob--1" />
      <div className="hero__blob hero__blob--2" />
      <div className="hero__content hero__content--centered">
        <h1 className="hero__title" style={{ opacity: scrollOp, transition: 'opacity 0.1s' }}>
          Tu carrera profesional<br />
          <span className="hero__title-accent">empieza aquí.</span>
        </h1>
        <p className="hero__subtitle">
          Conectamos egresados de la Universidad Cooperativa de Colombia con las
          mejores oportunidades laborales del país. Mide tu estabilidad laboral,
          postúlate con seguridad y crece.
        </p>
        <div className="hero__actions">
          <a href="#registro" className="btn btn--red btn--lg">
            Comenzar ahora →
          </a>
          <a href="#como-funciona" className="btn btn--outline btn--lg">
            Ver cómo funciona
          </a>
        </div>
        <div className="hero__trust">
          <span>✓ Gratuito para egresados</span>
          <span>✓ Datos protegidos</span>
        </div>
      </div>
    </section>
  );
}

// ── Features ──────────────────────────────────────────────────────────────────
function Features() {
  return (
    <section className="features" id="funciones">
      <div className="section-header">
        <span className="section-tag">¿Qué ofrecemos?</span>
        <h2 className="section-title">
          Todo lo que necesitas para encontrar empleo
        </h2>
        <p className="section-sub">
          Herramientas diseñadas pensando en los egresados de la UCC.
        </p>
      </div>
      <div className="features__grid">
        {FEATURES.map((f) => (
          <div className="feature-card" key={f.title}>
            <span className="feature-card__icon">{f.icon}</span>
            <h3 className="feature-card__title">{f.title}</h3>
            <p className="feature-card__desc">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Cómo funciona ─────────────────────────────────────────────────────────────
function ComoFunciona() {
  return (
    <section className="pasos" id="como-funciona">
      <div className="pasos__bg" />
      <div className="section-header section-header--light">
        <span className="section-tag section-tag--light">Proceso simple</span>
        <h2 className="section-title section-title--light">¿Cómo funciona?</h2>
        <p className="section-sub section-sub--light">
          Empieza a buscar empleo en menos de 5 minutos.
        </p>
      </div>
      <div className="pasos__grid">
        {PASOS.map((p, i) => (
          <div className="paso-card" key={p.num}>
            <div className="paso-card__num">{p.num}</div>
            {i < PASOS.length - 1 && <div className="paso-card__line" />}
            <h3 className="paso-card__title">{p.titulo}</h3>
            <p className="paso-card__desc">{p.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Estabilidad laboral ───────────────────────────────────────────────────────
const GAUGE_TOTAL = 251;

function Gauge({ pct, label }: { pct: number; label: string }) {
  const offset = GAUGE_TOTAL * (1 - pct / 100);
  return (
    <div className="estabilidad__gauge">
      <svg viewBox="0 0 200 110" className="gauge-svg">
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#c8102e" />
            <stop offset="100%" stopColor="#003f88" />
          </linearGradient>
        </defs>
        <path
          d="M20,100 A80,80 0 0,1 180,100"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="16"
          strokeLinecap="round"
        />
        <path
          d="M20,100 A80,80 0 0,1 180,100"
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={GAUGE_TOTAL}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="gauge-value">{pct}%</div>
      <div className="gauge-label">{label}</div>
    </div>
  );
}

function EstabilidadSection() {
  const items = [
    { label: "Experiencia", pct: 85 },
    { label: "Formación", pct: 92 },
    { label: "Habilidades blandas", pct: 70 },
    { label: "Empleabilidad sectorial", pct: 65 },
  ];

  const promedio = Math.round(
    items.reduce((acc, i) => acc + i.pct, 0) / items.length
  );
  const nivelLabel =
    promedio >= 70
      ? "Estabilidad Alta"
      : promedio >= 45
      ? "Estabilidad Media"
      : "Estabilidad Baja";

  return (
    <section className="estabilidad">
      <div className="estabilidad__inner">
        <div className="estabilidad__content">
          <span className="section-tag">Funcionalidad exclusiva</span>
          <h2 className="section-title">Mide tu estabilidad laboral</h2>
          <p className="section-sub">
            Nuestro índice analiza tu experiencia, habilidades y sector para
            darte un diagnóstico real de tu posición en el mercado laboral
            colombiano.
          </p>
          <ul className="estabilidad__lista">
            <li>✓ Identifica brechas de habilidades</li>
            <li>✓ Recibe recomendaciones de empleabilidad</li>
            <li>✓ Actualización mensual del índice</li>
          </ul>
          <a href="#registro" className="btn btn--red btn--lg">
            Ver mi índice →
          </a>
        </div>
        <div className="estabilidad__visual">
          <div className="estabilidad__gauge-wrap">
            <Gauge pct={promedio} label={nivelLabel} />
          </div>
        </div>
      </div>
    </section>
  );
}

// ── CTA Final ─────────────────────────────────────────────────────────────────
function CTAFinal() {
  return (
    <section className="cta-final" id="registro">
      <div className="cta-final__blob" />
      <div className="cta-final__content">
        <h2 className="cta-final__title">¿Listo para dar el siguiente paso?</h2>
        <p className="cta-final__sub">
          Únete a más de 12.000 egresados UCC que ya están usando el portal
          para avanzar en su carrera.
        </p>
        <div className="cta-final__form">
          <input
            type="email"
            placeholder="tucorreo@ucc.edu.co"
            className="cta-final__input"
          />
          <button className="btn btn--red btn--lg">Crear cuenta gratis</button>
        </div>
        <p className="cta-final__note">
          Solo para egresados con correo institucional UCC.
        </p>
      </div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function InicioPage() {
  return (
    <div className="page-root">
      <Header />
      <Hero />
      <Features />
      <ComoFunciona />
      <EstabilidadSection />
      <CTAFinal />
      <Footer />
    </div>
  );
}