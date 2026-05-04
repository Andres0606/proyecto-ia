"use client";

import { useState, useMemo, useEffect } from "react";
import Header from "../Components/header";
import Footer from "../Components/footer";
import "../css/Bolsa_Empleo/Bolsa.css";

// ── Tipos ──────────────────────────────────────────────
interface Job {
  id: number;
  role: string;
  company: string;
  logo: string;
  area: string;
  mode: "Presencial" | "Remoto" | "Híbrido";
  exp: "Sin exp." | "1-3 años" | "3+ años";
  city: string;
  salaryMin: number;
  salaryLabel: string;
  desc: string;
  posted: string;
  featured: boolean;
  tags: string[];
}

// ── Datos ──────────────────────────────────────────────
const ALL_JOBS: Job[] = [
  {
    id: 1,
    role: "Desarrollador Full Stack",
    company: "TechColombia S.A.S",
    logo: "TC",
    area: "Ingeniería",
    mode: "Híbrido",
    exp: "1-3 años",
    city: "Bogotá",
    salaryMin: 4500000,
    salaryLabel: "$4.5M – $6M",
    desc: "Buscamos desarrollador con experiencia en React y Node.js para unirse a nuestro equipo de producto digital en crecimiento.",
    posted: "Hace 2 días",
    featured: true,
    tags: ["React", "Node.js", "PostgreSQL"],
  },
  {
    id: 2,
    role: "Médico General",
    company: "Clínica del Norte",
    logo: "CN",
    area: "Salud",
    mode: "Presencial",
    exp: "Sin exp.",
    city: "Medellín",
    salaryMin: 4000000,
    salaryLabel: "$4M – $5M",
    desc: "Convocatoria abierta para médicos recién graduados. Turnos rotativos, formación continua y excelentes prestaciones sociales.",
    posted: "Hace 1 día",
    featured: false,
    tags: ["Medicina general", "Urgencias"],
  },
  {
    id: 3,
    role: "Abogado Corporativo Jr.",
    company: "Bermúdez & Asociados",
    logo: "BA",
    area: "Derecho",
    mode: "Presencial",
    exp: "1-3 años",
    city: "Cali",
    salaryMin: 3500000,
    salaryLabel: "$3.5M – $4.5M",
    desc: "Firma boutique requiere abogado para apoyo en contratos mercantiles y consultoría a clientes corporativos.",
    posted: "Hace 3 días",
    featured: false,
    tags: ["Contratos", "Derecho mercantil"],
  },
  {
    id: 4,
    role: "Analista Financiero",
    company: "Grupo Bancolombia",
    logo: "GB",
    area: "Administración",
    mode: "Híbrido",
    exp: "1-3 años",
    city: "Bogotá",
    salaryMin: 5000000,
    salaryLabel: "$5M – $7M",
    desc: "Perfil analítico para modelación financiera, reportes de gestión y soporte a la gerencia en toma de decisiones estratégicas.",
    posted: "Hace 5 días",
    featured: true,
    tags: ["Excel avanzado", "Power BI", "Finanzas"],
  },
  {
    id: 5,
    role: "Contador Público",
    company: "Deloitte Colombia",
    logo: "DL",
    area: "Contaduría",
    mode: "Remoto",
    exp: "1-3 años",
    city: "Barranquilla",
    salaryMin: 4000000,
    salaryLabel: "$4M – $5.5M",
    desc: "Oportunidad para contador con experiencia en auditoría o impuestos. Trabajo 100% remoto con clientes multinacionales.",
    posted: "Hace 1 semana",
    featured: false,
    tags: ["NIIF", "Auditoría", "Tributaria"],
  },
  {
    id: 6,
    role: "Ingeniero Civil de Obra",
    company: "Constructora Bolívar",
    logo: "CB",
    area: "Ingeniería",
    mode: "Presencial",
    exp: "3+ años",
    city: "Bucaramanga",
    salaryMin: 6000000,
    salaryLabel: "$6M – $9M",
    desc: "Residente de obra para proyectos de vivienda masiva. Manejo de presupuesto, cronograma y personal en campo.",
    posted: "Hace 2 días",
    featured: false,
    tags: ["AutoCAD", "MS Project", "Presupuestos"],
  },
  {
    id: 7,
    role: "Docente de Matemáticas",
    company: "Colegio Los Nogales",
    logo: "LN",
    area: "Educación",
    mode: "Presencial",
    exp: "Sin exp.",
    city: "Bogotá",
    salaryMin: 2800000,
    salaryLabel: "$2.8M – $3.5M",
    desc: "Institución privada busca licenciado o profesional afín para enseñanza de matemáticas en bachillerato.",
    posted: "Hace 4 días",
    featured: false,
    tags: ["Pedagogía", "Cálculo"],
  },
  {
    id: 8,
    role: "Enfermero Jefe UCI",
    company: "Hospital San Ignacio",
    logo: "HS",
    area: "Salud",
    mode: "Presencial",
    exp: "3+ años",
    city: "Bogotá",
    salaryMin: 4500000,
    salaryLabel: "$4.5M – $6M",
    desc: "Vacante para enfermero(a) especialista en cuidados intensivos. Experiencia en manejo de ventilación mecánica requerida.",
    posted: "Hace 6 días",
    featured: false,
    tags: ["UCI", "Ventilación mecánica"],
  },
];

