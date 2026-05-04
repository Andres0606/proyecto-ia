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

  const videoRef = React.useRef<HTMLVideoElement>(null);
  const avatarInputRef = React.useRef<HTMLInputElement>(null);
  const cvInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 12 && hour < 18) setGreeting('Buenas tardes');
    if (hour >= 18 || hour < 5) setGreeting('Buenas noches');

    const savedUser = localStorage.getItem('ucc_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUserId(userData.id);
      setUserPhoto(userData.foto_url || userData.profile?.foto_url || userData.user_metadata?.avatar_url || null);
      fetchFullProfile(userData.id);
    }
  }, []);

  const calculateProgress = (u: any, p: any, photo: any) => {
    let pct = 0;
    if (photo) pct += 15;
    if (u.cv_url) pct += 25;
    if (u.telefono && u.nombre_completo) pct += 20;
    
    // Perfil profesional (40%)
    const profFields = [p.nivel_formacion, p.programa_academico, p.estrato, p.estado_civil, p.ingreso_mensual];
    const filledCount = profFields.filter(f => f && f !== '').length;
    pct += (filledCount / profFields.length) * 40;
    
    setCompletionPct(Math.round(pct));
  };

  const fetchFullProfile = async (id: string) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
      const res = await fetch(`${backendUrl}/api/users/profile/${id}`);
      const data = await res.json();
      if (data.success) {
        const u = data.profile;
        const p = data.profile.perfiles_usuarios?.[0] || {};
        
        setUserName(u.nombre_completo.split(' ')[0]);
        const newFormData = {
          nombre_completo: u.nombre_completo || '',
          correo: u.correo || '',
          telefono: u.telefono || '',
          cedula: u.cedula || 'N/A',
          fecha_nacimiento: u.fecha_nacimiento ? u.fecha_nacimiento.split('T')[0] : '',
          genero: u.genero || '',
          nivel_formacion: p.nivel_formacion || '',
          programa_academico: p.programa_academico || '',
          estrato: p.estrato || '',
          estado_civil: p.estado_civil || '',
          numero_hijos: p.numero_hijos || '',
          ingreso_mensual: p.ingreso_mensual || '',
          sector_economico: p.sector_economico || '',
          area_desempeno: p.area_desempeno || '',
          emprendimiento: p.emprendimiento || ''
        };
        setFormData(newFormData);
        calculateProgress(u, p, userPhoto);

        // DECISIÓN: ¿Mostrar resumen o formulario?
        if (p.programa_academico) {
          setIsEditingProf(false);
        } else {
          setIsEditingProf(true);
        }
      }
    } catch (err) {
      console.error("Error cargando perfil:", err);
    }
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
          userData: { 
            nombre_completo: formData.nombre_completo,
            correo: formData.correo,
            telefono: formData.telefono
          },
          profileData: formData
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("¡Datos actualizados!");
        setIsEditingProf(false);
        fetchFullProfile(userId);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleFileUpload = async (file: File, type: 'avatar' | 'cv') => {
    if (!userId) return;
    setUploading(true);
    const fd = new FormData();
    fd.append(type === 'avatar' ? 'image' : 'cv', file);
    fd.append('userId', userId);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
      const endpoint = type === 'avatar' ? '/api/users/upload-avatar' : '/api/users/upload-cv';
      const res = await fetch(`${backendUrl}${endpoint}`, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) {
        alert(type === 'avatar' ? '¡Foto actualizada!' : '¡Hoja de vida subida!');
        if (type === 'avatar') setUserPhoto(data.url);
        fetchFullProfile(userId);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setUploading(false);
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  };

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          handleFileUpload(new File([blob], "capture.jpg", { type: "image/jpeg" }), 'avatar');
          stopCamera();
        }
      }, 'image/jpeg');
    }
  };

  const handleViewResume = async () => {
    if (!userId) return;
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
      const res = await fetch(`${backendUrl}/api/users/get-cv-url/${userId}`);
      const data = await res.json();
      if (data.success) window.open(data.url, '_blank');
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="db-page">
      <Header />
      <input type="file" ref={avatarInputRef} hidden accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'avatar')} />
      <input type="file" ref={cvInputRef} hidden accept=".pdf" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'cv')} />

      <main className="db-main" style={{ paddingTop: '80px', minHeight: '80vh' }}>
        
        {/* NUEVA BARRA DE PROGRESO DESTACADA */}
        <div className="db-card" style={{ margin: '20px auto 40px', maxWidth: '1100px', padding: '20px 30px', display: 'flex', alignItems: 'center', gap: '40px', background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
          <div style={{ position: 'relative', width: '80px', height: '80px' }}>
            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" strokeWidth="3" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--ucc-blue)" strokeDasharray={`${completionPct}, 100`} strokeWidth="3" strokeLinecap="round" style={{ transition: 'stroke-dasharray 1s ease' }} />
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: 'bold', color: 'var(--ucc-navy)', fontSize: '1.2rem' }}>{completionPct}%</div>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, color: 'var(--ucc-navy)', fontSize: '1.4rem' }}>{greeting}, {userName} ✨</h3>
            <p style={{ margin: '5px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
              {completionPct < 100 ? `Tu perfil está al ${completionPct}%. ¡Completa las tareas pendientes para destacar!` : '¡Increíble! Tu perfil está completo al 100%.'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
             <button onClick={startCamera} style={{ background: 'var(--ucc-blue)', color: 'white', border: 'none', borderRadius: '12px', padding: '10px 20px', cursor: 'pointer', fontWeight: 600 }}>📸 Cámara</button>
             <button onClick={() => avatarInputRef.current?.click()} style={{ background: '#f1f5f9', color: 'var(--ucc-navy)', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 20px', cursor: 'pointer', fontWeight: 600 }}>📁 Foto</button>
          </div>
        </div>

        <div className="db-actions" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', margin: '40px auto', maxWidth: '1100px' }}>
          {QUICK_ACTIONS.map((action, idx) => (
            <div key={idx} className="db-action-card" style={{ cursor: 'pointer', padding: '25px', textAlign: 'center', background: 'white', borderRadius: '15px', border: activeSection === action.id ? '2px solid var(--ucc-blue)' : '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }} 
              onClick={() => {
                if (action.id === 'cv') cvInputRef.current?.click();
                else setActiveSection(activeSection === action.id ? 'none' : action.id as any);
              }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{action.icon}</div>
              <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--ucc-navy)' }}>{action.title}</h3>
            </div>
          ))}
        </div>

        <div style={{ maxWidth: '1100px', margin: '0 auto 40px' }}>
          {/* SECCIÓN: DATOS PERSONALES */}
          {activeSection === 'personal' && (
            <div className="db-card" style={{ padding: '30px', animation: 'fadeIn 0.3s' }}>
              <h2 style={{ color: 'var(--ucc-navy)', marginBottom: '25px', borderBottom: '2px solid #f1f5f9' }}>👤 Datos Personales</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                <div className="form-group"><label>Nombre Completo</label><input type="text" value={formData.nombre_completo} onChange={(e) => setFormData({...formData, nombre_completo: e.target.value})} /></div>
                <div className="form-group"><label>Correo Electrónico</label><input type="email" value={formData.correo} onChange={(e) => setFormData({...formData, correo: e.target.value})} /></div>
                <div className="form-group"><label>Teléfono</label><input type="text" value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} /></div>
                <div className="form-group"><label style={{ color: '#94a3b8' }}>Cédula</label><input type="text" value={formData.cedula} disabled style={{ background: '#334155', color: '#cbd5e1' }} /></div>
              </div>
              <button onClick={handleSaveProfile} disabled={loadingProfile} style={{ width: '100%', marginTop: '30px', padding: '15px', background: 'var(--ucc-navy)', color: 'white', borderRadius: '12px', fontWeight: 'bold' }}>{loadingProfile ? 'Guardando...' : '💾 Guardar Datos'}</button>
            </div>
          )}

          {/* SECCIÓN: PERFIL PROFESIONAL (DINÁMICA) */}
          {activeSection === 'professional' && (
            <div className="db-card" style={{ padding: '30px', animation: 'fadeIn 0.3s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '2px solid #f1f5f9', paddingBottom: '15px' }}>
                <h2 style={{ color: 'var(--ucc-navy)', margin: 0 }}>💼 Perfil Profesional</h2>
                {!isEditingProf && (
                  <button onClick={() => setIsEditingProf(true)} style={{ background: 'var(--ucc-blue)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 20px', cursor: 'pointer', fontWeight: 600 }}>✏️ Actualizar Perfil</button>
                )}
              </div>

              {isEditingProf ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                  <div className="form-group"><label>Programa Académico</label><select value={formData.programa_academico} onChange={(e) => setFormData({...formData, programa_academico: e.target.value})}><option value="">Seleccione...</option>{DIAG_OPTIONS.Programa.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
                  <div className="form-group"><label>Estrato</label><select value={formData.estrato} onChange={(e) => setFormData({...formData, estrato: e.target.value})}><option value="">Seleccione...</option>{DIAG_OPTIONS.Estrato.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
                  <div className="form-group"><label>Estado Civil</label><select value={formData.estado_civil} onChange={(e) => setFormData({...formData, estado_civil: e.target.value})}><option value="">Seleccione...</option>{DIAG_OPTIONS.EstadoCivil.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
                  <div className="form-group"><label>Número de Hijos</label><select value={formData.numero_hijos} onChange={(e) => setFormData({...formData, numero_hijos: e.target.value})}><option value="">Seleccione...</option>{DIAG_OPTIONS.Hijos.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
                  <div className="form-group"><label>Nivel de Formación</label><select value={formData.nivel_formacion} onChange={(e) => setFormData({...formData, nivel_formacion: e.target.value})}><option value="">Seleccione...</option>{DIAG_OPTIONS.Formacion.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
                  <div className="form-group"><label>Área de Desempeño</label><select value={formData.area_desempeno} onChange={(e) => setFormData({...formData, area_desempeno: e.target.value})}><option value="">Seleccione...</option>{DIAG_OPTIONS.Area.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
                  <div className="form-group"><label>Rango de Ingreso</label><select value={formData.ingreso_mensual} onChange={(e) => setFormData({...formData, ingreso_mensual: e.target.value})}><option value="">Seleccione...</option>{DIAG_OPTIONS.Ingreso.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
                  <div className="form-group"><label>¿Emprendimiento?</label><select value={formData.emprendimiento} onChange={(e) => setFormData({...formData, emprendimiento: e.target.value})}><option value="">Seleccione...</option>{DIAG_OPTIONS.Emprendimiento.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
                  <button onClick={handleSaveProfile} disabled={loadingProfile} style={{ gridColumn: 'span 3', marginTop: '20px', padding: '15px', background: 'var(--ucc-navy)', color: 'white', borderRadius: '12px', fontWeight: 'bold' }}>{loadingProfile ? 'Guardando...' : '💾 Guardar Perfil Profesional'}</button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
                  <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}><p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Programa Académico</p><p style={{ fontWeight: 600, color: 'var(--ucc-navy)', fontSize: '1.1rem', margin: 0 }}>{formData.programa_academico}</p></div>
                  <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}><p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Nivel Formación</p><p style={{ fontWeight: 600, color: 'var(--ucc-navy)', fontSize: '1.1rem', margin: 0 }}>{formData.nivel_formacion}</p></div>
                  <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}><p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Estado Civil</p><p style={{ fontWeight: 600, color: 'var(--ucc-navy)', fontSize: '1.1rem', margin: 0 }}>{formData.estado_civil}</p></div>
                  <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}><p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Estrato Socioeconómico</p><p style={{ fontWeight: 600, color: 'var(--ucc-navy)', fontSize: '1.1rem', margin: 0 }}>{formData.estrato}</p></div>
                  <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}><p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Rango de Ingresos</p><p style={{ fontWeight: 600, color: 'var(--ucc-navy)', fontSize: '1.1rem', margin: 0 }}>{formData.ingreso_mensual}</p></div>
                  <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}><p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>¿Tiene Emprendimiento?</p><p style={{ fontWeight: 600, color: 'var(--ucc-navy)', fontSize: '1.1rem', margin: 0 }}>{formData.emprendimiento}</p></div>
                </div>
              )}
            </div>
          )}
        </div>

        {showCamera && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,40,85,0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 2000, backdropFilter: 'blur(5px)' }}>
            <div style={{ background: 'white', padding: '20px', borderRadius: '20px', textAlign: 'center', maxWidth: '90%' }}>
              <video ref={videoRef} autoPlay style={{ width: '100%', maxWidth: '400px', borderRadius: '15px', marginBottom: '20px', transform: 'scaleX(-1)' }} />
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                <button onClick={capturePhoto} className="btn" style={{ background: 'var(--ucc-green)', color: 'var(--ucc-navy)', padding: '12px 30px', fontWeight: '800' }}>📸 Capturar</button>
                <button onClick={stopCamera} className="btn" style={{ background: '#f1f5f9', color: '#002855', padding: '12px 30px' }}>Cancelar</button>
              </div>
            </div>
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
}
