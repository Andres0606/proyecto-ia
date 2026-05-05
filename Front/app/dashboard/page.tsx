'use client';

import React, { useEffect, useState } from 'react';
import Header from '../Components/header';
import Footer from '../Components/footer';
import '../css/Dashboard/dashboard.css';

// Iconos SVG Premium (Los mismos del dashboard-externo)
const Icons = {
  Home: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  User: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Briefcase: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  File: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>,
  Mail: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
};

const getQuickActions = () => [
  { title: 'Inicio', Icon: Icons.Home, id: 'none', color: '#3b82f6' },
  { title: 'Datos Personales', Icon: Icons.User, id: 'personal', color: '#8b5cf6' },
  { title: 'Perfil Profesional', Icon: Icons.Briefcase, id: 'professional', color: '#10b981' },
  { title: 'Actualizar CV', Icon: Icons.File, id: 'cv', color: '#ef4444' },
  { title: 'Mis Postulaciones', Icon: Icons.Mail, id: 'apps', color: '#f59e0b' },
];

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
  const [activeSection, setActiveSection] = useState<'none' | 'personal' | 'professional' | 'apps' | 'cv'>('none');
  const [isEditingProf, setIsEditingProf] = useState(false);
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [completionPct, setCompletionPct] = useState(0);
  const [toast, setToast] = useState<{ msg: string, type: 'info' | 'success' | 'error' | 'none' }>({ msg: '', type: 'none' });
  const [isUploading, setIsUploading] = useState(false);

  const avatarInputRef = React.useRef<HTMLInputElement>(null);
  const cvInputRef = React.useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type: 'info' | 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'none' }), 3000);
  };

  const base = () => (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000').replace(/\/$/, '');

  useEffect(() => {
    const h = new Date().getHours();
    if (h >= 12 && h < 18) setGreeting('Buenas tardes');
    else if (h >= 18 || h < 5) setGreeting('Buenas noches');

    const saved = sessionStorage.getItem('ucc_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        const raw = u.id || u.profile?.id || u.user_id;
        if (raw) {
          const id = String(raw).trim().split(':')[0];
          setUserId(id); fetchProfile(id);
        }
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
        setUserName(u.nombre_completo?.split(' ')[0] || 'Egresado');
        if (u.foto_url) setUserPhoto(u.foto_url);
        const val = (v: any) => (v !== null && v !== undefined && v !== '') ? String(v) : '';
        setFormData({
          nombre_completo: u.nombre_completo || '', correo: u.correo || '', telefono: u.telefono || '',
          cedula: u.cedula || '', fecha_nacimiento: u.fecha_nacimiento?.split('T')[0] || '', genero: u.genero || '',
          nivel_formacion: val(p.nivel_formacion), programa_academico: val(p.programa_academico), estrato: val(p.estrato),
          estado_civil: val(p.estado_civil), numero_hijos: val(p.numero_hijos), ingreso_mensual: val(p.ingreso_mensual),
          sector_economico: val(p.sector_economico), area_desempeno: val(p.area_desempeno), emprendimiento: val(p.emprendimiento)
        });
        let pct = 0;
        if (u.foto_url) pct += 15;
        if (u.cv_url) pct += 25;
        if (u.telefono && u.nombre_completo) pct += 20;
        const profFields = [p.nivel_formacion, p.programa_academico, p.estrato, p.estado_civil, p.ingreso_mensual];
        const filled = profFields.filter(f => f !== null && f !== undefined && String(f).trim() !== '').length;
        pct += (filled / profFields.length) * 40;
        setCompletionPct(Math.round(pct));
      }
    } catch (err) { console.error(err); }
  };

  const [formData, setFormData] = useState({
    nombre_completo: '', correo: '', telefono: '', cedula: '', fecha_nacimiento: '', genero: '',
    nivel_formacion: '', programa_academico: '', estrato: '', estado_civil: '', numero_hijos: '',
    ingreso_mensual: '', sector_economico: '', area_desempeno: '', emprendimiento: ''
  });

  const handleSave = async () => {
    if (!userId) return;
    showToast('Guardando...', 'info');
    try {
      const r = await fetch(`${base()}/api/users/profile/${userId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userData: formData, profileData: formData }) });
      const d = await r.json();
      if (d.success) { showToast('¡Perfil actualizado!', 'success'); setIsEditingProf(false); setIsEditingPersonal(false); setTimeout(() => fetchProfile(userId!), 2000); }
    } catch { showToast('Error al guardar', 'error'); }
  };

  const handleFileUpload = async (file: File, type: 'avatar' | 'cv') => {
    if (!userId) return;
    setIsUploading(true); showToast(`Subiendo ${type}...`, 'info');
    const fd = new FormData();
    fd.append(type === 'avatar' ? 'image' : 'cv', file);
    fd.append('userId', String(userId).trim());
    try {
      const r = await fetch(`${base()}/api/users/upload-${type === 'avatar' ? 'avatar' : 'cv'}`, { method: 'POST', body: fd });
      const d = await r.json();
      if (d.success) {
        showToast('¡Subido con éxito!', 'success');
        if (type === 'avatar') setUserPhoto(d.url);
        setTimeout(() => fetchProfile(userId), 1500);
      } else showToast(d.message || 'Error', 'error');
    } catch { showToast('Error', 'error'); } finally { setIsUploading(false); }
  };

  const mainWidth = '1120px';
  const inp = { padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%', fontSize: '0.95rem', outline: 'none' };
  const dis = { ...inp, background: '#f8fafc', color: '#64748b', cursor: 'not-allowed' as const };
  const lbl = { fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px', display: 'block', textTransform: 'uppercase' as const };

  return (
    <div className="db-page" style={{ background: '#f4f7fa', minHeight: '100vh' }}>
      <Header />
      <input type="file" ref={avatarInputRef} hidden accept="image/*" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'avatar')} />
      <input type="file" ref={cvInputRef} hidden accept=".pdf" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'cv')} />

      {toast.type !== 'none' && (
        <div style={{ position: 'fixed', bottom: '32px', right: '32px', zIndex: 9999, padding: '16px 24px', borderRadius: '16px', color: 'white', fontWeight: 600, boxShadow: '0 10px 40px rgba(0,0,0,0.15)', background: toast.type === 'success' ? '#059669' : toast.type === 'error' ? '#dc2626' : '#1e3a5f', animation: 'slideIn 0.3s ease-out' }}>
          {toast.msg}
        </div>
      )}

      <main style={{ paddingTop: '110px', maxWidth: mainWidth, margin: '0 auto', paddingBottom: '60px' }}>
        
        {/* Hero Card Premium */}
        <div style={{ background: 'white', borderRadius: '32px', padding: '40px', boxShadow: '0 10px 40px rgba(0,40,85,0.04)', display: 'flex', alignItems: 'center', gap: '40px', marginBottom: '32px', position: 'relative', overflow: 'hidden', border: '1px solid rgba(226, 232, 240, 0.5)' }}>
          <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)', zIndex: 0 }} />
          <div style={{ position: 'relative', width: '130px', height: '130px', flexShrink: 0 }}>
            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)', position: 'absolute', zIndex: 1 }}>
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f1f5f9" strokeWidth="2" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#3b82f6" strokeDasharray={`${completionPct}, 100`} strokeWidth="2" strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.5s ease' }} />
            </svg>
            <div style={{ position: 'absolute', top: '10px', left: '10px', right: '10px', bottom: '10px', borderRadius: '50%', background: userPhoto ? `url(${userPhoto}) center/cover` : 'linear-gradient(135deg, #1e3a5f 0%, #3b82f6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.8rem', fontWeight: 800, color: 'white', border: '4px solid white', boxShadow: '0 8px 25px rgba(0,0,0,0.1)', zIndex: 2 }}>
              {!userPhoto && userName[0]}
            </div>
          </div>
          <div style={{ flex: 1, zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '10px' }}>
              <h1 style={{ margin: 0, color: '#1e3a5f', fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.5px' }}>{greeting}, {userName} ✨</h1>
              <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '8px 18px', borderRadius: '30px', fontSize: '0.75rem', fontWeight: 800, border: '1px solid #fecaca', textTransform: 'uppercase', letterSpacing: '0.5px' }}>EGRESADO</span>
            </div>
            <p style={{ color: '#64748b', margin: '0 0 20px', fontSize: '1.05rem', fontWeight: 500 }}>Tu perfil profesional está al <span style={{ color: '#3b82f6', fontWeight: 800 }}>{completionPct}%</span></p>
            <button onClick={() => avatarInputRef.current?.click()} style={{ background: '#f8fafc', color: '#1e3a5f', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '12px 24px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>📁 Cambiar Foto</button>
          </div>
        </div>

        {/* Action Grid (Premium Icons + Glassmorphism) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px', marginBottom: '40px' }}>
          {getQuickActions().map(a => (
            <div key={a.id} onClick={() => setActiveSection(a.id as any)} style={{ background: activeSection === a.id ? 'white' : 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)', borderRadius: '28px', padding: '32px 20px', textAlign: 'center', boxShadow: activeSection === a.id ? '0 15px 35px rgba(59, 130, 246, 0.15)' : '0 4px 15px rgba(0,0,0,0.03)', cursor: 'pointer', border: activeSection === a.id ? `2px solid ${a.color}` : '1px solid rgba(255,255,255,0.4)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', transform: activeSection === a.id ? 'translateY(-5px)' : 'none' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: `${a.color}15`, color: a.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <a.Icon />
              </div>
              <h3 style={{ margin: 0, color: '#1e3a5f', fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.3 }}>{a.title}</h3>
            </div>
          ))}
        </div>

        {/* Content Area */}
        <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
          {activeSection === 'none' && (
            <div style={{ background: 'white', borderRadius: '32px', padding: '50px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', display: 'flex', gap: '40px', alignItems: 'center', border: '1px solid rgba(226, 232, 240, 0.5)' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '30px', background: 'linear-gradient(135deg, #3b82f6 0%, #1e3a5f 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: 'white', boxShadow: '0 10px 20px rgba(59, 130, 246, 0.2)' }}><Icons.Home /></div>
              <div style={{ flex: 1 }}>
                <h2 style={{ color: '#1e3a5f', fontWeight: 900, fontSize: '1.8rem', margin: '0 0 12px' }}>¡Bienvenido a tu Portal Institucional!</h2>
                <p style={{ color: '#64748b', lineHeight: 1.7, margin: '0 0 28px', fontSize: '1.05rem' }}>Como egresado de la UCC, tienes acceso a herramientas exclusivas para potenciar tu empleabilidad y desarrollo profesional.</p>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <button onClick={() => setActiveSection('professional')} style={{ background: '#1e3a5f', color: 'white', border: 'none', borderRadius: '16px', padding: '16px 32px', fontWeight: 800, cursor: 'pointer' }}>Mi Perfil Profesional</button>
                  <button onClick={() => setActiveSection('cv')} style={{ background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '16px', padding: '16px 32px', fontWeight: 800, cursor: 'pointer' }}>Actualizar Hoja de Vida</button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'personal' && (
            <div style={{ background: 'white', borderRadius: '32px', padding: '45px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
                <h2 style={{ margin: 0, color: '#1e3a5f', fontWeight: 900, fontSize: '1.6rem' }}>Identidad Personal</h2>
                <button onClick={() => setIsEditingPersonal(!isEditingPersonal)} style={{ background: isEditingPersonal ? '#fee2e2' : '#1e3a5f', color: isEditingPersonal ? '#b91c1c' : 'white', border: 'none', borderRadius: '14px', padding: '12px 24px', fontWeight: 700, cursor: 'pointer' }}>{isEditingPersonal ? '✕ Cancelar' : 'Editar Datos'}</button>
              </div>
              <div className="responsive-grid-2" style={{ gap: '25px' }}>
                {[{ l: 'Nombre Completo', k: 'nombre_completo', e: true }, { l: 'Correo Electrónico', k: 'correo', e: true }, { l: 'Teléfono', k: 'telefono', e: true }, { l: 'Cédula', k: 'cedula', e: false }, { l: 'Nacimiento', k: 'fecha_nacimiento', e: false }, { l: 'Género', k: 'genero', e: false }].map(f => (
                  <div key={f.k}><label style={lbl}>{f.l}</label><input value={(formData as any)[f.k]} onChange={e => f.e && setFormData({ ...formData, [f.k]: e.target.value })} disabled={!isEditingPersonal || !f.e} style={!isEditingPersonal || !f.e ? dis : inp} /></div>
                ))}
              </div>
              {isEditingPersonal && <button onClick={handleSave} style={{ width: '100%', marginTop: '40px', padding: '18px', background: '#1e3a5f', color: 'white', borderRadius: '16px', fontWeight: 800, border: 'none', cursor: 'pointer' }}>💾 Guardar Cambios</button>}
            </div>
          )}

          {activeSection === 'professional' && (
            <div style={{ background: 'white', borderRadius: '32px', padding: '45px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
                <h2 style={{ margin: 0, color: '#1e3a5f', fontWeight: 900, fontSize: '1.6rem' }}>Perfil Profesional</h2>
                <button onClick={() => setIsEditingProf(!isEditingProf)} style={{ background: isEditingProf ? '#fee2e2' : '#00A9E0', color: isEditingProf ? '#b91c1c' : 'white', border: 'none', borderRadius: '14px', padding: '12px 24px', fontWeight: 700, cursor: 'pointer' }}>{isEditingProf ? '✕ Cancelar' : 'Actualizar Perfil'}</button>
              </div>
              <div className="responsive-grid-2" style={{ gap: '25px' }}>
                {[{ l: 'Programa Académico', k: 'programa_academico', o: DIAG_OPTIONS.Programa }, { l: 'Nivel', k: 'nivel_formacion', o: DIAG_OPTIONS.Formacion }, { l: 'Estado Civil', k: 'estado_civil', o: DIAG_OPTIONS.EstadoCivil }, { l: 'Estrato', k: 'estrato', o: DIAG_OPTIONS.Estrato }, { l: 'Ingresos', k: 'ingreso_mensual', o: DIAG_OPTIONS.Ingreso }, { l: 'Emprendimiento', k: 'emprendimiento', o: DIAG_OPTIONS.Emprendimiento }].map(f => (
                  <div key={f.k}><label style={lbl}>{f.l}</label>{isEditingProf ? <select value={(formData as any)[f.k]} onChange={e => setFormData({ ...formData, [f.k]: e.target.value })} style={inp}><option value="">Seleccionar...</option>{f.o.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select> : <input value={(formData as any)[f.k] || 'No completado'} disabled style={dis} />}</div>
                ))}
              </div>
              {isEditingProf && <button onClick={handleSave} style={{ width: '100%', marginTop: '40px', padding: '18px', background: '#00A9E0', color: 'white', borderRadius: '16px', fontWeight: 800, border: 'none', cursor: 'pointer' }}>💾 Guardar Perfil</button>}
            </div>
          )}

          {activeSection === 'cv' && (
            <div style={{ background: 'white', borderRadius: '32px', padding: '70px 50px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', textAlign: 'center' }}>
              <div style={{ width: '90px', height: '90px', borderRadius: '25px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 30px' }}><Icons.File /></div>
              <h2 style={{ color: '#1e3a5f', fontWeight: 900, fontSize: '2rem', margin: '0 0 12px' }}>Hoja de Vida</h2>
              <p style={{ color: '#64748b', marginBottom: '45px', fontSize: '1.1rem' }}>Mantén tu CV actualizado para ser visible ante las empresas aliadas.</p>
              <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                <button onClick={() => { if (!userId) return; fetch(`${base()}/api/users/get-cv-url/${userId}`).then(r => r.json()).then(d => d.success ? window.open(d.url, '_blank') : showToast('No hay CV registrado', 'info')) }} style={{ padding: '16px 35px', background: '#1e3a5f', color: 'white', border: 'none', borderRadius: '16px', fontWeight: 800, cursor: 'pointer' }}>📄 Ver CV Actual</button>
                <button onClick={() => cvInputRef.current?.click()} style={{ padding: '16px 35px', background: '#e0f7ff', color: '#00A9E0', border: '2px solid #3b82f6', borderRadius: '16px', fontWeight: 800, cursor: 'pointer' }}>⬆️ Subir Nuevo CV</button>
              </div>
            </div>
          )}

          {activeSection === 'apps' && (
            <div style={{ background: 'white', borderRadius: '32px', padding: '70px 50px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', textAlign: 'center' }}>
              <div style={{ width: '90px', height: '90px', borderRadius: '25px', background: '#fff7ed', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 30px' }}><Icons.Mail /></div>
              <h2 style={{ color: '#1e3a5f', fontWeight: 900, fontSize: '2rem', margin: '0 0 12px' }}>Mis Postulaciones</h2>
              <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Aquí podrás hacer seguimiento a las vacantes a las que te has postulado.</p>
            </div>
          )}
        </div>

      </main>
      <Footer />
      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>
    </div>
  );
}
