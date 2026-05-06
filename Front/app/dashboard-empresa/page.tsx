'use client';

import React, { useEffect, useState } from 'react';
import Header from '../Components/header';
import Footer from '../Components/footer';
import '../css/Dashboard/dashboard.css';

const Icons = {
  Home: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
  Company: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M8 10h.01" /><path d="M16 10h.01" /><path d="M8 14h.01" /><path d="M16 14h.01" /></svg>,
  Announce: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a3 3 0 0 0-3-3H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a3 3 0 0 0 3-3V8Z" /><path d="M10 8v4" /><path d="M21 15v-2a5 5 0 0 0-5-5" /><path d="M21 9v2" /></svg>,
  List: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  Users: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M17 7a4 4 0 0 1 0 7.75" /></svg>,
  Support: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" /></svg>
};

const QUICK_ACTIONS = [
  { title: 'Inicio', Icon: Icons.Home, id: 'none', color: '#3b82f6' },
  { title: 'Mi Empresa', Icon: Icons.Company, id: 'professional', color: '#1e3a5f' },
  { title: 'Nueva Vacante', Icon: Icons.Announce, id: 'jobs', color: '#8b5cf6' },
  { title: 'Mis Vacantes', Icon: Icons.List, id: 'my-jobs', color: '#f59e0b' },
  { title: 'Candidatos', Icon: Icons.Users, id: 'candidates', color: '#10b981' },
];

const OPTIONS = {
  Area: ["Administracion de Empresas", "Contaduria Publica", "Derecho", "Ingenieria de Sistemas", "Ingenieria Civil", "Medicina", "Psicologia", "Odontologia", "Enfermeria", "Medicina Veterinaria y Zootecnia", "Comercio Internacional", "Mercadeo", "Comunicacion Social", "Educacion"],
  Programas: ["Derecho", "Contaduria Publica", "Ingenieria Civil", "Ciencias Economicas", "Medicina", "Psicologia", "Odontologia", "Enfermeria", "Ingenieria de Sistemas", "Medicina Veterinaria y Zootecnia", "Especializacion", "Tecnico Auxiliar en Enfermeria"],
  Nivel: ["Profesional", "Especialista", "Magister", "Doctorado", "Tecnico"],
  Contrato: ["Termino Indefinido", "Termino Fijo", "Prestacion de Servicios", "Obra o Labor", "Aprendizaje"],
  Modalidad: ["Presencial", "Remoto", "Hibrido"],
};

