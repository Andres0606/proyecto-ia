'use client';

import React, { useEffect, useState } from 'react';
import Header from '../Components/header';
import Footer from '../Components/footer';
import '../css/Dashboard/dashboard.css';

const QUICK_ACTIONS = [
  { title: 'Perfil Empresa', icon: '🏢', id: 'professional' },
  { title: 'Publicar Vacante', icon: '📢', id: 'jobs' },
  { title: 'Ver Candidatos', icon: '👥', id: 'candidates' },
  { title: 'Soporte', icon: '🎧', id: 'support' },
];

export default function DashboardEmpresa() {
  const [greeting, setGreeting] = useState('Buenos días');
  const [userName, setUserName] = useState('Empresa');
  const [userId, setUserId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'none' | 'professional' | 'jobs' | 'candidates' | 'support'>('none');
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [formData, setFormData] = useState({
    razon_social: '', nit: '', sector_economico: '', ciudad: '', tamano_empresa: '', tipo_empresa: '', telefono: '', correo: ''
  });

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 12 && hour < 18) setGreeting('Buenas tardes');
    else if (hour >= 18 || hour < 5) setGreeting('Buenas noches');

    const savedUser = sessionStorage.getItem('ucc_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        const rawId = userData.id || userData.profile?.id || userData.user_id;
        if (rawId) {
          const cleanId = String(rawId).trim().split(':')[0];
          const rolId = Number(userData.profile?.rol_id);

          // Route Guard
          if (rolId === 4) window.location.href = "/dashboard-admin";
          else if (rolId === 2) window.location.href = "/dashboard-externo";
          else if (rolId === 1) window.location.href = "/dashboard";
          else {
            setUserId(cleanId);
            fetchFullProfile(cleanId);
          }
        }
      } catch (e) { console.error(e); }
    }
  }, []);

  const fetchFullProfile = async (id: string) => {
    try {
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000').replace(/\/$/, '');
      const res = await fetch(`${backendUrl}/api/users/profile/${id}`);
      const data = await res.json();
      if (data.success && data.profile) {
        const u = data.profile;
        const c = u.empresa || {};
        setUserName(c.razon_social || 'Empresa');
        setFormData({
          razon_social: c.razon_social || '', nit: c.nit || '', sector_economico: c.sector_economico || '',
          ciudad: c.ciudad || '', tamano_empresa: c.tamano_empresa || '', tipo_empresa: c.tipo_empresa || '',
          telefono: u.telefono || c.telefono || '', correo: u.correo || c.correo || ''
        });
      }
    } catch (err) { console.error(err); }
  };

  const labelStyle = { fontSize: '0.9rem', fontWeight: 700, color: 'var(--ucc-navy)', marginBottom: '8px', display: 'block' };
  const disabledInputStyle = { padding: '16px 24px', borderRadius: '14px', border: '1px solid #e2e8f0', width: '100%', fontSize: '1rem', background: '#f8fafc', color: '#64748b' };

  return (
    <div className="db-page">
      <Header />
      <main className="db-main" style={{ paddingTop: '100px', minHeight: '80vh' }}>
        <div className="db-card" style={{ margin: '0 auto 40px', maxWidth: '1100px', padding: '30px 40px', display: 'flex', alignItems: 'center', gap: '40px', background: 'white', borderRadius: '24px' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '20px', background: 'var(--ucc-navy)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800 }}>🏢</div>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, color: 'var(--ucc-navy)', fontSize: '2rem' }}>{greeting}, {userName}</h1>
            <span style={{ background: '#fef3c7', color: '#92400e', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>EMPRESA ALIADA</span>
          </div>
        </div>

        <div className="db-actions" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '25px', margin: '40px auto', maxWidth: '1100px' }}>
          {QUICK_ACTIONS.map((action) => (
            <div key={action.id} onClick={() => setActiveSection(action.id as any)} style={{ cursor: 'pointer', padding: '30px', textAlign: 'center', background: 'white', borderRadius: '24px', border: activeSection === action.id ? '2px solid var(--ucc-blue)' : '1px solid #f1f5f9', boxShadow: '0 8px 20px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>{action.icon}</div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--ucc-navy)', fontWeight: 800 }}>{action.title}</h3>
            </div>
          ))}
        </div>

        <div style={{ maxWidth: '1100px', margin: '0 auto 60px' }}>
          {activeSection === 'professional' && (
            <div className="db-card" style={{ padding: '45px', borderRadius: '28px' }}>
              <h2 style={{ color: 'var(--ucc-navy)', fontWeight: 800, marginBottom: '30px' }}>🏢 Datos Corporativos</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '35px' }}>
                <div className="form-group"><label style={labelStyle}>Razón Social</label><input type="text" value={formData.razon_social} disabled style={disabledInputStyle} /></div>
                <div className="form-group"><label style={labelStyle}>NIT</label><input type="text" value={formData.nit} disabled style={disabledInputStyle} /></div>
                <div className="form-group"><label style={labelStyle}>Sector Económico</label><input type="text" value={formData.sector_economico} disabled style={disabledInputStyle} /></div>
                <div className="form-group"><label style={labelStyle}>Ciudad</label><input type="text" value={formData.ciudad} disabled style={disabledInputStyle} /></div>
                <div className="form-group"><label style={labelStyle}>Tamaño</label><input type="text" value={formData.tamano_empresa} disabled style={disabledInputStyle} /></div>
                <div className="form-group"><label style={labelStyle}>Correo Corporativo</label><input type="text" value={formData.correo} disabled style={disabledInputStyle} /></div>
              </div>
            </div>
          )}

          {activeSection === 'jobs' && (
            <div className="db-card" style={{ padding: '45px', borderRadius: '28px', textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📢</div>
              <h2 style={{ color: 'var(--ucc-navy)', fontWeight: 800 }}>Publicar Oferta Laboral</h2>
              <p style={{ color: '#64748b' }}>Próximamente: Podrás crear vacantes y conectar con los mejores egresados UCC.</p>
            </div>
          )}

          {activeSection === 'candidates' && (
            <div className="db-card" style={{ padding: '45px', borderRadius: '28px', textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>👥</div>
              <h2 style={{ color: 'var(--ucc-navy)', fontWeight: 800 }}>Gestión de Candidatos</h2>
              <p style={{ color: '#64748b' }}>Aquí verás las hojas de vida de los egresados que se postulen a tus vacantes.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