const AREAS = ["Todas", "Ingeniería", "Salud", "Derecho", "Administración", "Contaduría", "Educación"];
const MODOS = ["Todas", "Presencial", "Remoto", "Híbrido"];
const EXPS = ["Todas", "Sin exp.", "1-3 años", "3+ años"];

const MODE_BADGE: Record<string, string> = {
  Presencial: "be-badge--presencial",
  Remoto: "be-badge--remoto",
  Híbrido: "be-badge--hibrido",
};

// ── Chip ───────────────────────────────────────────────
function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button className={`be-chip${active ? " be-chip--on" : ""}`} onClick={onClick}>
      {label}
    </button>
  );
}

// ── Filtros ────────────────────────────────────────────
function Filters({
  area, setArea,
  mode, setMode,
  exp, setExp,
  onClear,
}: {
  area: string; setArea: (v: string) => void;
  mode: string; setMode: (v: string) => void;
  exp: string; setExp: (v: string) => void;
  onClear: () => void;
}) {
  return (
    <aside className="be-filters">
      <div className="be-filters__head">
        <span className="be-filters__title">Filtros</span>
        <button className="be-filters__clear" onClick={onClear}>Limpiar</button>
      </div>

      <div className="be-filter-group">
        <span className="be-filter-group__label">Área</span>
        <div className="be-chips">
          {AREAS.map((a) => <Chip key={a} label={a} active={area === a} onClick={() => setArea(a)} />)}
        </div>
      </div>

      <div className="be-filter-divider" />

      <div className="be-filter-group">
        <span className="be-filter-group__label">Modalidad</span>
        <div className="be-chips">
          {MODOS.map((m) => <Chip key={m} label={m} active={mode === m} onClick={() => setMode(m)} />)}
        </div>
      </div>

      <div className="be-filter-divider" />

      <div className="be-filter-group">
        <span className="be-filter-group__label">Experiencia</span>
        <div className="be-chips">
          {EXPS.map((e) => <Chip key={e} label={e} active={exp === e} onClick={() => setExp(e)} />)}
        </div>
      </div>
    </aside>
  );
}

// ── JobCard ────────────────────────────────────────────
function JobCard({ job }: { job: Job }) {
  return (
    <article className={`be-card${job.featured ? " be-card--featured" : ""}`}>
      {job.featured && <span className="be-card__badge-feat">DESTACADA</span>}

      <div className="be-card__top">
        <div className="be-card__logo">{job.logo}</div>
        <div className="be-card__heading">
          <h3 className="be-card__role">{job.role}</h3>
          <p className="be-card__company">{job.company}</p>
        </div>
        <span className="be-card__salary">{job.salaryLabel}</span>
      </div>

      <div className="be-card__badges">
        <span className={`be-badge ${MODE_BADGE[job.mode]}`}>{job.mode}</span>
        <span className="be-badge be-badge--area">{job.area}</span>
        <span className="be-badge be-badge--exp">{job.exp}</span>
        <span className="be-badge be-badge--city">📍 {job.city}</span>
      </div>

      <p className="be-card__desc">{job.desc}</p>

      <div className="be-card__tags">
        {job.tags.map((t) => <span className="be-tag" key={t}>{t}</span>)}
      </div>

      <div className="be-card__footer">
        <span className="be-card__posted">{job.posted}</span>
        <button className="be-card__apply">Postularme →</button>
      </div>
    </article>
  );
}

