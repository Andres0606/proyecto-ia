'use client';

import React, { useEffect, useState } from 'react';
import Header from '../Components/header';
import Footer from '../Components/footer';
import '../css/Dashboard/dashboard.css';

const QUICK_ACTIONS = [
  { title: 'Datos Personales', icon: '👤', id: 'personal' },
  { title: 'Perfil Profesional', icon: '💼', id: 'professional' },
  { title: 'Planes y Membresía', icon: '💳', id: 'plans' },
  { title: 'Actualizar CV', icon: '📄', id: 'cv' },
];

const DIAG_OPTIONS = {
  Programa: ["Derecho", "Contaduria Publica", "Ingenieria Civil", "Ciencias Economicas", "Medicina", "Psicologia", "Odontologia", "Enfermeria", "Ingenieria de Sistemas", "Medicina Veterinaria y Zootecnia", "Especializacion", "Tecnico Auxiliar en Enfermeria"],
  Estrato: ["Uno", "Dos", "Tres", "Cuatro", "Cinco", "Seis"],
  EstadoCivil: ["Casado", "Union libre", "Soltero", "Separado", "Viudo"],
  Hijos: ["Cero", "Uno", "Dos", "Tres", "Cuatro", "Cinco"],
  Formacion: ["Profesional", "Especialista", "Magister", "Doctorado", "Tecnico Profesional"],
  Emprendimiento: ["Si", "No"],
  Area: ["Servicios", "Administrativa", "Salud", "Financiera", "Industrial", "Economica", "Gestion Humana", "Educacion", "Comercial", "Contable", "Sistemas"],
  Sector: ["Servicios", "Comercial", "Industrial"],
  Ingreso: ["1 SML o menos", "2-3 SML", "3-5 SML", "5 SML o mas"]
};

