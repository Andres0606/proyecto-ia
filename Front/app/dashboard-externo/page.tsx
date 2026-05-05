'use client';

import React, { useEffect, useState } from 'react';
import Header from '../Components/header';
import Footer from '../Components/footer';
import '../css/Dashboard/dashboard.css';

const QUICK_ACTIONS = [
  { title: 'Inicio', icon: '🏠', id: 'none' },
  { title: 'Datos Personales', icon: '👤', id: 'personal' },
  { title: 'Perfil Profesional', icon: '💼', id: 'professional' },
  { title: 'Planes y Membresía', icon: '💳', id: 'plans' },
  { title: 'Mi Hoja de Vida', icon: '📄', id: 'cv' },
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

export default function DashboardExterno() {
  const [greeting, setGreeting] = useState('Buenos días');
  const [userName, setUserName] = useState('Usuario');
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'none' | 'personal' | 'professional' | 'plans' | 'cv'>('none');
  const [isEditingProf, setIsEditingProf] = useState(false);
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [toast, setToast] = useState<{ msg: string, type: 'info' | 'success' | 'error' | 'none' }>({ msg: '', type: 'none' });
  const [isUploading, setIsUploading] = useState(false);
  const [completionPct, setCompletionPct] = useState(0);
  const [userPlan, setUserPlan] = useState('Gratuito');
  const [formData, setFormData] = useState({
    nombre_completo: '', correo: '', telefono: '', cedula: '', fecha_nacimiento: '', genero: '',
    nivel_formacion: '', programa_academico: '', estrato: '', estado_civil: '', numero_hijos: '',
    ingreso_mensual: '', sector_economico: '', area_desempeno: '', emprendimiento: ''
  });

  const avatarRef = React.useRef<HTMLInputElement>(null);
  const cvRef = React.useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type: 'info' | 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'none' }), 3000);
  };

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

  const base = () => (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000').replace(/\/$/, '');

  const fetchProfile = async (id: string) => {
    try {
      const r = await fetch(`${base()}/api/users/profile/${id}`);
      const d = await r.json();
      if (d.success && d.profile) {
        const u = d.profile;
        const p = u.perfiles_usuarios?.[0] || {};
        setUserName(u.nombre_completo?.split(' ')[0] || 'Usuario');
        if (u.foto_url) setUserPhoto(u.foto_url);
        const v = (x: any) => (x != null && x !== '') ? String(x) : '';
        setFormData({
          nombre_completo: u.nombre_completo || '', correo: u.correo || '', telefono: u.telefono || '',
          cedula: u.cedula || '', fecha_nacimiento: u.fecha_nacimiento?.split('T')[0] || '', genero: u.genero || '',
          nivel_formacion: v(p.nivel_formacion), programa_academico: v(p.programa_academico), estrato: v(p.estrato),
          estado_civil: v(p.estado_civil), numero_hijos: v(p.numero_hijos), ingreso_mensual: v(p.ingreso_mensual),
          sector_economico: v(p.sector_economico), area_desempeno: v(p.area_desempeno), emprendimiento: v(p.emprendimiento)
        });
        let pct = 0;
        if (u.foto_url) pct += 15;
        if (u.cv_url) pct += 25;
        if (u.telefono && u.nombre_completo) pct += 20;
        const profFields = [p.nivel_formacion, p.programa_academico, p.estrato, p.estado_civil, p.ingreso_mensual];
        const filled = profFields.filter(f => f !== null && f !== undefined && String(f).trim() !== '').length;
        pct += (filled / profFields.length) * 40;
        setCompletionPct(Math.round(pct));
        if (u.suscripcion) setUserPlan(u.suscripcion.tipo_plan || 'Gratuito');
      }
    } catch (e) { console.error(e); }
  };

  const handleSave = async () => {
    if (!userId) return;
    showToast('Guardando...', 'info');
    try {
      const r = await fetch(`${base()}/api/users/profile/${userId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userData: formData, profileData: formData }) });
      const d = await r.json();
      if (d.success) { showToast('¡Perfil actualizado!', 'success'); setIsEditingProf(false); setIsEditingPersonal(false); setTimeout(() => fetchProfile(userId!), 2000); }
    } catch { showToast('Error al guardar', 'error'); }
  };

  const handleUpload = async (file: File, type: 'avatar' | 'cv') => {
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

  const handleSubscribe = async (planName: string) => {
    if (!userId) return;
    showToast('Procesando...', 'info');
    try {
      const r = await fetch(`${base()}/api/users/subscribe`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: String(userId).trim(), planType: planName })
      });
      const d = await r.json();
      if (d.success) {
        showToast('¡Plan actualizado!', 'success');
        setTimeout(() => window.location.reload(), 1500);
      } else showToast(d.message || 'Error', 'error');
    } catch { showToast('Error', 'error'); }
  };

  const inp = { padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%', fontSize: '0.95rem', outline: 'none' };
  const dis = { ...inp, background: '#f8fafc', color: '#64748b', cursor: 'not-allowed' as const };
  const lbl = { fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px', display: 'block', textTransform: 'uppercase' as const };

  const PLANS = [
    { name: 'Gratuito', price: 'Gratis', icon: '🆓', features: ['Perfil Profesional', 'Subir CV'] },
    { name: 'Acceso al Modelo', price: '$25.000', icon: '🧠', features: ['Perfil Profesional', 'Subir CV', 'Diagnóstico IA'] },
    { name: 'Plan Completo', price: '$45.000', icon: '🚀', features: ['Todo lo anterior', 'Bolsa de Empleo', 'Alertas Email'] }
  ];

  return (
    <div className="db-page" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <Header />
      <input type="file" ref={avatarRef} hidden accept="image/*" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], 'avatar')} />
      <input type="file" ref={cvRef} hidden accept=".pdf" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], 'cv')} />

      {toast.type !== 'none' && (
        <div style={{ position: 'fixed', bottom: '32px', right: '32px', zIndex: 9999, padding: '14px 22px', borderRadius: '14px', color: 'white', fontWeight: 600, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', background: toast.type === 'success' ? '#059669' : toast.type === 'error' ? '#dc2626' : '#1e3a5f' }}>
          {toast.msg}
        </div>
      )}

      <main style={{ paddingTop: '110px', maxWidth: '1100px', margin: '0 auto', paddingBottom: '60px' }}>
        
        {/* Hero Card */}
        <div style={{ background: 'white', borderRadius: '24px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '32px', marginBottom: '40px' }}>
          <div style={{ position: 'relative', width: '120px', height: '120px' }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: userPhoto ? `url(${userPhoto}) center/cover` : '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800, color: 'white', border: '4px solid #f1f5f9' }}>
              {!userPhoto && userName[0]}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <h1 style={{ margin: 0, color: '#1e3a5f', fontSize: '2.2rem', fontWeight: 800 }}>{greeting}, {userName} ✨</h1>
              <span style={{ background: '#dcfce7', color: '#166534', padding: '6px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>USUARIO EXTERNO</span>
            </div>
            <p style={{ color: '#64748b', margin: '0 0 16px', fontSize: '1rem' }}>Tu perfil profesional está al {completionPct}%</p>
            <button onClick={() => avatarRef.current?.click()} style={{ background: '#f8fafc', color: '#1e3a5f', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 20px', fontWeight: 700, cursor: 'pointer' }}>📁 Cambiar Foto</button>
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

        {/* Content Sections */}
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
          {activeSection === 'none' && (
            <div style={{ background: 'white', borderRadius: '24px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', gap: '30px', alignItems: 'center' }}>
              <div style={{ fontSize: '5rem' }}>🚀</div>
              <div style={{ flex: 1 }}>
                <h2 style={{ color: '#1e3a5f', fontWeight: 800, margin: '0 0 10px' }}>¡Bienvenido a tu Dashboard!</h2>
                <p style={{ color: '#64748b', lineHeight: 1.6, margin: '0 0 20px' }}>Completa tu perfil para acceder a las mejores oportunidades laborales y diagnósticos inteligentes.</p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => setActiveSection('professional')} style={{ background: '#1e3a5f', color: 'white', border: 'none', borderRadius: '12px', padding: '14px 28px', fontWeight: 700, cursor: 'pointer' }}>Completar Perfil</button>
                  <button onClick={() => setActiveSection('plans')} style={{ background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '12px', padding: '14px 28px', fontWeight: 700, cursor: 'pointer' }}>Ver Planes</button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'personal' && (
            <div style={{ background: 'white', borderRadius: '24px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h2 style={{ margin: 0, color: '#1e3a5f', fontWeight: 800 }}>👤 Datos Personales</h2>
                <button onClick={() => setIsEditingPersonal(!isEditingPersonal)} style={{ background: isEditingPersonal ? '#fee2e2' : '#1e3a5f', color: isEditingPersonal ? '#b91c1c' : 'white', border: 'none', borderRadius: '12px', padding: '10px 20px', fontWeight: 700, cursor: 'pointer' }}>{isEditingPersonal ? '✕ Cancelar' : '✏️ Editar'}</button>
              </div>
              <div className="responsive-grid-2">
                {[{ l: 'Nombre Completo', k: 'nombre_completo', e: true }, { l: 'Correo', k: 'correo', e: true }, { l: 'Teléfono', k: 'telefono', e: true }, { l: 'Cédula', k: 'cedula', e: false }, { l: 'Nacimiento', k: 'fecha_nacimiento', e: false }, { l: 'Género', k: 'genero', e: false }].map(f => (
                  <div key={f.k}><label style={lbl}>{f.l}</label><input value={(formData as any)[f.k]} onChange={e => f.e && setFormData({ ...formData, [f.k]: e.target.value })} disabled={!isEditingPersonal || !f.e} style={!isEditingPersonal || !f.e ? dis : inp} /></div>
                ))}
              </div>
              {isEditingPersonal && <button onClick={handleSave} style={{ width: '100%', marginTop: '30px', padding: '16px', background: '#1e3a5f', color: 'white', borderRadius: '12px', fontWeight: 800, border: 'none', cursor: 'pointer' }}>💾 Guardar Cambios</button>}
            </div>
          )}

          {activeSection === 'professional' && (
            <div style={{ background: 'white', borderRadius: '24px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h2 style={{ margin: 0, color: '#1e3a5f', fontWeight: 800 }}>💼 Perfil Profesional</h2>
                <button onClick={() => setIsEditingProf(!isEditingProf)} style={{ background: isEditingProf ? '#fee2e2' : '#00A9E0', color: isEditingProf ? '#b91c1c' : 'white', border: 'none', borderRadius: '12px', padding: '10px 20px', fontWeight: 700, cursor: 'pointer' }}>{isEditingProf ? '✕ Cancelar' : '✏️ Actualizar'}</button>
              </div>
              <div className="responsive-grid-2">
                {[{ l: 'Programa', k: 'programa_academico', o: DIAG_OPTIONS.Programa }, { l: 'Nivel', k: 'nivel_formacion', o: DIAG_OPTIONS.Formacion }, { l: 'Estado Civil', k: 'estado_civil', o: DIAG_OPTIONS.EstadoCivil }, { l: 'Estrato', k: 'estrato', o: DIAG_OPTIONS.Estrato }, { l: 'Ingresos', k: 'ingreso_mensual', o: DIAG_OPTIONS.Ingreso }, { l: 'Emprendimiento', k: 'emprendimiento', o: DIAG_OPTIONS.Emprendimiento }].map(f => (
                  <div key={f.k}><label style={lbl}>{f.l}</label>{isEditingProf ? <select value={(formData as any)[f.k]} onChange={e => setFormData({ ...formData, [f.k]: e.target.value })} style={inp}><option value="">Seleccionar...</option>{f.o.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select> : <input value={(formData as any)[f.k] || 'No completado'} disabled style={dis} />}</div>
                ))}
              </div>
              {isEditingProf && <button onClick={handleSave} style={{ width: '100%', marginTop: '30px', padding: '16px', background: '#00A9E0', color: 'white', borderRadius: '12px', fontWeight: 800, border: 'none', cursor: 'pointer' }}>💾 Guardar Perfil</button>}
            </div>
          )}

          {activeSection === 'plans' && (
            <div style={{ background: 'white', borderRadius: '24px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <h2 style={{ margin: '0 0 32px', color: '#1e3a5f', fontWeight: 800, textAlign: 'center' }}>💳 Planes y Membresía</h2>
              <div className="responsive-grid-3" style={{ gap: '24px' }}>
                {PLANS.map(p => (
                  <div key={p.name} style={{ padding: '30px', borderRadius: '20px', border: userPlan === p.name ? '2px solid #3b82f6' : '1px solid #e2e8f0', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{p.icon}</div>
                    <h3 style={{ margin: '0 0 10px', color: '#1e3a5f' }}>{p.name}</h3>
                    <p style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 20px' }}>{p.price}</p>
                    <button onClick={() => userPlan !== p.name && handleSubscribe(p.name)} disabled={userPlan === p.name} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: userPlan === p.name ? '#f1f5f9' : '#3b82f6', color: userPlan === p.name ? '#94a3b8' : 'white', fontWeight: 700, cursor: userPlan === p.name ? 'default' : 'pointer' }}>{userPlan === p.name ? 'Plan Actual' : 'Seleccionar'}</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'cv' && (
            <div style={{ background: 'white', borderRadius: '24px', padding: '60px 40px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📄</div>
              <h2 style={{ color: '#1e3a5f', fontWeight: 800, margin: '0 0 8px' }}>Tu Hoja de Vida</h2>
              <p style={{ color: '#64748b', marginBottom: '32px' }}>Sube tu CV para que las empresas puedan conocerte</p>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                <button onClick={() => { if (!userId) return; fetch(`${base()}/api/users/get-cv-url/${userId}`).then(r => r.json()).then(d => d.success ? window.open(d.url, '_blank') : showToast('No hay CV', 'info')) }} style={{ padding: '14px 28px', background: '#1e3a5f', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Ver CV Actual</button>
                <button onClick={() => cvRef.current?.click()} style={{ padding: '14px 28px', background: '#e0f7ff', color: '#00A9E0', border: '1px solid #3b82f6', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Subir Nuevo CV</button>
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