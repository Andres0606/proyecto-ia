'use client';

import React, { useEffect, useState } from 'react';
import Header from '../Components/header';
import Footer from '../Components/footer';
import '../css/Dashboard/dashboard.css';

const AdminIcons = {
  Overview: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>,
  Users: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Jobs: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 12h12.5a3.5 3.5 0 1 0-3.5-3.5V19"/><path d="M12 9l12 12"/><path d="M5 20a2 2 0 1 0 4 0 2 2 0 0 0-4 0z"/></svg>,
  Reports: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>,
  Lock: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  Building: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/></svg>,
  Card: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
  Graduation: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
  Calendar: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
};

const ADMIN_SECTIONS = [
  { title: 'Resumen', icon: AdminIcons.Overview, id: 'overview' },
  { title: 'Usuarios', icon: AdminIcons.Users, id: 'users' },
  { title: 'Vacantes', icon: AdminIcons.Jobs, id: 'jobs' },
  { title: 'Distribución', icon: AdminIcons.Reports, id: 'reports' },
];

export default function DashboardAdmin() {
  const [userName, setUserName] = useState('Administrador');
  const [activeSection, setActiveSection] = useState<'overview' | 'users' | 'jobs' | 'reports' | 'settings'>('overview');
  const [stats, setStats] = useState({ total_users: 0, total_companies: 0, total_jobs: 0, active_plans: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [vacancies, setVacancies] = useState<any[]>([]);
  const [distributions, setDistributions] = useState<any[]>([]);

  const base = () => (process.env.NEXT_PUBLIC_BACKEND_URL || 'https://proyecto-ia-production-b7d6.up.railway.app').replace(/\/$/, '');

  useEffect(() => {
    const savedUser = sessionStorage.getItem('ucc_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      const rolId = Number(userData.profile?.rol_id);
      if (rolId === 2) window.location.href = '/dashboard-externo';
      else if (rolId === 3) window.location.href = '/dashboard-empresa';
      else if (rolId === 1) window.location.href = '/dashboard';
      else setUserName(userData.profile?.nombre_completo?.split(' ')[0] || 'Admin');
    }
    fetchStats();
    fetchUsers();
    fetchVacancies();
    fetchDistributions();
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchJobs, setSearchJobs] = useState('');
  const [reportProgram, setReportProgram] = useState('all');

  const uniquePrograms = Array.from(new Set(distributions.map(d => d.perfiles_usuarios?.[0]?.programa_academico).filter(Boolean)));

  const filteredDistributions = distributions.filter(d => 
    reportProgram === 'all' || d.perfiles_usuarios?.[0]?.programa_academico === reportProgram
  );

  const filteredUsers = users.filter(u => 
    u.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.correo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredVacancies = vacancies.filter(v => 
    v.cargo?.toLowerCase().includes(searchJobs.toLowerCase()) ||
    v.empresas?.razon_social?.toLowerCase().includes(searchJobs.toLowerCase())
  );

  const fetchStats = async () => {
    try {
      const r = await fetch(`${base()}/api/admin/stats`);
      const d = await r.json();
      if (d.success) setStats(d.stats);
    } catch (e) { console.error("Error fetching stats:", e); }
  };

  const fetchUsers = async () => {
    try {
      const r = await fetch(`${base()}/api/admin/users`);
      const d = await r.json();
      if (d.success) setUsers(d.users);
    } catch (e) { console.error("Error fetching users:", e); }
  };

  const fetchVacancies = async () => {
    try {
      const r = await fetch(`${base()}/api/admin/vacancies`);
      const d = await r.json();
      if (d.success) setVacancies(d.vacancies);
    } catch (e) { console.error("Error fetching vacancies:", e); }
  };

  const fetchDistributions = async () => {
    try {
      const r = await fetch(`${base()}/api/admin/distributions`);
      const d = await r.json();
      if (d.success) setDistributions(d.data);
    } catch (e) { console.error("Error fetching distributions:", e); }
  };

  const STAT_CARDS = [
    { label: 'Total Usuarios', value: stats.total_users, icon: AdminIcons.Users, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Empresas Aliadas', value: stats.total_companies, icon: AdminIcons.Building, color: '#8b5cf6', bg: '#f5f3ff' },
    { label: 'Vacantes Activas', value: stats.total_jobs, icon: AdminIcons.Jobs, color: '#10b981', bg: '#f0fdf4' },
    { label: 'Planes Activos', value: stats.active_plans, icon: AdminIcons.Card, color: '#f59e0b', bg: '#fffbeb' },
  ];

  return (
    <div className="db-page" style={{ background: '#f1f5f9' }}>
      <Header />
      <main style={{ paddingTop: '80px', minHeight: '100vh', display: 'flex' }}>

        {/* Sidebar */}
        <aside style={{ width: '260px', flexShrink: 0, background: 'var(--ucc-navy)', minHeight: 'calc(100vh - 80px)', padding: '30px 0', display: 'flex', flexDirection: 'column', position: 'sticky', top: '80px', alignSelf: 'flex-start' }}>
          <div style={{ padding: '0 24px 30px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: '12px' }}><AdminIcons.Lock /></div>
            <p style={{ color: 'white', fontWeight: 800, fontSize: '1rem', margin: 0 }}>{userName}</p>
            <span style={{ background: 'rgba(239,68,68,0.2)', color: '#fca5a5', fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', marginTop: '6px', display: 'inline-block', letterSpacing: '1px' }}>ADMINISTRADOR</span>
          </div>
          <nav style={{ padding: '20px 12px', flex: 1 }}>
            {ADMIN_SECTIONS.map(s => {
              const Icon = s.icon;
              return (
                <button key={s.id} onClick={() => setActiveSection(s.id as any)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 16px', borderRadius: '14px', border: 'none', cursor: 'pointer', marginBottom: '6px', background: activeSection === s.id ? 'rgba(59,130,246,0.2)' : 'transparent', color: activeSection === s.id ? '#93c5fd' : 'rgba(255,255,255,0.6)', fontWeight: activeSection === s.id ? 700 : 500, fontSize: '0.95rem', transition: 'all 0.2s', textAlign: 'left' }}>
                  <Icon />
                  {s.title}
                  {activeSection === s.id && <span style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6' }} />}
                </button>
              );
            })}
          </nav>
          <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <button onClick={() => { sessionStorage.clear(); window.location.href = '/'; }} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#fca5a5', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>Cerrar Sesión</button>
          </div>
        </aside>

        {/* Content */}
        <div style={{ flex: 1, padding: '40px', overflowX: 'hidden' }}>

          {activeSection === 'overview' && (
            <div>
              <div style={{ marginBottom: '32px' }}>
                <h1 style={{ color: 'var(--ucc-navy)', fontSize: '2rem', fontWeight: 800, margin: 0 }}>Panel de Control</h1>
                <p style={{ color: '#64748b', marginTop: '6px' }}>Bienvenido de nuevo, {userName}. Aquí tienes el resumen del sistema.</p>
              </div>

              {/* Stats */}
              <div className="responsive-grid-4" style={{ marginBottom: '32px' }}>
                {STAT_CARDS.map(c => {
                  const Icon = c.icon;
                  return (
                    <div key={c.label} style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: c.bg, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon /></div>
                      <div>
                        <p style={{ margin: 0, fontSize: '2rem', fontWeight: 800, color: c.color }}>{c.value.toLocaleString()}</p>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>{c.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Welcome banner */}
              <div style={{ background: 'linear-gradient(135deg, var(--ucc-navy) 0%, #0f2340 100%)', borderRadius: '24px', padding: '40px 50px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '30px', flexWrap: 'wrap' }}>
                <div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 10px' }}>Centro de Control UCC</h2>
                  <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, maxWidth: '460px', lineHeight: 1.6 }}>Gestiona todos los usuarios, vacantes y reportes del Portal del Egresado desde aquí.</p>
                </div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <button onClick={() => setActiveSection('users')} style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', padding: '12px 24px', fontWeight: 700, cursor: 'pointer' }}>Ver Usuarios</button>
                  <button onClick={() => setActiveSection('reports')} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', padding: '12px 24px', fontWeight: 700, cursor: 'pointer' }}>Ver Reportes</button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'users' && (
            <div>
              <h1 style={{ color: 'var(--ucc-navy)', fontSize: '1.8rem', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}><AdminIcons.Users /> Gestión de Usuarios</h1>
              <div style={{ background: 'white', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <div style={{ padding: '20px 28px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: 'var(--ucc-navy)' }}>Todos los usuarios</span>
                  <input 
                    placeholder="Buscar usuario..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none', width: '220px' }} 
                  />
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      {['Nombre', 'Correo', 'Rol', 'Acciones'].map(h => <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>{users.length === 0 ? "Cargando usuarios..." : "No se encontraron usuarios"}</td></tr>
                    ) : (
                      filteredUsers.map((u, i) => {
                        const rolMap: any = { 1: 'Egresado', 2: 'Externo', 3: 'Empresa', 4: 'Admin' };
                        const colorMap: any = { 1: { bg: '#fee2e2', tc: '#b91c1c' }, 2: { bg: '#dcfce7', tc: '#166534' }, 3: { bg: '#fef3c7', tc: '#92400e' }, 4: { bg: '#e0f2fe', tc: '#0369a1' } };
                        const rol = rolMap[u.rol_id] || 'Desconocido';
                        const colors = colorMap[u.rol_id] || { bg: '#f1f5f9', tc: '#64748b' };
                        
                        return (
                          <tr key={u.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                            <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--ucc-navy)' }}>{u.nombre_completo}</td>
                            <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '0.9rem' }}>{u.correo}</td>
                            <td style={{ padding: '16px 20px' }}><span style={{ background: colors.bg, color: colors.tc, padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700 }}>{rol}</span></td>
                            <td style={{ padding: '16px 20px' }}><button style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>Editar</button></td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'jobs' && (
            <div>
              <h1 style={{ color: 'var(--ucc-navy)', fontSize: '1.8rem', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}><AdminIcons.Jobs /> Gestión de Vacantes</h1>
              <div style={{ background: 'white', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <div style={{ padding: '20px 28px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: 'var(--ucc-navy)' }}>Todas las ofertas</span>
                  <input 
                    placeholder="Buscar vacante o empresa..." 
                    value={searchJobs}
                    onChange={(e) => setSearchJobs(e.target.value)}
                    style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none', width: '220px' }} 
                  />
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      {['Empresa', 'Cargo', 'Salario', 'Estado', 'Acciones'].map(h => <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVacancies.length === 0 ? (
                      <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>{vacancies.length === 0 ? "Cargando vacantes..." : "No se encontraron vacantes"}</td></tr>
                    ) : (
                      filteredVacancies.map((v) => (
                        <tr key={v.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                          <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--ucc-navy)' }}>{v.empresas?.razon_social || 'UCC'}</td>
                          <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '0.9rem' }}>{v.cargo}</td>
                          <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '0.9rem' }}>{v.salario ? `$${v.salario.toLocaleString()}` : 'No definido'}</td>
                          <td style={{ padding: '16px 20px' }}>
                            <span style={{ 
                              background: v.estado === 'activa' ? '#dcfce7' : '#fee2e2', 
                              color: v.estado === 'activa' ? '#166534' : '#b91c1c', 
                              padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700 
                            }}>
                              {v.estado || 'Inactiva'}
                            </span>
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            <button style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>Ver Detalle</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'reports' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', gap: '20px', flexWrap: 'wrap' }}>
                <div>
                  <h1 style={{ color: 'var(--ucc-navy)', fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>Análisis de Egresados</h1>
                  <p style={{ color: '#64748b', margin: '4px 0 0' }}>Cruza variables para obtener estadísticas funcionales</p>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'white', padding: '10px 20px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ucc-navy)' }}>Filtrar por Carrera:</span>
                  <select 
                    value={reportProgram} 
                    onChange={(e) => setReportProgram(e.target.value)}
                    style={{ border: 'none', background: 'none', outline: 'none', fontWeight: 600, color: '#3b82f6', cursor: 'pointer', fontSize: '0.9rem' }}
                  >
                    <option value="all">Todas las Carreras</option>
                    {uniquePrograms.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
                {/* Distribución por Programa (Solo se muestra si estamos en "Todas") */}
                {reportProgram === 'all' && (
                  <div style={{ background: 'white', borderRadius: '24px', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ucc-navy)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <AdminIcons.Graduation /> Programas con más Egresados
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {Object.entries(
                        distributions.reduce((acc: any, curr) => {
                          const prog = curr.perfiles_usuarios?.[0]?.programa_academico || 'No definido';
                          acc[prog] = (acc[prog] || 0) + 1;
                          return acc;
                        }, {})
                      ).sort((a: any, b: any) => b[1] - a[1]).slice(0, 5).map(([prog, count]: any) => (
                        <div key={prog}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                            <span style={{ fontWeight: 600, color: '#475569' }}>{prog}</span>
                            <span style={{ fontWeight: 700, color: 'var(--ucc-navy)' }}>{count}</span>
                          </div>
                          <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${(count / distributions.length) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #60a5fa)', borderRadius: '4px' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Distribución por Género (Dinámica) */}
                <div style={{ background: 'white', borderRadius: '24px', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ucc-navy)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <AdminIcons.Users /> Género {reportProgram !== 'all' ? `en ${reportProgram}` : ''}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {Object.entries(
                      filteredDistributions.reduce((acc: any, curr) => {
                        const gen = curr.genero === 'M' || curr.genero === 'Masculino' ? 'Masculino' : curr.genero === 'F' || curr.genero === 'Femenino' ? 'Femenino' : 'Sin definir';
                        acc[gen] = (acc[gen] || 0) + 1;
                        return acc;
                      }, {})
                    ).map(([gen, count]: any) => (
                      <div key={gen} style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: gen === 'Femenino' ? '#fdf2f8' : gen === 'Masculino' ? '#eff6ff' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: gen === 'Femenino' ? '#db2777' : gen === 'Masculino' ? '#2563eb' : '#94a3b8' }}>
                          {gen === 'Femenino' ? '👩' : gen === 'Masculino' ? '👨' : '👤'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 600, color: '#475569' }}>{gen}</span>
                            <span style={{ fontWeight: 700, color: 'var(--ucc-navy)' }}>{filteredDistributions.length > 0 ? Math.round((count / filteredDistributions.length) * 100) : 0}%</span>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{count} egresados</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Distribución por Edad (Dinámica) */}
                <div style={{ background: 'white', borderRadius: '24px', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', gridColumn: reportProgram === 'all' ? 'span 2' : 'auto' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ucc-navy)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <AdminIcons.Calendar /> Rangos de Edad {reportProgram !== 'all' ? `en ${reportProgram}` : ''}
                  </h3>
                  <div style={{ display: 'flex', justifyContent: 'space-around', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-end', minHeight: '150px' }}>
                    {Object.entries(
                      filteredDistributions.reduce((acc: any, curr) => {
                        if (!curr.fecha_nacimiento) { acc['N/D'] = (acc['N/D'] || 0) + 1; return acc; }
                        const birth = new Date(curr.fecha_nacimiento);
                        const age = new Date().getFullYear() - birth.getFullYear();
                        let range = '';
                        if (age < 25) range = '20-25';
                        else if (age < 30) range = '26-30';
                        else if (age < 40) range = '31-40';
                        else range = '41+';
                        acc[range] = (acc[range] || 0) + 1;
                        return acc;
                      }, {})
                    ).sort().map(([range, count]: any) => (
                      <div key={range} style={{ textAlign: 'center', flex: 1, maxWidth: '100px' }}>
                        <div style={{ width: '100%', height: '120px', background: '#f8fafc', borderRadius: '12px', position: 'relative', display: 'flex', alignItems: 'flex-end', marginBottom: '12px' }}>
                          <div style={{ width: '100%', height: `${filteredDistributions.length > 0 ? (count / filteredDistributions.length) * 100 : 0}%`, background: 'linear-gradient(180deg, #1d4ed8, var(--ucc-navy))', borderRadius: '0 0 12px 12px', transition: 'height 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                          <span style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', fontWeight: 800, color: 'var(--ucc-navy)', fontSize: '0.9rem' }}>{count}</span>
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{range === 'N/D' ? 'Sin edad' : `${range} años`}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
