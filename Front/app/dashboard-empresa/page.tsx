'use client';

import React, { useEffect, useState } from 'react';
import Header from '../Components/header';
import Footer from '../Components/footer';
import '../css/Dashboard/dashboard.css';

const SECTIONS = [
  { title: 'Mi Empresa', icon: '🏢', id: 'professional' },
  { title: 'Publicar Vacante', icon: '📢', id: 'jobs' },
  { title: 'Candidatos', icon: '👥', id: 'candidates' },
  { title: 'Soporte', icon: '🎧', id: 'support' },
];

export default function DashboardEmpresa() {
  const [greeting, setGreeting] = useState('Buenos días');
  const [userName, setUserName] = useState('Empresa');
  const [userId, setUserId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'none' | 'professional' | 'jobs' | 'candidates' | 'support'>('none');
  const [formData, setFormData] = useState({ razon_social: '', nit: '', sector_economico: '', ciudad: '', tamano_empresa: '', tipo_empresa: '', telefono: '', correo: '' });

  useEffect(() => {
    const h = new Date().getHours();
    if (h >= 12 && h < 18) setGreeting('Buenas tardes');
    else if (h >= 18 || h < 5) setGreeting('Buenas noches');

    const savedUser = sessionStorage.getItem('ucc_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        const rawId = userData.id || userData.profile?.id || userData.user_id;
        if (rawId) {
          const cleanId = String(rawId).trim().split(':')[0];
          const rolId = Number(userData.profile?.rol_id);
          if (rolId === 4) window.location.href = '/dashboard-admin';
          else if (rolId === 2) window.location.href = '/dashboard-externo';
          else if (rolId === 1) window.location.href = '/dashboard';
          else { setUserId(cleanId); fetchProfile(cleanId); }
        }
      } catch (e) { console.error(e); }
    }
  }, []);

  const fetchProfile = async (id: string) => {
    try {
      const base = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000').replace(/\/$/, '');
      const res = await fetch(`${base}/api/users/profile/${id}`);
      const data = await res.json();
      if (data.success && data.profile) {
        const u = data.profile;
        const c = u.empresa || {};
        setUserName(c.razon_social || u.nombre_completo?.split(' ')[0] || 'Empresa');
        setFormData({ razon_social: c.razon_social || '', nit: c.nit || '', sector_economico: c.sector_economico || '', ciudad: c.ciudad || '', tamano_empresa: c.tamano_empresa || '', tipo_empresa: c.tipo_empresa || '', telefono: u.telefono || c.telefono || '', correo: u.correo || c.correo || '' });
      }
    } catch (err) { console.error(err); }
  };

  const dis = { padding: '14px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%', fontSize: '0.95rem', background: '#f8fafc', color: '#475569', cursor: 'not-allowed' as const };
  const lbl = { fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '6px', display: 'block', textTransform: 'uppercase' as const, letterSpacing: '0.5px' };

  const INFO_FIELDS = [
    { label: 'Razón Social', val: formData.razon_social },
    { label: 'NIT', val: formData.nit },
    { label: 'Sector Económico', val: formData.sector_economico },
    { label: 'Ciudad', val: formData.ciudad },
    { label: 'Tamaño', val: formData.tamano_empresa },
    { label: 'Correo Corporativo', val: formData.correo },
  ];

  return (
    <div className="db-page" style={{ background: '#f8fafc' }}>
      <Header />
      <main style={{ paddingTop: '80px', minHeight: '100vh' }}>

        {/* Top Hero Banner */}
        <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2340 60%, #1a3a6e 100%)', padding: '50px 40px 80px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(59,130,246,0.08)' }} />
          <div style={{ position: 'absolute', bottom: '-40px', left: '10%', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(139,92,246,0.06)' }} />
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '30px', position: 'relative' }}>
            <div style={{ width: '90px', height: '90px', borderRadius: '24px', background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.8rem', flexShrink: 0, boxShadow: '0 20px 40px rgba(59,130,246,0.3)' }}>🏢</div>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.6)', margin: '0 0 4px', fontSize: '0.9rem', fontWeight: 600 }}>{greeting}</p>
              <h1 style={{ color: 'white', margin: '0 0 10px', fontSize: '2.2rem', fontWeight: 800 }}>{userName}</h1>
              <span style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', padding: '5px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px' }}>EMPRESA ALIADA UCC</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: '80px', zIndex: 100 }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', overflowX: 'auto', padding: '0 20px' }}>
            {SECTIONS.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id as any)} style={{ padding: '18px 28px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap', borderBottom: activeSection === s.id ? '3px solid #3b82f6' : '3px solid transparent', color: activeSection === s.id ? '#3b82f6' : '#64748b', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{s.icon}</span>{s.title}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div style={{ maxWidth: '1200px', margin: '-40px auto 60px', padding: '0 20px', position: 'relative', zIndex: 10 }}>

          {activeSection === 'none' && (
            <div>
              {/* Quick Stats */}
              <div className="responsive-grid-4" style={{ marginBottom: '32px' }}>
                {[
                  { label: 'Vacantes Publicadas', val: '0', icon: '📢', color: '#3b82f6', bg: '#eff6ff' },
                  { label: 'Candidatos Recibidos', val: '0', icon: '📬', color: '#8b5cf6', bg: '#f5f3ff' },
                  { label: 'Perfil Completado', val: formData.razon_social ? '80%' : '20%', icon: '✅', color: '#10b981', bg: '#f0fdf4' },
                  { label: 'Estado Membresía', val: 'Activa', icon: '💎', color: '#f59e0b', bg: '#fffbeb' },
                ].map(c => (
                  <div key={c.label} style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', marginBottom: '12px' }}>{c.icon}</div>
                    <p style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: c.color }}>{c.val}</p>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>{c.label}</p>
                  </div>
                ))}
              </div>

              {/* Welcome card */}
              <div style={{ background: 'white', borderRadius: '24px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', gap: '30px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ fontSize: '5rem' }}>🚀</div>
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <h2 style={{ color: 'var(--ucc-navy)', fontWeight: 800, margin: '0 0 10px' }}>¡Bienvenida al Portal de Empresas!</h2>
                  <p style={{ color: '#64748b', lineHeight: 1.6, margin: '0 0 20px' }}>Aquí puedes gestionar tu perfil corporativo, publicar vacantes y conectar con los mejores egresados UCC.</p>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button onClick={() => setActiveSection('professional')} style={{ background: 'var(--ucc-navy)', color: 'white', border: 'none', borderRadius: '12px', padding: '12px 24px', fontWeight: 700, cursor: 'pointer' }}>Ver Mi Empresa</button>
                    <button onClick={() => setActiveSection('jobs')} style={{ background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '12px 24px', fontWeight: 700, cursor: 'pointer' }}>Publicar Vacante</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'professional' && (
            <div style={{ background: 'white', borderRadius: '24px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem' }}>🏢</div>
                <div>
                  <h2 style={{ margin: 0, color: 'var(--ucc-navy)', fontWeight: 800 }}>Datos Corporativos</h2>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Información registrada de tu empresa</p>
                </div>
              </div>
              <div className="responsive-grid-2">
                {INFO_FIELDS.map(f => (
                  <div key={f.label}>
                    <label style={lbl}>{f.label}</label>
                    <input value={f.val || 'No registrado'} disabled style={dis} />
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '24px', padding: '16px 20px', background: '#fffbeb', borderRadius: '14px', border: '1px solid #fde68a' }}>
                <p style={{ margin: 0, color: '#92400e', fontSize: '0.85rem' }}>⚠️ Para actualizar tus datos corporativos, contacta al administrador del portal.</p>
              </div>
            </div>
          )}

          {activeSection === 'jobs' && (
            <div style={{ background: 'white', borderRadius: '24px', padding: '60px 40px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 24px' }}>📢</div>
              <h2 style={{ color: 'var(--ucc-navy)', fontWeight: 800, fontSize: '1.6rem', marginBottom: '12px' }}>Publicar Oferta Laboral</h2>
              <p style={{ color: '#64748b', maxWidth: '440px', margin: '0 auto 32px', lineHeight: 1.6 }}>Próximamente podrás crear y gestionar vacantes para conectar con los mejores egresados de la UCC.</p>
              <div style={{ display: 'inline-block', background: '#f1f5f9', borderRadius: '16px', padding: '16px 32px' }}>
                <span style={{ color: '#64748b', fontWeight: 700 }}>🚧 En construcción</span>
              </div>
            </div>
          )}

          {activeSection === 'candidates' && (
            <div style={{ background: 'white', borderRadius: '24px', padding: '60px 40px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 24px' }}>👥</div>
              <h2 style={{ color: 'var(--ucc-navy)', fontWeight: 800, fontSize: '1.6rem', marginBottom: '12px' }}>Gestión de Candidatos</h2>
              <p style={{ color: '#64748b', maxWidth: '440px', margin: '0 auto', lineHeight: 1.6 }}>Aquí verás las hojas de vida de los egresados que se postulen a tus vacantes activas.</p>
            </div>
          )}

          {activeSection === 'support' && (
            <div style={{ background: 'white', borderRadius: '24px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <h2 style={{ color: 'var(--ucc-navy)', fontWeight: 800, marginBottom: '24px' }}>🎧 Soporte y Ayuda</h2>
              <div className="responsive-grid-2" style={{ gap: '20px' }}>
                {[
                  { title: 'Correo Soporte', desc: 'egresados@ucc.edu.co', icon: '📧' },
                  { title: 'Teléfono', desc: '+57 (8) 577 6655', icon: '📞' },
                  { title: 'Horario', desc: 'Lunes a Viernes 8am–6pm', icon: '🕐' },
                  { title: 'Chat en Línea', desc: 'Próximamente disponible', icon: '💬' },
                ].map(s => (
                  <div key={s.title} style={{ padding: '24px', border: '1px solid #e2e8f0', borderRadius: '16px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '1.8rem' }}>{s.icon}</div>
                    <div><h4 style={{ margin: '0 0 4px', color: 'var(--ucc-navy)' }}>{s.title}</h4><p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>{s.desc}</p></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
