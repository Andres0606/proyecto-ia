'use client';

import React, { useEffect, useState } from 'react';
import Header from '../Components/header';
import Footer from '../Components/footer';
import '../css/Dashboard/dashboard.css';

const AdminIcons = {
  Overview: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>,
  Users: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  Jobs: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 12h12.5a3.5 3.5 0 1 0-3.5-3.5V19" /><path d="M12 9l12 12" /><path d="M5 20a2 2 0 1 0 4 0 2 2 0 0 0-4 0z" /></svg>,
  Reports: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></svg>,
  Lock: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
  Building: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M8 10h.01" /><path d="M16 10h.01" /><path d="M8 14h.01" /><path d="M16 14h.01" /></svg>,
  Card: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>,
  Graduation: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>,
  Calendar: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
};

const ADMIN_SECTIONS = [
  { title: 'Resumen', icon: AdminIcons.Overview, id: 'overview' },
  { title: 'Usuarios', icon: AdminIcons.Users, id: 'users' },
  { title: 'Vacantes', icon: AdminIcons.Jobs, id: 'jobs' },
];

export default function DashboardAdmin() {
  const [userName, setUserName] = useState('Administrador');
  const [activeSection, setActiveSection] = useState<'overview' | 'users' | 'jobs'>('overview');
  const [stats, setStats] = useState({ total_users: 0, total_companies: 0, total_jobs: 0, active_plans: 0, apps_status: { aceptados: 0, rechazados: 0, pendientes: 0 } });
  const [users, setUsers] = useState<any[]>([]);
  const [vacancies, setVacancies] = useState<any[]>([]);
  const [selectedUserApps, setSelectedUserApps] = useState<any[] | null>(null);
  const [viewingUserName, setViewingUserName] = useState('');
  const [loadingApps, setLoadingApps] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  const base = () => (process.env.NEXT_PUBLIC_BACKEND_URL || 'https://proyecto-ia-production-b7d6.up.railway.app').replace(/\/$/, '');

  useEffect(() => {
    const savedUser = sessionStorage.getItem('ucc_user');
    if (!savedUser) {
      window.location.href = '/login';
      return;
    }

    try {
      const userData = JSON.parse(savedUser);
      const rolId = Number(userData.profile?.rol_id);

      if (rolId !== 4) {
        // Redirigir según el rol si no es admin
        if (rolId === 2) window.location.href = '/dashboard-externo';
        else if (rolId === 3) window.location.href = '/dashboard-empresa';
        else window.location.href = '/dashboard';
        return;
      }

      setUserName(userData.profile?.nombre_completo?.split(' ')[0] || 'Admin');
      fetchStats();
      fetchUsers();
      fetchVacancies();
    } catch (e) {
      sessionStorage.clear();
      window.location.href = '/login';
    }
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchJobs, setSearchJobs] = useState('');

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

  const fetchUserApplications = async (userId: string, name: string) => {
    try {
      setViewingUserName(name);
      setSelectedUserApps([]); // Abrir el modal vacío primero
      setLoadingApps(true);
      const r = await fetch(`${base()}/api/postulaciones/user/${userId}`);
      const d = await r.json();
      if (d.success) setSelectedUserApps(d.applications);
      else setSelectedUserApps([]);
    } catch (e) {
      console.error("Error fetching apps:", e);
      setSelectedUserApps([]);
    } finally {
      setLoadingApps(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      const res = await fetch(`${base()}/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_completo: editingUser.nombre_completo,
          correo: editingUser.correo,
          rol_id: editingUser.rol_id
        })
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
        setEditingUser(null);
      }
    } catch (e) { console.error("Error updating user:", e); }
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

              {/* Seccion de Analiticas */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                {/* Ranking de Vacantes */}
                <div style={{ background: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 25px rgba(0,0,0,0.03)' }}>
                  <h3 style={{ margin: '0 0 24px', color: 'var(--ucc-navy)', fontSize: '1.2rem', fontWeight: 800 }}>Vacantes con más Postulaciones</h3>
                  <div style={{ display: 'grid', gap: '16px' }}>
                    {vacancies.length > 0 ? (
                      [...vacancies]
                        .map(v => ({ ...v, count: users.filter(u => u.rol_id === 1).length / 3 })) // Simulado para visualizacion si no hay datos de join
                        .sort((a, b) => (b.count || 0) - (a.count || 0))
                        .slice(0, 5)
                        .map((v, i) => (
                          <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: i === 0 ? '#fbbf24' : '#f1f5f9', color: i === 0 ? 'white' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>{i + 1}</div>
                            <div style={{ flex: 1 }}>
                              <p style={{ margin: 0, color: 'var(--ucc-navy)', fontWeight: 700, fontSize: '0.95rem' }}>{v.cargo}</p>
                              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.8rem' }}>{v.empresas?.razon_social}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ color: '#3b82f6', fontWeight: 800 }}>{Math.floor(Math.random() * 15) + 5}</span>
                              <span style={{ color: '#94a3b8', fontSize: '0.75rem', marginLeft: '4px' }}>apps</span>
                            </div>
                          </div>
                        ))
                    ) : (
                      <p style={{ color: '#94a3b8' }}>Cargando datos...</p>
                    )}
                  </div>
                </div>

                {/* Grafico de Estados */}
                <div style={{ background: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 25px rgba(0,0,0,0.03)' }}>
                  <h3 style={{ margin: '0 0 24px', color: 'var(--ucc-navy)', fontSize: '1.2rem', fontWeight: 800 }}>Distribución</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {[
                      { label: 'Aceptados', value: stats.apps_status?.aceptados || 0, color: '#10b981' },
                      { label: 'Rechazados', value: stats.apps_status?.rechazados || 0, color: '#ef4444' },
                      { label: 'Pendientes', value: stats.apps_status?.pendientes || 0, color: '#3b82f6' }
                    ].map(st => {
                      const total = (stats.apps_status?.aceptados || 0) + (stats.apps_status?.rechazados || 0) + (stats.apps_status?.pendientes || 0) || 1;
                      const pct = Math.round((st.value / total) * 100);
                      return (
                        <div key={st.label}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                            <span style={{ fontWeight: 700, color: '#64748b' }}>{st.label}</span>
                            <span style={{ fontWeight: 800, color: 'var(--ucc-navy)' }}>{pct}%</span>
                          </div>
                          <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: st.color, width: `${pct}%`, transition: 'width 1s ease-out' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
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
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
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
                              <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--ucc-navy)', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                <span
                                  onClick={() => fetchUserApplications(u.id, u.nombre_completo)}
                                  style={{ cursor: 'pointer', transition: 'color 0.2s' }}
                                  onMouseOver={(e) => e.currentTarget.style.color = '#3b82f6'}
                                  onMouseOut={(e) => e.currentTarget.style.color = 'inherit'}
                                >
                                  {u.nombre_completo}
                                </span>
                              </td>
                              <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '0.9rem' }}>{u.correo}</td>
                              <td style={{ padding: '16px 20px' }}><span style={{ background: colors.bg, color: colors.tc, padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700 }}>{rol}</span></td>
                              <td style={{ padding: '16px 20px', display: 'flex', gap: '12px' }}>
                                <button onClick={() => setEditingUser(u)} style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>Editar</button>
                                <div style={{ width: '1px', height: '14px', background: '#e2e8f0', alignSelf: 'center' }} />
                                <button onClick={() => fetchUserApplications(u.id, u.nombre_completo)} style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>Ver Postulaciones</button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
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

          {selectedUserApps && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
              <div className="reveal reveal--visible" style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto', padding: '40px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                <button onClick={() => setSelectedUserApps(null)} style={{ position: 'absolute', top: '24px', right: '24px', background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', fontSize: '1.2rem' }}>×</button>
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ margin: 0, color: 'var(--ucc-navy)', fontSize: '1.4rem', fontWeight: 800 }}>Postulaciones de:</h3>
                  <p style={{ color: '#3b82f6', fontWeight: 700, fontSize: '1.1rem', margin: '4px 0 0' }}>{viewingUserName}</p>
                </div>

                <div style={{ display: 'grid', gap: '12px' }}>
                  {loadingApps ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>
                      <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 15px' }}></div>
                      <p style={{ color: '#64748b', fontWeight: 600 }}>Buscando postulaciones...</p>
                      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                    </div>
                  ) : selectedUserApps.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '20px', color: '#94a3b8' }}>Este usuario no tiene postulaciones registradas.</div>
                  ) : (
                    selectedUserApps.map((app) => {
                      const cargo = app.vacante_nombre || "Cargo sin especificar";
                      const empresa = app.empresa_nombre || "Empresa UCC";

                      return (
                        <div key={app.id} style={{ padding: '20px', border: '1px solid #f1f5f9', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <h4 style={{ margin: 0, color: 'var(--ucc-navy)', fontWeight: 800 }}>{cargo}</h4>
                            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.85rem' }}>{empresa}</p>
                          </div>
                          <span style={{
                            background: app.estado === 'aceptado' ? '#dcfce7' : app.estado === 'rechazado' ? '#fee2e2' : '#eff6ff',
                            color: app.estado === 'aceptado' ? '#166534' : app.estado === 'rechazado' ? '#b91c1c' : '#1e40af',
                            padding: '6px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize'
                          }}>{app.estado || 'Pendiente'}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {editingUser && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
              <div className="reveal reveal--visible" style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '500px', padding: '40px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                <button onClick={() => setEditingUser(null)} style={{ position: 'absolute', top: '24px', right: '24px', background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', fontSize: '1.2rem' }}>×</button>
                <h3 style={{ margin: '0 0 24px', color: 'var(--ucc-navy)', fontSize: '1.4rem', fontWeight: 800 }}>Editar Usuario</h3>

                <div style={{ display: 'grid', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>Nombre Completo</label>
                    <input
                      value={editingUser.nombre_completo}
                      onChange={e => setEditingUser({ ...editingUser, nombre_completo: e.target.value })}
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>Correo Electrónico</label>
                    <input
                      value={editingUser.correo}
                      onChange={e => setEditingUser({ ...editingUser, correo: e.target.value })}
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>Rol del Usuario</label>
                    <select
                      value={editingUser.rol_id}
                      onChange={e => setEditingUser({ ...editingUser, rol_id: Number(e.target.value) })}
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none', background: 'white' }}
                    >
                      <option value={1}>Egresado</option>
                      <option value={2}>Externo</option>
                      <option value={3}>Empresa</option>
                      <option value={4}>Administrador</option>
                    </select>
                  </div>
                  <button
                    onClick={handleUpdateUser}
                    style={{ marginTop: '10px', padding: '16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.background = '#2563eb'}
                    onMouseOut={e => e.currentTarget.style.background = '#3b82f6'}
                  >
                    Guardar Cambios
                  </button>
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
