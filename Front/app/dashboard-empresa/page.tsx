'use client';
/** VERSION CORREGIDA - POR FAVOR RECARGAR ARCHIVO EN EL EDITOR **/

import React, { useEffect, useState } from 'react';
import Header from '../Components/header';
import Footer from '../Components/footer';
import '../css/Dashboard/dashboard.css';

const Icons = {
  Home: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
  Company: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M8 10h.01" /><path d="M16 10h.01" /><path d="M8 14h.01" /><path d="M16 14h.01" /></svg>,
  Announce: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a3 3 0 0 0-3-3H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a3 3 0 0 0 3-3V8Z" /><path d="M10 8v4" /><path d="M21 15v-2a5 5 0 0 0-5-5" /><path d="M21 9v2" /></svg>,
  List: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  Users: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M17 7a4 4 0 0 1 0 7.75" /></svg>,
  Edit: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>,
  Location: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Mail: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Phone: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
};

const QUICK_ACTIONS = [
  { title: 'Inicio', Icon: Icons.Home, id: 'none' as const, color: '#3b82f6' },
  { title: 'Mi Empresa', Icon: Icons.Company, id: 'professional' as const, color: '#8b5cf6' },
  { title: 'Nueva Vacante', Icon: Icons.Announce, id: 'jobs' as const, color: '#10b981' },
  { title: 'Mis Vacantes', Icon: Icons.List, id: 'my-jobs' as const, color: '#f59e0b' },
  { title: 'Candidatos', Icon: Icons.Users, id: 'candidates' as const, color: '#ef4444' },
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
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState<'none' | 'professional' | 'jobs' | 'my-jobs' | 'candidates'>('none');
  const [toast, setToast] = useState<{ msg: string, type: 'info' | 'success' | 'error' | 'none' }>({ msg: '', type: 'none' });
  const [myVacancies, setMyVacancies] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [vacanciesTab, setVacanciesTab] = useState<'activas' | 'inactivas'>('activas');
  
  const [formData, setFormData] = useState({ razon_social: '', nit: '', sector_economico: '', ciudad: '', tamano_empresa: '', tipo_empresa: '', telefono: '', correo: '', eslogan: '' });
  const [jobData, setJobData] = useState({ cargo: '', area_desempeno: '', programa_requerido: [] as string[], nivel_formacion: '', salario: '', tipo_contrato: '', modalidad: '', ubicacion: '', descripcion: '', numero_vacantes: '1' });

  const logoInputRef = React.useRef<HTMLInputElement>(null);
  const base = () => (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000').replace(/\/$/, '');

  useEffect(() => {
    setIsVisible(true);
    const h = new Date().getHours();
    if (h >= 12 && h < 18) setGreeting('Buenas tardes');
    else if (h >= 18 || h < 5) setGreeting('Buenas noches');

    const savedUser = sessionStorage.getItem('ucc_user');
    if (!savedUser) {
      window.location.href = '/login';
      return;
    }

    try {
      const u = JSON.parse(savedUser);
      const rolId = Number(u.profile?.rol_id);

      if (rolId !== 3) {
        // Redirigir según el rol si no es empresa
        if (rolId === 4) window.location.href = '/dashboard-admin';
        else if (rolId === 2) window.location.href = '/dashboard-externo';
        else window.location.href = '/dashboard';
        return;
      }

      const rawId = u.id || u.profile?.id || u.user_id;
      if (rawId) {
        const cleanId = String(rawId).trim().split(':')[0];
        setUserId(cleanId); 
        fetchProfile(cleanId);
        fetchMyVacancies(cleanId);
        fetchCandidates(cleanId);
      }
    } catch (e) { 
      sessionStorage.clear();
      window.location.href = '/login';
    }
  }, []);

  const fetchProfile = async (id: string) => {
    try {
      const res = await fetch(`${base()}/api/users/profile/${id}`);
      const data = await res.json();
      if (data.success && data.profile) {
        const u = data.profile;
        const c = u.empresa || {};
        setCompanyName(c.razon_social || u.nombre_completo || 'Empresa UCC');
        setCompanySlogan(c.eslogan || 'Panel de gestión corporativa');
        if (u.foto_url) setCompanyLogo(`${u.foto_url}?t=${Date.now()}`);
        setFormData({ razon_social: c.razon_social || '', nit: c.nit || '', sector_economico: c.sector_economico || '', ciudad: c.ciudad || '', tamano_empresa: c.tamano_empresa || '', tipo_empresa: c.tipo_empresa || '', telefono: c.telefono || u.telefono || '', correo: c.correo || u.correo || '', eslogan: c.eslogan || '' });
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
      setToast({ msg: 'Actualizando...', type: 'info' });
      const res = await fetch(`${base()}/api/postulaciones/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ estado: newStatus }) });
      const data = await res.json();
      if (data.success) {
        setToast({ msg: `Candidato ${newStatus}`, type: 'success' });
        if (userId) fetchCandidates(userId);
        setSelectedCandidate(null);
      }
    } catch (err) { setToast({ msg: 'Error', type: 'error' }); }
    finally { setTimeout(() => setToast({ msg: '', type: 'none' }), 3000); }
  };

  const handleToggleStatus = async (id: number, current: string) => {
    const newStatus = (current || 'activa') === 'activa' ? 'inactiva' : 'activa';
    try {
      const res = await fetch(`${base()}/api/vacantes/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ estado: newStatus }) });
      const data = await res.json();
      if (data.success) {
        setToast({ msg: `Vacante ${newStatus}`, type: 'success' });
        if (userId) fetchMyVacancies(userId);
      }
    } catch (err) { setToast({ msg: 'Error', type: 'error' }); }
    finally { setTimeout(() => setToast({ msg: '', type: 'none' }), 3000); }
  };

  const handlePostJob = async () => {
    if (!userId || !jobData.cargo || jobData.programa_requerido.length === 0) {
      setToast({ msg: 'Completa los campos', type: 'error' });
      return;
    }

    if (Number(jobData.salario) < 0 || Number(jobData.numero_vacantes) <= 0) {
      setToast({ msg: 'Valores numéricos inválidos', type: 'error' });
      return;
    }
    setToast({ msg: 'Publicando...', type: 'info' });
    try {
      const res = await fetch(`${base()}/api/vacantes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...jobData, programa_requerido: jobData.programa_requerido.join(', '), userId }) });
      const d = await res.json();
      if (d.success) {
        setToast({ msg: '¡Publicada!', type: 'success' });
        setJobData({ cargo: '', area_desempeno: '', programa_requerido: [], nivel_formacion: '', salario: '', tipo_contrato: '', modalidad: '', ubicacion: '', descripcion: '', numero_vacantes: '1' });
        fetchMyVacancies(userId);
        setActiveSection('my-jobs');
      }
    } catch { setToast({ msg: 'Error', type: 'error' }); }
    finally { setTimeout(() => setToast({ msg: '', type: 'none' }), 3000); }
  };

  const inp = { padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%', fontSize: '0.95rem' };
  const dis = { ...inp, background: '#f8fafc', color: '#64748b', cursor: 'not-allowed' as const };
  const lbl = { fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '8px', display: 'block', textTransform: 'uppercase' as const };

  return (
    <div style={{ background: '#f4f7fa', minHeight: '100vh' }}>
      <Header />
      <input type="file" ref={logoInputRef} hidden accept="image/*" onChange={e => e.target.files?.[0] && (async (file) => {
        if (!userId) return;
        const fd = new FormData(); fd.append('image', file); fd.append('userId', userId);
        try {
          const r = await fetch(`${base()}/api/users/upload-avatar`, { method: 'POST', body: fd });
          if ((await r.json()).success) { await fetchProfile(userId); }
        } catch (err) { console.error(err); }
      })(e.target.files[0])} />

      {toast.type !== 'none' && (
        <div style={{ position: 'fixed', bottom: '32px', right: '32px', zIndex: 9999, padding: '16px 24px', borderRadius: '16px', color: 'white', fontWeight: 600, background: toast.type === 'success' ? '#059669' : toast.type === 'error' ? '#dc2626' : '#1e3a5f' }}>
          {toast.msg}
        </div>
      )}

      <main className="db-main" style={{ paddingTop: '40px' }}>
        <div className={`reveal ${isVisible ? 'reveal--visible' : ''}`} style={{ background: 'white', borderRadius: '32px', padding: '40px', boxShadow: '0 10px 40px rgba(0,40,85,0.04)', display: 'flex', alignItems: 'center', gap: '40px', marginBottom: '32px', position: 'relative', border: '1px solid rgba(226, 232, 240, 0.5)' }}>
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => logoInputRef.current?.click()}>
            <div style={{ width: '120px', height: '120px', borderRadius: '28px', background: companyLogo ? `url(${companyLogo}) center/cover` : '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: '#1e3a5f', border: '4px solid white', boxShadow: '0 8px 25px rgba(0,0,0,0.05)' }}>
              {!companyLogo && <Icons.Company />}
            </div>
            <div style={{ position: 'absolute', bottom: '-5px', right: '-5px', background: '#1e3a5f', color: 'white', width: '32px', height: '32px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}><Icons.Edit /></div>
          </div>
          <div>
            <h1 style={{ margin: 0, color: '#0f172a', fontSize: '2.2rem', fontWeight: 900 }}>{greeting}, {companyName}</h1>
            <p style={{ color: '#64748b', margin: '5px 0 0', fontSize: '1.1rem' }}>{companySlogan}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px', marginBottom: '40px' }}>
          {QUICK_ACTIONS.map((a, idx) => (
            <div 
              key={a.id} 
              onClick={() => setActiveSection(a.id)} 
              className={`reveal dashboard-action-card ${isVisible ? 'reveal--visible' : ''} ${activeSection === a.id ? 'active-card' : ''}`}
              style={{ 
                background: activeSection === a.id ? 'white' : 'rgba(255,255,255,0.7)', 
                backdropFilter: 'blur(10px)',
                borderRadius: '28px', 
                padding: '32px 20px', 
                textAlign: 'center', 
                cursor: 'pointer', 
                border: `1px solid ${activeSection === a.id ? a.color : 'rgba(255,255,255,0.4)'}`,
                boxShadow: activeSection === a.id ? `0 15px 35px ${a.color}25` : '0 4px 15px rgba(0,0,0,0.03)',
                transitionDelay: `${idx * 0.05}s`
              }}
            >
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '18px', 
                background: `${a.color}15`, 
                color: a.color, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 16px' 
              }}>
                <a.Icon />
              </div>
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1e3a5f' }}>{a.title}</span>
            </div>
          ))}
        </div>

        <div className={`reveal ${isVisible ? 'reveal--visible' : ''}`} style={{ animation: 'fadeIn 0.3s ease-out' }}>
          {activeSection === 'none' && (
            <div style={{ background: 'white', borderRadius: '32px', padding: '50px', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
              <h2 style={{ color: '#1e3a5f', fontSize: '1.8rem', fontWeight: 900 }}>Panel Corporativo UCC</h2>
              <p style={{ color: '#64748b', maxWidth: '600px', margin: '15px auto 30px' }}>Gestiona tus vacantes y encuentra el mejor talento de nuestra universidad.</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                <button onClick={() => setActiveSection('jobs')} style={{ background: '#1e3a5f', color: 'white', border: 'none', padding: '16px 32px', borderRadius: '16px', fontWeight: 800, cursor: 'pointer' }}>Publicar Vacante</button>
                <button onClick={() => setActiveSection('my-jobs')} style={{ background: 'white', color: '#1e3a5f', border: '2px solid #1e3a5f', padding: '16px 32px', borderRadius: '16px', fontWeight: 800, cursor: 'pointer' }}>Ver Vacantes</button>
              </div>
            </div>
          )}

          {activeSection === 'professional' && (
            <div style={{ background: 'white', borderRadius: '32px', padding: '40px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
              <h2 style={{ color: '#1e3a5f', fontWeight: 900, marginBottom: '30px' }}>Información de la Empresa</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {Object.entries(formData).filter(([k]) => k !== 'eslogan').map(([k, v]) => (
                  <div key={k}><label style={lbl}>{k.replace('_', ' ')}</label><input value={v} disabled style={dis} /></div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'jobs' && (
            <div style={{ background: 'white', borderRadius: '32px', padding: '40px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
              <h2 style={{ color: '#1e3a5f', fontWeight: 900, marginBottom: '30px' }}>Nueva Vacante</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div><label style={lbl}>Cargo</label><input style={inp} value={jobData.cargo} onChange={e => setJobData({...jobData, cargo: e.target.value})} /></div>
                <div><label style={lbl}>Área</label><select style={inp} value={jobData.area_desempeno} onChange={e => setJobData({...jobData, area_desempeno: e.target.value})}><option value="">Seleccionar...</option>{OPTIONS.Area.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={lbl}>Programas</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '15px', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
                    {OPTIONS.Programas.map(p => (
                      <button key={p} onClick={() => setJobData(prev => ({ ...prev, programa_requerido: prev.programa_requerido.includes(p) ? prev.programa_requerido.filter(x => x !== p) : [...prev.programa_requerido, p] }))} style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid', background: jobData.programa_requerido.includes(p) ? '#1e3a5f' : 'white', color: jobData.programa_requerido.includes(p) ? 'white' : '#64748b', fontSize: '0.8rem', cursor: 'pointer' }}>{p}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={lbl}>Salario</label>
                  <input 
                    style={inp} 
                    type="number" 
                    min="0" 
                    value={jobData.salario} 
                    onChange={e => {
                      const val = e.target.value;
                      if (Number(val) < 0) {
                        setToast({ msg: 'El salario no puede ser negativo', type: 'error' });
                        setTimeout(() => setToast({ msg: '', type: 'none' }), 2000);
                        return;
                      }
                      setJobData({...jobData, salario: val});
                    }} 
                  />
                </div>
                <div>
                  <label style={lbl}>Cupos</label>
                  <input 
                    style={inp} 
                    type="number" 
                    min="1" 
                    value={jobData.numero_vacantes} 
                    onChange={e => {
                      const val = e.target.value;
                      if (Number(val) < 0) {
                        setToast({ msg: 'Los cupos no pueden ser negativos', type: 'error' });
                        setTimeout(() => setToast({ msg: '', type: 'none' }), 2000);
                        return;
                      }
                      setJobData({...jobData, numero_vacantes: val});
                    }} 
                  />
                </div>
                <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Descripción</label><textarea style={{ ...inp, height: '100px' }} value={jobData.descripcion} onChange={e => setJobData({...jobData, descripcion: e.target.value})} /></div>
              </div>
              <button onClick={handlePostJob} style={{ width: '100%', marginTop: '30px', padding: '16px', background: '#0f172a', color: 'white', borderRadius: '16px', border: 'none', fontWeight: 800, cursor: 'pointer' }}>Publicar Vacante</button>
            </div>
          )}

          {activeSection === 'my-jobs' && (
            <div style={{ background: 'white', borderRadius: '32px', padding: '40px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '30px', background: '#f8fafc', padding: '6px', borderRadius: '18px', width: 'fit-content' }}>
                <button onClick={() => setVacanciesTab('activas')} style={{ padding: '10px 20px', borderRadius: '14px', border: 'none', background: vacanciesTab === 'activas' ? 'white' : 'transparent', fontWeight: 700, cursor: 'pointer' }}>Activas</button>
                <button onClick={() => setVacanciesTab('inactivas')} style={{ padding: '10px 20px', borderRadius: '14px', border: 'none', background: vacanciesTab === 'inactivas' ? 'white' : 'transparent', fontWeight: 700, cursor: 'pointer' }}>Pausadas</button>
              </div>
              <div style={{ display: 'grid', gap: '12px' }}>
                {myVacancies.filter(v => (v.estado || 'activa') === (vacanciesTab === 'activas' ? 'activa' : 'inactiva')).map(v => (
                  <div key={v.id} style={{ padding: '20px', border: '1px solid #f1f5f9', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: 0, color: '#0f172a', fontWeight: 800 }}>{v.cargo}</h4>
                      <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Icons.Location /> {v.ubicacion} | <Icons.Users /> {v.numero_vacantes} cupos
                      </p>
                    </div>
                    <button onClick={() => handleToggleStatus(v.id, v.estado || 'activa')} style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid #0f172a', background: 'white', fontWeight: 700, cursor: 'pointer' }}>{vacanciesTab === 'activas' ? 'Pausar' : 'Activar'}</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'candidates' && (
            <div style={{ background: 'white', borderRadius: '32px', padding: '40px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
              <h2 style={{ color: '#0f172a', fontWeight: 900, marginBottom: '30px' }}>Candidatos Postulados</h2>
              <div style={{ display: 'grid', gap: '20px' }}>
                {Object.entries(candidates.reduce((acc: any, curr: any) => { const k = curr.vacante || 'Otros'; if (!acc[k]) acc[k] = []; acc[k].push(curr); return acc; }, {})).map(([title, apps]: [string, any]) => (
                  <div key={title} style={{ border: '1px solid #f1f5f9', borderRadius: '24px', overflow: 'hidden' }}>
                    <div style={{ background: '#f8fafc', padding: '15px 20px', fontWeight: 800, color: '#0f172a' }}>{title} ({apps.length})</div>
                    <div style={{ padding: '15px', display: 'grid', gap: '10px' }}>
                      {apps.map((c: any) => (
                        <div key={c.id} style={{ padding: '12px 16px', border: '1px solid #f1f5f9', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700 }}>{c.candidato?.nombre}</span>
                          <button onClick={() => setSelectedCandidate(c)} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #0f172a', background: 'white', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>Detalles</button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {selectedCandidate && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
                  <div style={{ background: 'white', borderRadius: '24px', width: '90%', maxWidth: '600px', padding: '30px', position: 'relative' }}>
                    <button onClick={() => setSelectedCandidate(null)} style={{ position: 'absolute', top: '15px', right: '15px', border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                    <h3>{selectedCandidate.candidato?.nombre}</h3>
                    <p>{selectedCandidate.candidato?.perfil?.programa_academico}</p>
                    <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '16px', margin: '20px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><Icons.Mail /> {selectedCandidate.candidato?.correo}</p>
                      <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><Icons.Phone /> {selectedCandidate.candidato?.telefono}</p>
                      {selectedCandidate.cv_url && <a href={selectedCandidate.cv_url} target="_blank" style={{ color: '#1e3a5f', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}><Icons.List /> Ver Hoja de Vida</a>}
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button onClick={() => handleUpdateStatus(selectedCandidate.id, 'aceptado')} style={{ flex: 1, padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}>Aceptar</button>
                      <button onClick={() => handleUpdateStatus(selectedCandidate.id, 'rechazado')} style={{ flex: 1, padding: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}>Eliminar / Rechazar</button>
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
