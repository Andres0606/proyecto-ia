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

export default function Dashboard() {
  const [greeting, setGreeting] = useState('Buenos días');
  const [userName, setUserName] = useState('Egresado');
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [activeSection, setActiveSection] = useState<'none' | 'personal' | 'professional' | 'apps'>('none');
  const [loadingProfile, setLoadingProfile] = useState(false);
  
  const [fullProfile, setFullProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    telefono: '',
    nivel_formacion: '',
    programa_academico: '',
    estrato: '',
    estado_civil: '',
    numero_hijos: '',
    ingreso_mensual: '',
    sector_economico: '',
    area_desempeno: '',
    emprendimiento: false
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
      const name = userData.profile?.nombre_completo || userData.user_metadata?.full_name || 'Egresado';
      setUserName(name.split(' ')[0]);
      fetchFullProfile(userData.id);
    }
  }, []);

  const fetchFullProfile = async (id: string) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
      const res = await fetch(`${backendUrl}/api/users/profile/${id}`);
      const data = await res.json();
      if (data.success) {
        setFullProfile(data.profile);
        const p = data.profile.perfiles_usuarios?.[0] || {};
        setFormData({
          telefono: data.profile.telefono || '',
          nivel_formacion: p.nivel_formacion || '',
          programa_academico: p.programa_academico || '',
          estrato: p.estrato?.toString() || '',
          estado_civil: p.estado_civil || '',
          numero_hijos: p.numero_hijos?.toString() || '',
          ingreso_mensual: p.ingreso_mensual?.toString() || '',
          sector_economico: p.sector_economico || '',
          area_desempeno: p.area_desempeno || '',
          emprendimiento: !!p.emprendimiento
        });
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
          userData: { telefono: formData.telefono },
          profileData: {
            nivel_formacion: formData.nivel_formacion,
            programa_academico: formData.programa_academico,
            estrato: parseInt(formData.estrato) || 0,
            estado_civil: formData.estado_civil,
            numero_hijos: parseInt(formData.numero_hijos) || 0,
            ingreso_mensual: parseFloat(formData.ingreso_mensual) || 0,
            sector_economico: formData.sector_economico,
            area_desempeno: formData.area_desempeno,
            emprendimiento: formData.emprendimiento
          }
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("¡Perfil actualizado!");
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
          <div className="db-header__welcome" style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => avatarInputRef.current?.click()}>
              <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: userPhoto ? `url(${userPhoto}) center/cover` : 'var(--ucc-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'white', border: '3px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                {!userPhoto && userName[0]}
              </div>
              <div style={{ position: 'absolute', bottom: '0', right: '0', background: 'var(--ucc-red)', borderRadius: '50%', width: '28px', height: '28px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>📷</div>
            </div>
            <div>
              <p className="db-header__date">{new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <h1>{greeting}, {userName}</h1>
              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button onClick={startCamera} style={{ background: 'var(--ucc-blue)', color: 'white', border: 'none', borderRadius: '20px', padding: '6px 15px', cursor: 'pointer' }}>📷 Cámara</button>
                <button onClick={handleViewResume} style={{ background: 'var(--ucc-green)', color: 'var(--ucc-navy)', border: 'none', borderRadius: '20px', padding: '6px 15px', cursor: 'pointer', fontWeight: 'bold' }}>📄 Ver CV Actual</button>
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

        {/* Sección 1: Datos Personales (users table) */}
        {activeSection === 'personal' && fullProfile && (
          <div className="db-card" style={{ marginBottom: '30px', padding: '30px', animation: 'fadeIn 0.3s' }}>
            <h2 style={{ color: 'var(--ucc-navy)', marginBottom: '25px', borderBottom: '2px solid #f1f5f9' }}>👤 Datos Personales</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Nombre Completo</label>
                <input type="text" value={fullProfile.nombre_completo} disabled style={{ background: '#334155', color: '#cbd5e1', padding: '12px', borderRadius: '8px', border: 'none', width: '100%' }} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Correo Electrónico</label>
                <input type="text" value={fullProfile.correo} disabled style={{ background: '#334155', color: '#cbd5e1', padding: '12px', borderRadius: '8px', border: 'none', width: '100%' }} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Cédula</label>
                <input type="text" value={fullProfile.cedula || 'N/A'} disabled style={{ background: '#334155', color: '#cbd5e1', padding: '12px', borderRadius: '8px', border: 'none', width: '100%' }} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem' }}>Teléfono de Contacto</label>
                <input type="text" value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%' }} />
              </div>
            </div>
            <button onClick={handleSaveProfile} disabled={loadingProfile} style={{ width: '100%', marginTop: '30px', padding: '15px', background: 'var(--ucc-navy)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>{loadingProfile ? 'Guardando...' : '💾 Actualizar Datos Personales'}</button>
          </div>
        )}

        {/* Sección 2: Perfil Profesional (perfiles_usuarios table) */}
        {activeSection === 'professional' && fullProfile && (
          <div className="db-card" style={{ marginBottom: '30px', padding: '30px', animation: 'fadeIn 0.3s' }}>
            <h2 style={{ color: 'var(--ucc-navy)', marginBottom: '25px', borderBottom: '2px solid #f1f5f9' }}>💼 Perfil Profesional y Socioeconómico</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem' }}>Nivel de Formación</label>
                <select value={formData.nivel_formacion} onChange={(e) => setFormData({...formData, nivel_formacion: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <option value="">Seleccione...</option>
                  <option value="Pregrado">Pregrado</option><option value="Especialización">Especialización</option><option value="Maestría">Maestría</option><option value="Doctorado">Doctorado</option>
                </select>
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem' }}>Programa Académico</label>
                <input type="text" value={formData.programa_academico} onChange={(e) => setFormData({...formData, programa_academico: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem' }}>Estrato</label>
                <input type="number" value={formData.estrato} onChange={(e) => setFormData({...formData, estrato: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem' }}>Estado Civil</label>
                <select value={formData.estado_civil} onChange={(e) => setFormData({...formData, estado_civil: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <option value="">Seleccione...</option>
                  <option value="Soltero">Soltero/a</option><option value="Casado">Casado/a</option><option value="Union Libre">Unión Libre</option>
                </select>
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem' }}>Número de Hijos</label>
                <input type="number" value={formData.numero_hijos} onChange={(e) => setFormData({...formData, numero_hijos: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem' }}>Ingreso Mensual</label>
                <input type="number" value={formData.ingreso_mensual} onChange={(e) => setFormData({...formData, ingreso_mensual: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem' }}>Sector Económico</label>
                <input type="text" value={formData.sector_economico} onChange={(e) => setFormData({...formData, sector_economico: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem' }}>Área de Desempeño</label>
                <input type="text" value={formData.area_desempeno} onChange={(e) => setFormData({...formData, area_desempeno: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '25px' }}>
                <input type="checkbox" checked={formData.emprendimiento} onChange={(e) => setFormData({...formData, emprendimiento: e.target.checked})} style={{ width: '20px', height: '20px' }} />
                <label style={{ fontSize: '0.9rem' }}>¿Emprendimiento?</label>
              </div>
            </div>
            <button onClick={handleSaveProfile} disabled={loadingProfile} style={{ width: '100%', marginTop: '30px', padding: '15px', background: 'var(--ucc-navy)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>{loadingProfile ? 'Guardando...' : '💾 Actualizar Perfil Profesional'}</button>
          </div>
        )}

        {/* Sección 3: Postulaciones (Placeholder) */}
        {activeSection === 'apps' && (
          <div className="db-card" style={{ marginBottom: '30px', padding: '30px', animation: 'fadeIn 0.3s', textAlign: 'center' }}>
            <h2 style={{ color: 'var(--ucc-navy)', marginBottom: '20px' }}>📨 Mis Postulaciones</h2>
            <p style={{ color: '#64748b' }}>Aún no tienes postulaciones activas. ¡Explora la bolsa de empleo para comenzar!</p>
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
}
