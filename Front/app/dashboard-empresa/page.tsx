'use client';

import React, { useEffect, useState } from 'react';
import Header from '../Components/header';
import Footer from '../Components/footer';
import '../css/Dashboard/dashboard.css';

const SECTIONS = [
  { title: 'Inicio', icon: '🏠', id: 'none' },
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
  const [toast, setToast] = useState<{ msg: string, type: 'info' | 'success' | 'error' | 'none' }>({ msg: '', type: 'none' });
  const [formData, setFormData] = useState({ 
    razon_social: '', nit: '', sector_economico: '', ciudad: '', 
    tamano_empresa: '', tipo_empresa: '', telefono: '', correo: '' 
  });

  const showToast = (msg: string, type: 'info' | 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'none' }), 3000);
  };

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
          
          // Guardias de ruta
          if (rolId === 4) window.location.href = '/dashboard-admin';
          else if (rolId === 2) window.location.href = '/dashboard-externo';
          else if (rolId === 1) window.location.href = '/dashboard';
          else { 
            setUserId(cleanId); 
            fetchProfile(cleanId); 
          }
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
        setFormData({ 
          razon_social: c.razon_social || '', 
          nit: c.nit || '', 
          sector_economico: c.sector_economico || '', 
          ciudad: c.ciudad || '', 
          tamano_empresa: c.tamano_empresa || '', 
          tipo_empresa: c.tipo_empresa || '', 
          telefono: u.telefono || c.telefono || '', 
          correo: u.correo || c.correo || '' 
        });
      }
    } catch (err) { console.error(err); }
  };

  const inp = { padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%', fontSize: '0.95rem', outline: 'none' };
  const dis = { ...inp, background: '#f8fafc', color: '#64748b', cursor: 'not-allowed' as const };
  const lbl = { fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px', display: 'block', textTransform: 'uppercase' as const, letterSpacing: '0.5px' };

  return (
    <div className="db-page" style={{ background: '#f8fafc' }}>
      <Header />
      
      {/* Toast Notification */}
      {toast.type !== 'none' && (
        <div style={{ position: 'fixed', bottom: '32px', right: '32px', zIndex: 9999, padding: '14px 22px', borderRadius: '14px', color: 'white', fontWeight: 600, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', background: toast.type === 'success' ? '#059669' : toast.type === 'error' ? '#dc2626' : '#1e3a5f', transition: 'all 0.3s' }}>
          {toast.msg}
        </div>
      )}

      <main style={{ paddingTop: '80px', minHeight: '100vh' }}>

        {/* Hero Banner (Modernized) */}
        <div style={{ background: 'linear-gradient(135deg, #002855 0%, #003875 50%, #00A9E0 100%)', padding: '50px 40px 80px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '320px', height: '320px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
          <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '240px', height: '240px', borderRadius: '50%', background: 'rgba(0,169,224,0.1)' }} />
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '28px', position: 'relative', flexWrap: 'wrap' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '24px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', flexShrink: 0, boxShadow: '0 15px 35px rgba(0,0,0,0.2)' }}>🏢</div>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.6)', margin: '0 0 4px', fontSize: '0.9rem' }}>{greeting}</p>
              <h1 style={{ color: 'white', margin: '0 0 10px', fontSize: '2.2rem', fontWeight: 800 }}>{userName}</h1>
              <span style={{ background: 'rgba(0,169,224,0.25)', color: '#7dd3fc', padding: '5px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px' }}>EMPRESA ALIADA UCC</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Glassmorphism) */}
        <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: '80px', zIndex: 100 }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', overflowX: 'auto', padding: '0 20px' }}>
            {SECTIONS.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id as any)} style={{ padding: '18px 26px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap', borderBottom: activeSection === s.id ? '3px solid var(--ucc-navy)' : '3px solid transparent', color: activeSection === s.id ? 'var(--ucc-navy)' : '#64748b', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{s.icon}</span>{s.title}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div style={{ maxWidth: '1200px', margin: '40px auto 60px', padding: '0 20px', position: 'relative', zIndex: 10 }}>

          {activeSection === 'none' && (
            <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
              {/* Quick Stats Cards */}
              <div className="responsive-grid-4" style={{ marginBottom: '40px', gap: '28px' }}>
                {[
                  { label: 'Vacantes Publicadas', val: '0', icon: '📢', color: 'var(--ucc-navy)', bg: '#eff6ff' },
                  { label: 'Candidatos Recibidos', val: '0', icon: '📬', color: '#00A9E0', bg: '#e0f7ff' },
                  { label: 'Perfil Empresa', val: formData.razon_social ? '100%' : '20%', icon: '🏢', color: '#8b5cf6', bg: '#f5f3ff' },
                  { label: 'Membresía', val: 'Premium', icon: '💎', color: '#f59e0b', bg: '#fffbeb' },
                ].map(c => (
                  <div key={c.label} style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', marginBottom: '12px' }}>{c.icon}</div>
                    <p style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: c.color }}>{c.val}</p>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>{c.label}</p>
                  </div>
                ))}
              </div>

              {/* Welcome/CTA Card */}
              <div style={{ background: 'white', borderRadius: '24px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', gap: '30px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ fontSize: '5rem' }}>🚀</div>
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <h2 style={{ color: 'var(--ucc-navy)', fontWeight: 800, margin: '0 0 10px' }}>¡Bienvenido al Panel Corporativo!</h2>
                  <p style={{ color: '#64748b', lineHeight: 1.6, margin: '0 0 20px' }}>Gestione su presencia en la Universidad Cooperativa de Colombia. Publique vacantes y acceda al talento de nuestros mejores egresados.</p>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button onClick={() => setActiveSection('jobs')} style={{ background: 'var(--ucc-navy)', color: 'white', border: 'none', borderRadius: '12px', padding: '14px 28px', fontWeight: 700, cursor: 'pointer', transition: 'transform 0.2s' }}>Publicar Nueva Vacante</button>
                    <button onClick={() => setActiveSection('professional')} style={{ background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '12px', padding: '14px 28px', fontWeight: 700, cursor: 'pointer' }}>Editar Perfil</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'professional' && (
            <div style={{ background: 'white', borderRadius: '24px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', animation: 'fadeIn 0.3s ease-out' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem' }}>🏢</div>
                <div>
                  <h2 style={{ margin: 0, color: 'var(--ucc-navy)', fontWeight: 800 }}>Datos Corporativos</h2>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Información oficial de su organización</p>
                </div>
              </div>
              <div className="responsive-grid-2">
                {[
                  { label: 'Razón Social', val: formData.razon_social },
                  { label: 'NIT', val: formData.nit },
                  { label: 'Sector Económico', val: formData.sector_economico },
                  { label: 'Ciudad', val: formData.ciudad },
                  { label: 'Tamaño de Empresa', val: formData.tamano_empresa },
                  { label: 'Tipo de Empresa', val: formData.tipo_empresa },
                  { label: 'Correo Corporativo', val: formData.correo },
                  { label: 'Teléfono de Contacto', val: formData.telefono },
                ].map(f => (
                  <div key={f.label}>
                    <label style={lbl}>{f.label}</label>
                    <input value={f.val || 'No registrado'} disabled style={dis} />
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '32px', padding: '20px', background: '#fffbeb', borderRadius: '16px', border: '1px solid #fde68a', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ fontSize: '1.5rem' }}>⚠️</div>
                <p style={{ margin: 0, color: '#92400e', fontSize: '0.9rem', fontWeight: 500 }}>
                  Para modificar los datos básicos de su empresa, por favor comuníquese con la oficina de egresados de su sede.
                </p>
              </div>
            </div>
          )}

          {activeSection === 'jobs' && (
            <div style={{ background: 'white', borderRadius: '24px', padding: '60px 40px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', textAlign: 'center', animation: 'fadeIn 0.3s ease-out' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 24px' }}>📢</div>
              <h2 style={{ color: 'var(--ucc-navy)', fontWeight: 800, fontSize: '1.8rem', marginBottom: '12px' }}>Publicar Oferta Laboral</h2>
              <p style={{ color: '#64748b', maxWidth: '440px', margin: '0 auto 32px', lineHeight: 1.6 }}>Próximamente podrá crear y gestionar vacantes para conectar con los mejores egresados de la Universidad Cooperativa.</p>
              <div style={{ display: 'inline-block', background: '#f1f5f9', borderRadius: '20px', padding: '16px 40px' }}>
                <span style={{ color: '#64748b', fontWeight: 800, fontSize: '1rem' }}>🚧 Módulo en desarrollo</span>
              </div>
            </div>
          )}

          {activeSection === 'candidates' && (
            <div style={{ background: 'white', borderRadius: '24px', padding: '60px 40px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', textAlign: 'center', animation: 'fadeIn 0.3s ease-out' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 24px' }}>👥</div>
              <h2 style={{ color: 'var(--ucc-navy)', fontWeight: 800, fontSize: '1.8rem', marginBottom: '12px' }}>Gestión de Candidatos</h2>
              <p style={{ color: '#64748b', maxWidth: '440px', margin: '0 auto', lineHeight: 1.6 }}>En este apartado podrá revisar las hojas de vida y perfiles de los egresados que se postulen a sus ofertas.</p>
            </div>
          )}

          {activeSection === 'support' && (
            <div style={{ background: 'white', borderRadius: '24px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', animation: 'fadeIn 0.3s ease-out' }}>
              <h2 style={{ color: 'var(--ucc-navy)', fontWeight: 800, marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span>🎧</span> Centro de Ayuda Corporativo
              </h2>
              <div className="responsive-grid-2" style={{ gap: '24px' }}>
                {[
                  { title: 'Correo Soporte', desc: 'empresas.egresados@ucc.edu.co', icon: '📧' },
                  { title: 'Teléfono', desc: '+57 (8) 577 6655 ext. 120', icon: '📞' },
                  { title: 'Horario Corporativo', desc: 'Lunes a Viernes 8:00 AM – 6:00 PM', icon: '🕐' },
                  { title: 'Chat Soporte', desc: 'Disponible de 9:00 AM a 4:00 PM', icon: '💬' },
                ].map(s => (
                  <div key={s.title} style={{ padding: '28px', border: '1px solid #f1f5f9', borderRadius: '20px', display: 'flex', gap: '20px', alignItems: 'center', transition: 'all 0.2s' }} onMouseOver={e => (e.currentTarget.style.borderColor = '#3b82f6')} onMouseOut={e => (e.currentTarget.style.borderColor = '#f1f5f9')}>
                    <div style={{ fontSize: '2.2rem' }}>{s.icon}</div>
                    <div><h4 style={{ margin: '0 0 6px', color: 'var(--ucc-navy)', fontSize: '1.1rem' }}>{s.title}</h4><p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem', fontWeight: 500 }}>{s.desc}</p></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      
      <Footer />
    </div>
  );
}
