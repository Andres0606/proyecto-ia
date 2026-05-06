'use client';

import React, { useEffect, useState } from 'react';
import Header from '../Components/header';
import Footer from '../Components/footer';
import '../css/Dashboard/dashboard.css';

const Icons = {
  Home: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
  User: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  Briefcase: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>,
  File: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>,
  Mail: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
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

export default function Dashboard() {
  const [greeting, setGreeting] = useState('Buenos días');
  const [userName, setUserName] = useState('Egresado');
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState<'none' | 'personal' | 'professional' | 'apps' | 'cv'>('none');
  const [isEditingProf, setIsEditingProf] = useState(false);
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [completionPct, setCompletionPct] = useState(0);
  const [toast, setToast] = useState<{ msg: string, type: 'info' | 'success' | 'error' | 'none' }>({ msg: '', type: 'none' });

  const [formData, setFormData] = useState({
    nombre_completo: '', correo: '', telefono: '', cedula: '', fecha_nacimiento: '', genero: '',
    nivel_formacion: '', programa_academico: '', estrato: '', estado_civil: '', numero_hijos: '',
    ingreso_mensual: '', sector_economico: '', area_desempeno: '', emprendimiento: ''
  });

  const avatarInputRef = React.useRef<HTMLInputElement>(null);
  const cvInputRef = React.useRef<HTMLInputElement>(null);

  const base = () => (process.env.NEXT_PUBLIC_BACKEND_URL || 'https://proyecto-ia-production-b7d6.up.railway.app').replace(/\/$/, '');

  useEffect(() => {
    const h = new Date().getHours();
    if (h >= 12 && h < 18) setGreeting('Buenas tardes');
    else if (h >= 18 || h < 5) setGreeting('Buenas noches');
    const saved = sessionStorage.getItem('ucc_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        // El login guarda: { id: uuid, ...authFields, profile: { id: uuid, rol_id, ... } }
        const id = u.id || u.profile?.id;
        if (!id) {
          console.error('❌ No se encontró id en la sesión. Estructura recibida:', Object.keys(u));
          return;
        }
        const cleanId = String(id).trim();
        console.log('✅ Dashboard Egresado - userId:', cleanId);
        setUserId(cleanId);
        fetchProfile(cleanId);
        fetchMyApplications(cleanId);
      } catch (e) { console.error('❌ Error leyendo sesión:', e); }
    } else {
      console.warn('⚠️ No hay sesión guardada en sessionStorage');
    }
  }, []);

  const fetchMyApplications = async (id: string) => {
    if (!id) return;
    try {
      const r = await fetch(`${base()}/api/postulaciones/user/${id}`);
      const d = await r.json();
      if (d.success) setMyApplications(d.applications || []);
    } catch (e) { 
      console.error("Error cargando postulaciones:", e); 
    }
  };

  const fetchProfile = async (id: string) => {
    try {
      const r = await fetch(`${base()}/api/users/profile/${id}`);
      const d = await r.json();
      if (d.success && d.profile) {
        const u = d.profile;
        const p = u.perfiles_usuarios?.[0] || {};
        setUserName(u.nombre_completo?.split(' ')[0] || 'Egresado');
        if (u.foto_url) setUserPhoto(u.foto_url);
        const val = (v: any) => (v !== null && v !== undefined && v !== '') ? String(v) : '';
        setFormData({
          nombre_completo: u.nombre_completo || '', correo: u.correo || '', telefono: u.telefono || '',
          cedula: u.cedula || '', fecha_nacimiento: u.fecha_nacimiento?.split('T')[0] || '', genero: u.genero || '',
          nivel_formacion: val(p.nivel_formacion), programa_academico: val(p.programa_academico), estrato: val(p.estrato),
          estado_civil: val(p.estado_civil), numero_hijos: val(p.numero_hijos), ingreso_mensual: val(p.ingreso_mensual),
          sector_economico: val(p.sector_economico), area_desempeno: val(p.area_desempeno || p.area_desempeño || p.Area), emprendimiento: p.emprendimiento ? 'Si' : 'No'
        });

        let pct = 0;
        if (u.foto_url) pct += 10;
        if (u.cv_url) pct += 20;
        const fields = [p.nivel_formacion, p.programa_academico, p.estrato, p.estado_civil, p.numero_hijos, p.ingreso_mensual, p.sector_economico, p.area_desempeno];
        const filled = fields.filter(f => f && String(f).trim() !== '').length;
        pct += (filled / fields.length) * 70;
        setCompletionPct(Math.round(pct));
      }
    } catch (err) { console.error(err); }
  };

  const handleSave = async () => {
    if (!userId) return;
    setToast({ msg: 'Guardando...', type: 'info' });
    const payload = { ...formData, emprendimiento: formData.emprendimiento === 'Si' };
    try {
      const r = await fetch(`${base()}/api/users/profile/${userId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userData: payload, profileData: payload }) });
      const d = await r.json();
      if (d.success) { setToast({ msg: '¡Éxito!', type: 'success' }); setIsEditingProf(false); setIsEditingPersonal(false); fetchProfile(userId); }
    } catch { setToast({ msg: 'Error', type: 'error' }); } finally { setTimeout(() => setToast({ msg: '', type: 'none' }), 3000); }
  };

  const handleFileUpload = async (file: File, type: 'avatar' | 'cv') => {
    if (!userId) return;
    setToast({ msg: 'Subiendo archivo...', type: 'info' });
    const fd = new FormData();
    fd.append(type === 'avatar' ? 'image' : 'cv', file);
    fd.append('userId', String(userId).trim());
    try {
      const r = await fetch(`${base()}/api/users/upload-${type === 'avatar' ? 'avatar' : 'cv'}`, { method: 'POST', body: fd });
      const d = await r.json();
      if (d.success) { setToast({ msg: '¡Éxito!', type: 'success' }); setTimeout(() => fetchProfile(userId), 1500); }
    } catch { setToast({ msg: 'Error', type: 'error' }); } finally { setTimeout(() => setToast({ msg: '', type: 'none' }), 3000); }
  };

  const handleSectionChange = (id: string) => {
    setActiveSection(id as any);
    if (id === 'apps' && userId) fetchMyApplications(userId);
  };

  const ACTIONS = [
    { title: 'Inicio', icon: Icons.Home, id: 'none', color: '#3b82f6' },
    { title: 'Datos Personales', icon: Icons.User, id: 'personal', color: '#8b5cf6' },
    { title: 'Perfil Profesional', icon: Icons.Briefcase, id: 'professional', color: '#10b981' },
    { title: 'Mis Postulaciones', icon: Icons.Mail, id: 'apps', color: '#f59e0b' },
    { title: 'Actualizar CV', icon: Icons.File, id: 'cv', color: '#ef4444' },
  ];

  const inpS = { padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%', fontSize: '0.95rem' };
  const disS = { ...inpS, background: '#f1f5f9', color: '#64748b', cursor: 'not-allowed' };
  const lblS = { fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px', display: 'block', textTransform: 'uppercase' as const };

  return (
    <div className="db-page" style={{ background: '#f4f7fa', minHeight: '100vh' }}>
      <Header />
      <input type="file" ref={avatarInputRef} hidden accept="image/*" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'avatar')} />
      <input type="file" ref={cvInputRef} hidden accept=".pdf" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'cv')} />

      {toast.type !== 'none' && (
        <div style={{ position: 'fixed', bottom: '32px', right: '32px', zIndex: 9999, padding: '16px 24px', borderRadius: '16px', color: 'white', fontWeight: 600, background: toast.type === 'success' ? '#059669' : toast.type === 'error' ? '#dc2626' : '#1e3a5f', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
          {toast.msg}
        </div>
      )}

      <main style={{ paddingTop: '110px', maxWidth: '1120px', margin: '0 auto', paddingBottom: '60px' }}>

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
              <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '8px 18px', borderRadius: '30px', fontSize: '0.75rem', fontWeight: 800, border: '1px solid #fecaca' }}>EGRESADO</span>
            </div>
            <p style={{ color: '#64748b', margin: 0, fontSize: '1.05rem', fontWeight: 500 }}>Tu perfil profesional está al <span style={{ color: '#3b82f6', fontWeight: 800 }}>{completionPct}%</span></p>
            <button onClick={() => avatarInputRef.current?.click()} style={{ background: '#f8fafc', color: '#1e3a5f', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '12px 24px', fontWeight: 700, cursor: 'pointer', marginTop: '15px' }}>📁 Cambiar Foto</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px', marginBottom: '40px' }}>
          {ACTIONS.map(a => {
            const Icon = a.icon;
            return (
              <div key={a.id} onClick={() => handleSectionChange(a.id)} style={{ background: activeSection === a.id ? 'white' : 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)', borderRadius: '28px', padding: '32px 20px', textAlign: 'center', boxShadow: activeSection === a.id ? '0 15px 35px rgba(59, 130, 246, 0.15)' : '0 4px 15px rgba(0,0,0,0.03)', cursor: 'pointer', border: activeSection === a.id ? `2px solid ${a.color}` : '1px solid rgba(255,255,255,0.4)', transition: 'all 0.3s' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: `${a.color}15`, color: a.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><Icon /></div>
                <h3 style={{ margin: 0, color: '#1e3a5f', fontWeight: 800, fontSize: '0.95rem' }}>{a.title}</h3>
              </div>
            );
          })}
        </div>

        <div style={{ background: 'white', borderRadius: '32px', padding: '45px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)' }}>
          {activeSection === 'none' && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <h2 style={{ fontSize: '2rem', color: '#1e3a5f', fontWeight: 900 }}>¡Bienvenido a tu panel de control!</h2>
              <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Desde aquí puedes gestionar tu perfil profesional y revisar tus postulaciones.</p>
            </div>
          )}

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

          {activeSection === 'apps' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ margin: 0, color: '#1e3a5f', fontWeight: 900 }}>Mis Postulaciones</h2>
                <button onClick={() => userId && fetchMyApplications(userId)} style={{ padding: '8px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🔄 Actualizar
                </button>
              </div>
              {myApplications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                  <Icons.Mail />
                  <p style={{ marginTop: '20px' }}>Aún no te has postulado a ninguna vacante.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '15px' }}>
                  {myApplications.map(app => (
                    <div key={app.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', borderRadius: '20px', border: '1px solid #f1f5f9', background: '#f8fafc' }}>
                      <div>
                        <h3 style={{ margin: 0, color: '#1e3a5f', fontSize: '1.1rem', fontWeight: 800 }}>{app.vacante_nombre}</h3>
                        <p style={{ margin: '4px 0', color: '#64748b', fontWeight: 500 }}>{app.empresa_nombre} · {app.ubicacion}</p>
                        <small style={{ color: '#94a3b8' }}>Postulado el: {new Date(app.fecha).toLocaleDateString()}</small>
                      </div>
                      <span style={{ 
                        padding: '8px 16px', 
                        borderRadius: '12px', 
                        fontSize: '0.75rem', 
                        fontWeight: 800, 
                        textTransform: 'uppercase',
                        background: app.estado === 'postulado' ? '#eff6ff' : '#ecfdf5',
                        color: app.estado === 'postulado' ? '#3b82f6' : '#059669',
                        border: app.estado === 'postulado' ? '1px solid #dbeafe' : '1px solid #d1fae5'
                      }}>
                        {app.estado}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSection === 'cv' && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}><Icons.File /></div>
              <h2 style={{ color: '#1e3a5f', fontWeight: 900, fontSize: '1.8rem' }}>Gestión de Hoja de Vida</h2>
              <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '30px' }}>
                <button onClick={() => { if (!userId) return; fetch(`${base()}/api/users/get-cv-url/${userId}`).then(r => r.json()).then(d => d.success ? window.open(d.url, '_blank') : setToast({ msg: 'No tienes CV subido', type: 'info' })) }} style={{ padding: '15px 30px', background: '#1e3a5f', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 700, cursor: 'pointer' }}>Ver CV Actual</button>
                <button onClick={() => cvInputRef.current?.click()} style={{ padding: '15px 30px', background: '#f8fafc', color: '#1e3a5f', border: '2px solid #1e3a5f', borderRadius: '14px', fontWeight: 700, cursor: 'pointer' }}>Subir Nuevo CV (.pdf)</button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}