"use client";

import { useState, useMemo, useEffect } from "react";
import Header from "../Components/header";
import Footer from "../Components/footer";
import "../css/Bolsa_Empleo/Bolsa.css";

// ── Iconos SVG Profesionales ─────────────────────────────
const Icons = {
  Location: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
  Clock: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  Briefcase: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  Star: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1.7L15 9.2L22.6 10L16.8 15.2L18.5 22.7L12 18.8L5.5 22.7L7.2 15.2L1.4 10L9 9.2L12 1.7Z"/></svg>,
  Empty: () => <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h8"/><path d="M8 17h8"/><path d="M8 9h2"/></svg>
};

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
};

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return <button className={`be-chip${active ? " be-chip--on" : ""}`} onClick={onClick}>{label}</button>;
}

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

function JobCard({ job, delay }: { job: Job; delay: number }) {
  const initials = job.company.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const base = () => (process.env.NEXT_PUBLIC_BACKEND_URL || 'https://proyecto-ia-production-b7d6.up.railway.app').replace(/\/$/, '');

  const handleApply = async (e: React.MouseEvent, jobTitle: string, vacancyId: number) => {
    const saved = sessionStorage.getItem('ucc_user');
    if (!saved) {
      alert("Debes iniciar sesión para postularte.");
      return;
    }

    const user = JSON.parse(saved);
    const rol = Number(user.profile?.rol_id);
    const plan = (user.profile?.suscripcion?.tipo_plan || 'Gratuito').trim();
    const userId = user.id || user.user_id || user.profile?.id;

    console.log(`🔍 Intento de postulación - Rol: ${rol}, Plan: "${plan}"`);

    // 1. REGLA: Solo Rol 1 (Egresado) y Rol 2 (Externo con Plan Completo)
    if (rol === 3 || rol === 4) {
      alert("Tu cuenta de Empresa/Admin no permite postularse a vacantes.");
      return;
    }

    if (rol === 2 && plan !== 'Plan Completo') {
      console.warn("🚫 Bloqueado por plan insuficiente:", plan);
      alert("Tu plan actual solo permite visualizar ofertas. Actualiza al 'Plan Completo' en tu Dashboard para poder postularte.");
      return;
    }

    // 2. Ejecutar postulación en el Backend
    try {
      const cleanUserId = String(userId).trim().split(':')[0];
      const url = `${base()}/api/postulaciones`;
      console.log(`🚀 Enviando postulación a: ${url} | User: ${cleanUserId} | Vacante: ${vacancyId}`);

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: cleanUserId, vacancyId })
      });
      const data = await res.json();
      console.log("📥 Respuesta del servidor:", data);

      if (data.success) {
        alert(`¡Felicidades! Te has postulado exitosamente a: ${jobTitle}`);
      } else {
        alert(data.message || "Error al procesar la postulación");
      }
    } catch (err: any) {
      console.error("❌ Error FATAL al postularse:", err);
      alert("Hubo un problema de conexión al intentar postularte.");
    }
  };

  return (
    <article className={`be-card${job.featured ? " be-card--featured" : ""}`} style={{ animationDelay: `${delay * 60}ms` }}>
      {job.featured && (
        <span className="be-card__badge-feat">
          <Icons.Star /> DESTACADA
        </span>
      )}

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
            <Icons.Briefcase />
            {job.company}
          </p>
        </div>
        <span className="be-card__salary">{job.salaryLabel}</span>
      </div>

      <div className="be-card__badges">
        <span className={`be-badge ${MODE_BADGE[job.mode] || "be-badge--hibrido"}`}>{job.mode}</span>
        <span className="be-badge be-badge--area">{job.area}</span>
        <span className="be-badge be-badge--exp">{job.nivel}</span>
        <span className="be-badge be-badge--city">
          <Icons.Location /> {job.city}
        </span>
      </div>

      {job.desc && <p className="be-card__desc">{job.desc}</p>}

      <div className="be-card__footer">
        <span className="be-card__posted">
          <Icons.Clock /> {job.posted}
        </span>
        <button className="be-card__apply" onClick={(e) => handleApply(e, job.role, job.id)}>
          Postularme
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>
    </article>
  );
}

export default function BolsaPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("Todas");
  const [mode, setMode] = useState("Todas");
  const [nivel, setNivel] = useState("Todas");
  const [sort, setSort] = useState("recent");

  const base = () => (process.env.NEXT_PUBLIC_BACKEND_URL || 'https://proyecto-ia-production-b7d6.up.railway.app').replace(/\/$/, '');

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
            tags: [v.programa_requerido, v.tipo_contrato].filter(Boolean)
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

      <div className="be-searchbar">
        <div className="be-searchbar__inner">
          <div style={{ flex: 1, position: 'relative' }}>
             <span style={{ position: 'absolute', left: '16px', top: '13px', color: '#94a3b8' }}><Icons.Search /></span>
             <input
              className="be-searchbar__input"
              style={{ paddingLeft: '45px' }}
              placeholder="Cargo, empresa o palabra clave..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div style={{ flex: '0 0 200px', position: 'relative' }}>
             <span style={{ position: 'absolute', left: '16px', top: '13px', color: '#94a3b8' }}><Icons.Location /></span>
             <input
              className="be-searchbar__input be-searchbar__city"
              style={{ paddingLeft: '45px', width: '100%' }}
              placeholder="Ciudad..."
              value={city}
              onChange={e => setCity(e.target.value)}
            />
          </div>
          <button className="be-searchbar__btn" onClick={fetchJobs}>Buscar</button>
        </div>
      </div>

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
                <strong>{filtered.length}</strong> resultados encontrados
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
                <Icons.Empty />
                <p style={{ marginTop: '20px' }}>{jobs.length === 0 ? "Aún no hay vacantes publicadas." : "No encontramos vacantes con estos filtros."}</p>
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