// ── Page ───────────────────────────────────────────────
export default function BolsaPage() {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("Todas");
  const [mode, setMode] = useState("Todas");
  const [exp, setExp] = useState("Todas");
  const [sort, setSort] = useState("recent");

  const filtered = useMemo(() => {
    let list = ALL_JOBS.filter((j) => {
      const q = search.toLowerCase();
      const c = city.toLowerCase();
      return (
        (!q || j.role.toLowerCase().includes(q) || j.company.toLowerCase().includes(q)) &&
        (!c || j.city.toLowerCase().includes(c)) &&
        (area === "Todas" || j.area === area) &&
        (mode === "Todas" || j.mode === mode) &&
        (exp === "Todas" || j.exp === exp)
      );
    });

    if (sort === "salary") list = [...list].sort((a, b) => b.salaryMin - a.salaryMin);
    if (sort === "relevance") list = [...list].sort((a, b) => Number(b.featured) - Number(a.featured));

    return list;
  }, [search, city, area, mode, exp, sort]);

  function clearAll() {
    setSearch(""); setCity(""); setArea("Todas"); setMode("Todas"); setExp("Todas");
  }

  return (
    <div className="be-page">
      <Header />

      {/* Hero */}
      <section className="be-hero">
        <div className="be-hero__inner">
          <span className="be-hero__eyebrow">Portal del egresado · UCC</span>
          <h1 className="be-hero__title">
            Bolsa de <em>empleo</em>
          </h1>
            <p className="be-hero__sub">
              Vacantes reales de empresas aliadas, filtradas por tu área, ciudad y experiencia.
            </p>

          <div className="be-hero__kpis">
            <div>
              <span className="be-hero__kpi-val">{ALL_JOBS.length}</span>
              <span className="be-hero__kpi-lbl">Vacantes activas</span>
            </div>
            <div className="be-hero__sep" />
            <div>
              <span className="be-hero__kpi-val">87</span>
              <span className="be-hero__kpi-lbl">Empresas publicando</span>
            </div>
            <div className="be-hero__sep" />
            <div>
              <span className="be-hero__kpi-val">34</span>
              <span className="be-hero__kpi-lbl">Nuevas esta semana</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <div className="be-searchbar">
        <div className="be-searchbar__inner">
          <input
            className="be-searchbar__input"
            placeholder="Cargo, empresa o palabra clave..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <input
            className="be-searchbar__input be-searchbar__city"
            placeholder="Ciudad..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button className="be-searchbar__btn">Buscar</button>
        </div>
      </div>

      {/* Alerta */}
      <div className="be-alert">
        <div className="be-alert__inner">
          <span className="be-alert__icon">🔔</span>
          <p className="be-alert__text">
            <strong>Activa alertas de empleo</strong> — recibe un correo cuando publiquen
            vacantes que encajan con tu perfil.
          </p>
          <button className="be-alert__btn">Activar alerta</button>
        </div>
      </div>

      {/* Layout */}
      <div className="be-layout">
        <div className="be-layout__inner">
          <Filters
            area={area} setArea={setArea}
            mode={mode} setMode={setMode}
            exp={exp} setExp={setExp}
            onClear={clearAll}
          />

          <main className="be-main">
            <div className="be-main__bar">
              <span className="be-main__count">
                <strong>{filtered.length}</strong> vacantes encontradas
              </span>
              <select
                className="be-main__sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="recent">Más recientes</option>
                <option value="salary">Mayor salario</option>
                <option value="relevance">Más relevantes</option>
              </select>
            </div>

            {filtered.length === 0 ? (
              <div className="be-empty">
                <span className="be-empty__icon">🔍</span>
                <p>No hay vacantes con estos filtros.</p>
                <button className="be-empty__btn" onClick={clearAll}>
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div className="be-jobs">
                {filtered.map((j) => <JobCard key={j.id} job={j} />)}
              </div>
            )}

            <div className="be-pagination">
              {[1, 2, 3].map((p) => (
                <button key={p} className={`be-page-btn${p === 1 ? " be-page-btn--active" : ""}`}>
                  {p}
                </button>
              ))}
              <button className="be-page-btn">›</button>
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}