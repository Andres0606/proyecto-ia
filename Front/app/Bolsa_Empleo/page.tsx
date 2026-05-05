"use client";

import { useState, useMemo, useEffect } from "react";
import Header from "../Components/header";
import Footer from "../Components/footer";
import "../css/Bolsa_Empleo/Bolsa.css";

interface Job {
  id: number;
  role: string;
  company: string;
  logo: string;
  area: string;
  mode: string;
  nivel: string;
  city: string;
  salaryMin: number;
  salaryLabel: string;
  desc: string;
  posted: string;
  featured: boolean;
  tags: string[];
}

const AREAS = ["Todas","Administrativa","Salud","Financiera","Industrial","Educacion","Sistemas","Juridica","Ventas","Marketing","Contable","Gestion Humana","Comercial"];
const MODOS = ["Todas","Presencial","Remoto","Hibrido"];
const NIVELES = ["Todas","Profesional","Especialista","Magister","Doctorado","Tecnico"];

const MODE_BADGE: Record<string, string> = {
  Presencial: "be-badge--presencial",
  Remoto: "be-badge--remoto",
  Hibrido: "be-badge--hibrido",
  Híbrido: "be-badge--hibrido",
};

// ── Chip ──────────────────────────────────────────────────
function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return <button className={`be-chip${active ? " be-chip--on" : ""}`} onClick={onClick}>{label}</button>;
}

// ── Sidebar de Filtros ────────────────────────────────────
function Filters({ area, setArea, mode, setMode, nivel, setNivel, onClear }: {
  area: string; setArea: (v: string) => void;
  mode: string; setMode: (v: string) => void;
  nivel: string; setNivel: (v: string) => void;
  onClear: () => void;
}) {
  return (
    <aside className="be-filters">
      <div className="be-filters__head">
        <span className="be-filters__title">Filtros</span>
        <button className="be-filters__clear" onClick={onClear}>Limpiar todo</button>
      </div>

      <div className="be-filter-group">
        <span className="be-filter-group__label">Área de Trabajo</span>
        <div className="be-chips">
          {AREAS.map(a => <Chip key={a} label={a} active={area === a} onClick={() => setArea(a)} />)}
        </div>
      </div>

      <div className="be-filter-divider" />

      <div className="be-filter-group">
        <span className="be-filter-group__label">Modalidad</span>
        <div className="be-chips">
          {MODOS.map(m => <Chip key={m} label={m} active={mode === m} onClick={() => setMode(m)} />)}
        </div>
      </div>

      <div className="be-filter-divider" />

      <div className="be-filter-group">
        <span className="be-filter-group__label">Nivel de Formación</span>
        <div className="be-chips">
          {NIVELES.map(n => <Chip key={n} label={n} active={nivel === n} onClick={() => setNivel(n)} />)}
        </div>
      </div>
    </aside>
  );
}

// ── Tarjeta de Vacante ────────────────────────────────────
function JobCard({ job, delay }: { job: Job; delay: number }) {
  const initials = job.company.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <article className={`be-card${job.featured ? " be-card--featured" : ""}`} style={{ animationDelay: `${delay * 60}ms` }}>
      {job.featured && <span className="be-card__badge-feat">⭐ Destacada</span>}

      <div className="be-card__top">
        <div className="be-card__logo">
          {job.logo.startsWith('http')
            ? <img src={job.logo} alt={job.company} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : initials
          }
        </div>
        <div className="be-card__heading">
          <h3 className="be-card__role">{job.role}</h3>
          <p className="be-card__company">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/></svg>
            {job.company}
          </p>
        </div>
        <span className="be-card__salary">{job.salaryLabel}</span>
      </div>

      <div className="be-card__badges">
        <span className={`be-badge ${MODE_BADGE[job.mode] || "be-badge--hibrido"}`}>{job.mode}</span>
        <span className="be-badge be-badge--area">{job.area}</span>
        <span className="be-badge be-badge--exp">{job.nivel}</span>
        <span className="be-badge be-badge--city">📍 {job.city}</span>
      </div>

      {job.desc && <p className="be-card__desc">{job.desc}</p>}

      {job.tags.length > 0 && (
        <div className="be-card__tags">
          {job.tags.map(t => <span className="be-tag" key={t}>{t}</span>)}
        </div>
      )}

      <div className="be-card__footer">
        <span className="be-card__posted">🕐 {job.posted}</span>
        <button className="be-card__apply">
          Postularme
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>
    </article>
  );
}

