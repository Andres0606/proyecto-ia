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
  mode: string;
  exp: string;
  city: string;
  salaryMin: number;
  salaryLabel: string;
  desc: string;
  posted: string;
  featured: boolean;
  tags: string[];
}

const AREAS = ["Todas", "Administrativa", "Salud", "Financiera", "Industrial", "Educacion", "Sistemas", "Juridica", "Ventas", "Marketing"];
const MODOS = ["Todas", "Presencial", "Remoto", "Híbrido"];
const EXPS = ["Todas", "Profesional", "Especialista", "Magister", "Doctorado", "Tecnico"];

const MODE_BADGE: Record<string, string> = {
  Presencial: "be-badge--presencial",
  Remoto: "be-badge--remoto",
  Híbrido: "be-badge--hibrido",
  "Hibrido": "be-badge--hibrido",
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
        <span className="be-filter-group__label">Nivel de Formación</span>
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
        <div className="be-card__logo">
          {job.logo.startsWith('http') ? <img src={job.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} /> : job.logo}
        </div>
        <div className="be-card__heading">
          <h3 className="be-card__role">{job.role}</h3>
          <p className="be-card__company">{job.company}</p>
        </div>
        <span className="be-card__salary">{job.salaryLabel}</span>
      </div>

      <div className="be-card__badges">
        <span className={`be-badge ${MODE_BADGE[job.mode] || "be-badge--hibrido"}`}>{job.mode}</span>
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
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("Todas");
  const [mode, setMode] = useState("Todas");
  const [exp, setExp] = useState("Todas");
  const [sort, setSort] = useState("recent");

  const base = () => (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000').replace(/\/$/, '');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${base()}/api/vacantes`);
      const data = await res.json();
      if (data.success) {
        const mappedJobs: Job[] = data.vacancies.map((v: any) => {
          const fecha = new Date(v.created_at);
          const diff = Math.floor((new Date().getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24));
          const postedText = diff === 0 ? "Publicado hoy" : `Hace ${diff} días`;
          
          return {
            id: v.id,
            role: v.cargo,
            company: v.empresas?.razon_social || "Empresa UCC",
            logo: v.empresa_logo || (v.empresas?.razon_social?.[0] || "U"),
            area: v.area_desempeno || "General",
            mode: v.modalidad || "Presencial",
            exp: v.nivel_formacion || "Profesional",
            city: v.ubicacion || v.empresas?.ciudad || "Colombia",
            salaryMin: parseFloat(v.salario) || 0,
            salaryLabel: v.salario ? `$${new Intl.NumberFormat('es-CO').format(v.salario)}` : "Salario a convenir",
            desc: v.descripcion || "",
            posted: postedText,
            featured: v.salario > 4000000, // Destacamos vacantes de alto salario
            tags: [v.programa_requerido, v.tipo_contrato].filter(Boolean)
          };
        });
        setJobs(mappedJobs);
      }
    } catch (err) {
      console.error("Error al cargar vacantes:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let list = jobs.filter((j) => {
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
  }, [jobs, search, city, area, mode, exp, sort]);

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
              Vacantes reales de empresas aliadas, filtradas por tu área, ciudad y formación.
            </p>

          <div className="be-hero__kpis">
            <div>
              <span className="be-hero__kpi-val">{jobs.length}</span>
              <span className="be-hero__kpi-lbl">Vacantes activas</span>
            </div>
            <div className="be-hero__sep" />
            <div>
              <span className="be-hero__kpi-val">87</span>
              <span className="be-hero__kpi-lbl">Empresas aliadas</span>
            </div>
            <div className="be-hero__sep" />
            <div>
              <span className="be-hero__kpi-val">Conexión</span>
              <span className="be-hero__kpi-lbl">Talento UCC</span>
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
          <button className="be-searchbar__btn" onClick={fetchJobs}>Buscar</button>
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

            {loading ? (
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <p>Cargando vacantes...</p>
              </div>
            ) : filtered.length === 0 ? (
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
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}