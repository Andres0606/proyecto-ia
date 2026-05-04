'use client';

import React, { useEffect, useState } from 'react';
import Header from '../Components/header';
import Footer from '../Components/footer';
import '../css/Dashboard/dashboard.css';

const ADMIN_ACTIONS = [
  { title: 'Usuarios', icon: '👥', id: 'users', desc: 'Gestionar egresados, empresas y externos' },
  { title: 'Vacantes', icon: '📢', id: 'jobs', desc: 'Aprobar y supervisar ofertas laborales' },
  { title: 'Reportes', icon: '📊', id: 'reports', desc: 'Estadísticas y descargas de datos' },
  { title: 'Configuración', icon: '⚙️', id: 'settings', desc: 'Ajustes globales del portal' },
];

export default function DashboardAdmin() {
  const [userName, setUserName] = useState('Administrador');
  const [activeSection, setActiveSection] = useState<'none' | 'users' | 'jobs' | 'reports' | 'settings'>('none');
  const [stats, setStats] = useState({ total_users: 0, total_companies: 0, total_jobs: 0 });

  useEffect(() => {
    const savedUser = sessionStorage.getItem('ucc_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUserName(userData.profile?.nombre_completo || 'Admin');
    }
    // Mock stats for now
    setStats({ total_users: 1542, total_companies: 87, total_jobs: 124 });
  }, []);

  const cardStyle = { background: 'white', borderRadius: '24px', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', textAlign: 'center' as const };

  return (
    <div className="db-page">
      <Header />
      <main className="db-main" style={{ paddingTop: '100px', minHeight: '80vh' }}>
        
        {/* Admin Header */}
        <div style={{ margin: '0 auto 40px', maxWidth: '1200px', padding: '0 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ color: 'var(--ucc-navy)', margin: 0, fontSize: '2.5rem', fontWeight: 800 }}>Panel de Control Admin 🔐</h1>
              <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Bienvenido de nuevo, {userName}</p>
            </div>
            <div style={{ display: 'flex', gap: '20px' }}>
               <div style={{ ...cardStyle, padding: '15px 25px' }}>
                 <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>USUARIOS</p>
                 <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--ucc-blue)' }}>{stats.total_users}</p>
               </div>
               <div style={{ ...cardStyle, padding: '15px 25px' }}>
                 <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>EMPRESAS</p>
                 <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--ucc-navy)' }}>{stats.total_companies}</p>
               </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '25px', margin: '40px auto', maxWidth: '1200px', padding: '0 20px' }}>
          {ADMIN_ACTIONS.map((action) => (
            <div 
              key={action.id} 
              onClick={() => setActiveSection(action.id as any)}
              style={{ 
                ...cardStyle, 
                cursor: 'pointer', 
                border: activeSection === action.id ? '2px solid var(--ucc-blue)' : '1px solid #f1f5f9',
                transition: 'all 0.3s ease'
              }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '15px' }}>{action.icon}</div>
              <h3 style={{ margin: '0 0 10px', color: 'var(--ucc-navy)', fontWeight: 800 }}>{action.title}</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: '1.4' }}>{action.desc}</p>
            </div>
          ))}
        </div>

        {/* Content Section */}
        <div style={{ maxWidth: '1200px', margin: '0 auto 60px', padding: '0 20px' }}>
          {activeSection === 'users' && (
            <div style={cardStyle}>
              <h2 style={{ textAlign: 'left', color: 'var(--ucc-navy)', marginBottom: '30px' }}>👥 Gestión de Usuarios</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                    <th style={{ padding: '15px' }}>Nombre</th>
                    <th style={{ padding: '15px' }}>Correo</th>
                    <th style={{ padding: '15px' }}>Rol</th>
                    <th style={{ padding: '15px' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '15px' }}>Juan Perez</td>
                    <td style={{ padding: '15px' }}>juan@gmail.com</td>
                    <td style={{ padding: '15px' }}><span style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: '10px', fontSize: '0.8rem' }}>Egresado</span></td>
                    <td style={{ padding: '15px' }}><button style={{ color: 'var(--ucc-blue)', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600 }}>Editar</button></td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '15px' }}>Tech Solutions</td>
                    <td style={{ padding: '15px' }}>hr@tech.com</td>
                    <td style={{ padding: '15px' }}><span style={{ background: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: '10px', fontSize: '0.8rem' }}>Empresa</span></td>
                    <td style={{ padding: '15px' }}><button style={{ color: 'var(--ucc-blue)', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600 }}>Editar</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeSection === 'none' && (
             <div style={{ ...cardStyle, padding: '60px', background: 'linear-gradient(135deg, var(--ucc-navy) 0%, #0f2340 100%)', color: 'white' }}>
               <h2 style={{ fontSize: '2rem', marginBottom: '15px' }}>Bienvenido al Centro de Control</h2>
               <p style={{ opacity: 0.8, maxWidth: '600px', margin: '0 auto' }}>Selecciona una de las opciones superiores para gestionar los usuarios, vacantes o generar reportes del sistema.</p>
             </div>
          )}

          {activeSection === 'reports' && (
            <div style={cardStyle}>
               <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📊</div>
               <h2>Generador de Reportes</h2>
               <p>Próximamente: Descarga informes en Excel de egresados por programa, tasas de empleo y más.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
