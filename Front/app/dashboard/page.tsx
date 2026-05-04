'use client';

import React, { useEffect, useState } from 'react';
import Header from '../Components/header';
import Footer from '../Components/footer';
import '../css/Dashboard/dashboard.css';

// Mock data for the dashboard
const RECOMMENDED_JOBS = [
  { id: 1, title: 'Analista de Datos Senior', company: 'TechFlow Solutions', time: 'hace 2 horas', logo: 'TF' },
  { id: 2, title: 'Gestor de Proyectos Sociales', company: 'Fundación UCC', time: 'hace 5 horas', logo: 'FU' },
  { id: 3, title: 'Ingeniero de Software (Fullstack)', company: 'Nexus Digital', time: 'hace 1 día', logo: 'ND' },
];

const QUICK_ACTIONS = [
  { title: 'Nuevo Diagnóstico', icon: '📊', link: '/diagnostico' },
  { title: 'Ver Bolsa de Empleo', icon: '💼', link: '/Bolsa_Empleo' },
  { title: 'Actualizar CV', icon: '📄', link: '#' },
  { title: 'Mis Postulaciones', icon: '📨', link: '#' },
];

// Simple Gauge Component for the dashboard
const GAUGE_TOTAL = 251;
function DashboardGauge({ pct }: { pct: number }) {
  const offset = GAUGE_TOTAL * (1 - pct / 100);
  return (
    <div style={{ position: 'relative', textAlign: 'center' }}>
      <svg viewBox="0 0 200 110" style={{ width: '100%' }}>
        <defs>
          <linearGradient id="dbGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#002855" />
            <stop offset="50%" stopColor="#00A9E0" />
            <stop offset="100%" stopColor="#8DC63F" />
          </linearGradient>
        </defs>
        <path d="M20,100 A80,80 0 0,1 180,100" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" strokeLinecap="round" />
        <path
          d="M20,100 A80,80 0 0,1 180,100"
          fill="none"
          stroke="url(#dbGaugeGrad)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={GAUGE_TOTAL}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
        />
      </svg>
      <div style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '-20px' }}>{pct}%</div>
      <div style={{ fontSize: '0.8rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1px' }}>Estabilidad Alta</div>
    </div>
  );
}

