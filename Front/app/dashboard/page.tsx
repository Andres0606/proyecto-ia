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
  const [userId, setUserId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 12 && hour < 18) setGreeting('Buenas tardes');
    if (hour >= 18 || hour < 5) setGreeting('Buenas noches');

    const savedUser = localStorage.getItem('ucc_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUserId(userData.id);
      const name = userData.profile?.nombre_completo || userData.user_metadata?.full_name || 'Egresado';
      setUserName(name.split(' ')[0]);
    }
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cv') => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

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
          // Actualizar localmente si es necesario
          window.location.reload(); 
        }
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      alert("Error al subir archivo: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="db-page">
      <Header />
      
      {/* Inputs ocultos para subida */}
      <input 
        type="file" 
        id="upload-avatar" 
        hidden 
        accept="image/*" 
        onChange={(e) => handleFileUpload(e, 'avatar')} 
      />
      <input 
        type="file" 
        id="upload-cv" 
        hidden 
        accept=".pdf" 
        onChange={(e) => handleFileUpload(e, 'cv')} 
      />

      <main className="db-main" style={{ paddingTop: '100px' }}>
        {/* Header Section */}
        <header className="db-header">
          <div className="db-header__welcome">
            <p className="db-header__date">{new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <h1>{greeting}, {userName}</h1>
              <button 
                onClick={() => document.getElementById('upload-avatar')?.click()}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--ucc-blue)', textDecoration: 'underline' }}
              >
                {uploading ? 'Subiendo...' : 'Cambiar foto'}
              </button>
            </div>
            <p>Aquí tienes el resumen de tu carrera hoy.</p>
          </div>
        </header>

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
                    onClick={isCV ? () => document.getElementById('upload-cv')?.click() : undefined}
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
