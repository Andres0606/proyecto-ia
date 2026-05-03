"use client";

import { useState, useEffect, useRef } from "react";
import "../css/Inicio/inicio.css";

// ── Datos ────────────────────────────────────────────────────────────────────
const STATS = [
  { value: 12480, label: "Egresados registrados", suffix: "+" },
  { value: 3200, label: "Ofertas publicadas", suffix: "+" },
  { value: 87, label: "Tasa de empleabilidad", suffix: "%" },
  { value: 540, label: "Empresas aliadas", suffix: "+" },
];

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

const TESTIMONIOS = [
  {
    nombre: "Laura Martínez",
    programa: "Ing. de Sistemas · Sede Bogotá",
    texto:
      "En menos de 3 semanas encontré trabajo en una empresa tech gracias al portal. El índice de empleabilidad me ayudó a saber qué mejorar.",
    avatar: "LM",
  },
  {
    nombre: "Carlos Herrera",
    programa: "Administración de Empresas · Sede Medellín",
    texto:
      "Las alertas de empleo son un golazo. Me llegó la oferta perfecta sin tener que buscar todos los días.",
    avatar: "CH",
  },
  {
    nombre: "Valentina Ríos",
    programa: "Psicología · Sede Cali",
    texto:
      "Me encanta que la hoja de vida solo la ven las empresas donde apliqué. Mucha más privacidad que otras plataformas.",
    avatar: "VR",
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

// ── Contador animado ──────────────────────────────────────────────────────────
function AnimatedCounter({
  target,
  suffix,
}: {
  target: number;
  suffix: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1800;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {count.toLocaleString("es-CO")}
      {suffix}
    </span>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
      <div className="navbar__inner">
        <div className="navbar__brand">
          <span className="navbar__logo-box">UCC</span>
          <span className="navbar__brand-text">Portal del Egresado</span>
        </div>
        <ul
          className={`navbar__links ${menuOpen ? "navbar__links--open" : ""}`}
        >
          <li>
            <a href="#funciones">Funciones</a>
          </li>
          <li>
            <a href="#como-funciona">¿Cómo funciona?</a>
          </li>
          <li>
            <a href="#testimonios">Testimonios</a>
          </li>
          <li>
            <a href="#estadisticas">Estadísticas</a>
          </li>
        </ul>
        <div className="navbar__cta">
          <a href="#registro" className="btn btn--ghost">
            Ingresar
          </a>
          <a href="#registro" className="btn btn--red">
            Registrarse
          </a>
        </div>
        <button
          className="navbar__hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  );
}

// ── Hero (centrado, sin panel visual) ─────────────────────────────────────────
function Hero() {
  return (
    <section className="hero">
      <div className="hero__bg-grid" />
      <div className="hero__blob hero__blob--1" />
      <div className="hero__blob hero__blob--2" />
      <div className="hero__content hero__content--centered">
        <h1 className="hero__title">
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

// ── Stats ─────────────────────────────────────────────────────────────────────
function Stats() {
  return (
    <section className="stats" id="estadisticas">
      <div className="stats__inner">
        {STATS.map((s) => (
          <div className="stats__item" key={s.label}>
            <div className="stats__value">
              <AnimatedCounter target={s.value} suffix={s.suffix} />
            </div>
            <div className="stats__label">{s.label}</div>
          </div>
        ))}
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
// El arco SVG tiene una longitud total de ~251px (semicírculo r=80).
// strokeDashoffset = 251 * (1 - pct/100) recorta desde la derecha.
// Para "Larga" usamos pct alto (~78), para "Corta" usamos pct bajo (~25).
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
        {/* Track */}
        <path
          d="M20,100 A80,80 0 0,1 180,100"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="16"
          strokeLinecap="round"
        />
        {/* Fill */}
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

  // Promedio de los ítems para el gauge
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

// ── Testimonios ───────────────────────────────────────────────────────────────
function Testimonios() {
  return (
    <section className="testimonios" id="testimonios">
      <div className="section-header">
        <span className="section-tag">Lo que dicen nuestros egresados</span>
        <h2 className="section-title">Historias reales de éxito</h2>
      </div>
      <div className="testimonios__grid">
        {TESTIMONIOS.map((t) => (
          <div className="testimonio-card" key={t.nombre}>
            <p className="testimonio-card__texto">"{t.texto}"</p>
            <div className="testimonio-card__autor">
              <div className="testimonio-card__avatar">{t.avatar}</div>
              <div>
                <div className="testimonio-card__nombre">{t.nombre}</div>
                <div className="testimonio-card__prog">{t.programa}</div>
              </div>
            </div>
          </div>
        ))}
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

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <span className="navbar__logo-box">UCC</span>
          <span>Portal del Egresado · Universidad Cooperativa de Colombia</span>
        </div>
        <div className="footer__links">
          <a href="#">Política de privacidad</a>
          <a href="#">Términos de uso</a>
          <a href="#">Soporte</a>
          <a href="#">Contacto</a>
        </div>
        <p className="footer__copy">
          © 2025 Universidad Cooperativa de Colombia. Todos los derechos
          reservados.
        </p>
      </div>
    </footer>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function InicioPage() {
  return (
    <div className="page-root">
      <Navbar />
      <Hero />
      <Features />
      <ComoFunciona />
      <EstabilidadSection />
      <CTAFinal />
      <Footer />
    </div>
  );
}