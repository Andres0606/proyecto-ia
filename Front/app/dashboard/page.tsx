'use client';

import React, { useEffect, useState } from 'react';
import Header from '../Components/header';
import Footer from '../Components/footer';
import '../css/Dashboard/dashboard.css';

const getQuickActions = (role: string | null) => {
  return [
    { title: 'Datos Personales', icon: '👤', id: 'personal' },
    { title: 'Perfil Profesional', icon: '💼', id: 'professional' },
    { title: 'Actualizar CV', icon: '📄', id: 'cv' },
    { title: 'Mis Postulaciones', icon: '📨', id: 'apps' },
  ];
};

const DIAG_OPTIONS = {
  Programa: [
    "Derecho", "Contaduria Publica", "Ingenieria Civil", "Ciencias Economicas",
    "Medicina", "Psicologia", "Odontologia", "Enfermeria", "Ingenieria de Sistemas",
    "Medicina Veterinaria y Zootecnia", "Especializacion", "Tecnico Auxiliar en Enfermeria"
  ],
  Estrato: ["Uno", "Dos", "Tres", "Cuatro", "Cinco", "Seis"],
  EstadoCivil: ["Casado", "Union libre", "Soltero", "Separado", "Viudo"],
  Hijos: ["Cero", "Uno", "Dos", "Tres", "Cuatro", "Cinco"],
  Formacion: ["Profesional", "Especialista", "Magister", "Doctorado", "Tecnico Profesional"],
  Emprendimiento: ["Si", "No"],
  Area: [
    "Servicios", "Administrativa", "Salud", "Financiera", "Industrial",
    "Economica", "Gestion Humana", "Educacion", "Comercial", "Contable", "Sistemas"
  ],
  Sector: ["Servicios", "Comercial", "Industrial"],
  Ingreso: ["1 SML o menos", "2-3 SML", "3-5 SML", "5 SML o mas"]
};

