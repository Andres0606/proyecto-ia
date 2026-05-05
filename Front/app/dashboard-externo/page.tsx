'use client';

import React, { useEffect, useState } from 'react';
import Header from '../Components/header';
import Footer from '../Components/footer';
import '../css/Dashboard/dashboard.css';

const Icons = {
  Home: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  User: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Briefcase: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  Card: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>,
  File: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
};

const DIAG_OPTIONS = {
  Programa: ["Derecho", "Contaduria Publica", "Ingenieria Civil", "Ciencias Economicas", "Medicina", "Psicologia", "Odontologia", "Enfermeria", "Ingenieria de Sistemas", "Medicina Veterinaria y Zootecnia", "Especializacion", "Tecnico Auxiliar en Enfermeria"],
  Formacion: ["Profesional", "Especialista", "Magister", "Doctorado", "Tecnico Profesional"],
  EstadoCivil: ["Casado", "Union libre", "Soltero", "Separado", "Viudo"],
  Estrato: ["Uno", "Dos", "Tres", "Cuatro", "Cinco", "Seis"],
  Ingreso: ["1 SML o menos", "2-3 SML", "3-5 SML", "5 SML o mas"],
  Area: ["Servicios", "Administrativa", "Salud", "Financiera", "Industrial", "Economica", "Gestion Humana", "Educacion", "Comercial", "Contable", "Sistemas"],
  Sector: ["Servicios", "Comercial", "Industrial"],
  Emprendimiento: ["Si", "No"],
  Hijos: ["Cero", "Uno", "Dos", "Tres", "Cuatro", "Cinco"],
};

