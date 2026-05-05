'use client';

import React, { useEffect, useState } from 'react';
import Header from '../Components/header';
import Footer from '../Components/footer';
import '../css/Dashboard/dashboard.css';

const Icons = {
  Home: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
  Company: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M8 10h.01" /><path d="M16 10h.01" /><path d="M8 14h.01" /><path d="M16 14h.01" /></svg>,
  Announce: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a3 3 0 0 0-3-3H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a3 3 0 0 0 3-3V8Z" /><path d="M10 8v4" /><path d="M21 15v-2a5 5 0 0 0-5-5" /><path d="M21 9v2" /></svg>,
  Users: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M17 7a4 4 0 0 1 0 7.75" /></svg>,
  Support: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" /></svg>
};

const QUICK_ACTIONS = [
  { title: 'Inicio', Icon: Icons.Home, id: 'none', color: '#3b82f6' },
  { title: 'Mi Empresa', Icon: Icons.Company, id: 'professional', color: '#1e3a5f' },
  { title: 'Publicar Vacante', Icon: Icons.Announce, id: 'jobs', color: '#8b5cf6' },
  { title: 'Candidatos', Icon: Icons.Users, id: 'candidates', color: '#10b981' },
  { title: 'Soporte', Icon: Icons.Support, id: 'support', color: '#ef4444' },
];

