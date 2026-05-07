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
  Settings: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>,
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
  { title: 'Reportes', icon: AdminIcons.Reports, id: 'reports' },
  { title: 'Configuración', icon: AdminIcons.Settings, id: 'settings' },
];

export default function DashboardAdmin() {
  const [userName, setUserName] = useState('Administrador');
  const [activeSection, setActiveSection] = useState<'overview' | 'users' | 'jobs' | 'reports' | 'settings'>('overview');
  const [stats] = useState({ total_users: 1542, total_companies: 87, total_jobs: 124, active_plans: 312 });

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
  }, []);

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
                  <input placeholder="Buscar usuario..." style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none', width: '220px' }} />
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      {['Nombre', 'Correo', 'Rol', 'Acciones'].map(h => <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { nombre: 'Juan Pérez', correo: 'juan@gmail.com', rol: 'Egresado', color: '#fee2e2', tc: '#b91c1c' },
                      { nombre: 'Tech Solutions', correo: 'hr@tech.com', rol: 'Empresa', color: '#fef3c7', tc: '#92400e' },
                      { nombre: 'María Rodríguez', correo: 'maria@gmail.com', rol: 'Externo', color: '#dcfce7', tc: '#166534' },
                    ].map((u, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                        <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--ucc-navy)' }}>{u.nombre}</td>
                        <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '0.9rem' }}>{u.correo}</td>
                        <td style={{ padding: '16px 20px' }}><span style={{ background: u.color, color: u.tc, padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700 }}>{u.rol}</span></td>
                        <td style={{ padding: '16px 20px' }}><button style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>Editar</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'jobs' && (
            <div style={{ textAlign: 'center', padding: '80px 40px', background: 'white', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: '#f1f5f9', color: 'var(--ucc-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}><AdminIcons.Jobs /></div>
              <h2 style={{ color: 'var(--ucc-navy)', fontWeight: 800, fontSize: '1.8rem' }}>Gestión de Vacantes</h2>
              <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto' }}>Próximamente: Aprueba y supervisa todas las ofertas laborales publicadas por las empresas.</p>
            </div>
          )}

          {activeSection === 'reports' && (
            <div>
              <h1 style={{ color: 'var(--ucc-navy)', fontSize: '1.8rem', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}><AdminIcons.Reports /> Reportes del Sistema</h1>
              <div className="responsive-grid-2" style={{ gap: '20px' }}>
                {[
                  { title: 'Egresados por Programa', desc: 'Distribución de egresados por carrera académica', icon: AdminIcons.Graduation },
                  { title: 'Tasa de Empleo', desc: 'Porcentaje de egresados empleados vs desempleados', icon: AdminIcons.Reports },
                  { title: 'Planes Activos', desc: 'Detalle de suscripciones y membresías activas', icon: AdminIcons.Card },
                  { title: 'Actividad Mensual', desc: 'Logins y acciones en el portal por mes', icon: AdminIcons.Calendar },
                ].map(r => {
                  const Icon = r.icon;
                  return (
                    <div key={r.title} style={{ background: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', gap: '20px', alignItems: 'center' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ucc-navy)', flexShrink: 0 }}>
                        <Icon />
                      </div>
                      <div>
                        <h3 style={{ margin: '0 0 6px', color: 'var(--ucc-navy)', fontWeight: 700 }}>{r.title}</h3>
                        <p style={{ margin: '0 0 12px', color: '#64748b', fontSize: '0.85rem' }}>{r.desc}</p>
                        <button style={{ background: 'var(--ucc-navy)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 18px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>Próximamente</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeSection === 'settings' && (
            <div>
              <h1 style={{ color: 'var(--ucc-navy)', fontSize: '1.8rem', fontWeight: 800, marginBottom: '24px' }}>Configuración del Portal</h1>
              <div style={{ background: 'white', borderRadius: '20px', padding: '36px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                {['Nombre del Portal', 'Correo de Soporte', 'URL del Backend'].map(f => (
                  <div key={f} style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontWeight: 700, color: 'var(--ucc-navy)', marginBottom: '8px', fontSize: '0.9rem' }}>{f}</label>
                    <input placeholder={`Ingrese ${f.toLowerCase()}...`} disabled style={{ width: '100%', padding: '14px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', background: '#f8fafc', color: '#94a3b8', cursor: 'not-allowed' }} />
                  </div>
                ))}
                <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Configuración disponible próximamente.</p>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
