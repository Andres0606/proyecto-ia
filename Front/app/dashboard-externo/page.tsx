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
        // Obtener el ID de forma ultra-segura
        const rawId = u.id || u.user_id || (u.profile && u.profile.id);
        if (rawId) {
          const cleanId = String(rawId).trim().split(':')[0];
          setUserId(cleanId);
          fetchProfile(cleanId);
        }
      } catch (e) { console.error("Error sesión:", e); }
    }
  }, []);

  const fetchProfile = async (id: string) => {
    try {
      const r = await fetch(`${base()}/api/users/profile/${id}`);
      const d = await r.json();
      if (d.success && d.profile) {
        const u = d.profile;
        const p = u.perfiles_usuarios?.[0] || {};
        
        // Actualizar sessionStorage para que el Header reconozca el cambio
        const savedSession = sessionStorage.getItem('ucc_user');
        if (savedSession) {
          const sessionObj = JSON.parse(savedSession);
          sessionObj.profile = u;
          sessionObj.profile.suscripcion = u.suscripcion; // Sincronizar plan
          sessionStorage.setItem('ucc_user', JSON.stringify(sessionObj));
          // Disparar evento para que componentes como Header se enteren del cambio
          window.dispatchEvent(new Event('storage'));
        }

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
        
        const planActual = u.suscripcion?.tipo_plan || 'Gratuito';
        setUserPlan(planActual);

        let pct = 0;
        if (u.foto_url) pct += 10;
        if (u.cv_url) pct += 20;
        const fields = [p.nivel_formacion, p.programa_academico, p.estrato, p.estado_civil, p.numero_hijos, p.ingreso_mensual, p.sector_economico, p.area_desempeno];
        const filled = fields.filter(f => f && String(f).trim() !== '').length;
        pct += (filled / fields.length) * 70;
        setCompletionPct(Math.round(pct));
      }
    } catch (e) { console.error(e); }
  };

  const handleSave = async () => {
    if (!userId) return;
    setToast({ msg: 'Guardando...', type: 'info' });
    const payload = { ...formData, emprendimiento: formData.emprendimiento === 'Si' };
    try {
      const r = await fetch(`${base()}/api/users/profile/${userId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userData: payload, profileData: payload }) });
      const d = await r.json();
      if (d.success) { setToast({ msg: '¡Datos Guardados!', type: 'success' }); setIsEditingProf(false); setIsEditingPersonal(false); fetchProfile(userId); }
    } catch { setToast({ msg: 'Error', type: 'error' }); } finally { setTimeout(() => setToast({ msg: '', type: 'none' }), 3000); }
  };

  const handleUpdatePlan = async (planName: string) => {
    if (!userId) return;
    setToast({ msg: `Activando ${planName}...`, type: 'info' });
    try {
      const r = await fetch(`${base()}/api/users/update-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, planType: planName }) // Usamos planType que es más estándar en el backend
      });
      const d = await r.json();
      if (d.success) {
        setToast({ msg: `¡Plan ${planName} activado!`, type: 'success' });
        // Sincronizar localmente antes de re-cargar para respuesta inmediata
        const saved = sessionStorage.getItem('ucc_user');
        if (saved) {
          const obj = JSON.parse(saved);
          if (obj.profile) obj.profile.suscripcion = { tipo_plan: planName };
          sessionStorage.setItem('ucc_user', JSON.stringify(obj));
        }
        setTimeout(() => fetchProfile(userId), 500);
      } else {
        setToast({ msg: d.message || 'Error al actualizar plan', type: 'error' });
      }
    } catch (err) {
      console.error("Error updating plan:", err);
      setToast({ msg: 'Error de conexión', type: 'error' });
    } finally {
      setTimeout(() => setToast({ msg: '', type: 'none' }), 3000);
    }
  };

  const handleUpload = async (file: File, type: 'avatar' | 'cv') => {
    if (!userId) return;
    setToast({ msg: 'Subiendo...', type: 'info' });
    const fd = new FormData();
    fd.append(type === 'avatar' ? 'image' : 'cv', file);
    fd.append('userId', String(userId).trim());
    try {
      const r = await fetch(`${base()}/api/users/upload-${type === 'avatar' ? 'avatar' : 'cv'}`, { method: 'POST', body: fd });
      const d = await r.json();
      if (d.success) { setToast({ msg: '¡Subido con éxito!', type: 'success' }); setTimeout(() => fetchProfile(userId), 1500); }
    } catch { setToast({ msg: 'Error', type: 'error' }); } finally { setTimeout(() => setToast({ msg: '', type: 'none' }), 3000); }
  };

  const PLANS = [
    { name: 'Gratuito', price: 'Gratis', icon: <Icons.User />, features: ['Perfil Profesional', 'Subir Hoja de Vida', 'Acceso a Vacantes Básicas'] },
    { name: 'Acceso al Modelo', price: '$25.000', icon: <Icons.Home />, features: ['Todo lo anterior', 'Diagnóstico IA Estabilidad', 'Reporte PDF'] },
    { name: 'Plan Completo', price: '$45.000', icon: <Icons.Briefcase />, features: ['Todo lo anterior', 'Bolsa de Empleo UCC', 'Alertas Prioritarias'] }
  ];

  const ACTIONS = [
    { title: 'Inicio', icon: Icons.Home, id: 'none', color: '#3b82f6' },
    { title: 'Datos Personales', icon: Icons.User, id: 'personal', color: '#8b5cf6' },
    { title: 'Perfil Profesional', icon: Icons.Briefcase, id: 'professional', color: '#10b981' },
    { title: 'Planes', icon: Icons.Card, id: 'plans', color: '#f59e0b' },
    { title: 'Mi Hoja de Vida', icon: Icons.File, id: 'cv', color: '#ef4444' },
  ];

  const inpS = { padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%', fontSize: '0.95rem' };
  const disS = { ...inpS, background: '#f1f5f9', color: '#64748b', cursor: 'not-allowed' };
  const lblS = { fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px', display: 'block', textTransform: 'uppercase' as const };

  return (
    <div className="db-page" style={{ background: '#f4f7fa', minHeight: '100vh' }}>
      <Header />
      <input type="file" ref={avatarRef} hidden accept="image/*" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], 'avatar')} />
      <input type="file" ref={cvRef} hidden accept=".pdf" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], 'cv')} />

      {toast.type !== 'none' && (
        <div style={{ position: 'fixed', bottom: '32px', right: '32px', zIndex: 9999, padding: '16px 24px', borderRadius: '16px', color: 'white', fontWeight: 600, background: toast.type === 'success' ? '#059669' : toast.type === 'error' ? '#dc2626' : '#1e3a5f', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
          {toast.msg}
        </div>
      )}

      <main style={{ paddingTop: '110px', maxWidth: '1120px', margin: '0 auto', paddingBottom: '60px' }}>
        
        {/* Hero Card */}
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
              <h1 style={{ margin: 0, color: '#1e3a5f', fontSize: '2.4rem', fontWeight: 900 }}>{greeting}, {userName}</h1>
              <span style={{ background: '#ecfdf5', color: '#059669', padding: '8px 18px', borderRadius: '30px', fontSize: '0.75rem', fontWeight: 800, border: '1px solid #d1fae5' }}>USUARIO EXTERNO</span>
            </div>
            <p style={{ color: '#64748b', margin: 0, fontSize: '1.05rem', fontWeight: 500 }}>Tu perfil profesional está al <span style={{ color: '#3b82f6', fontWeight: 800 }}>{completionPct}%</span></p>
            <button onClick={() => avatarRef.current?.click()} style={{ background: '#f8fafc', color: '#1e3a5f', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '12px 24px', fontWeight: 700, cursor: 'pointer', marginTop: '15px' }}>Cambiar Foto</button>
          </div>
        </div>

        {/* Grid */}
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

        {/* Contenido */}
        <div style={{ background: 'white', borderRadius: '32px', padding: '45px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)' }}>
          {activeSection === 'none' && <h2 style={{ textAlign: 'center' }}>Bienvenido al Portal Externo</h2>}

          {activeSection === 'personal' && (
             <div>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '35px' }}>
                 <h2 style={{ margin: 0 }}>Datos Personales</h2>
                 <button onClick={() => setIsEditingPersonal(!isEditingPersonal)} style={{ background: '#1e3a5f', color: 'white', border: 'none', borderRadius: '12px', padding: '10px 20px', cursor: 'pointer' }}>{isEditingPersonal ? 'Cancelar' : 'Editar'}</button>
               </div>
               <div className="responsive-grid-2" style={{ gap: '25px' }}>
                 {[
                   { l: 'Nombre Completo', k: 'nombre_completo', gray: false },
                   { l: 'Cédula', k: 'cedula', gray: false },
                   { l: 'Correo Electrónico', k: 'correo', gray: false },
                   { l: 'Teléfono', k: 'telefono', gray: true },
                   { l: 'Fecha de Nacimiento', k: 'fecha_nacimiento', gray: true },
                   { l: 'Género', k: 'genero', gray: true }
                 ].map(f => (
                   <div key={f.k}>
                     <label style={lblS}>{f.l}</label>
                     <input 
                       value={(formData as any)[f.k]} 
                       onChange={e => !f.gray && setFormData({ ...formData, [f.k]: e.target.value })} 
                       disabled={f.gray || !isEditingPersonal} 
                       style={f.gray ? disS : (!isEditingPersonal ? { ...inpS, background: '#f8fafc' } : inpS)} 
                     />
                   </div>
                 ))}
               </div>
               {isEditingPersonal && <button onClick={handleSave} style={{ width: '100%', marginTop: '30px', padding: '15px', background: '#1e3a5f', color: 'white', borderRadius: '14px', border: 'none', fontWeight: 800, cursor: 'pointer' }}>Guardar Cambios</button>}
             </div>
          )}

          {activeSection === 'professional' && (
             <div>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '35px' }}>
                 <h2 style={{ margin: 0 }}>Perfil Profesional</h2>
                 <button onClick={() => setIsEditingProf(!isEditingProf)} style={{ background: '#00A9E0', color: 'white', border: 'none', borderRadius: '12px', padding: '10px 20px', cursor: 'pointer' }}>{isEditingProf ? 'Cancelar' : 'Actualizar'}</button>
               </div>
               <div className="responsive-grid-2" style={{ gap: '25px' }}>
                 {[
                   { l: 'Programa Académico', k: 'programa_academico', o: DIAG_OPTIONS.Programa },
                   { l: 'Nivel de Formación', k: 'nivel_formacion', o: DIAG_OPTIONS.Formacion },
                   { l: 'Estrato', k: 'estrato', o: DIAG_OPTIONS.Estrato },
                   { l: 'Estado Civil', k: 'estado_civil', o: DIAG_OPTIONS.EstadoCivil },
                   { l: 'Número de Hijos', k: 'numero_hijos', o: DIAG_OPTIONS.Hijos },
                   { l: 'Ingreso Mensual', k: 'ingreso_mensual', o: DIAG_OPTIONS.Ingreso },
                   { l: 'Sector Económico', k: 'sector_economico', o: DIAG_OPTIONS.Sector },
                   { l: 'Área de Desempeño', k: 'area_desempeno', o: DIAG_OPTIONS.Area },
                   { l: 'Emprendimiento', k: 'emprendimiento', o: DIAG_OPTIONS.Emprendimiento },
                 ].map(f => (
                   <div key={f.k}>
                     <label style={lblS}>{f.l}</label>
                     {isEditingProf ? (
                       <select value={(formData as any)[f.k]} onChange={e => setFormData({ ...formData, [f.k]: e.target.value })} style={inpS}>
                         <option value="">Seleccionar...</option>
                         {f.o.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                       </select>
                     ) : (
                       <input value={(formData as any)[f.k] || 'No registrado'} disabled style={{ ...inpS, background: '#f8fafc' }} />
                     )}
                   </div>
                 ))}
               </div>
               {isEditingProf && <button onClick={handleSave} style={{ width: '100%', marginTop: '30px', padding: '15px', background: '#00A9E0', color: 'white', borderRadius: '14px', border: 'none', fontWeight: 800, cursor: 'pointer' }}>Guardar Perfil</button>}
             </div>
          )}

          {activeSection === 'plans' && (
             <div>
               <h2 style={{ textAlign: 'center', marginBottom: '40px', color: '#1e3a5f', fontWeight: 900 }}>Planes y Membresía</h2>
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
                 {PLANS.map(p => (
                   <div key={p.name} style={{ padding: '40px 30px', borderRadius: '32px', border: userPlan === p.name ? '3px solid #3b82f6' : '1px solid #e2e8f0', textAlign: 'center', position: 'relative', background: userPlan === p.name ? '#f8fafc' : 'white' }}>
                     {userPlan === p.name && <span style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', background: '#3b82f6', color: 'white', padding: '6px 20px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800 }}>PLAN ACTUAL</span>}
                     <div style={{ fontSize: '3.5rem', marginBottom: '20px' }}>{p.icon}</div>
                     <h3 style={{ color: '#1e3a5f', fontWeight: 800, fontSize: '1.4rem', marginBottom: '10px' }}>{p.name}</h3>
                     <p style={{ fontSize: '2.2rem', fontWeight: 900, color: '#1e3a5f', marginBottom: '25px' }}>{p.price}</p>
                     <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', margin: '0 0 30px' }}>
                       {p.features.map(f => <li key={f} style={{ marginBottom: '12px', fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                         <span style={{ color: '#10b981', fontWeight: 900 }}>✓</span> {f}
                       </li>)}
                     </ul>
                     <button 
                       onClick={() => handleUpdatePlan(p.name)}
                       disabled={userPlan === p.name} 
                       style={{ width: '100%', padding: '15px', borderRadius: '16px', background: userPlan === p.name ? '#e2e8f0' : '#1e3a5f', color: userPlan === p.name ? '#94a3b8' : 'white', fontWeight: 800, border: 'none', cursor: userPlan === p.name ? 'default' : 'pointer' }}>
                       {userPlan === p.name ? 'Activo' : 'Seleccionar'}
                     </button>
                   </div>
                 ))}
               </div>
             </div>
          )}
          
          {activeSection === 'cv' && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}><Icons.File /></div>
              <h2 style={{ color: '#1e3a5f', fontWeight: 900, fontSize: '1.8rem' }}>Mi Hoja de Vida</h2>
              <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '30px' }}>
                <button onClick={() => { if (!userId) return; fetch(`${base()}/api/users/get-cv-url/${userId}`).then(r => r.json()).then(d => d.success ? window.open(d.url, '_blank') : setToast({ msg: 'No tienes CV', type: 'info' })) }} style={{ padding: '15px 30px', background: '#1e3a5f', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 700, cursor: 'pointer' }}>Ver Hoja de Vida</button>
                <button onClick={() => cvRef.current?.click()} style={{ padding: '15px 30px', background: '#f8fafc', color: '#1e3a5f', border: '2px solid #1e3a5f', borderRadius: '14px', fontWeight: 700, cursor: 'pointer' }}>Subir Nueva (.pdf)</button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}