export default function DashboardEmpresa() {
  const [greeting, setGreeting] = useState('Buenos días');
  const [companyName, setCompanyName] = useState('Empresa');
  const [companySlogan, setCompanySlogan] = useState('Panel de gestión corporativa');
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'none' | 'professional' | 'jobs' | 'candidates' | 'support'>('none');
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState<{ msg: string, type: 'info' | 'success' | 'error' | 'none' }>({ msg: '', type: 'none' });
  const [formData, setFormData] = useState({
    razon_social: '', nit: '', sector_economico: '', ciudad: '',
    tamano_empresa: '', tipo_empresa: '', telefono: '', correo: '', eslogan: ''
  });

  const logoInputRef = React.useRef<HTMLInputElement>(null);

  const base = () => (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000').replace(/\/$/, '');

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
      } catch (e) { console.error('Error parseando usuario:', e); }
    }
  }, []);

  const fetchProfile = async (id: string) => {
    try {
      const res = await fetch(`${base()}/api/users/profile/${id}`);
      const data = await res.json();
      
      if (data.success && data.profile) {
        const u = data.profile;
        // Buscamos la empresa en la respuesta. Puede venir como 'empresa' o dentro de un array.
        const c = u.empresa || (u.empresas && u.empresas[0]) || {};
        
        console.log('📦 Datos de empresa recuperados:', c);

        const nombreFinal = c.razon_social || u.nombre_completo || 'Empresa UCC';
        setCompanyName(nombreFinal);
        setCompanySlogan(c.eslogan || 'Panel de gestión y talento corporativo');
        
        // Añadimos un timestamp para evitar el caché del navegador al actualizar la foto
        if (u.foto_url) {
          const freshUrl = `${u.foto_url}?t=${new Date().getTime()}`;
          setCompanyLogo(freshUrl);
        }

        // Actualizar sesión para el Header
        const savedSession = sessionStorage.getItem('ucc_user');
        if (savedSession) {
          const sessionObj = JSON.parse(savedSession);
          sessionObj.profile = { ...u, nombre_completo: nombreFinal };
          sessionStorage.setItem('ucc_user', JSON.stringify(sessionObj));
          window.dispatchEvent(new Event('storage'));
        }

        setFormData({
          razon_social: c.razon_social || '',
          nit: c.nit || '',
          sector_economico: c.sector_economico || '',
          ciudad: c.ciudad || '',
          tamano_empresa: c.tamano_empresa || '',
          tipo_empresa: c.tipo_empresa || '',
          telefono: c.telefono || u.telefono || '',
          correo: c.correo || u.correo || '',
          eslogan: c.eslogan || ''
        });
      }
    } catch (err) { 
      console.error('❌ Error crítico recuperando perfil:', err);
      setToast({ msg: 'Error de conexión con el servidor', type: 'error' });
    }
  };

  const handleSave = async () => {
    if (!userId) return;
    setToast({ msg: 'Guardando...', type: 'info' });
    try {
      const r = await fetch(`${base()}/api/users/profile/${userId}`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ userData: formData, profileData: formData, isCompany: true }) 
      });
      const d = await r.json();
      if (d.success) { 
        setToast({ msg: '¡Datos Guardados!', type: 'success' }); 
        setIsEditing(false); 
        fetchProfile(userId); 
      }
    } catch { setToast({ msg: 'Error al guardar', type: 'error' }); } 
    finally { setTimeout(() => setToast({ msg: '', type: 'none' }), 3000); }
  };

  const handleLogoUpload = async (file: File) => {
    if (!userId) return;
    setToast({ msg: 'Subiendo Logo...', type: 'info' });
    const fd = new FormData();
    fd.append('image', file);
    fd.append('userId', userId);
    try {
      const r = await fetch(`${base()}/api/users/upload-avatar`, { method: 'POST', body: fd });
      const d = await r.json();
      if (d.success) {
        setToast({ msg: '¡Logo actualizado!', type: 'success' });
        // Llamada inmediata para refrescar la UI
        await fetchProfile(userId);
      }
    } catch { setToast({ msg: 'Error de subida', type: 'error' }); }
    finally { setTimeout(() => setToast({ msg: '', type: 'none' }), 3000); }
  };

  const inp = { padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%', fontSize: '0.95rem' };
  const dis = { ...inp, background: '#f8fafc', color: '#64748b', cursor: 'not-allowed' as const };
  const lbl = { fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '8px', display: 'block', textTransform: 'uppercase' as const };

  return (
    <div className="db-page" style={{ background: '#f4f7fa', minHeight: '100vh' }}>
      <Header />
      <input type="file" ref={logoInputRef} hidden accept="image/*" onChange={e => e.target.files?.[0] && handleLogoUpload(e.target.files[0])} />

      {toast.type !== 'none' && (
        <div style={{ position: 'fixed', bottom: '32px', right: '32px', zIndex: 9999, padding: '16px 24px', borderRadius: '16px', color: 'white', fontWeight: 600, boxShadow: '0 10px 40px rgba(0,0,0,0.15)', background: toast.type === 'success' ? '#059669' : toast.type === 'error' ? '#dc2626' : '#1e3a5f' }}>
          {toast.msg}
        </div>
      )}

      <main style={{ paddingTop: '110px', maxWidth: '1120px', margin: '0 auto', paddingBottom: '60px' }}>

        {/* Hero Card Corporativo */}
        <div style={{ background: 'white', borderRadius: '32px', padding: '40px', boxShadow: '0 10px 40px rgba(0,40,85,0.04)', display: 'flex', alignItems: 'center', gap: '40px', marginBottom: '32px', border: '1px solid rgba(226, 232, 240, 0.5)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)', zIndex: 0 }} />
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => logoInputRef.current?.click()}>
            <div style={{ width: '130px', height: '130px', borderRadius: '28px', background: companyLogo ? `url(${companyLogo}) center/cover` : '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem', boxShadow: '0 8px 25px rgba(0,0,0,0.05)', color: '#1e3a5f', border: '4px solid white' }}>
              {!companyLogo && <Icons.Company />}
            </div>
            <div style={{ position: 'absolute', bottom: '-5px', right: '-5px', background: '#1e3a5f', color: 'white', width: '32px', height: '32px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', border: '2px solid white' }}>✎</div>
          </div>
          <div style={{ flex: 1, zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '10px' }}>
              <h1 style={{ margin: 0, color: '#1e3a5f', fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.5px' }}>{greeting}, {companyName} ✨</h1>
              <span style={{ background: '#eff6ff', color: '#1e40af', padding: '8px 18px', borderRadius: '30px', fontSize: '0.75rem', fontWeight: 800, border: '1px solid #dbeafe', textTransform: 'uppercase' }}>EMPRESA ALIADA UCC</span>
            </div>
            <p style={{ color: '#64748b', margin: 0, fontSize: '1.2rem', fontWeight: 600, fontStyle: 'italic' }}>"{companySlogan}"</p>
          </div>
        </div>

        {/* Action Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px', marginBottom: '40px' }}>
          {QUICK_ACTIONS.map(a => (
            <div key={a.id} onClick={() => setActiveSection(a.id as any)} style={{ background: activeSection === a.id ? 'white' : 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)', borderRadius: '28px', padding: '32px 20px', textAlign: 'center', boxShadow: activeSection === a.id ? '0 15px 35px rgba(30, 58, 95, 0.15)' : '0 4px 15px rgba(0,0,0,0.03)', cursor: 'pointer', border: activeSection === a.id ? `2px solid ${a.color}` : '1px solid rgba(255,255,255,0.4)', transition: 'all 0.3s', transform: activeSection === a.id ? 'translateY(-5px)' : 'none' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: `${a.color}15`, color: a.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <a.Icon />
              </div>
              <h3 style={{ margin: 0, color: '#1e3a5f', fontWeight: 800, fontSize: '0.95rem' }}>{a.title}</h3>
            </div>
          ))}
        </div>

        {/* Content Area */}
        <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
          {activeSection === 'none' && (
            <div style={{ background: 'white', borderRadius: '32px', padding: '50px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', display: 'flex', gap: '40px', alignItems: 'center' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '30px', background: 'linear-gradient(135deg, #1e3a5f 0%, #3b82f6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><Icons.Company /></div>
              <div style={{ flex: 1 }}>
                <h2 style={{ color: '#1e3a5f', fontWeight: 900, fontSize: '1.8rem', margin: '0 0 12px' }}>¡Bienvenido al Panel Corporativo!</h2>
                <p style={{ color: '#64748b', lineHeight: 1.7, margin: '0 0 28px', fontSize: '1.05rem' }}>Desde aquí podrá gestionar su presencia en la Universidad Cooperativa y conectar con el mejor talento egresado.</p>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <button onClick={() => setActiveSection('jobs')} style={{ background: '#1e3a5f', color: 'white', border: 'none', borderRadius: '16px', padding: '16px 32px', fontWeight: 800, cursor: 'pointer' }}>Publicar Vacante</button>
                  <button onClick={() => setActiveSection('professional')} style={{ background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '16px', padding: '16px 32px', fontWeight: 800, cursor: 'pointer' }}>Configurar Empresa</button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'professional' && (
            <div style={{ background: 'white', borderRadius: '32px', padding: '45px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '35px', alignItems: 'center' }}>
                <h2 style={{ margin: 0, color: '#1e3a5f', fontWeight: 900, fontSize: '1.6rem' }}>Información Corporativa</h2>
                <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} style={{ background: '#1e3a5f', color: 'white', border: 'none', borderRadius: '12px', padding: '10px 25px', cursor: 'pointer', fontWeight: 700 }}>{isEditing ? 'Guardar Cambios' : 'Editar Perfil'}</button>
              </div>
              <div className="responsive-grid-2" style={{ gap: '25px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={lbl}>Eslogan de la Empresa</label>
                  <input value={formData.eslogan} onChange={e => setFormData({...formData, eslogan: e.target.value})} placeholder="Ej: Innovación para un futuro mejor" disabled={!isEditing} style={isEditing ? inp : dis} />
                </div>
                {[
                  { l: 'Razón Social', k: 'razon_social' },
                  { l: 'NIT Institucional', k: 'nit' },
                  { l: 'Sector Económico', k: 'sector_economico' },
                  { l: 'Ciudad Sede', k: 'ciudad' },
                  { l: 'Tamaño Empresa', k: 'tamano_empresa' },
                  { l: 'Tipo de Organización', k: 'tipo_empresa' },
                  { l: 'Correo Corporativo', k: 'correo' },
                  { l: 'Teléfono Directo', k: 'telefono' },
                ].map(f => (
                  <div key={f.k}>
                    <label style={lbl}>{f.l}</label>
                    <input 
                      value={(formData as any)[f.k]} 
                      onChange={e => setFormData({ ...formData, [f.k]: e.target.value })} 
                      disabled={!isEditing} 
                      style={isEditing ? inp : dis} 
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'jobs' && (
            <div style={{ background: 'white', borderRadius: '32px', padding: '70px 50px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', textAlign: 'center' }}>
              <div style={{ width: '90px', height: '90px', borderRadius: '25px', background: '#f5f3ff', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 30px' }}><Icons.Announce /></div>
              <h2 style={{ color: '#1e3a5f', fontWeight: 900, fontSize: '2rem', margin: '0 0 12px' }}>Publicar Oferta Laboral</h2>
              <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Módulo en proceso de implementación.</p>
            </div>
          )}

          {activeSection === 'candidates' && (
            <div style={{ background: 'white', borderRadius: '32px', padding: '70px 50px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', textAlign: 'center' }}>
              <div style={{ width: '90px', height: '90px', borderRadius: '25px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 30px' }}><Icons.Users /></div>
              <h2 style={{ color: '#1e3a5f', fontWeight: 900, fontSize: '2rem', margin: '0 0 12px' }}>Gestión de Talento</h2>
              <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Próximamente podrá visualizar las postulaciones.</p>
            </div>
          )}

          {activeSection === 'support' && (
            <div style={{ background: 'white', borderRadius: '32px', padding: '45px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)' }}>
              <h2 style={{ margin: '0 0 35px', color: '#1e3a5f', fontWeight: 900, fontSize: '1.6rem' }}>Centro de Soporte</h2>
              <div className="responsive-grid-2" style={{ gap: '25px' }}>
                {[
                  { t: 'Correo Soporte', v: 'egresados@ucc.edu.co', i: '📧' },
                  { t: 'Línea de Atención', v: '+57 (8) 577 6655', i: '📞' },
                ].map(s => (
                  <div key={s.t} style={{ padding: '25px', border: '1px solid #f1f5f9', borderRadius: '24px', display: 'flex', gap: '20px', alignItems: 'center', background: '#f8fafc' }}>
                    <div style={{ fontSize: '2.5rem' }}>{s.i}</div>
                    <div><h4 style={{ margin: 0, color: '#1e3a5f', fontWeight: 800 }}>{s.t}</h4><p style={{ margin: 0, color: '#64748b', fontWeight: 500 }}>{s.v}</p></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