// ── Página Principal ──────────────────────────────────────
export default function BolsaPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("Todas");
  const [mode, setMode] = useState("Todas");
  const [nivel, setNivel] = useState("Todas");
  const [sort, setSort] = useState("recent");

  const base = () => (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000').replace(/\/$/, '');

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${base()}/api/vacantes`);
      const data = await res.json();
      if (data.success) {
        const mapped: Job[] = data.vacancies.map((v: any) => {
          const fecha = new Date(v.created_at);
          const diff = Math.floor((Date.now() - fecha.getTime()) / 86400000);
          const postedText = diff === 0 ? "Publicado hoy" : diff === 1 ? "Hace 1 día" : `Hace ${diff} días`;
          const salario = parseFloat(v.salario);
          return {
            id: v.id,
            role: v.cargo || "Cargo sin especificar",
            company: v.empresas?.razon_social || "Empresa UCC",
            logo: v.empresa_logo || '',
            area: v.area_desempeno || "General",
            mode: v.modalidad || "Presencial",
            nivel: v.nivel_formacion || "Profesional",
            city: v.ubicacion || v.empresas?.ciudad || "Colombia",
            salaryMin: salario || 0,
            salaryLabel: salario ? `$${new Intl.NumberFormat('es-CO').format(salario)}` : "A convenir",
            desc: v.descripcion || "",
            posted: postedText,
            featured: salario > 4000000,
            tags: [v.programa_requerido, v.tipo_contrato, v.duracion_contrato].filter(Boolean)
          };
        });
        setJobs(mapped);
      }
    } catch (err) {
      console.error("Error al cargar vacantes:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let list = jobs.filter(j => {
      const q = search.toLowerCase();
      const c = city.toLowerCase();
      return (
        (!q || j.role.toLowerCase().includes(q) || j.company.toLowerCase().includes(q)) &&
        (!c || j.city.toLowerCase().includes(c)) &&
        (area === "Todas" || j.area === area) &&
        (mode === "Todas" || j.mode === mode) &&
        (nivel === "Todas" || j.nivel === nivel)
      );
    });
    if (sort === "salary") list = [...list].sort((a, b) => b.salaryMin - a.salaryMin);
    if (sort === "relevance") list = [...list].sort((a, b) => Number(b.featured) - Number(a.featured));
    return list;
  }, [jobs, search, city, area, mode, nivel, sort]);

  function clearAll() {
    setSearch(""); setCity(""); setArea("Todas"); setMode("Todas"); setNivel("Todas");
  }

  return (
    <div className="be-page">
      <Header />

      {/* Hero */}
      <section className="be-hero">
        <div className="be-hero__inner">
          <span className="be-hero__eyebrow">Portal del Egresado · UCC</span>
          <h1 className="be-hero__title">Bolsa de <em>empleo</em></h1>
          <p className="be-hero__sub">Conectamos el mejor talento UCC con empresas líderes. Encuentra la oportunidad que impulse tu carrera profesional.</p>
          <div className="be-hero__kpis">
            <div>
              <span className="be-hero__kpi-val">{loading ? '—' : jobs.length}</span>
              <span className="be-hero__kpi-lbl">Vacantes Activas</span>
            </div>
            <div className="be-hero__sep" />
            <div>
              <span className="be-hero__kpi-val">UCC</span>
              <span className="be-hero__kpi-lbl">Red de Egresados</span>
            </div>
            <div className="be-hero__sep" />
            <div>
              <span className="be-hero__kpi-val">Live</span>
              <span className="be-hero__kpi-lbl">Actualización en tiempo real</span>
            </div>
          </div>
        </div>
      </section>

      {/* Barra de Búsqueda Flotante */}
      <div className="be-searchbar">
        <div className="be-searchbar__inner">
          <input
            className="be-searchbar__input"
            placeholder="🔍  Cargo, empresa o palabra clave..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchJobs()}
          />
          <input
            className="be-searchbar__input be-searchbar__city"
            placeholder="📍  Ciudad..."
            value={city}
            onChange={e => setCity(e.target.value)}
          />
          <button className="be-searchbar__btn" onClick={fetchJobs}>Buscar</button>
        </div>
      </div>

      {/* Layout Principal */}
      <div className="be-layout">
        <div className="be-layout__inner">
          <Filters
            area={area} setArea={setArea}
            mode={mode} setMode={setMode}
            nivel={nivel} setNivel={setNivel}
            onClear={clearAll}
          />

          <main className="be-main">
            <div className="be-main__bar">
              <span className="be-main__count">
                <strong>{filtered.length}</strong> vacante{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
              </span>
              <select className="be-main__sort" value={sort} onChange={e => setSort(e.target.value)}>
                <option value="recent">Más recientes</option>
                <option value="salary">Mayor salario</option>
                <option value="relevance">Más relevantes</option>
              </select>
            </div>

            {loading ? (
              <div className="be-loading">
                <div className="be-loading__spinner" />
                <p>Cargando vacantes disponibles...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="be-empty">
                <span className="be-empty__icon">🔍</span>
                <p>{jobs.length === 0 ? "Aún no hay vacantes publicadas. ¡Vuelve pronto!" : "No encontramos vacantes con estos filtros."}</p>
                {jobs.length > 0 && <button className="be-empty__btn" onClick={clearAll}>Limpiar filtros</button>}
              </div>
            ) : (
              <div className="be-jobs">
                {filtered.map((j, i) => <JobCard key={j.id} job={j} delay={i} />)}
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}