export default function DashboardExterno() {
  const [greeting, setGreeting] = useState('Buenos días');
  const [userName, setUserName] = useState('Usuario');
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'none' | 'personal' | 'professional' | 'plans' | 'cv'>('none');
  const [isEditingProf, setIsEditingProf] = useState(false);
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [completionPct, setCompletionPct] = useState(0);
  
  const [uploadStatus, setUploadStatus] = useState<{msg: string, type: 'info' | 'success' | 'error' | 'none'}>({msg: '', type: 'none'});
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre_completo: '', correo: '', telefono: '', cedula: '', fecha_nacimiento: '', genero: '',
    nivel_formacion: '', programa_academico: '', estrato: '', estado_civil: '', numero_hijos: '',
    ingreso_mensual: '', sector_economico: '', area_desempeno: '', emprendimiento: ''
  });

  const avatarInputRef = React.useRef<HTMLInputElement>(null);
  const cvInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 12 && hour < 18) setGreeting('Buenas tardes');
    else if (hour >= 18 || hour < 5) setGreeting('Buenas noches');

    const savedUser = sessionStorage.getItem('ucc_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        const rawId = userData.id || userData.profile?.id || userData.user_id;
        if (rawId) {
          const cleanId = String(rawId).trim().split(':')[0];
          setUserId(cleanId);
          const meta = userData.profile || userData.user_metadata || {};
          setUserName(meta.full_name?.split(' ')[0] || meta.nombre_completo?.split(' ')[0] || 'Usuario');
          fetchFullProfile(cleanId);
        }
      } catch (e) { console.error(e); }
    }
  }, []);

  const fetchFullProfile = async (id: string) => {
    try {
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000').replace(/\/$/, '');
      const res = await fetch(`${backendUrl}/api/users/profile/${id}`);
      const data = await res.json();
      if (data.success && data.profile) {
        const u = data.profile;
        const p = (u.perfiles_usuarios && u.perfiles_usuarios.length > 0) ? u.perfiles_usuarios[0] : {};
        setUserName(u.nombre_completo ? u.nombre_completo.split(' ')[0] : 'Usuario');
        if (u.foto_url) setUserPhoto(u.foto_url);
        const val = (v: any) => (v !== null && v !== undefined && v !== '') ? String(v) : '';
        setFormData({
          nombre_completo: u.nombre_completo || '', correo: u.correo || '', telefono: u.telefono || '',
          cedula: u.cedula || 'N/A', fecha_nacimiento: u.fecha_nacimiento ? u.fecha_nacimiento.split('T')[0] : 'No definida',
          genero: u.genero || 'No definido', nivel_formacion: val(p.nivel_formacion), programa_academico: val(p.programa_academico),
          estrato: val(p.estrato), estado_civil: val(p.estado_civil), numero_hijos: val(p.numero_hijos),
          ingreso_mensual: val(p.ingreso_mensual), sector_economico: val(p.sector_economico),
          area_desempeno: val(p.area_desempeno), emprendimiento: val(p.emprendimiento)
        });
        setCompletionPct(45); // Static for now
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
        body: JSON.stringify({ userData: formData, profileData: formData }),
      });
      const data = await res.json();
      if (data.success) {
        setUploadStatus({ msg: 'Perfil actualizado con éxito', type: 'success' });
        setIsEditingProf(false); setIsEditingPersonal(false);
        setTimeout(() => { fetchFullProfile(userId); setUploadStatus({ msg: '', type: 'none' }); }, 2000);
      }
    } catch (err) { setUploadStatus({ msg: 'Error al guardar cambios', type: 'error' }); } finally { setLoadingProfile(false); }
  };

  const handleFileUpload = async (file: File, type: 'avatar' | 'cv') => {
    if (!userId) return;
    setIsUploading(true);
    setUploadStatus({ msg: `⏳ Subiendo ${type}...`, type: 'info' });
    const fd = new FormData();
    fd.append(type === 'avatar' ? 'image' : 'cv', file);
    fd.append('userId', userId);
    try {
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000').replace(/\/$/, '');
      const res = await fetch(`${backendUrl}/api/users/upload-${type === 'avatar' ? 'avatar' : 'cv'}`, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) {
        setUploadStatus({ msg: '¡Éxito!', type: 'success' });
        if (type === 'avatar') setUserPhoto(data.url);
        setTimeout(() => { fetchFullProfile(userId); setUploadStatus({ msg: '', type: 'none' }); }, 3000);
      }
    } catch (err) { setUploadStatus({ msg: 'Error en la carga', type: 'error' }); } finally { setIsUploading(false); }
  };

  const handleViewResume = async () => {
    if (!userId) return;
    setUploadStatus({ msg: 'Abriendo CV...', type: 'info' });
    try {
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000').replace(/\/$/, '');
      const res = await fetch(`${backendUrl}/api/users/get-cv-url/${userId}`);
      const data = await res.json();
      if (data.success) window.open(data.url, '_blank');
      else setUploadStatus({ msg: 'No hay CV subido', type: 'info' });
    } catch (err) { setUploadStatus({ msg: 'Error', type: 'error' }); }
    setTimeout(() => setUploadStatus({ msg: '', type: 'none' }), 2000);
  };

  const baseInputStyle = { padding: '16px 24px', borderRadius: '14px', border: '1px solid #e2e8f0', width: '100%', fontSize: '1rem', outline: 'none' };
  const disabledInputStyle = { ...baseInputStyle, background: '#f8fafc', color: '#64748b', cursor: 'not-allowed' };
  const labelStyle = { fontSize: '0.9rem', fontWeight: 700, color: 'var(--ucc-navy)', marginBottom: '8px', display: 'block' };

  return (
    <div className="db-page">
      <Header />
      <input type="file" ref={avatarInputRef} hidden accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'avatar')} />
      <input type="file" ref={cvInputRef} hidden accept=".pdf" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'cv')} />

      {uploadStatus.type !== 'none' && (
        <div style={{ position: 'fixed', bottom: '32px', right: '32px', zIndex: 9999, padding: '16px 22px', borderRadius: '16px', color: 'white', fontWeight: 600, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', background: uploadStatus.type === 'success' ? '#059669' : uploadStatus.type === 'error' ? '#dc2626' : '#1e3a5f' }}>
          {uploadStatus.msg}
        </div>
      )}

      <main className="db-main" style={{ paddingTop: '100px', minHeight: '80vh' }}>
        <div className="db-card" style={{ margin: '0 auto 40px', maxWidth: '1100px', padding: '30px 40px', display: 'flex', alignItems: 'center', gap: '40px', background: 'white', borderRadius: '24px' }}>
          <div style={{ width: '130px', height: '130px', borderRadius: '50%', background: userPhoto ? `url(${userPhoto}) center/cover` : 'var(--ucc-navy)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800 }}>
            {!userPhoto && userName[0]}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, color: 'var(--ucc-navy)', fontSize: '2rem' }}>{greeting}, {userName} ✨</h1>
            <span style={{ background: '#dcfce7', color: '#166534', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>USUARIO EXTERNO</span>
            <div style={{ marginTop: '15px' }}>
              <button onClick={() => avatarInputRef.current?.click()} style={{ background: '#f8fafc', color: 'var(--ucc-navy)', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 20px', cursor: 'pointer', fontWeight: 600 }}>📁 Cambiar Foto</button>
            </div>
          </div>
        </div>

        <div className="db-actions" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '25px', margin: '40px auto', maxWidth: '1100px' }}>
          {QUICK_ACTIONS.map((action) => (
            <div key={action.id} onClick={() => setActiveSection(action.id as any)} style={{ cursor: 'pointer', padding: '30px', textAlign: 'center', background: 'white', borderRadius: '24px', border: activeSection === action.id ? '2px solid var(--ucc-blue)' : '1px solid #f1f5f9', boxShadow: '0 8px 20px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>{action.icon}</div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--ucc-navy)', fontWeight: 800 }}>{action.title}</h3>
            </div>
          ))}
        </div>

        <div style={{ maxWidth: '1100px', margin: '0 auto 60px' }}>
          {activeSection === 'personal' && (
            <div className="db-card" style={{ padding: '45px', borderRadius: '28px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
                <h2 style={{ color: 'var(--ucc-navy)', margin: 0, fontWeight: 800 }}>👤 Datos Personales</h2>
                <button onClick={() => setIsEditingPersonal(!isEditingPersonal)} style={{ background: 'var(--ucc-blue)', color: 'white', border: 'none', borderRadius: '12px', padding: '10px 20px', cursor: 'pointer', fontWeight: 700 }}>{isEditingPersonal ? '❌ Cancelar' : '✏️ Editar Datos'}</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '35px' }}>
                <div className="form-group"><label style={labelStyle}>Nombre Completo</label><input type="text" value={formData.nombre_completo} onChange={(e) => setFormData({...formData, nombre_completo: e.target.value})} disabled={!isEditingPersonal} style={isEditingPersonal ? baseInputStyle : disabledInputStyle} /></div>
                <div className="form-group"><label style={labelStyle}>Correo</label><input type="email" value={formData.correo} onChange={(e) => setFormData({...formData, correo: e.target.value})} disabled={!isEditingPersonal} style={isEditingPersonal ? baseInputStyle : disabledInputStyle} /></div>
                <div className="form-group"><label style={labelStyle}>Teléfono</label><input type="text" value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} disabled={!isEditingPersonal} style={isEditingPersonal ? baseInputStyle : disabledInputStyle} /></div>
                <div className="form-group"><label style={labelStyle}>Cédula</label><input type="text" value={formData.cedula} disabled style={disabledInputStyle} /></div>
              </div>
              {isEditingPersonal && <button onClick={handleSaveProfile} style={{ width: '100%', marginTop: '40px', padding: '18px', background: 'var(--ucc-navy)', color: 'white', borderRadius: '16px', fontWeight: 800 }}>💾 Guardar Cambios</button>}
            </div>
          )}

          {activeSection === 'plans' && (
            <div className="db-card" style={{ padding: '45px', borderRadius: '28px', textAlign: 'center' }}>
              <h2 style={{ color: 'var(--ucc-navy)', fontWeight: 800 }}>💳 Membresía y Planes</h2>
              <p style={{ color: '#64748b', marginBottom: '40px' }}>Como usuario externo, puedes acceder a beneficios exclusivos con nuestros planes.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                <div style={{ padding: '30px', border: '2px solid #e2e8f0', borderRadius: '20px' }}>
                  <h3>Plan Básico</h3>
                  <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>Gratis</p>
                  <ul style={{ textAlign: 'left', listStyle: 'none', padding: 0 }}>
                    <li>✓ Perfil Profesional</li>
                    <li>✓ Subir CV</li>
                    <li>✗ Diagnóstico de Estabilidad</li>
                  </ul>
                </div>
                <div style={{ padding: '30px', border: '2px solid var(--ucc-blue)', borderRadius: '20px', background: '#f0f7ff' }}>
                  <h3>Plan Premium</h3>
                  <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>$29,900 / mes</p>
                  <ul style={{ textAlign: 'left', listStyle: 'none', padding: 0 }}>
                    <li>✓ Perfil Profesional</li>
                    <li>✓ Subir CV</li>
                    <li>✓ Diagnóstico de Estabilidad AI</li>
                  </ul>
                  <button style={{ width: '100%', padding: '12px', background: 'var(--ucc-blue)', color: 'white', border: 'none', borderRadius: '10px', marginTop: '15px', fontWeight: 700 }}>Mejorar ahora</button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'professional' && (
            <div className="db-card" style={{ padding: '45px', borderRadius: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h2 style={{ color: 'var(--ucc-navy)', fontWeight: 800 }}>💼 Perfil Profesional Externo</h2>
                <button onClick={() => setIsEditingProf(!isEditingProf)} style={{ background: 'var(--ucc-blue)', color: 'white', border: 'none', borderRadius: '12px', padding: '10px 20px', cursor: 'pointer', fontWeight: 700 }}>{isEditingProf ? '❌ Cancelar' : '✏️ Actualizar'}</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '35px' }}>
                {[
                  { label: 'Nivel de Formación', key: 'nivel_formacion', options: DIAG_OPTIONS.Formacion },
                  { label: 'Estado Civil', key: 'estado_civil', options: DIAG_OPTIONS.EstadoCivil },
                  { label: 'Estrato', key: 'estrato', options: DIAG_OPTIONS.Estrato },
                  { label: 'Ingreso Mensual', key: 'ingreso_mensual', options: DIAG_OPTIONS.Ingreso },
                  { label: 'Área de Desempeño', key: 'area_desempeno', options: DIAG_OPTIONS.Area },
                ].map((field) => (
                  <div key={field.key} className="form-group">
                    <label style={labelStyle}>{field.label}</label>
                    {isEditingProf ? (
                      <select value={(formData as any)[field.key]} onChange={(e) => setFormData({...formData, [field.key]: e.target.value})} style={baseInputStyle}>
                        <option value="">Seleccione...</option>
                        {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input type="text" value={(formData as any)[field.key] || 'No completado'} disabled style={disabledInputStyle} />
                    )}
                  </div>
                ))}
              </div>
              {isEditingProf && <button onClick={handleSaveProfile} style={{ width: '100%', marginTop: '40px', padding: '18px', background: 'var(--ucc-navy)', color: 'white', borderRadius: '16px', fontWeight: 800 }}>💾 Guardar Perfil</button>}
            </div>
          )}

          {activeSection === 'cv' && (
            <div className="db-card" style={{ padding: '60px 45px', borderRadius: '28px', textAlign: 'center' }}>
              <div style={{ fontSize: '4.5rem', marginBottom: '20px' }}>📄</div>
              <h2 style={{ color: 'var(--ucc-navy)', fontWeight: 800 }}>Tu Hoja de Vida</h2>
              <button onClick={handleViewResume} style={{ width: '100%', maxWidth: '400px', padding: '20px', background: 'var(--ucc-green)', borderRadius: '15px', fontWeight: 800, border: 'none', cursor: 'pointer', marginBottom: '20px' }}>📄 Ver CV Actual</button>
              <div onClick={() => cvInputRef.current?.click()} style={{ border: '2px dashed #cbd5e1', padding: '40px', borderRadius: '20px', cursor: 'pointer' }}>
                <span>⬆️ Subir nuevo PDF</span>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
