'use client';

import React, { useEffect, useState } from 'react';
import Header from '../Components/header';
import Footer from '../Components/footer';
import '../css/Dashboard/dashboard.css';

const QUICK_ACTIONS = [
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
          setUserId(cleanId); fetchProfile(cleanId);
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
          razon_social: c.razon_social || '', nit: c.nit || '', sector_economico: c.sector_economico || '', 
          ciudad: c.ciudad || '', tamano_empresa: c.tamano_empresa || '', tipo_empresa: c.tipo_empresa || '', 
          telefono: u.telefono || c.telefono || '', correo: u.correo || c.correo || '' 
        });
      }
    } catch (err) { console.error(err); }
  };

  const inp = { padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%', fontSize: '0.95rem', background: '#f8fafc', color: '#64748b', cursor: 'not-allowed' as const };
  const lbl = { fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '8px', display: 'block', textTransform: 'uppercase' as const };

  return (
    <div className="db-page" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <Header />
      
      {toast.type !== 'none' && (
        <div style={{ position: 'fixed', bottom: '32px', right: '32px', zIndex: 9999, padding: '14px 22px', borderRadius: '14px', color: 'white', fontWeight: 600, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', background: toast.type === 'success' ? '#059669' : toast.type === 'error' ? '#dc2626' : '#1e3a5f' }}>
          {toast.msg}
        </div>
      )}

      <main style={{ paddingTop: '110px', maxWidth: '1100px', margin: '0 auto', paddingBottom: '60px' }}>

        {/* Hero Card */}
        <div style={{ background: 'white', borderRadius: '24px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '32px', marginBottom: '40px' }}>
          <div style={{ width: '120px', height: '120px', borderRadius: '24px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>🏢</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <h1 style={{ margin: 0, color: '#1e3a5f', fontSize: '2.2rem', fontWeight: 800 }}>{greeting}, {userName} ✨</h1>
              <span style={{ background: '#eff6ff', color: '#1e40af', padding: '6px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>EMPRESA ALIADA UCC</span>
            </div>
            <p style={{ color: '#64748b', margin: 0, fontSize: '1rem' }}>Panel de gestión corporativa</p>
          </div>
        </div>

        {/* Action Grid (Restaurado con INICIO) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          {QUICK_ACTIONS.map(a => (
            <div key={a.id} onClick={() => setActiveSection(a.id as any)} style={{ background: 'white', borderRadius: '24px', padding: '30px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', cursor: 'pointer', border: activeSection === a.id ? '2px solid #3b82f6' : '2px solid transparent', transition: 'all 0.2s' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>{a.icon}</div>
              <h3 style={{ margin: 0, color: '#1e3a5f', fontWeight: 800, fontSize: '1.1rem' }}>{a.title}</h3>
            </div>
          ))}
        </div>

        {/* Content Area */}
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
          {activeSection === 'none' && (
            <div style={{ background: 'white', borderRadius: '24px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', gap: '30px', alignItems: 'center' }}>
              <div style={{ fontSize: '5rem' }}>🏢</div>
              <div style={{ flex: 1 }}>
                <h2 style={{ color: '#1e3a5f', fontWeight: 800, margin: '0 0 10px' }}>¡Bienvenido al Panel de Empresas!</h2>
                <p style={{ color: '#64748b', lineHeight: 1.6, margin: '0 0 20px' }}>Gestione sus vacantes, busque candidatos y mantenga actualizado el perfil de su organización.</p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => setActiveSection('jobs')} style={{ background: '#1e3a5f', color: 'white', border: 'none', borderRadius: '12px', padding: '14px 28px', fontWeight: 700, cursor: 'pointer' }}>Publicar Vacante</button>
                  <button onClick={() => setActiveSection('professional')} style={{ background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '12px', padding: '14px 28px', fontWeight: 700, cursor: 'pointer' }}>Ver Mi Empresa</button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'professional' && (
            <div style={{ background: 'white', borderRadius: '24px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <h2 style={{ margin: '0 0 32px', color: '#1e3a5f', fontWeight: 800 }}>🏢 Datos Corporativos</h2>
              <div className="responsive-grid-2">
                {[
                  { label: 'Razón Social', val: formData.razon_social },
                  { label: 'NIT', val: formData.nit },
                  { label: 'Sector Económico', val: formData.sector_economico },
                  { label: 'Ciudad', val: formData.ciudad },
                  { label: 'Tamaño', val: formData.tamano_empresa },
                  { label: 'Tipo', val: formData.tipo_empresa },
                  { label: 'Correo', val: formData.correo },
                  { label: 'Teléfono', val: formData.telefono },
                ].map(f => (
                  <div key={f.label}><label style={lbl}>{f.label}</label><input value={f.val || 'No registrado'} disabled style={inp} /></div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'jobs' && (
            <div style={{ background: 'white', borderRadius: '24px', padding: '60px 40px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📢</div>
              <h2 style={{ color: '#1e3a5f', fontWeight: 800, margin: '0 0 12px' }}>Publicar Oferta Laboral</h2>
              <p style={{ color: '#64748b', maxWidth: '440px', margin: '0 auto 32px' }}>Módulo próximamente disponible.</p>
            </div>
          )}

          {activeSection === 'candidates' && (
            <div style={{ background: 'white', borderRadius: '24px', padding: '60px 40px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>👥</div>
              <h2 style={{ color: '#1e3a5f', fontWeight: 800, margin: '0 0 12px' }}>Gestión de Candidatos</h2>
              <p style={{ color: '#64748b' }}>Revise los candidatos que se postulan a sus ofertas.</p>
            </div>
          )}

          {activeSection === 'support' && (
            <div style={{ background: 'white', borderRadius: '24px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <h2 style={{ margin: '0 0 32px', color: '#1e3a5f', fontWeight: 800 }}>🎧 Soporte</h2>
              <div className="responsive-grid-2" style={{ gap: '20px' }}>
                {[
                  { t: 'Correo', v: 'egresados@ucc.edu.co', i: '📧' },
                  { t: 'Teléfono', v: '+57 (8) 577 6655', i: '📞' },
                ].map(s => (
                  <div key={s.t} style={{ padding: '20px', border: '1px solid #f1f5f9', borderRadius: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ fontSize: '2rem' }}>{s.i}</div>
                    <div><h4 style={{ margin: 0, color: '#1e3a5f' }}>{s.t}</h4><p style={{ margin: 0, color: '#64748b' }}>{s.v}</p></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
