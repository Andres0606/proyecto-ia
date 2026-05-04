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
  
  const [fullProfile, setFullProfile] = useState<any>(null);
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
    if (u.telefono && u.nombre_completo && u.correo) pct += 20;
    
    const profFields = [p.nivel_formacion, p.programa_academico, p.estrato, p.estado_civil, p.ingreso_mensual];
    const filled = profFields.filter(f => !!f).length;
    pct += (filled / profFields.length) * 40;
    
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
        setFullProfile(u);
        setUserName(u.nombre_completo.split(' ')[0]);
        setFormData({
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
        });
        calculateProgress(u, p, userPhoto);
        // Si no hay perfil profesional, poner modo edición por defecto
        if (!p.id) setIsEditingProf(true);
        else setIsEditingProf(false);
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
          profileData: {
            nivel_formacion: formData.nivel_formacion,
            programa_academico: formData.programa_academico,
            estrato: formData.estrato,
            estado_civil: formData.estado_civil,
            numero_hijos: formData.numero_hijos,
            ingreso_mensual: formData.ingreso_mensual,
            sector_economico: formData.sector_economico,
            area_desempeno: formData.area_desempeno,
            emprendimiento: formData.emprendimiento
          }
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("¡Datos actualizados correctamente!");
        setActiveSection('none');
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
        if (type === 'avatar') {
          setUserPhoto(data.url);
          const saved = JSON.parse(localStorage.getItem('ucc_user') || '{}');
          saved.foto_url = data.url;
          localStorage.setItem('ucc_user', JSON.stringify(saved));
        }
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

      <main className="db-main" style={{ paddingTop: '100px', minHeight: '80vh' }}>
        <header className="db-header">
          <div className="db-header__welcome" style={{ display: 'flex', alignItems: 'center', gap: '25px', width: '100%' }}>
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => avatarInputRef.current?.click()}>
              <div style={{ width: '110px', height: '110px', borderRadius: '50%', background: userPhoto ? `url(${userPhoto}) center/cover` : 'var(--ucc-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', color: 'white', border: '4px solid white', boxShadow: '0 8px 20px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
                {!userPhoto && userName[0]}
              </div>
              <div style={{ position: 'absolute', bottom: '5px', right: '5px', background: 'var(--ucc-red)', borderRadius: '50%', width: '32px', height: '32px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>📷</div>
            </div>
            <div style={{ flex: 1 }}>
              <p className="db-header__date">{new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <h1 style={{ fontSize: '2.2rem' }}>{greeting}, {userName}</h1>
              
              {/* Barra de Progreso */}
              <div style={{ marginTop: '15px', maxWidth: '500px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--ucc-navy)' }}>
                  <span>Progreso del Perfil</span>
                  <span>{completionPct}%</span>
                </div>
                <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div style={{ width: `${completionPct}%`, height: '100%', background: 'linear-gradient(90deg, var(--ucc-blue), var(--ucc-green))', transition: 'width 1s ease-in-out' }} />
                </div>
                <p style={{ fontSize: '0.75rem', marginTop: '6px', color: '#64748b' }}>
                  {completionPct < 100 ? `💡 Tip: ${completionPct < 40 ? 'Sube tu CV para un gran salto' : 'Completa tu perfil profesional para ser más visible'}` : '✨ ¡Perfil estelar! Estás listo para las mejores vacantes.'}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button onClick={startCamera} style={{ background: 'var(--ucc-blue)', color: 'white', border: 'none', borderRadius: '20px', padding: '8px 20px', cursor: 'pointer', fontWeight: 600 }}>📷 Cámara</button>
                <button onClick={() => avatarInputRef.current?.click()} style={{ background: '#f1f5f9', color: 'var(--ucc-navy)', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '8px 20px', cursor: 'pointer', fontWeight: 600 }}>📁 Subir foto</button>
                <button onClick={handleViewResume} style={{ background: 'var(--ucc-green)', color: 'var(--ucc-navy)', border: 'none', borderRadius: '20px', padding: '8px 20px', cursor: 'pointer', fontWeight: 'bold' }}>📄 Ver CV Actual</button>
              </div>
            </div>
          </div>
        </header>

        {showCamera && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,40,85,0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 2000, backdropFilter: 'blur(5px)' }}>
            <div style={{ background: 'white', padding: '20px', borderRadius: '20px', textAlign: 'center', maxWidth: '90%' }}>
              <video ref={videoRef} autoPlay style={{ width: '100%', maxWidth: '400px', borderRadius: '15px', marginBottom: '20px', transform: 'scaleX(-1)' }} />
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                <button onClick={capturePhoto} className="btn" style={{ background: 'var(--ucc-green)', color: 'var(--ucc-navy)', padding: '12px 30px', fontWeight: '800' }}>{uploading ? '...' : '📸 Capturar'}</button>
                <button onClick={stopCamera} className="btn" style={{ background: '#f1f5f9', color: '#002855', padding: '12px 30px' }}>Cancelar</button>
              </div>
            </div>
          </div>
        )}

        <div className="db-actions" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', margin: '40px 0' }}>
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

        {/* Sección: Datos Personales */}
        {activeSection === 'personal' && (
          <div className="db-card" style={{ marginBottom: '30px', padding: '30px', animation: 'fadeIn 0.3s' }}>
            <h2 style={{ color: 'var(--ucc-navy)', marginBottom: '25px', borderBottom: '2px solid #f1f5f9' }}>👤 Datos Personales</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem' }}>Nombre Completo</label>
                <input type="text" value={formData.nombre_completo} onChange={(e) => setFormData({...formData, nombre_completo: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%' }} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem' }}>Correo Electrónico</label>
                <input type="email" value={formData.correo} onChange={(e) => setFormData({...formData, correo: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%' }} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem' }}>Teléfono de Contacto</label>
                <input type="text" value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%' }} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Cédula</label>
                <input type="text" value={formData.cedula} disabled style={{ background: '#334155', color: '#cbd5e1', padding: '12px', borderRadius: '8px', border: 'none', width: '100%' }} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Fecha de Nacimiento</label>
                <input type="text" value={formData.fecha_nacimiento} disabled style={{ background: '#334155', color: '#cbd5e1', padding: '12px', borderRadius: '8px', border: 'none', width: '100%' }} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Género</label>
                <input type="text" value={formData.genero} disabled style={{ background: '#334155', color: '#cbd5e1', padding: '12px', borderRadius: '8px', border: 'none', width: '100%' }} />
              </div>
            </div>
            <button onClick={handleSaveProfile} disabled={loadingProfile} style={{ width: '100%', marginTop: '30px', padding: '15px', background: 'var(--ucc-navy)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>{loadingProfile ? 'Guardando...' : '💾 Guardar Datos Personales'}</button>
          </div>
        )}

        {/* Sección: Perfil Profesional (DINÁMICA) */}
        {activeSection === 'professional' && (
          <div className="db-card" style={{ marginBottom: '30px', padding: '30px', animation: 'fadeIn 0.3s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '2px solid #f1f5f9', pb: '10px' }}>
              <h2 style={{ color: 'var(--ucc-navy)', margin: 0 }}>💼 Perfil Profesional</h2>
              {!isEditingProf && (
                <button onClick={() => setIsEditingProf(true)} style={{ background: 'var(--ucc-blue)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 15px', cursor: 'pointer', fontWeight: 600 }}>✏️ Actualizar Información</button>
              )}
            </div>

            {isEditingProf ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                <div className="form-group"><label style={{ fontSize: '0.8rem' }}>Programa Académico</label><select value={formData.programa_academico} onChange={(e) => setFormData({...formData, programa_academico: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}><option value="">Seleccione...</option>{DIAG_OPTIONS.Programa.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
                <div className="form-group"><label style={{ fontSize: '0.8rem' }}>Estrato</label><select value={formData.estrato} onChange={(e) => setFormData({...formData, estrato: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}><option value="">Seleccione...</option>{DIAG_OPTIONS.Estrato.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
                <div className="form-group"><label style={{ fontSize: '0.8rem' }}>Estado Civil</label><select value={formData.estado_civil} onChange={(e) => setFormData({...formData, estado_civil: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}><option value="">Seleccione...</option>{DIAG_OPTIONS.EstadoCivil.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
                <div className="form-group"><label style={{ fontSize: '0.8rem' }}>Número de Hijos</label><select value={formData.numero_hijos} onChange={(e) => setFormData({...formData, numero_hijos: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}><option value="">Seleccione...</option>{DIAG_OPTIONS.Hijos.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
                <div className="form-group"><label style={{ fontSize: '0.8rem' }}>Nivel de Formación</label><select value={formData.nivel_formacion} onChange={(e) => setFormData({...formData, nivel_formacion: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}><option value="">Seleccione...</option>{DIAG_OPTIONS.Formacion.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
                <div className="form-group"><label style={{ fontSize: '0.8rem' }}>Área de Desempeño</label><select value={formData.area_desempeno} onChange={(e) => setFormData({...formData, area_desempeno: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}><option value="">Seleccione...</option>{DIAG_OPTIONS.Area.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
                <div className="form-group"><label style={{ fontSize: '0.8rem' }}>Sector Económico</label><select value={formData.sector_economico} onChange={(e) => setFormData({...formData, sector_economico: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}><option value="">Seleccione...</option>{DIAG_OPTIONS.Sector.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
                <div className="form-group"><label style={{ fontSize: '0.8rem' }}>Rango de Ingreso</label><select value={formData.ingreso_mensual} onChange={(e) => setFormData({...formData, ingreso_mensual: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}><option value="">Seleccione...</option>{DIAG_OPTIONS.Ingreso.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
                <div className="form-group"><label style={{ fontSize: '0.8rem' }}>¿Emprendimiento?</label><select value={formData.emprendimiento} onChange={(e) => setFormData({...formData, emprendimiento: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}><option value="">Seleccione...</option>{DIAG_OPTIONS.Emprendimiento.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
                <button onClick={handleSaveProfile} disabled={loadingProfile} style={{ gridColumn: 'span 3', marginTop: '10px', padding: '15px', background: 'var(--ucc-navy)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>{loadingProfile ? 'Guardando...' : '💾 Guardar Perfil Profesional'}</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
                <div style={{ borderLeft: '3px solid var(--ucc-blue)', paddingLeft: '15px' }}><p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Programa</p><p style={{ fontWeight: 600, color: 'var(--ucc-navy)' }}>{formData.programa_academico || 'No definido'}</p></div>
                <div style={{ borderLeft: '3px solid var(--ucc-blue)', paddingLeft: '15px' }}><p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Nivel Formación</p><p style={{ fontWeight: 600, color: 'var(--ucc-navy)' }}>{formData.nivel_formacion || 'No definido'}</p></div>
                <div style={{ borderLeft: '3px solid var(--ucc-blue)', paddingLeft: '15px' }}><p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Estado Civil</p><p style={{ fontWeight: 600, color: 'var(--ucc-navy)' }}>{formData.estado_civil || 'No definido'}</p></div>
                <div style={{ borderLeft: '3px solid var(--ucc-blue)', paddingLeft: '15px' }}><p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Estrato</p><p style={{ fontWeight: 600, color: 'var(--ucc-navy)' }}>{formData.estrato || 'No definido'}</p></div>
                <div style={{ borderLeft: '3px solid var(--ucc-blue)', paddingLeft: '15px' }}><p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Ingresos</p><p style={{ fontWeight: 600, color: 'var(--ucc-navy)' }}>{formData.ingreso_mensual || 'No definido'}</p></div>
                <div style={{ borderLeft: '3px solid var(--ucc-blue)', paddingLeft: '15px' }}><p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Sector</p><p style={{ fontWeight: 600, color: 'var(--ucc-navy)' }}>{formData.sector_economico || 'No definido'}</p></div>
              </div>
            )}
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
}