export default function DashboardExterno() {
  const [greeting, setGreeting] = useState('Buenos días');
  const [userName, setUserName] = useState('Usuario');
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'none' | 'personal' | 'professional' | 'plans' | 'cv'>('none');
  const [isEditingProf, setIsEditingProf] = useState(false);
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [completionPct, setCompletionPct] = useState(0);
  const [userPlan, setUserPlan] = useState('Gratuito');
  const [toast, setToast] = useState<{ msg: string, type: 'info' | 'success' | 'error' | 'none' }>({ msg: '', type: 'none' });

  const [formData, setFormData] = useState({
    nombre_completo: '', correo: '', telefono: '', cedula: '', fecha_nacimiento: '', genero: '',
    nivel_formacion: '', programa_academico: '', estrato: '', estado_civil: '', numero_hijos: '',
    ingreso_mensual: '', sector_economico: '', area_desempeno: '', emprendimiento: ''
  });

  const avatarRef = React.useRef<HTMLInputElement>(null);
  const cvRef = React.useRef<HTMLInputElement>(null);

  const base = () => (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000').replace(/\/$/, '');

  useEffect(() => {
    const h = new Date().getHours();
    if (h >= 12 && h < 18) setGreeting('Buenas tardes');
    else if (h >= 18 || h < 5) setGreeting('Buenas noches');
    const saved = sessionStorage.getItem('ucc_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        const id = String(u.id || u.profile?.id || u.user_id).trim().split(':')[0];
        setUserId(id); fetchProfile(id);
      } catch (e) { console.error(e); }
    }
  }, []);

  const fetchProfile = async (id: string) => {
    try {
      const r = await fetch(`${base()}/api/users/profile/${id}`);
      const d = await r.json();
      if (d.success && d.profile) {
        const u = d.profile;
        const p = u.perfiles_usuarios?.[0] || {};
        setUserName(u.nombre_completo?.split(' ')[0] || 'Usuario');
        if (u.foto_url) setUserPhoto(u.foto_url);
        const val = (v: any) => (v !== null && v !== undefined && v !== '') ? String(v) : '';
        setFormData({
          nombre_completo: u.nombre_completo || '', correo: u.correo || '', telefono: u.telefono || '',
          cedula: u.cedula || '', fecha_nacimiento: u.fecha_nacimiento?.split('T')[0] || '', genero: u.genero || '',
          nivel_formacion: val(p.nivel_formacion), programa_academico: val(p.programa_academico), estrato: val(p.estrato),
          estado_civil: val(p.estado_civil), numero_hijos: val(p.numero_hijos), ingreso_mensual: val(p.ingreso_mensual),
          sector_economico: val(p.sector_economico), area_desempeno: val(p.area_desempeno), emprendimiento: p.emprendimiento ? 'Si' : 'No'
        });
        if (u.suscripcion) setUserPlan(u.suscripcion.tipo_plan || 'Gratuito');

        // Progreso para externos
        let pct = 0;
        if (u.foto_url) pct += 10;
        if (u.cv_url) pct += 20;
        const fields = [p.nivel_formacion, p.programa_academico, p.estrato, p.estado_civil, p.ingreso_mensual];
        const filled = fields.filter(f => f && String(f).trim() !== '').length;
        pct += (filled / fields.length) * 70;
        setCompletionPct(Math.round(pct));
      }
    } catch (e) { console.error(e); }
  };

  const PLANS = [
    { name: 'Gratuito', price: 'Gratis', icon: '🆓', features: ['Perfil Profesional', 'Subir Hoja de Vida'] },
    { name: 'Acceso al Modelo', price: '$25.000', icon: '🧠', features: ['Todo lo anterior', 'Diagnóstico IA'] },
    { name: 'Plan Completo', price: '$45.000', icon: '🚀', features: ['Todo lo anterior', 'Bolsa de Empleo', 'Alertas'] }
  ];

  const ACTIONS = [
    { title: 'Inicio', icon: Icons.Home, id: 'none', color: '#3b82f6' },
    { title: 'Datos Personales', icon: Icons.User, id: 'personal', color: '#8b5cf6' },
    { title: 'Perfil Profesional', icon: Icons.Briefcase, id: 'professional', color: '#10b981' },
    { title: 'Planes', icon: Icons.Card, id: 'plans', color: '#f59e0b' },
    { title: 'Mi Hoja de Vida', icon: Icons.File, id: 'cv', color: '#ef4444' },
  ];

  return (
    <div className="db-page" style={{ background: '#f4f7fa', minHeight: '100vh' }}>
      <Header />
      <input type="file" ref={avatarRef} hidden accept="image/*" />
      <input type="file" ref={cvRef} hidden accept=".pdf" />

      {toast.type !== 'none' && (
        <div style={{ position: 'fixed', bottom: '32px', right: '32px', zIndex: 9999, padding: '16px 24px', borderRadius: '16px', color: 'white', fontWeight: 600, background: toast.type === 'success' ? '#059669' : toast.type === 'error' ? '#dc2626' : '#1e3a5f', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
          {toast.msg}
        </div>
      )}

      <main style={{ paddingTop: '110px', maxWidth: '1120px', margin: '0 auto', paddingBottom: '60px' }}>
        
        {/* Hero Card Premium */}
        <div style={{ background: 'white', borderRadius: '32px', padding: '40px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '40px', marginBottom: '32px', position: 'relative', overflow: 'hidden', border: '1px solid rgba(226, 232, 240, 0.5)' }}>
          <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)', zIndex: 0 }} />
          <div style={{ position: 'relative', width: '130px', height: '130px', flexShrink: 0 }}>
            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)', position: 'absolute', zIndex: 1 }}>
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f1f5f9" strokeWidth="2" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#3b82f6" strokeDasharray={`${completionPct}, 100`} strokeWidth="2" strokeLinecap="round" />
            </svg>
            <div style={{ position: 'absolute', top: '10px', left: '10px', right: '10px', bottom: '10px', borderRadius: '50%', background: userPhoto ? `url(${userPhoto}) center/cover` : '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.8rem', fontWeight: 800, color: 'white', border: '4px solid white', zIndex: 2 }}>
              {!userPhoto && userName[0]}
            </div>
          </div>
          <div style={{ flex: 1, zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '10px' }}>
              <h1 style={{ margin: 0, color: '#1e3a5f', fontSize: '2.4rem', fontWeight: 900 }}>{greeting}, {userName} ✨</h1>
              <span style={{ background: '#ecfdf5', color: '#059669', padding: '8px 18px', borderRadius: '30px', fontSize: '0.75rem', fontWeight: 800, border: '1px solid #d1fae5' }}>USUARIO EXTERNO</span>
            </div>
            <p style={{ color: '#64748b', margin: 0, fontSize: '1.05rem', fontWeight: 500 }}>Tu perfil profesional está al <span style={{ color: '#3b82f6', fontWeight: 800 }}>{completionPct}%</span></p>
          </div>
        </div>

        {/* Grid de Acciones Correcto */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px', marginBottom: '40px' }}>
          {ACTIONS.map(a => {
            const Icon = a.icon;
            return (
              <div key={a.id} onClick={() => setActiveSection(a.id as any)} style={{ background: activeSection === a.id ? 'white' : 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)', borderRadius: '28px', padding: '32px 20px', textAlign: 'center', boxShadow: activeSection === a.id ? '0 15px 35px rgba(59, 130, 246, 0.15)' : '0 4px 15px rgba(0,0,0,0.03)', cursor: 'pointer', border: activeSection === a.id ? `2px solid ${a.color}` : '1px solid rgba(255,255,255,0.4)', transition: 'all 0.3s' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: `${a.color}15`, color: a.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><Icon /></div>
                <h3 style={{ margin: 0, color: '#1e3a5f', fontWeight: 800, fontSize: '0.95rem' }}>{a.title}</h3>
              </div>
            );
          })}
        </div>

        {/* Áreas de Contenido */}
        <div style={{ background: 'white', borderRadius: '32px', padding: '45px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)' }}>
          {activeSection === 'none' && <h2>Bienvenido al Portal Externo, {userName}</h2>}
          {activeSection === 'plans' && (
             <div>
               <h2 style={{ textAlign: 'center', marginBottom: '40px' }}>Planes y Membresía</h2>
               <div className="responsive-grid-3" style={{ gap: '30px' }}>
                 {PLANS.map(p => (
                   <div key={p.name} style={{ padding: '40px 30px', borderRadius: '32px', border: userPlan === p.name ? '3px solid #3b82f6' : '1px solid #e2e8f0', textAlign: 'center', position: 'relative' }}>
                     {userPlan === p.name && <span style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', background: '#3b82f6', color: 'white', padding: '6px 20px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800 }}>ACTIVO</span>}
                     <div style={{ fontSize: '3.5rem', marginBottom: '20px' }}>{p.icon}</div>
                     <h3 style={{ color: '#1e3a5f', fontWeight: 800 }}>{p.name}</h3>
                     <p style={{ fontSize: '2rem', fontWeight: 900 }}>{p.price}</p>
                     <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', margin: '20px 0' }}>
                       {p.features.map(f => <li key={f} style={{ marginBottom: '10px', fontSize: '0.9rem', color: '#64748b' }}>✓ {f}</li>)}
                     </ul>
                     <button disabled={userPlan === p.name} style={{ width: '100%', padding: '15px', borderRadius: '16px', background: userPlan === p.name ? '#f1f5f9' : '#3b82f6', color: userPlan === p.name ? '#94a3b8' : 'white', fontWeight: 800, border: 'none', cursor: userPlan === p.name ? 'default' : 'pointer' }}>{userPlan === p.name ? 'Plan Activo' : 'Seleccionar'}</button>
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