export default function DashboardEmpresa() {
  const [greeting, setGreeting] = useState('Buenos días');
  const [companyName, setCompanyName] = useState('Empresa');
  const [companySlogan, setCompanySlogan] = useState('Panel de gestión corporativa');
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'none' | 'professional' | 'jobs' | 'my-jobs' | 'candidates' | 'support'>('none');
  const [toast, setToast] = useState<{ msg: string, type: 'info' | 'success' | 'error' | 'none' }>({ msg: '', type: 'none' });
  const [myVacancies, setMyVacancies] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);

  
  const [formData, setFormData] = useState({
    razon_social: '', nit: '', sector_economico: '', ciudad: '',
    tamano_empresa: '', tipo_empresa: '', telefono: '', correo: '', eslogan: ''
  });

  const [jobData, setJobData] = useState({
    cargo: '', area_desempeno: '', programa_requerido: [] as string[], nivel_formacion: '',
    salario: '', tipo_contrato: '', duracion_contrato: '', modalidad: '',
    ubicacion: '', descripcion: '', numero_vacantes: '1'
  });


  const logoInputRef = React.useRef<HTMLInputElement>(null);
  const base = () => (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000').replace(/\/$/, '');

  useEffect(() => {
    const h = new Date().getHours();
    if (h >= 12 && h < 18) setGreeting('Buenas tardes');
    else if (h >= 18 || h < 5) setGreeting('Buenas noches');

    const savedUser = sessionStorage.getItem('ucc_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        const rawId = userData.id || userData.profile?.id || userData.user_id;
        if (rawId) {
          const cleanId = String(rawId).trim().split(':')[0];
          setUserId(cleanId); 
          fetchProfile(cleanId);
          fetchMyVacancies(cleanId);
          fetchCandidates(cleanId);
        }
      } catch (e) { console.error('Error parseando usuario:', e); }

    }
  }, []);

  const fetchProfile = async (id: string) => {
    try {
      const res = await fetch(`${base()}/api/users/profile/${id}`);
      const data = await res.json();
      if (data.success && data.profile) {
        const u = data.profile;
        const c = u.empresa || {};
        const nombreFinal = c.razon_social || u.nombre_completo || 'Empresa UCC';
        setCompanyName(nombreFinal);
        setCompanySlogan(c.eslogan || 'Panel de gestión y talento corporativo');
        if (u.foto_url) setCompanyLogo(`${u.foto_url}?t=${new Date().getTime()}`);

        setFormData({
          razon_social: c.razon_social || '', nit: c.nit || '', sector_economico: c.sector_economico || '',
          ciudad: c.ciudad || '', tamano_empresa: c.tamano_empresa || '', tipo_empresa: c.tipo_empresa || '',
          telefono: c.telefono || u.telefono || '', correo: c.correo || u.correo || '', eslogan: c.eslogan || ''
        });
      }
    } catch (err) { console.error(err); }
  };

  const fetchMyVacancies = async (id: string) => {
    try {
      const res = await fetch(`${base()}/api/vacantes/my-vacancies/${id}`);
      const d = await res.json();
      if (d.success) setMyVacancies(d.vacancies);
    } catch (err) { console.error(err); }
  };

  const fetchCandidates = async (id: string) => {
    try {
      const res = await fetch(`${base()}/api/postulaciones/company/${id}`);
      const d = await res.json();
      if (d.success) setCandidates(d.applications);
    } catch (err) { console.error(err); }
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      setToast({ msg: 'Actualizando estado...', type: 'info' });
      const res = await fetch(`${base()}/api/postulaciones/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setToast({ msg: `Candidato ${newStatus === 'aceptado' ? 'aceptado' : 'rechazado'}`, type: 'success' });
        if (userId) fetchCandidates(userId);
        setSelectedCandidate(null);
      } else {
        setToast({ msg: 'Error al actualizar', type: 'error' });
      }
    } catch (err) {
      setToast({ msg: 'Error de conexión', type: 'error' });
    }
    finally { setTimeout(() => setToast({ msg: '', type: 'none' }), 3000); }
  };


  const handleToggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = (currentStatus || 'activa') === 'activa' ? 'inactiva' : 'activa';
    console.log(`🔄 Cambiando estado de vacante ${id}: ${currentStatus} -> ${newStatus}`);
    
    try {
      const res = await fetch(`${base()}/api/vacantes/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: newStatus })
      });
      const data = await res.json();
      
      if (data.success) {
        setToast({ msg: `Vacante ${newStatus === 'activa' ? 'activada' : 'pausada'}`, type: 'success' });
        if (userId) fetchMyVacancies(userId);
      } else {
        console.error('❌ Error del servidor:', data);
        setToast({ msg: data.error || 'Error al cambiar estado', type: 'error' });
      }
    } catch (err) { 
      console.error('❌ Error de red:', err);
      setToast({ msg: 'Error de conexión con el servidor', type: 'error' }); 
    }
    finally { setTimeout(() => setToast({ msg: '', type: 'none' }), 3000); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta vacante permanentemente?')) return;
    console.log(`🗑 Eliminando vacante ${id}`);
    
    try {
      const res = await fetch(`${base()}/api/vacantes/${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        setToast({ msg: 'Vacante eliminada con éxito', type: 'success' });
        if (userId) fetchMyVacancies(userId);
      } else {
        setToast({ msg: data.message || 'Error al eliminar', type: 'error' });
      }
    } catch (err) { 
      console.error('❌ Error de red:', err);
      setToast({ msg: 'Error de conexión', type: 'error' }); 
    }
    finally { setTimeout(() => setToast({ msg: '', type: 'none' }), 3000); }
  };

  const handleToggleProgram = (prog: string) => {
    setJobData(prev => ({
      ...prev,
      programa_requerido: prev.programa_requerido.includes(prog)
        ? prev.programa_requerido.filter(p => p !== prog)
        : [...prev.programa_requerido, prog]
    }));
  };

  const handlePostJob = async () => {
    if (!userId) return;
    if (!jobData.cargo || jobData.programa_requerido.length === 0) {
      setToast({ msg: 'Completa los campos obligatorios', type: 'error' });
      return;
    }

    setToast({ msg: 'Publicando vacante...', type: 'info' });
    try {
      const payload = { 
        ...jobData, 
        programa_requerido: jobData.programa_requerido.join(', '), 
        userId 
      };
      const res = await fetch(`${base()}/api/vacantes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const d = await res.json();
      if (d.success) {
        setToast({ msg: '¡Vacante publicada con éxito!', type: 'success' });
        setJobData({
          cargo: '', area_desempeno: '', programa_requerido: [], nivel_formacion: '',
          salario: '', tipo_contrato: '', duracion_contrato: '', modalidad: '',
          ubicacion: '', descripcion: '', numero_vacantes: '1'
        });

        fetchMyVacancies(userId);
        setActiveSection('my-jobs');
      } else {
        setToast({ msg: d.message || 'Error al publicar', type: 'error' });
      }
    } catch { setToast({ msg: 'Error de conexión', type: 'error' }); }
    finally { setTimeout(() => setToast({ msg: '', type: 'none' }), 3000); }
  };

  const inp = { padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%', fontSize: '0.95rem' };
  const dis = { ...inp, background: '#f8fafc', color: '#64748b', cursor: 'not-allowed' as const };
  const lbl = { fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '8px', display: 'block', textTransform: 'uppercase' as const };

  return (
    <div className="db-page" style={{ background: '#f4f7fa', minHeight: '100vh' }}>
      <Header />
      <input type="file" ref={logoInputRef} hidden accept="image/*" onChange={e => e.target.files?.[0] && (async (file) => {
        if (!userId) return;
        setToast({ msg: 'Subiendo Logo...', type: 'info' });
        const fd = new FormData(); fd.append('image', file); fd.append('userId', userId);
        try {
          const r = await fetch(`${base()}/api/users/upload-avatar`, { method: 'POST', body: fd });
          if ((await r.json()).success) { setToast({ msg: 'Logo actualizado', type: 'success' }); await fetchProfile(userId); }
        } catch { setToast({ msg: 'Error', type: 'error' }); }
        finally { setTimeout(() => setToast({ msg: '', type: 'none' }), 3000); }
      })(e.target.files[0])} />

      {toast.type !== 'none' && (
        <div style={{ position: 'fixed', bottom: '32px', right: '32px', zIndex: 9999, padding: '16px 24px', borderRadius: '16px', color: 'white', fontWeight: 600, boxShadow: '0 10px 40px rgba(0,0,0,0.15)', background: toast.type === 'success' ? '#059669' : toast.type === 'error' ? '#dc2626' : '#1e3a5f' }}>
          {toast.msg}
        </div>
      )}

      <main style={{ paddingTop: '110px', maxWidth: '1120px', margin: '0 auto', paddingBottom: '60px' }}>
        
        {/* Hero Card */}
        <div style={{ background: 'white', borderRadius: '32px', padding: '40px', boxShadow: '0 10px 40px rgba(0,40,85,0.04)', display: 'flex', alignItems: 'center', gap: '40px', marginBottom: '32px', border: '1px solid rgba(226, 232, 240, 0.5)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)', zIndex: 0 }} />
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => logoInputRef.current?.click()}>
            <div style={{ width: '130px', height: '130px', borderRadius: '28px', background: companyLogo ? `url(${companyLogo}) center/cover` : '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem', boxShadow: '0 8px 25px rgba(0,0,0,0.05)', color: '#1e3a5f', border: '4px solid white' }}>
              {!companyLogo && <Icons.Company />}
            </div>
            <div style={{ position: 'absolute', bottom: '-5px', right: '-5px', background: '#1e3a5f', color: 'white', width: '32px', height: '32px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>✎</div>
          </div>
          <div style={{ flex: 1, zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '10px' }}>
              <h1 style={{ margin: 0, color: '#0f172a', fontSize: '2.4rem', fontWeight: 900 }}>{greeting}, {companyName}</h1>
              <span style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)', color: 'white', padding: '8px 18px', borderRadius: '30px', fontSize: '0.75rem', fontWeight: 800, boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)' }}>EMPRESA ALIADA UCC</span>
            </div>

            <p style={{ color: '#64748b', margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>"{companySlogan}"</p>
          </div>
        </div>

        {/* Action Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px', marginBottom: '40px' }}>
          {QUICK_ACTIONS.map(a => (
            <div key={a.id} onClick={() => setActiveSection(a.id as any)} style={{ background: activeSection === a.id ? 'white' : 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)', borderRadius: '28px', padding: '32px 20px', textAlign: 'center', boxShadow: activeSection === a.id ? '0 15px 35px rgba(30, 58, 95, 0.15)' : '0 4px 15px rgba(0,0,0,0.03)', cursor: 'pointer', border: activeSection === a.id ? `2px solid ${a.color}` : '1px solid rgba(255,255,255,0.4)', transition: 'all 0.3s' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: `${a.color}15`, color: a.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><a.Icon /></div>
              <h3 style={{ margin: 0, color: '#1e3a5f', fontWeight: 800, fontSize: '0.95rem' }}>{a.title}</h3>
            </div>
          ))}
        </div>

        <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
          {activeSection === 'none' && (
            <div style={{ background: 'white', borderRadius: '32px', padding: '50px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', display: 'flex', gap: '40px', alignItems: 'center' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '30px', background: 'linear-gradient(135deg, #1e3a5f 0%, #3b82f6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><Icons.Company /></div>
              <div style={{ flex: 1 }}>
                <h2 style={{ color: '#1e3a5f', fontWeight: 900, fontSize: '1.8rem', margin: '0 0 12px' }}>¡Bienvenido al Panel Corporativo!</h2>
                <p style={{ color: '#64748b', lineHeight: 1.7, margin: '0 0 28px' }}>Desde aquí podrá gestionar su presencia en la Universidad Cooperativa y conectar con el mejor talento egresado.</p>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <button onClick={() => setActiveSection('jobs')} style={{ background: '#1e3a5f', color: 'white', border: 'none', borderRadius: '16px', padding: '16px 32px', fontWeight: 800, cursor: 'pointer' }}>Publicar Vacante</button>
                  <button onClick={() => setActiveSection('my-jobs')} style={{ background: 'white', color: '#1e3a5f', border: '2px solid #1e3a5f', borderRadius: '16px', padding: '16px 32px', fontWeight: 800, cursor: 'pointer' }}>Ver Mis Vacantes</button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'professional' && (
            <div style={{ background: 'white', borderRadius: '32px', padding: '45px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)' }}>
              <h2 style={{ margin: '0 0 35px', color: '#1e3a5f', fontWeight: 900 }}>Información Corporativa</h2>
              <div className="responsive-grid-2" style={{ gap: '25px' }}>
                {[
                  { l: 'Razón Social', k: 'razon_social' }, { l: 'NIT', k: 'nit' },
                  { l: 'Sector', k: 'sector_economico' }, { l: 'Ciudad', k: 'ciudad' },
                  { l: 'Tamaño', k: 'tamano_empresa' }, { l: 'Tipo', k: 'tipo_empresa' },
                  { l: 'Correo', k: 'correo' }, { l: 'Teléfono', k: 'telefono' },
                ].map(f => (
                  <div key={f.k}><label style={lbl}>{f.l}</label><input value={(formData as any)[f.k]} disabled style={dis} /></div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'jobs' && (
            <div style={{ background: 'white', borderRadius: '32px', padding: '45px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)' }}>
              <h2 style={{ color: '#1e3a5f', fontWeight: 900, marginBottom: '30px' }}>Publicar Nueva Vacante</h2>
              <div className="responsive-grid-2" style={{ gap: '20px' }}>
                <div><label style={lbl}>Cargo / Título</label><input style={inp} value={jobData.cargo} onChange={e => setJobData({...jobData, cargo: e.target.value})} placeholder="Ej: Analista de Sistemas" /></div>
                <div><label style={lbl}>Área de Desempeño</label><select style={inp} value={jobData.area_desempeno} onChange={e => setJobData({...jobData, area_desempeno: e.target.value})}><option value="">Seleccionar...</option>{OPTIONS.Area.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={lbl}>Programas Requeridos</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '15px', border: '1.5px solid #e2e8f0', borderRadius: '16px', background: '#f8fafc' }}>
                    {OPTIONS.Programas.map(p => (
                      <button key={p} onClick={() => handleToggleProgram(p)} style={{ padding: '8px 16px', borderRadius: '30px', border: '1.5px solid', borderColor: jobData.programa_requerido.includes(p) ? '#1e3a5f' : '#e2e8f0', background: jobData.programa_requerido.includes(p) ? '#1e3a5f' : 'white', color: jobData.programa_requerido.includes(p) ? 'white' : '#64748b', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>{p}</button>
                    ))}
                  </div>
                </div>
                <div><label style={lbl}>Nivel de Formación</label><select style={inp} value={jobData.nivel_formacion} onChange={e => setJobData({...jobData, nivel_formacion: e.target.value})}><option value="">Seleccionar...</option>{OPTIONS.Nivel.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
                <div><label style={lbl}>Salario Mensual</label><input style={inp} type="number" value={jobData.salario} onChange={e => setJobData({...jobData, salario: e.target.value})} placeholder="Ej: 2800000" /></div>
                <div><label style={lbl}>Tipo de Contrato</label><select style={inp} value={jobData.tipo_contrato} onChange={e => setJobData({...jobData, tipo_contrato: e.target.value})}><option value="">Seleccionar...</option>{OPTIONS.Contrato.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
                <div><label style={lbl}>Modalidad</label><select style={inp} value={jobData.modalidad} onChange={e => setJobData({...jobData, modalidad: e.target.value})}><option value="">Seleccionar...</option>{OPTIONS.Modalidad.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
                <div><label style={lbl}>Número de Vacantes</label><input style={inp} type="number" min="1" value={jobData.numero_vacantes} onChange={e => setJobData({...jobData, numero_vacantes: e.target.value})} placeholder="Ej: 5" /></div>
                <div style={{ gridColumn: '1 / -1' }}><label style={lbl}>Ubicación de la Empresa</label><input style={inp} value={jobData.ubicacion} onChange={e => setJobData({...jobData, ubicacion: e.target.value})} placeholder="Ej: Villavicencio" /></div>
                <div style={{ gridColumn: '1 / -1' }}><label style={lbl}>Descripción</label><textarea style={{ ...inp, height: '120px', resize: 'none' }} value={jobData.descripcion} onChange={e => setJobData({...jobData, descripcion: e.target.value})} placeholder="Detalles de la vacante..." /></div>
              </div>
              <button onClick={handlePostJob} style={{ width: '100%', marginTop: '30px', padding: '18px', background: '#0f172a', color: 'white', borderRadius: '16px', border: 'none', fontWeight: 800, cursor: 'pointer', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.2)' }}>Publicar Vacante</button>
            </div>
          )}


          {activeSection === 'my-jobs' && (
            <div style={{ background: 'white', borderRadius: '32px', padding: '45px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ color: '#1e3a5f', fontWeight: 900, margin: 0 }}>Mis Vacantes Publicadas</h2>
                <span style={{ background: '#f1f5f9', color: '#475569', padding: '8px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>{myVacancies.length} Ofertas</span>
              </div>
              <div style={{ display: 'grid', gap: '16px' }}>
                {myVacancies.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>Aún no has publicado ninguna vacante.</p>
                ) : (
                  myVacancies.map(v => (
                    <div key={v.id} style={{ padding: '24px', border: '1px solid #f1f5f9', borderRadius: '24px', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: v.estado === 'inactiva' ? 0.7 : 1 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                          <h4 style={{ margin: 0, color: '#1e3a5f', fontSize: '1.1rem', fontWeight: 800 }}>{v.cargo}</h4>
                          <span style={{ background: v.estado === 'inactiva' ? '#f1f5f9' : '#dcfce7', color: v.estado === 'inactiva' ? '#64748b' : '#166534', padding: '4px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>
                            {v.estado || 'activa'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '0.85rem', color: '#64748b' }}>
                          <span>📍 {v.ubicacion}</span>
                          <span>💰 ${v.salario?.toLocaleString()}</span>
                          <span>📅 {new Date(v.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => handleToggleStatus(v.id, v.estado || 'activa')} style={{ padding: '10px 18px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: 'white', color: '#1e3a5f', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                          {v.estado === 'inactiva' ? '▶ Reactivar' : '⏸ Pausar'}
                        </button>
                        <button onClick={() => handleDelete(v.id)} style={{ padding: '10px 18px', borderRadius: '12px', border: '1.5px solid #fee2e2', background: '#fef2f2', color: '#dc2626', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                          🗑 Eliminar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeSection === 'candidates' && (
            <div style={{ background: 'white', borderRadius: '32px', padding: '45px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
                <h2 style={{ color: '#0f172a', fontWeight: 900, margin: 0 }}>Candidatos por Vacante</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <span style={{ background: '#f1f5f9', color: '#475569', padding: '8px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>
                    {Object.keys(candidates.reduce((acc: any, curr: any) => {
                      const key = curr.vacante || 'Otras';
                      if (!acc[key]) acc[key] = [];
                      acc[key].push(curr);
                      return acc;
                    }, {})).length} Vacantes activas
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '32px' }}>
                {candidates.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '25px', background: '#f8fafc', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}><Icons.Users /></div>
                    <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Aún no hay candidatos postulados a tus vacantes.</p>
                  </div>
                ) : (
                  Object.entries(
                    candidates.reduce((acc: any, curr: any) => {
                      const key = curr.vacante || 'Otras';
                      if (!acc[key]) acc[key] = [];
                      acc[key].push(curr);
                      return acc;
                    }, {})
                  ).map(([vacanteTitle, apps]: [string, any]) => (
                    <div key={vacanteTitle} style={{ border: '1.5px solid #f1f5f9', borderRadius: '28px', overflow: 'hidden', background: '#ffffff' }}>
                      <div style={{ background: '#f8fafc', padding: '20px 30px', borderBottom: '1.5px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.2rem', fontWeight: 800 }}>{vacanteTitle}</h3>
                        <span style={{ background: '#0f172a', color: 'white', padding: '4px 12px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700 }}>{apps.length} Postulados</span>
                      </div>
                      <div style={{ padding: '20px', display: 'grid', gap: '12px' }}>
                        {Array.isArray(apps) && apps.map((c: any) => (
                          <div key={c.id} style={{ padding: '18px 24px', border: '1px solid #f1f5f9', borderRadius: '20px', background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                              <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#1e40af', fontWeight: 800 }}>
                                {c.candidato?.nombre?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1rem', fontWeight: 800 }}>{c.candidato?.nombre || 'Usuario'}</h4>
                                <div style={{ display: 'flex', gap: '10px', fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                                  <span>📅 {new Date(c.fecha).toLocaleDateString()}</span>
                                  <span style={{ 
                                    background: c.estado === 'aceptado' ? '#dcfce7' : c.estado === 'rechazado' ? '#fee2e2' : '#fef9c3', 
                                    color: c.estado === 'aceptado' ? '#166534' : c.estado === 'rechazado' ? '#991b1b' : '#854d0e',
                                    padding: '1px 6px', borderRadius: '4px', fontWeight: 800, textTransform: 'uppercase'
                                  }}>
                                    {c.estado}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <button onClick={() => setSelectedCandidate(c)} style={{ padding: '8px 16px', borderRadius: '10px', background: 'white', color: '#0f172a', border: '1.5px solid #0f172a', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                              Ver Detalles
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>



              {/* Modal de Detalle de Candidato */}
              {selectedCandidate && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }}>
                  <div style={{ background: 'white', borderRadius: '32px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                    <button onClick={() => setSelectedCandidate(null)} style={{ position: 'absolute', top: '24px', right: '24px', background: '#f1f5f9', border: 'none', width: '40px', height: '40px', borderRadius: '12px', cursor: 'pointer', fontSize: '1.2rem', color: '#64748b', fontWeight: 'bold' }}>×</button>
                    
                    <div style={{ padding: '40px' }}>
                      <div style={{ display: 'flex', gap: '30px', marginBottom: '35px', alignItems: 'center' }}>
                        <div style={{ width: '100px', height: '100px', borderRadius: '28px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: '#1e3a5f', border: '4px solid #f1f5f9' }}>
                          {selectedCandidate.candidato.nombre.charAt(0)}
                        </div>
                        <div>
                          <h2 style={{ margin: 0, color: '#1e3a5f', fontSize: '2rem', fontWeight: 900 }}>{selectedCandidate.candidato.nombre}</h2>
                          <p style={{ margin: '5px 0 0', color: '#64748b', fontSize: '1.1rem', fontWeight: 600 }}>{selectedCandidate.candidato.perfil.nivel_formacion} - {selectedCandidate.candidato.perfil.programa_academico}</p>
                          <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                            <span style={{ fontSize: '0.9rem', color: '#64748b' }}>📧 {selectedCandidate.candidato.correo}</span>
                            <span style={{ fontSize: '0.9rem', color: '#64748b' }}>📞 {selectedCandidate.candidato.telefono}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ background: '#f8fafc', borderRadius: '24px', padding: '30px', marginBottom: '35px' }}>
                        <h3 style={{ margin: '0 0 20px', color: '#1e3a5f', fontSize: '1.2rem', fontWeight: 800 }}>Información de Postulación</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                          <div>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Vacante Aplicada</p>
                            <p style={{ margin: '4px 0 0', color: '#1e3a5f', fontWeight: 700 }}>{selectedCandidate.vacante}</p>
                          </div>
                          <div>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Fecha de Postulación</p>
                            <p style={{ margin: '4px 0 0', color: '#1e3a5f', fontWeight: 700 }}>{new Date(selectedCandidate.fecha).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Sector de Interés</p>
                            <p style={{ margin: '4px 0 0', color: '#1e3a5f', fontWeight: 700 }}>{selectedCandidate.candidato.perfil.sector_economico || 'No especificado'}</p>
                          </div>
                          <div>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Área de Desempeño</p>
                            <p style={{ margin: '4px 0 0', color: '#1e3a5f', fontWeight: 700 }}>{selectedCandidate.candidato.perfil.area_desempeno || 'No especificada'}</p>
                          </div>
                        </div>
                        
                        {selectedCandidate.cv_url && (
                          <div style={{ marginTop: '30px' }}>
                            <a href={selectedCandidate.cv_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'white', color: '#1e3a5f', padding: '12px 24px', borderRadius: '14px', border: '1.5px solid #1e3a5f', fontWeight: 700, textDecoration: 'none', transition: 'all 0.2s' }}>
                              📄 Ver Hoja de Vida (CV)
                            </a>
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '16px' }}>
                        <button 
                          onClick={() => handleUpdateStatus(selectedCandidate.id, 'aceptado')}
                          style={{ flex: 1, padding: '18px', background: '#10b981', color: 'white', border: 'none', borderRadius: '18px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.2)' }}
                        >
                          Aceptar Candidato
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(selectedCandidate.id, 'rechazado')}
                          style={{ flex: 1, padding: '18px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '18px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.2)' }}
                        >
                          Eliminar / Rechazar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
}
