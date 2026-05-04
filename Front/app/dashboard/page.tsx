'use client';

import React, { useEffect, useState } from 'react';
import Header from '../Components/header';
import Footer from '../Components/footer';
import '../css/Dashboard/dashboard.css';

const QUICK_ACTIONS = [
  { title: 'Datos Personales', icon: '👤', id: 'personal' },
  { title: 'Perfil Profesional', icon: '💼', id: 'professional' },
  { title: 'Actualizar CV', icon: '📄', id: 'cv' },
  { title: 'Mis Postulaciones', icon: '📨', id: 'apps' },
];

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
  const [uploading, setUploading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [activeSection, setActiveSection] = useState<'none' | 'personal' | 'professional' | 'apps'>('none');
  const [isEditingProf, setIsEditingProf] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [completionPct, setCompletionPct] = useState(0);
  
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
  const videoRef = React.useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 12 && hour < 18) setGreeting('Buenas tardes');
    if (hour >= 18 || hour < 5) setGreeting('Buenas noches');

    const savedUser = localStorage.getItem('ucc_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUserId(userData.id);
      fetchFullProfile(userData.id);
    }
  }, []);

  const fetchFullProfile = async (id: string) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
      const res = await fetch(`${backendUrl}/api/users/profile/${id}`);
      const data = await res.json();
      
      if (data.success && data.profile) {
        const u = data.profile;
        const p = (u.perfiles_usuarios && u.perfiles_usuarios.length > 0) ? u.perfiles_usuarios[0] : {};
        
        setUserName(u.nombre_completo ? u.nombre_completo.split(' ')[0] : 'Egresado');
        if (u.foto_url) setUserPhoto(u.foto_url);

        const newFormData = {
          nombre_completo: u.nombre_completo || '',
          correo: u.correo || '',
          telefono: u.telefono || '',
          cedula: u.cedula || 'N/A',
          fecha_nacimiento: u.fecha_nacimiento ? u.fecha_nacimiento.split('T')[0] : 'No definida',
          genero: u.genero || 'No definido',
          nivel_formacion: p.nivel_formacion || '',
          programa_academico: p.programa_academico || '',
          estrato: String(p.estrato || ''),
          estado_civil: p.estado_civil || '',
          numero_hijos: String(p.numero_hijos || ''),
          ingreso_mensual: p.ingreso_mensual || '',
          sector_economico: p.sector_economico || '',
          area_desempeno: p.area_desempeno || '',
          emprendimiento: p.emprendimiento || ''
        };
        setFormData(newFormData);

        // Cálculo de progreso
        let pct = 0;
        if (u.foto_url || userPhoto) pct += 15;
        if (u.cv_url) pct += 25;
        if (u.telefono && u.nombre_completo) pct += 20;
        const profFields = [p.nivel_formacion, p.programa_academico, p.estrato, p.estado_civil, p.ingreso_mensual];
        const filled = profFields.filter(f => f && String(f).trim() !== '').length;
        pct += (filled / profFields.length) * 40;
        setCompletionPct(Math.round(pct));

        // Si hay datos, mostrar resumen
        setIsEditingProf(!p.programa_academico && !p.nivel_formacion);
      }
    } catch (err) { console.error(err); }
  };

  const handleSaveProfile = async () => {
    if (!userId) return;
    setLoadingProfile(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
      const res = await fetch(`${backendUrl}/api/users/profile/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userData: { nombre_completo: formData.nombre_completo, correo: formData.correo, telefono: formData.telefono },
          profileData: formData
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("¡Datos guardados! ✨");
        setIsEditingProf(false);
        setTimeout(() => fetchFullProfile(userId), 600);
      }
    } catch (err: any) { alert(err.message); } finally { setLoadingProfile(false); }
  };

  const handleFileUpload = async (file: File, type: 'avatar' | 'cv') => {
    if (!userId) return;
    setUploading(true);
    const fd = new FormData();
    fd.append(type === 'avatar' ? 'image' : 'cv', file);
    fd.append('userId', userId);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
      const res = await fetch(`${backendUrl}/api/users/upload-${type === 'avatar' ? 'avatar' : 'cv'}`, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) {
        if (type === 'avatar') setUserPhoto(data.url);
        fetchFullProfile(userId);
      }
    } catch (err: any) { alert(err.message); } finally { setUploading(false); }
  };

  const handleViewResume = async () => {
    if (!userId) return;
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
      const res = await fetch(`${backendUrl}/api/users/get-cv-url/${userId}`);
      const data = await res.json();
      if (data.success) window.open(data.url, '_blank');
      else alert("Aún no has subido tu CV");
    } catch (err) { alert("Error cargando CV"); }
  };

  const InfoCard = ({ label, value, detail }: { label: string, value: any, detail?: string }) => (
    <div style={{ background: 'white', padding: '22px', borderRadius: '18px', border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
      <p style={{ margin: '0 0 8px 0', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>{label}</p>
      <p style={{ margin: 0, fontSize: '1.05rem', color: 'var(--ucc-navy)', fontWeight: 700 }}>
        {value && String(value).trim() !== '' ? (detail ? `${detail} ${value}` : value) : <span style={{ color: '#cbd5e1', fontWeight: 400 }}>No completado</span>}
      </p>
    </div>
  );

  return (
    <div className="db-page">
      <Header />
      <input type="file" ref={avatarInputRef} hidden accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'avatar')} />
      <input type="file" ref={cvInputRef} hidden accept=".pdf" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'cv')} />

      <main className="db-main" style={{ paddingTop: '100px', minHeight: '80vh' }}>
        
        {/* CABECERA SIEMPRE VISIBLE */}
        <div className="db-card" style={{ margin: '0 auto 40px', maxWidth: '1100px', padding: '30px 40px', display: 'flex', alignItems: 'center', gap: '40px', background: 'white', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <div style={{ position: 'relative', width: '130px', height: '130px', flexShrink: 0 }}>
            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)', position: 'absolute' }}>
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f1f5f9" strokeWidth="2" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--ucc-blue)" strokeDasharray={`${completionPct}, 100`} strokeWidth="2" strokeLinecap="round" />
            </svg>
            <div style={{ position: 'absolute', top: '10px', left: '10px', right: '10px', bottom: '10px', borderRadius: '50%', background: userPhoto ? `url(${userPhoto}) center/cover` : 'var(--ucc-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2.5rem', fontWeight: 800, border: '4px solid white' }}>
              {!userPhoto && userName[0]}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, color: 'var(--ucc-navy)', fontSize: '2rem' }}>{greeting}, {userName} ✨</h1>
            <p style={{ color: '#64748b' }}>Tu perfil profesional está al {completionPct}%</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button onClick={() => setShowCamera(true)} style={{ background: 'var(--ucc-blue)', color: 'white', border: 'none', borderRadius: '12px', padding: '10px 20px', cursor: 'pointer', fontWeight: 600 }}>📸 Cámara</button>
              <button onClick={() => avatarInputRef.current?.click()} style={{ background: '#f8fafc', color: 'var(--ucc-navy)', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 20px', cursor: 'pointer', fontWeight: 600 }}>📁 Foto</button>
              <button onClick={handleViewResume} style={{ background: 'var(--ucc-green)', color: 'var(--ucc-navy)', border: 'none', borderRadius: '12px', padding: '10px 20px', cursor: 'pointer', fontWeight: 700 }}>📄 Ver CV Actual</button>
            </div>
          </div>
        </div>

        <div className="db-actions" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '25px', margin: '40px auto', maxWidth: '1100px' }}>
          {QUICK_ACTIONS.map((action) => (
            <div key={action.id} className="db-action-card" style={{ cursor: 'pointer', padding: '30px', textAlign: 'center', background: 'white', borderRadius: '24px', border: activeSection === action.id ? '2px solid var(--ucc-blue)' : '1px solid #f1f5f9', boxShadow: '0 8px 20px rgba(0,0,0,0.03)' }} 
              onClick={() => setActiveSection(activeSection === action.id ? 'none' : action.id as any)}>
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>{action.icon}</div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--ucc-navy)', fontWeight: 800 }}>{action.title}</h3>
            </div>
          ))}
        </div>

        <div style={{ maxWidth: '1100px', margin: '0 auto 60px' }}>
          {/* SECCIÓN: DATOS PERSONALES (RESTAURADA) */}
          {activeSection === 'personal' && (
            <div className="db-card" style={{ padding: '45px', borderRadius: '28px' }}>
              <h2 style={{ color: 'var(--ucc-navy)', marginBottom: '35px', fontWeight: 800 }}>👤 Datos Personales</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                <div className="form-group"><label>Nombre Completo</label><input type="text" value={formData.nombre_completo} onChange={(e) => setFormData({...formData, nombre_completo: e.target.value})} style={{ padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }} /></div>
                <div className="form-group"><label>Correo Electrónico</label><input type="email" value={formData.correo} onChange={(e) => setFormData({...formData, correo: e.target.value})} style={{ padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }} /></div>
                <div className="form-group"><label>Teléfono</label><input type="text" value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} style={{ padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }} /></div>
                <div className="form-group"><label style={{ color: '#94a3b8' }}>Cédula</label><input type="text" value={formData.cedula} disabled style={{ background: '#334155', color: '#cbd5e1', padding: '14px', borderRadius: '12px' }} /></div>
                {/* CAMPOS RESTAURADOS */}
                <div className="form-group"><label style={{ color: '#94a3b8' }}>Fecha de Nacimiento</label><input type="text" value={formData.fecha_nacimiento} disabled style={{ background: '#334155', color: '#cbd5e1', padding: '14px', borderRadius: '12px' }} /></div>
                <div className="form-group"><label style={{ color: '#94a3b8' }}>Género</label><input type="text" value={formData.genero} disabled style={{ background: '#334155', color: '#cbd5e1', padding: '14px', borderRadius: '12px' }} /></div>
              </div>
              <button onClick={handleSaveProfile} disabled={loadingProfile} style={{ width: '100%', marginTop: '40px', padding: '20px', background: 'var(--ucc-navy)', color: 'white', borderRadius: '16px', fontWeight: 800 }}>{loadingProfile ? 'Guardando...' : '💾 Guardar Datos'}</button>
            </div>
          )}

          {/* SECCIÓN: PERFIL PROFESIONAL */}
          {activeSection === 'professional' && (
            <div className="db-card" style={{ padding: '45px', borderRadius: '28px', background: '#f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h2 style={{ color: 'var(--ucc-navy)', margin: 0, fontWeight: 800 }}>💼 Perfil Profesional</h2>
                <button onClick={() => setIsEditingProf(!isEditingProf)} style={{ background: 'var(--ucc-blue)', color: 'white', border: 'none', borderRadius: '12px', padding: '10px 25px', cursor: 'pointer', fontWeight: 700 }}>
                  {isEditingProf ? '❌ Cancelar' : '✏️ Actualizar Información'}
                </button>
              </div>

              {isEditingProf ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px', background: 'white', padding: '30px', borderRadius: '24px' }}>
                  {[
                    { label: 'Programa Académico', key: 'programa_academico', options: DIAG_OPTIONS.Programa },
                    { label: 'Estrato', key: 'estrato', options: DIAG_OPTIONS.Estrato },
                    { label: 'Estado Civil', key: 'estado_civil', options: DIAG_OPTIONS.EstadoCivil },
                    { label: 'Número de Hijos', key: 'numero_hijos', options: DIAG_OPTIONS.Hijos },
                    { label: 'Nivel de Formación', key: 'nivel_formacion', options: DIAG_OPTIONS.Formacion },
                    { label: 'Área de Desempeño', key: 'area_desempeno', options: DIAG_OPTIONS.Area },
                    { label: 'Rango de Ingreso', key: 'ingreso_mensual', options: DIAG_OPTIONS.Ingreso },
                    { label: '¿Emprendimiento?', key: 'emprendimiento', options: DIAG_OPTIONS.Emprendimiento },
                  ].map((field) => (
                    <div key={field.key} className="form-group">
                      <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569' }}>{field.label}</label>
                      <select value={(formData as any)[field.key]} onChange={(e) => setFormData({...formData, [field.key]: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <option value="">Seleccione...</option>
                        {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                  <button onClick={handleSaveProfile} disabled={loadingProfile} style={{ gridColumn: 'span 3', padding: '20px', background: 'var(--ucc-navy)', color: 'white', borderRadius: '16px', fontWeight: 800 }}>💾 Guardar Perfil</button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px' }}>
                  <InfoCard label="Programa" value={formData.programa_academico} />
                  <InfoCard label="Nivel Formación" value={formData.nivel_formacion} />
                  <InfoCard label="Estado Civil" value={formData.estado_civil} />
                  <InfoCard label="Socioeconómico" value={formData.estrato} detail="Estrato" />
                  <InfoCard label="Ingresos" value={formData.ingreso_mensual} />
                  <InfoCard label="Emprendimiento" value={formData.emprendimiento} />
                  <InfoCard label="Área de desempeño" value={formData.area_desempeno} />
                  <InfoCard label="Sector Económico" value={formData.sector_economico} />
                  <InfoCard label="Número de Hijos" value={formData.numero_hijos} />
                </div>
              )}
            </div>
          )}

          {/* SECCIÓN: ACTUALIZAR CV (CON BOTÓN DE VER CV) */}
          {activeSection === 'cv' && (
            <div className="db-card" style={{ padding: '45px', borderRadius: '28px', textAlign: 'center' }}>
              <h2 style={{ color: 'var(--ucc-navy)', marginBottom: '30px' }}>📄 Gestión de Hoja de Vida</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
                <button onClick={handleViewResume} style={{ width: '100%', maxWidth: '400px', padding: '20px', background: 'var(--ucc-green)', color: 'var(--ucc-navy)', borderRadius: '16px', fontWeight: 800, fontSize: '1.2rem' }}>📄 Ver mi Hoja de Vida Actual</button>
                <div style={{ width: '100%', height: '2px', background: '#f1f5f9', margin: '20px 0' }} />
                <p style={{ color: '#64748b' }}>O sube una nueva versión (Solo PDF):</p>
                <button onClick={() => cvInputRef.current?.click()} style={{ width: '100%', maxWidth: '400px', padding: '20px', background: 'var(--ucc-navy)', color: 'white', borderRadius: '16px', fontWeight: 800 }}>⬆️ Subir Nuevo CV</button>
              </div>
            </div>
          )}
        </div>

        {showCamera && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,40,85,0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 4000, backdropFilter: 'blur(12px)' }}>
            <div style={{ background: 'white', padding: '35px', borderRadius: '35px', textAlign: 'center', maxWidth: '480px', width: '92%' }}>
              <video ref={videoRef} autoPlay style={{ width: '100%', borderRadius: '25px', marginBottom: '30px', transform: 'scaleX(-1)' }} />
              <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                <button onClick={capturePhoto} className="btn" style={{ background: 'var(--ucc-green)', color: 'var(--ucc-navy)', padding: '16px 40px', fontWeight: 800, borderRadius: '18px' }}>📸 Capturar</button>
                <button onClick={() => setShowCamera(false)} className="btn" style={{ background: '#f1f5f9', color: '#002855', padding: '16px 40px', borderRadius: '18px' }}>Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