export default function Dashboard() {
  const [greeting, setGreeting] = useState('Buenos días');
  const [userName, setUserName] = useState('Egresado');
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'none' | 'personal' | 'professional' | 'apps' | 'cv'>('none');
  const [isEditingProf, setIsEditingProf] = useState(false);
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [completionPct, setCompletionPct] = useState(0);
  
  const [uploadStatus, setUploadStatus] = useState<{msg: string, type: 'info' | 'success' | 'error' | 'none'}>({msg: '', type: 'none'});
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<{ msg: string, type: 'info' | 'success' | 'error' | 'none' }>({ msg: '', type: 'none' });

  const showToast = (msg: string, type: 'info' | 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'none' }), 3000);
  };

  const base = () => (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000').replace(/\/$/, '');
  
  const [formData, setFormData] = useState({
    nombre_completo: '',
    correo: '',
    telefono: '',
    cedula: '',
    fecha_nacimiento: '',
    genero: '',
    nivel_formacion: '',
    programa_academico: '',
    estrato: '',
    estado_civil: '',
    numero_hijos: '',
    ingreso_mensual: '',
    sector_economico: '',
    area_desempeno: '',
    emprendimiento: ''
  });

  const avatarInputRef = React.useRef<HTMLInputElement>(null);
  const cvInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 12 && hour < 18) setGreeting('Buenas tardes');
    if (hour >= 18 || hour < 5) setGreeting('Buenas noches');

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
          else if (rolId === 3) window.location.href = "/dashboard-empresa";
          else {
            setUserId(cleanId);
            const meta = userData.profile || userData.user_metadata || {};
            setUserName(meta.full_name?.split(' ')[0] || meta.nombre_completo?.split(' ')[0] || 'Usuario');
            setUserRole('egresado');
            fetchFullProfile(cleanId);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const fetchFullProfile = async (id: string) => {
    try {
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000').replace(/\/$/, '');
      const res = await fetch(`${backendUrl}/api/users/profile/${id}`);
      const data = await res.json();
      
      if (data.success && data.profile) {
        const u = data.profile;
        const fetchedRol = Number(u.rol_id);

        // Async Route Guard
        if (fetchedRol === 4) { window.location.href = "/dashboard-admin"; return; }
        if (fetchedRol === 2) { window.location.href = "/dashboard-externo"; return; }
        if (fetchedRol === 3) { window.location.href = "/dashboard-empresa"; return; }

        const p = (u.perfiles_usuarios && u.perfiles_usuarios.length > 0) ? u.perfiles_usuarios[0] : {};
        const c = u.empresa || {};
        
        setUserName(u.nombre_completo ? u.nombre_completo.split(' ')[0] : 'Egresado');
        if (u.foto_url) setUserPhoto(u.foto_url);

        const val = (v: any) => (v !== null && v !== undefined && v !== '') ? String(v) : '';

        setFormData({
          nombre_completo: u.nombre_completo || '',
          correo: u.correo || '',
          telefono: u.telefono || '',
          cedula: u.cedula || 'N/A',
          fecha_nacimiento: u.fecha_nacimiento ? u.fecha_nacimiento.split('T')[0] : 'No definida',
          genero: u.genero || 'No definido',
          nivel_formacion: val(p.nivel_formacion),
          programa_academico: val(p.programa_academico),
          estrato: val(p.estrato),
          estado_civil: val(p.estado_civil),
          numero_hijos: val(p.numero_hijos),
          ingreso_mensual: val(p.ingreso_mensual),
          sector_economico: val(p.sector_economico || c.sector_economico),
          area_desempeno: val(p.area_desempeno),
          emprendimiento: val(p.emprendimiento),
          // Empresa fields
          razon_social: val(c.razon_social),
          nit: val(c.nit),
          ciudad: val(c.ciudad),
          tamano_empresa: val(c.tamano_empresa),
          tipo_empresa: val(c.tipo_empresa)
        } as any);

        let pct = 0;
        if (u.foto_url || userPhoto) pct += 15;
        if (u.cv_url) pct += 25;
        if (u.telefono && u.nombre_completo) pct += 20;
        
        const profFields = [p.nivel_formacion, p.programa_academico, p.estrato, p.estado_civil, p.ingreso_mensual];
        const filled = profFields.filter(f => f !== null && f !== undefined && String(f).trim() !== '').length;
        pct += (filled / profFields.length) * 40;
        setCompletionPct(Math.round(pct));
      }
    } catch (err) { console.error(err); }
  };

  const handleSaveProfile = async () => {
    if (!userId) return;
    setLoadingProfile(true);
    setUploadStatus({ msg: 'Guardando cambios...', type: 'info' });
    try {
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000').replace(/\/$/, '');
      const res = await fetch(`${backendUrl}/api/users/profile/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userData: formData,
          profileData: formData
        }),
      });
      const data = await res.json();
      if (data.success) {
        setUploadStatus({ msg: 'Perfil actualizado con éxito', type: 'success' });
        setIsEditingProf(false);
        setIsEditingPersonal(false);
        setTimeout(() => {
          fetchFullProfile(userId);
          setUploadStatus({ msg: '', type: 'none' });
        }, 2000);
      }
    } catch (err: any) { setUploadStatus({ msg: 'Error al guardar cambios', type: 'error' }); } finally { setLoadingProfile(false); }
  };

  const handleFileUpload = async (file: File, type: 'avatar' | 'cv') => {
    if (!userId) return;
    setIsUploading(true);
    showToast(`Subiendo ${type === 'avatar' ? 'foto' : 'CV'}...`, 'info');
    
    const fd = new FormData();
    fd.append(type === 'avatar' ? 'image' : 'cv', file);
    fd.append('userId', String(userId).trim());
    
    try {
      const r = await fetch(`${base()}/api/users/upload-${type === 'avatar' ? 'avatar' : 'cv'}`, { method: 'POST', body: fd });
      const d = await r.json();
      
      if (d.success) {
        showToast('¡Subido con éxito!', 'success');
        if (type === 'avatar') setUserPhoto(d.url);
        setTimeout(() => fetchFullProfile(userId), 1500);
      } else {
        const errorDetail = d.error ? ` (${d.error})` : '';
        showToast(`${d.message || 'Error en la carga'}${errorDetail}`, 'error');
      }
    } catch { 
      showToast('Error en la carga', 'error'); 
    } finally { 
      setIsUploading(false); 
    }
  };

  const handleViewResume = async () => {
    if (!userId) return;
    try {
      const r = await fetch(`${base()}/api/users/get-cv-url/${userId}`);
      const d = await r.json();
      if (d.success) window.open(d.url, '_blank'); else showToast('No hay CV subido', 'info');
    } catch { showToast('Error al recuperar archivo', 'error'); }
  };

  const baseInputStyle = {
    padding: '16px 24px',
    borderRadius: '14px',
    border: '1px solid #e2e8f0',
    width: '100%',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.2s ease'
  };

  const disabledInputStyle = {
    ...baseInputStyle,
    background: '#f8fafc',
    color: '#64748b',
    cursor: 'not-allowed',
    fontWeight: 500,
    border: '1px solid #e2e8f0'
  };

  const labelStyle = {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: 'var(--ucc-navy)',
    marginBottom: '8px',
    display: 'block'
  };

  return (
    <div className="db-page">
      <Header />
      <input type="file" ref={avatarInputRef} hidden accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'avatar')} />
      <input type="file" ref={cvInputRef} hidden accept=".pdf" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'cv')} />

      {/* Notificación Toast Moderna */}
      {toast.type !== 'none' && (
        <div style={{
          position: 'fixed', bottom: '32px', right: '32px', zIndex: 9999,
          padding: '16px 22px',
          borderRadius: '16px',
          color: 'white',
          fontWeight: 600,
          fontSize: '0.95rem',
          letterSpacing: '0.01em',
          boxShadow: '0 20px 60px rgba(0,0,0,0.20), 0 4px 16px rgba(0,0,0,0.10)',
          border: '1px solid rgba(255,255,255,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          minWidth: '260px',
          maxWidth: '360px',
          backdropFilter: 'blur(12px)',
          animation: 'slideInRight 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          background:
            toast.type === 'success'
              ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
              : toast.type === 'error'
              ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
              : 'linear-gradient(135deg, #1e3a5f 0%, #0f2340 100%)'
        }}>
          {toast.type === 'info' && (
            <div className="spinner-white" style={{ flexShrink: 0 }} />
          )}
          {toast.type === 'success' && (
            <svg style={{ flexShrink: 0 }} width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="rgba(255,255,255,0.2)" />
              <path d="M7 12.5l3.5 3.5 6.5-7" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          {toast.type === 'error' && (
            <svg style={{ flexShrink: 0 }} width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="rgba(255,255,255,0.2)" />
              <path d="M15 9l-6 6M9 9l6 6" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          )}
          <span>{toast.msg}</span>
        </div>
      )}

      <main className="db-main" style={{ paddingTop: '100px', minHeight: '80vh' }}>
        
        <div className="db-card responsive-hero" style={{ margin: '0 auto 40px', maxWidth: '1100px', padding: '30px 40px', background: 'white', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <div style={{ position: 'relative', width: '130px', height: '130px', flexShrink: 0 }}>
            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)', position: 'absolute' }}>
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f1f5f9" strokeWidth="2" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--ucc-blue)" strokeDasharray={`${completionPct}, 100`} strokeWidth="2" strokeLinecap="round" />
            </svg>
            <div style={{ position: 'absolute', top: '10px', left: '10px', right: '10px', bottom: '10px', borderRadius: '50%', background: userPhoto ? `url(${userPhoto}) center/cover` : 'var(--ucc-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2.5rem', fontWeight: 800, border: '4px solid white' }}>
              {!userPhoto && userName[0]}
            </div>
            {isUploading && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner-white" />
              </div>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <h1 style={{ margin: 0, color: 'var(--ucc-navy)', fontSize: '2rem' }}>{greeting}, {userName} ✨</h1>
              <span style={{ 
                background: userRole === 'empresa' ? '#fef3c7' : userRole === 'externo' ? '#dcfce7' : '#fee2e2', 
                color: userRole === 'empresa' ? '#92400e' : userRole === 'externo' ? '#166534' : '#b91c1c',
                padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px'
              }}>
                {userRole || 'Egresado'}
              </span>
            </div>
            <p style={{ color: '#64748b', margin: 0 }}>Tu perfil profesional está al {completionPct}%</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button disabled={isUploading} onClick={() => avatarInputRef.current?.click()} style={{ background: '#f8fafc', color: 'var(--ucc-navy)', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 20px', cursor: isUploading ? 'not-allowed' : 'pointer', fontWeight: 600, transition: 'all 0.2s' }}>
                {isUploading ? 'Procesando...' : '📁 Cambiar Foto'}
              </button>
            </div>
          </div>
        </div>

        <div className="db-actions responsive-grid-4" style={{ margin: '40px auto', maxWidth: '1100px' }}>
          {getQuickActions(userRole).map((action) => (
            <div key={action.id} className="db-action-card" style={{ cursor: 'pointer', padding: '30px', textAlign: 'center', background: 'white', borderRadius: '24px', border: activeSection === action.id ? '2px solid var(--ucc-blue)' : '1px solid #f1f5f9', boxShadow: '0 8px 20px rgba(0,0,0,0.03)', transition: 'all 0.3s ease' }} 
              onClick={() => setActiveSection(activeSection === action.id ? 'none' : action.id as any)}>
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>{action.icon}</div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--ucc-navy)', fontWeight: 800 }}>{action.title}</h3>
            </div>
          ))}
        </div>

        <div style={{ maxWidth: '1100px', margin: '0 auto 60px' }}>
          {activeSection === 'personal' && userRole !== 'empresa' && (
            <div className="db-card" style={{ padding: '45px', borderRadius: '28px' }}>
              <div className="responsive-flex-between">
                <h2 style={{ color: 'var(--ucc-navy)', margin: 0, fontWeight: 800 }}>👤 Datos Personales</h2>
                <button 
                  onClick={() => setIsEditingPersonal(!isEditingPersonal)} 
                  style={{ 
                    background: isEditingPersonal ? 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)' : 'linear-gradient(135deg, var(--ucc-blue) 0%, #0056b3 100%)', 
                    color: isEditingPersonal ? '#475569' : 'white', 
                    border: 'none', borderRadius: '14px', padding: '12px 24px', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
                    boxShadow: isEditingPersonal ? '0 2px 4px rgba(0,0,0,0.05)' : '0 6px 16px rgba(0, 122, 255, 0.3)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex', alignItems: 'center', gap: '8px'
                  }}>
                  {isEditingPersonal ? '✕ Cancelar' : '✎ Editar Datos'}
                </button>
              </div>

              <div className="responsive-grid-2">
                <div className="form-group">
                  <label style={labelStyle}>Nombre Completo</label>
                  <input type="text" value={formData.nombre_completo} onChange={(e) => setFormData({...formData, nombre_completo: e.target.value})} disabled={!isEditingPersonal} style={isEditingPersonal ? {...baseInputStyle, border: '1px solid var(--ucc-blue)'} : disabledInputStyle} />
                </div>
                <div className="form-group">
                  <label style={labelStyle}>Correo Electrónico</label>
                  <input type="email" value={formData.correo} onChange={(e) => setFormData({...formData, correo: e.target.value})} disabled={!isEditingPersonal} style={isEditingPersonal ? {...baseInputStyle, border: '1px solid var(--ucc-blue)'} : disabledInputStyle} />
                </div>
                <div className="form-group">
                  <label style={labelStyle}>Teléfono</label>
                  <input type="text" value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} disabled={!isEditingPersonal} style={isEditingPersonal ? {...baseInputStyle, border: '1px solid var(--ucc-blue)'} : disabledInputStyle} />
                </div>
                <div className="form-group">
                  <label style={labelStyle}>Cédula</label>
                  <input type="text" value={formData.cedula} disabled style={disabledInputStyle} title="Este campo no se puede editar" />
                </div>
                <div className="form-group">
                  <label style={labelStyle}>Fecha de Nacimiento</label>
                  <input type="text" value={formData.fecha_nacimiento} disabled style={disabledInputStyle} title="Este campo no se puede editar" />
                </div>
                <div className="form-group">
                  <label style={labelStyle}>Género</label>
                  <input type="text" value={formData.genero} disabled style={disabledInputStyle} title="Este campo no se puede editar" />
                </div>
              </div>

              {isEditingPersonal && (
                <button onClick={handleSaveProfile} disabled={loadingProfile} style={{ width: '100%', marginTop: '40px', padding: '18px', background: 'var(--ucc-navy)', color: 'white', borderRadius: '16px', fontWeight: 800, cursor: loadingProfile ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease', boxShadow: '0 8px 25px rgba(30, 58, 95, 0.2)' }}>
                  {loadingProfile ? 'Guardando...' : '💾 Guardar Cambios Personales'}
                </button>
              )}
            </div>
          )}

          {activeSection === 'professional' && (
            <div className="db-card" style={{ padding: '45px', borderRadius: '28px' }}>
              <div className="responsive-flex-between" style={{ marginBottom: '40px' }}>
                <h2 style={{ color: 'var(--ucc-navy)', margin: 0, fontWeight: 800 }}>
                  {userRole === 'empresa' ? '🏢 Perfil de Empresa' : '💼 Perfil Profesional'}
                </h2>
                <button 
                  onClick={() => setIsEditingProf(!isEditingProf)} 
                  style={{ 
                    background: isEditingProf ? 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)' : 'linear-gradient(135deg, var(--ucc-blue) 0%, #0056b3 100%)', 
                    color: isEditingProf ? '#475569' : 'white', 
                    border: 'none', borderRadius: '14px', padding: '12px 24px', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
                    boxShadow: isEditingProf ? '0 2px 4px rgba(0,0,0,0.05)' : '0 6px 16px rgba(0, 122, 255, 0.3)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex', alignItems: 'center', gap: '8px'
                  }}>
                  {isEditingProf ? '✕ Cancelar' : '✎ Actualizar Información'}
                </button>
              </div>

              <div className="responsive-grid-2">
                {/* Egresado Fields */}
                {[
                  { label: 'Programa Académico', key: 'programa_academico', options: DIAG_OPTIONS.Programa },
                  { label: 'Nivel de Formación', key: 'nivel_formacion', options: DIAG_OPTIONS.Formacion },
                  { label: 'Estado Civil', key: 'estado_civil', options: DIAG_OPTIONS.EstadoCivil },
                  { label: 'Estrato', key: 'estrato', options: DIAG_OPTIONS.Estrato },
                  { label: 'Rango de Ingreso', key: 'ingreso_mensual', options: DIAG_OPTIONS.Ingreso },
                  { label: '¿Emprendimiento?', key: 'emprendimiento', options: DIAG_OPTIONS.Emprendimiento },
                  { label: 'Área de Desempeño', key: 'area_desempeno', options: DIAG_OPTIONS.Area },
                  { label: 'Sector Económico', key: 'sector_economico', options: DIAG_OPTIONS.Sector },
                  { label: 'Número de Hijos', key: 'numero_hijos', options: DIAG_OPTIONS.Hijos },
                ].map((field) => (
                  <div key={field.key} className="form-group">
                    <label style={labelStyle}>{field.label}</label>
                    {isEditingProf ? (
                      <select value={(formData as any)[field.key]} onChange={(e) => setFormData({...formData, [field.key]: e.target.value})} style={{...baseInputStyle, border: '1px solid var(--ucc-blue)'}}>
                        <option value="">Seleccione...</option>
                        {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input type="text" value={(formData as any)[field.key] || 'No completado'} disabled style={disabledInputStyle} />
                    )}
                  </div>
                ))}
              </div>
              {isEditingProf && (
                <button onClick={handleSaveProfile} disabled={loadingProfile} style={{ width: '100%', marginTop: '40px', padding: '18px', background: 'var(--ucc-navy)', color: 'white', borderRadius: '16px', fontWeight: 800, cursor: loadingProfile ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease', boxShadow: '0 8px 25px rgba(30, 58, 95, 0.2)' }}>
                  {loadingProfile ? 'Guardando...' : '💾 Guardar Perfil Profesional'}
                </button>
              )}
            </div>
          )}

          {activeSection === 'cv' && (
            <div style={{ background: 'white', borderRadius: '24px', padding: '50px 40px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 24px' }}>📄</div>
              <h2 style={{ color: 'var(--ucc-navy)', fontWeight: 800, fontSize: '1.6rem', marginBottom: '8px' }}>Tu Hoja de Vida</h2>
              <p style={{ color: '#64748b', marginBottom: '32px' }}>Sube tu CV en formato PDF para que las empresas puedan verlo</p>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '32px' }}>
                <button onClick={handleViewResume} style={{ padding: '14px 28px', background: 'var(--ucc-navy)', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}>📄 Ver CV Actual</button>
                <button onClick={() => cvInputRef.current?.click()} disabled={isUploading} style={{ padding: '14px 28px', background: '#e0f7ff', color: '#00A9E0', border: '1px solid #7dd3fc', borderRadius: '14px', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}>{isUploading ? 'Subiendo...' : '⬆️ Subir Nuevo CV'}</button>
              </div>
              <div onClick={() => !isUploading && cvInputRef.current?.click()} style={{ border: '2px dashed #cbd5e1', padding: '40px', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--ucc-navy)')} onMouseOut={e => (e.currentTarget.style.borderColor = '#cbd5e1')}>
                <p style={{ color: '#94a3b8', margin: 0 }}>{isUploading ? 'Procesando archivo...' : 'Arrastra tu PDF aquí o haz clic para seleccionarlo'}</p>
              </div>
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        @keyframes slideInRight {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .spinner-white {
          width: 18px;
          height: 18px;
          border: 2.5px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          flex-shrink: 0;
        }
        .spinner-blue {
          width: 30px;
          height: 30px;
          border: 4px solid rgba(0,0,0,0.05);
          border-top-color: var(--ucc-blue);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      
      <Footer />
    </div>
  );
}