export default function Dashboard() {
  const [greeting, setGreeting] = useState('Buenos días');
  const [userName, setUserName] = useState('Egresado');
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
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
    }
  }, []);

  const handleFileUpload = async (file: File, type: 'avatar' | 'cv') => {
    if (!userId) return;

    setUploading(true);
    const formData = new FormData();
    formData.append(type === 'avatar' ? 'image' : 'cv', file);
    formData.append('userId', userId);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
      const endpoint = type === 'avatar' ? '/api/users/upload-avatar' : '/api/users/upload-cv';
      
      const res = await fetch(`${backendUrl}${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        alert(type === 'avatar' ? '¡Foto de perfil actualizada!' : '¡Hoja de vida subida con éxito!');
        if (type === 'avatar') {
          setUserPhoto(data.url);
          const savedUser = JSON.parse(localStorage.getItem('ucc_user') || '{}');
          savedUser.foto_url = data.url;
          localStorage.setItem('ucc_user', JSON.stringify(savedUser));
        }
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      alert("Error al subir archivo: " + err.message);
    } finally {
      setUploading(false);
      setShowCamera(false);
    }
  };

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("No se pudo acceder a la cámara. Por favor verifica los permisos.");
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

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
          handleFileUpload(file, 'avatar');
          stopCamera(); // Usamos la nueva función centralizada
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
      
      if (data.success) {
        window.open(data.url, '_blank');
      } else {
        alert(data.message);
      }
    } catch (err: any) {
      alert("Error al obtener el CV: " + err.message);
    }
  };

  return (
    <div className="db-page">
      <Header />
      
      {/* Inputs ocultos para subida */}
      <input 
        type="file" 
        ref={avatarInputRef}
        hidden 
        accept="image/*" 
        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'avatar')} 
      />
      <input 
        type="file" 
        ref={cvInputRef}
        hidden 
        accept=".pdf" 
        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'cv')} 
      />

      <main className="db-main" style={{ paddingTop: '100px' }}>
        {/* Header Section */}
        <header className="db-header">
          <div className="db-header__welcome" style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
            {/* Foto de Perfil / Avatar clickable */}
            <div 
              style={{ position: 'relative', cursor: 'pointer' }}
              onClick={() => avatarInputRef.current?.click()}
            >
              <div style={{ 
                width: '90px', 
                height: '90px', 
                borderRadius: '50%', 
                background: userPhoto ? `url(${userPhoto}) center/cover` : 'var(--ucc-navy)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                color: 'white',
                border: '3px solid white',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                transition: 'transform 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {!userPhoto && userName[0]}
              </div>
              <div style={{ position: 'absolute', bottom: '0', right: '0', background: 'var(--ucc-red)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                📷
              </div>
            </div>

            <div>
              <p className="db-header__date">{new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <h1>{greeting}, {userName}</h1>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px' }}>
                <button 
                  onClick={startCamera}
                  style={{ 
                    background: 'var(--ucc-blue)', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '20px', 
                    padding: '6px 15px', 
                    fontSize: '0.85rem', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontWeight: '600'
                  }}
                >
                  📷 Cámara
                </button>
                <button 
                  onClick={() => avatarInputRef.current?.click()}
                  style={{ 
                    background: '#f1f5f9', 
                    color: 'var(--ucc-navy)', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '20px', 
                    padding: '6px 15px', 
                    fontSize: '0.85rem', 
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  📁 Subir foto
                </button>
                <button 
                  onClick={handleViewResume}
                  style={{ 
                    background: 'var(--ucc-green)', 
                    color: 'var(--ucc-navy)', 
                    border: 'none', 
                    borderRadius: '20px', 
                    padding: '6px 15px', 
                    fontSize: '0.85rem', 
                    cursor: 'pointer',
                    fontWeight: '700'
                  }}
                >
                  📄 Ver CV Actual
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Modal de Cámara Estilizado */}
        {showCamera && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,40,85,0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 2000, backdropFilter: 'blur(5px)' }}>
            <div style={{ background: 'white', padding: '20px', borderRadius: '20px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', textAlign: 'center', maxWidth: '90%' }}>
              <h2 style={{ marginBottom: '15px', color: 'var(--ucc-navy)' }}>Captura tu mejor perfil</h2>
              <video ref={videoRef} autoPlay style={{ width: '100%', maxWidth: '400px', borderRadius: '15px', marginBottom: '20px', transform: 'scaleX(-1)' }} />
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                <button onClick={capturePhoto} className="btn" style={{ background: 'var(--ucc-green)', color: 'var(--ucc-navy)', padding: '10px 30px', fontWeight: 'bold' }}>
                  {uploading ? 'Subiendo...' : '📸 Capturar'}
                </button>
                <button onClick={stopCamera} className="btn" style={{ background: 'var(--ucc-red)', color: 'white', padding: '10px 30px' }}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="db-grid">
          {/* Main Hero Widget */}
          <div className="db-card db-hero-widget">
            <div className="db-hero-widget__content">
              <span className="db-hero-widget__tag">Estatus Actual</span>
              <h2>¡Tu perfil está destacando!</h2>
              <p>
                Tu última medición de estabilidad laboral es superior al promedio de tu sector. 
                Sigue así y revisa las 3 nuevas ofertas que coinciden con tu perfil.
              </p>
              
              <div className="db-progress" style={{ maxWidth: '300px' }}>
                <div className="db-progress__label">
                  <span>Perfil completo</span>
                  <span>85%</span>
                </div>
                <div className="db-progress__bar">
                  <div className="db-progress__fill" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>
            
            <div className="db-hero-widget__visual">
              <DashboardGauge pct={78} />
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div style={{ gridColumn: 'span 2' }}>
            <div className="db-actions">
              {QUICK_ACTIONS.map((action, idx) => {
                const isCV = action.title === 'Actualizar CV';
                return (
                  <a 
                    key={idx} 
                    href={isCV ? undefined : action.link} 
                    className="db-action-card" 
                    style={{ textDecoration: 'none', cursor: 'pointer' }}
                    onClick={isCV ? () => cvInputRef.current?.click() : undefined}
                  >
                    <div className="db-action-card__icon">{action.icon}</div>
                    <h3>{action.title}</h3>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Jobs Widget */}
          <div className="db-card">
            <div className="db-card__title">
              Ofertas recomendadas
              <a href="/Bolsa_Empleo" style={{ fontSize: '0.8rem', color: 'var(--ucc-blue)', textDecoration: 'none' }}>Ver todas →</a>
            </div>
            <div className="db-jobs-list">
              {RECOMMENDED_JOBS.map(job => (
                <a key={job.id} href="#" className="db-job-item">
                  <div className="db-job-item__logo">{job.logo}</div>
                  <div className="db-job-item__info">
                    <div className="db-job-item__title">{job.title}</div>
                    <div className="db-job-item__meta">{job.company} • {job.time}</div>
                  </div>
                  <span style={{ fontSize: '1.2rem', color: '#cbd5e1' }}>›</span>
                </a>
              ))}
            </div>
          </div>

          {/* Notifications/Tips Widget */}
          <div className="db-card" style={{ background: 'var(--ucc-navy)', color: '#fff' }}>
            <div className="db-card__title" style={{ color: '#fff' }}>Tip de Carrera</div>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.6', opacity: 0.8 }}>
              Las empresas del sector TI están valorando un 15% más a los candidatos con certificaciones en 
              <strong> Inteligencia Artificial Aplicada</strong>. Considera actualizar tu formación en esta área.
            </p>
            <button className="btn" style={{ 
              marginTop: '1.5rem', 
              background: 'var(--ucc-green)', 
              color: 'var(--ucc-navy)', 
              fontWeight: 700,
              padding: '10px 20px',
              width: '100%'
            }}>
              Ver cursos recomendados
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
