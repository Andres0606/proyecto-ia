'use client';

import React, { useEffect, useState } from 'react';
import Header from '../Components/header';
import Footer from '../Components/footer';
import '../css/Dashboard/dashboard.css';

const SECTIONS = [
  { title: 'Datos Personales', icon: '👤', id: 'personal' },
  { title: 'Perfil Profesional', icon: '💼', id: 'professional' },
  { title: 'Planes', icon: '💳', id: 'plans' },
  { title: 'Mi CV', icon: '📄', id: 'cv' },
];

const DIAG_OPTIONS = {
  Formacion: ["Profesional","Especialista","Magister","Doctorado","Tecnico Profesional"],
  EstadoCivil: ["Casado","Union libre","Soltero","Separado","Viudo"],
  Estrato: ["Uno","Dos","Tres","Cuatro","Cinco","Seis"],
  Ingreso: ["1 SML o menos","2-3 SML","3-5 SML","5 SML o mas"],
  Area: ["Servicios","Administrativa","Salud","Financiera","Industrial","Economica","Gestion Humana","Educacion","Comercial","Contable","Sistemas"],
};

export default function DashboardExterno() {
  const [greeting, setGreeting] = useState('Buenos días');
  const [userName, setUserName] = useState('Usuario');
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'none'|'personal'|'professional'|'plans'|'cv'>('none');
  const [isEditingProf, setIsEditingProf] = useState(false);
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [toast, setToast] = useState<{msg:string,type:'info'|'success'|'error'|'none'}>({msg:'',type:'none'});
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    nombre_completo:'',correo:'',telefono:'',cedula:'',fecha_nacimiento:'',genero:'',
    nivel_formacion:'',estrato:'',estado_civil:'',numero_hijos:'',
    ingreso_mensual:'',area_desempeno:''
  });

  const avatarRef = React.useRef<HTMLInputElement>(null);
  const cvRef = React.useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type: 'info'|'success'|'error') => {
    setToast({msg, type});
    setTimeout(() => setToast({msg:'',type:'none'}), 3000);
  };

  useEffect(() => {
    const h = new Date().getHours();
    if (h >= 12 && h < 18) setGreeting('Buenas tardes');
    else if (h >= 18 || h < 5) setGreeting('Buenas noches');
    const saved = sessionStorage.getItem('ucc_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        const raw = u.id || u.profile?.id || u.user_id;
        if (raw) {
          const id = String(raw).trim().split(':')[0];
          const rol = Number(u.profile?.rol_id);
          if (rol === 4) window.location.href = '/dashboard-admin';
          else if (rol === 3) window.location.href = '/dashboard-empresa';
          else if (rol === 1) window.location.href = '/dashboard';
          else { setUserId(id); const m = u.profile || {}; setUserName(m.nombre_completo?.split(' ')[0] || 'Usuario'); fetchProfile(id); }
        }
      } catch(e){ console.error(e); }
    }
  }, []);

  const base = () => (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000').replace(/\/$/, '');

  const fetchProfile = async (id: string) => {
    try {
      const r = await fetch(`${base()}/api/users/profile/${id}`);
      const d = await r.json();
      if (d.success && d.profile) {
        const u = d.profile;
        const p = u.perfiles_usuarios?.[0] || {};
        setUserName(u.nombre_completo?.split(' ')[0] || 'Usuario');
        if (u.foto_url) setUserPhoto(u.foto_url);
        const v = (x: any) => x != null && x !== '' ? String(x) : '';
        setFormData({ nombre_completo: u.nombre_completo||'', correo: u.correo||'', telefono: u.telefono||'', cedula: u.cedula||'', fecha_nacimiento: u.fecha_nacimiento?.split('T')[0]||'', genero: u.genero||'', nivel_formacion: v(p.nivel_formacion), estrato: v(p.estrato), estado_civil: v(p.estado_civil), numero_hijos: v(p.numero_hijos), ingreso_mensual: v(p.ingreso_mensual), area_desempeno: v(p.area_desempeno) });
      }
    } catch(e){ console.error(e); }
  };

  const handleSave = async () => {
    if (!userId) return;
    showToast('Guardando...','info');
    try {
      const r = await fetch(`${base()}/api/users/profile/${userId}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({userData: formData, profileData: formData}) });
      const d = await r.json();
      if (d.success) { showToast('¡Perfil actualizado!','success'); setIsEditingProf(false); setIsEditingPersonal(false); setTimeout(() => fetchProfile(userId!), 2000); }
    } catch { showToast('Error al guardar','error'); }
  };

  const handleUpload = async (file: File, type: 'avatar'|'cv') => {
    if (!userId) return;
    setIsUploading(true); showToast(`Subiendo ${type}...`,'info');
    const fd = new FormData();
    fd.append(type === 'avatar' ? 'image' : 'cv', file);
    fd.append('userId', userId);
    try {
      const r = await fetch(`${base()}/api/users/upload-${type === 'avatar' ? 'avatar' : 'cv'}`, {method:'POST', body: fd});
      const d = await r.json();
      if (d.success) {
        showToast('¡Subido con éxito!','success');
        if (type==='avatar') setUserPhoto(d.url);
        setTimeout(() => fetchProfile(userId), 1500);
      } else {
        const errorDetail = d.error ? ` (${d.error})` : '';
        showToast(`${d.message || 'Error en la carga'}${errorDetail}`, 'error');
      }
    } catch { showToast('Error en la carga','error'); } finally { setIsUploading(false); }
  };

  const handleViewCV = async () => {
    if (!userId) return;
    try {
      const r = await fetch(`${base()}/api/users/get-cv-url/${userId}`);
      const d = await r.json();
      if (d.success) window.open(d.url,'_blank'); else showToast('No hay CV subido','info');
    } catch { showToast('Error','error'); }
  };

  const inp = { padding:'14px 18px', borderRadius:'12px', border:'1px solid #e2e8f0', width:'100%', fontSize:'0.95rem', outline:'none' };
  const dis = { ...inp, background:'#f8fafc', color:'#64748b', cursor:'not-allowed' as const };
  const lbl = { fontSize:'0.8rem', fontWeight:700, color:'#475569', marginBottom:'6px', display:'block', textTransform:'uppercase' as const, letterSpacing:'0.5px' };

  const PLANS = [
    { name:'Gratuito', price:'Gratis', period:'', note:'Acceso básico al portal', icon:'🆓', features:[
      {t:'Perfil Profesional',ok:true},{t:'Subir CV',ok:true},{t:'Bolsa de Empleo',ok:false},{t:'Diagnóstico IA',ok:false},{t:'Alertas de vacantes',ok:false}
    ]},
    { name:'Acceso al Modelo', price:'$25.000', period:'pago único', note:'Sin cargos recurrentes', icon:'🧠', features:[
      {t:'Perfil Profesional',ok:true},{t:'Subir CV',ok:true},{t:'Diagnóstico de estabilidad laboral con IA',ok:true},{t:'Bolsa de Empleo',ok:false},{t:'Alertas de vacantes',ok:false}
    ]},
    { name:'Plan Completo', price:'$45.000', period:'/ mes', note:'Cancela cuando quieras', icon:'🚀', popular:true, features:[
      {t:'Perfil Profesional',ok:true},{t:'Subir CV',ok:true},{t:'Diagnóstico de estabilidad laboral con IA',ok:true},{t:'Acceso completo a la bolsa de empleo',ok:true},{t:'Alertas de vacantes por correo',ok:true},{t:'Postulación directa a empresas',ok:true}
    ]}
  ];

  return (
    <div className="db-page" style={{ background:'#f8fafc' }}>
      <Header />
      <input type="file" ref={avatarRef} hidden accept="image/*" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0],'avatar')} />
      <input type="file" ref={cvRef} hidden accept=".pdf" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0],'cv')} />

      {/* Toast */}
      {toast.type !== 'none' && (
        <div style={{ position:'fixed', bottom:'32px', right:'32px', zIndex:9999, padding:'14px 22px', borderRadius:'14px', color:'white', fontWeight:600, boxShadow:'0 20px 60px rgba(0,0,0,0.2)', background: toast.type==='success'?'#059669': toast.type==='error'?'#dc2626':'#1e3a5f', transition:'all 0.3s' }}>
          {toast.msg}
        </div>
      )}

      <main style={{ paddingTop:'80px', minHeight:'100vh' }}>

        {/* Hero Banner */}
        <div style={{ background:'linear-gradient(135deg, #002855 0%, #003875 50%, #00A9E0 100%)', padding:'50px 40px 80px', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:'-80px', right:'-80px', width:'320px', height:'320px', borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />
          <div style={{ position:'absolute', bottom:'-60px', left:'-60px', width:'240px', height:'240px', borderRadius:'50%', background:'rgba(0,169,224,0.1)' }} />
          <div style={{ maxWidth:'1200px', margin:'0 auto', display:'flex', alignItems:'center', gap:'28px', position:'relative', flexWrap:'wrap' }}>
            <div style={{ width:'90px', height:'90px', borderRadius:'50%', background: userPhoto ? `url(${userPhoto}) center/cover` : 'rgba(255,255,255,0.15)', backdropFilter:'blur(10px)', border:'3px solid rgba(255,255,255,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2.4rem', fontWeight:800, color:'white', cursor:'pointer', flexShrink:0 }} onClick={() => avatarRef.current?.click()}>
              {!userPhoto && userName[0]}
            </div>
            <div>
              <p style={{ color:'rgba(255,255,255,0.6)', margin:'0 0 4px', fontSize:'0.9rem' }}>{greeting}</p>
              <h1 style={{ color:'white', margin:'0 0 10px', fontSize:'2rem', fontWeight:800 }}>{userName} ✨</h1>
              <span style={{ background:'rgba(0,169,224,0.25)', color:'#7dd3fc', padding:'5px 14px', borderRadius:'20px', fontSize:'0.75rem', fontWeight:700, letterSpacing:'1px' }}>USUARIO EXTERNO</span>
            </div>
          </div>
        </div>

        {/* Sticky Nav */}
        <div style={{ background:'white', borderBottom:'1px solid #e2e8f0', position:'sticky', top:'80px', zIndex:100 }}>
          <div style={{ maxWidth:'1200px', margin:'0 auto', display:'flex', overflowX:'auto', padding:'0 20px' }}>
            {SECTIONS.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id as any)} style={{ padding:'18px 26px', border:'none', background:'none', cursor:'pointer', fontWeight:700, fontSize:'0.9rem', whiteSpace:'nowrap', borderBottom: activeSection===s.id ? '3px solid var(--ucc-navy)' : '3px solid transparent', color: activeSection===s.id ? 'var(--ucc-navy)' : '#64748b', transition:'all 0.2s', display:'flex', alignItems:'center', gap:'8px' }}>
                <span>{s.icon}</span>{s.title}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth:'1200px', margin:'-40px auto 60px', padding:'0 20px', position:'relative', zIndex:10 }}>

          {activeSection === 'none' && (
            <div>
              <div className="responsive-grid-4" style={{ marginBottom:'28px' }}>
                {[
                  { label:'Perfil Completo', val:'45%', icon:'✅', color:'var(--ucc-navy)', bg:'#eff6ff' },
                  { label:'CVs Subidos', val:'1', icon:'📄', color:'#00A9E0', bg:'#e0f7ff' },
                  { label:'Postulaciones', val:'0', icon:'📬', color:'#8b5cf6', bg:'#f5f3ff' },
                  { label:'Plan Actual', val:'Gratuito', icon:'💳', color:'#e53e3e', bg:'#fff5f5' },
                ].map(c => (
                  <div key={c.label} style={{ background:'white', borderRadius:'20px', padding:'24px', boxShadow:'0 4px 20px rgba(0,0,0,0.05)' }}>
                    <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:c.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem', marginBottom:'12px' }}>{c.icon}</div>
                    <p style={{ margin:0, fontSize:'1.6rem', fontWeight:800, color:c.color }}>{c.val}</p>
                    <p style={{ margin:0, fontSize:'0.8rem', color:'#94a3b8', fontWeight:600 }}>{c.label}</p>
                  </div>
                ))}
              </div>
              <div style={{ background:'white', borderRadius:'24px', padding:'40px', boxShadow:'0 4px 20px rgba(0,0,0,0.05)', display:'flex', gap:'30px', alignItems:'center', flexWrap:'wrap' }}>
                <div style={{ fontSize:'4rem' }}>🌟</div>
                <div style={{ flex:1, minWidth:'240px' }}>
                  <h2 style={{ color:'var(--ucc-navy)', fontWeight:800, margin:'0 0 8px' }}>Portal de Usuario Externo UCC</h2>
                  <p style={{ color:'#64748b', lineHeight:1.6, margin:'0 0 20px' }}>Actualiza tu perfil, sube tu CV y explora los planes disponibles para acceder a más beneficios.</p>
                  <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
                    <button onClick={() => setActiveSection('professional')} style={{ background:'var(--ucc-navy)', color:'white', border:'none', borderRadius:'12px', padding:'12px 24px', fontWeight:700, cursor:'pointer' }}>Mi Perfil</button>
                    <button onClick={() => setActiveSection('plans')} style={{ background:'#fff5f5', color:'#e53e3e', border:'1px solid #feb2b2', borderRadius:'12px', padding:'12px 24px', fontWeight:700, cursor:'pointer' }}>Ver Planes ⭐</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'personal' && (
            <div style={{ background:'white', borderRadius:'24px', padding:'40px', boxShadow:'0 4px 20px rgba(0,0,0,0.05)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'28px', paddingBottom:'20px', borderBottom:'1px solid #f1f5f9', flexWrap:'wrap', gap:'12px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
                  <div style={{ width:'48px', height:'48px', borderRadius:'14px', background:'#eff6ff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem' }}>👤</div>
                  <div><h2 style={{ margin:0, color:'var(--ucc-navy)', fontWeight:800 }}>Datos Personales</h2><p style={{ margin:0, color:'#64748b', fontSize:'0.85rem' }}>Tu información básica de registro</p></div>
                </div>
                <button onClick={() => setIsEditingPersonal(!isEditingPersonal)} style={{ background: isEditingPersonal ? '#fee2e2' : 'var(--ucc-navy)', color: isEditingPersonal ? '#b91c1c' : 'white', border:'none', borderRadius:'12px', padding:'10px 20px', cursor:'pointer', fontWeight:700 }}>
                  {isEditingPersonal ? '✕ Cancelar' : '✏️ Editar'}
                </button>
              </div>
              <div className="responsive-grid-2">
                {[
                  { label:'Nombre Completo', key:'nombre_completo', editable:true },
                  { label:'Correo Electrónico', key:'correo', editable:true },
                  { label:'Teléfono', key:'telefono', editable:true },
                  { label:'Cédula', key:'cedula', editable:false },
                ].map(f => (
                  <div key={f.key}>
                    <label style={lbl}>{f.label}</label>
                    <input type="text" value={(formData as any)[f.key]} onChange={e => f.editable && setFormData({...formData, [f.key]: e.target.value})} disabled={!isEditingPersonal || !f.editable} style={!isEditingPersonal || !f.editable ? dis : inp} />
                  </div>
                ))}
              </div>
              {isEditingPersonal && <button onClick={handleSave} style={{ width:'100%', marginTop:'28px', padding:'16px', background:'var(--ucc-navy)', color:'white', borderRadius:'14px', fontWeight:800, border:'none', cursor:'pointer', fontSize:'1rem' }}>💾 Guardar Cambios</button>}
            </div>
          )}

          {activeSection === 'professional' && (
            <div style={{ background:'white', borderRadius:'24px', padding:'40px', boxShadow:'0 4px 20px rgba(0,0,0,0.05)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'28px', paddingBottom:'20px', borderBottom:'1px solid #f1f5f9', flexWrap:'wrap', gap:'12px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
                  <div style={{ width:'48px', height:'48px', borderRadius:'14px', background:'#eff6ff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem' }}>💼</div>
                  <div><h2 style={{ margin:0, color:'var(--ucc-navy)', fontWeight:800 }}>Perfil Profesional</h2><p style={{ margin:0, color:'#64748b', fontSize:'0.85rem' }}>Tu información laboral y académica</p></div>
                </div>
                <button onClick={() => setIsEditingProf(!isEditingProf)} style={{ background: isEditingProf ? '#fee2e2' : '#00A9E0', color: isEditingProf ? '#b91c1c' : 'white', border:'none', borderRadius:'12px', padding:'10px 20px', cursor:'pointer', fontWeight:700 }}>
                  {isEditingProf ? '✕ Cancelar' : '✏️ Actualizar'}
                </button>
              </div>
              <div className="responsive-grid-2">
                {[
                  { label:'Nivel de Formación', key:'nivel_formacion', opts:DIAG_OPTIONS.Formacion },
                  { label:'Estado Civil', key:'estado_civil', opts:DIAG_OPTIONS.EstadoCivil },
                  { label:'Estrato Socioeconómico', key:'estrato', opts:DIAG_OPTIONS.Estrato },
                  { label:'Ingreso Mensual', key:'ingreso_mensual', opts:DIAG_OPTIONS.Ingreso },
                  { label:'Área de Desempeño', key:'area_desempeno', opts:DIAG_OPTIONS.Area },
                ].map(f => (
                  <div key={f.key}>
                    <label style={lbl}>{f.label}</label>
                    {isEditingProf
                      ? <select value={(formData as any)[f.key]} onChange={e => setFormData({...formData, [f.key]: e.target.value})} style={inp}><option value="">Seleccione...</option>{f.opts.map(o => <option key={o} value={o}>{o}</option>)}</select>
                      : <input value={(formData as any)[f.key] || 'No completado'} disabled style={dis} />
                    }
                  </div>
                ))}
              </div>
              {isEditingProf && <button onClick={handleSave} style={{ width:'100%', marginTop:'28px', padding:'16px', background:'#00A9E0', color:'white', borderRadius:'14px', fontWeight:800, border:'none', cursor:'pointer', fontSize:'1rem' }}>💾 Guardar Perfil</button>}
            </div>
          )}

          {activeSection === 'plans' && (
            <div>
              <div style={{ textAlign:'center', marginBottom:'32px' }}>
                <h2 style={{ color:'var(--ucc-navy)', fontWeight:800, fontSize:'1.8rem', margin:'0 0 8px' }}>💳 Planes y Membresía</h2>
                <p style={{ color:'#64748b' }}>Elige el plan que mejor se adapte a tus necesidades</p>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'24px', maxWidth:'1100px', margin:'0 auto' }}>
                {PLANS.map((plan,i) => (
                  <div key={plan.name} style={{ background: i===2 ? 'linear-gradient(135deg, #002855 0%, #003875 100%)' : 'white', borderRadius:'24px', padding:'36px', boxShadow: i===2 ? '0 20px 50px rgba(0,40,85,0.3)' : '0 4px 20px rgba(0,0,0,0.05)', border: i===0 ? '2px solid #00A9E0' : i===1 ? '2px solid #e2e8f0' : 'none', position:'relative', overflow:'hidden' }}>
                    {(plan as any).popular && <span style={{ position:'absolute', top:'16px', right:'16px', background:'rgba(0,169,224,0.25)', color:'#7dd3fc', padding:'4px 12px', borderRadius:'20px', fontSize:'0.7rem', fontWeight:700 }}>MÁS POPULAR</span>}
                    <div style={{ marginBottom:'20px' }}>
                      <span style={{ fontSize:'2rem', display:'block', marginBottom:'8px' }}>{plan.icon}</span>
                      <span style={{ background: i===2 ? 'rgba(255,255,255,0.1)' : '#f1f5f9', color: i===2 ? '#7dd3fc' : '#475569', padding:'5px 14px', borderRadius:'20px', fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px' }}>{plan.name}</span>
                      <p style={{ fontSize:'2.2rem', fontWeight:800, color: i===2 ? 'white' : 'var(--ucc-navy)', margin:'16px 0 4px' }}>{plan.price}{plan.period && <span style={{ fontSize:'0.85rem', fontWeight:500, opacity:0.7 }}> {plan.period}</span>}</p>
                      <p style={{ color: i===2 ? 'rgba(255,255,255,0.6)' : '#94a3b8', fontSize:'0.85rem', margin:0 }}>{plan.note}</p>
                    </div>
                    <ul style={{ listStyle:'none', padding:0, margin:'0 0 28px' }}>
                      {plan.features.map(f => <li key={f.t} style={{ padding:'8px 0', color: f.ok ? (i===2 ? 'rgba(255,255,255,0.85)' : '#475569') : (i===2 ? 'rgba(255,255,255,0.3)' : '#cbd5e1'), display:'flex', alignItems:'center', gap:'10px', borderBottom: i===2 ? '1px solid rgba(255,255,255,0.08)' : '1px solid #f8fafc', fontSize:'0.9rem' }}><span style={{ color: f.ok ? (i===2 ? '#7dd3fc' : '#00A9E0') : (i===2 ? 'rgba(255,255,255,0.3)' : '#cbd5e1'), fontWeight:700 }}>{f.ok ? '✓' : '✗'}</span>{f.t}</li>)}
                    </ul>
                    <button style={{ width:'100%', padding:'14px', background: i===0 ? '#f1f5f9' : i===1 ? '#00A9E0' : 'white', color: i===0 ? '#94a3b8' : i===1 ? 'white' : 'var(--ucc-navy)', border:'none', borderRadius:'12px', fontWeight:800, cursor: i===0 ? 'default' : 'pointer', fontSize:'0.95rem' }} disabled={i===0}>{i===0 ? 'Plan Actual' : i===1 ? 'Adquirir Acceso →' : 'Suscribirme Ahora →'}</button>
                  </div>
                ))}
              </div>
              <p style={{ textAlign:'center', color:'#94a3b8', fontSize:'0.85rem', marginTop:'24px' }}>¿Eres egresado UCC? <a href='/registro' style={{ color:'#e53e3e', fontWeight:700, textDecoration:'none' }}>Regístrate gratis aquí</a></p>
            </div>
          )}

          {activeSection === 'cv' && (
            <div style={{ background:'white', borderRadius:'24px', padding:'50px 40px', boxShadow:'0 4px 20px rgba(0,0,0,0.05)', textAlign:'center' }}>
              <div style={{ width:'80px', height:'80px', borderRadius:'24px', background:'#eff6ff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2.5rem', margin:'0 auto 24px' }}>📄</div>
              <h2 style={{ color:'var(--ucc-navy)', fontWeight:800, fontSize:'1.6rem', marginBottom:'8px' }}>Tu Hoja de Vida</h2>
              <p style={{ color:'#64748b', marginBottom:'32px' }}>Sube tu CV en formato PDF para que las empresas puedan verlo</p>
              <div style={{ display:'flex', gap:'16px', justifyContent:'center', flexWrap:'wrap', marginBottom:'32px' }}>
                <button onClick={handleViewCV} style={{ padding:'14px 28px', background:'var(--ucc-navy)', color:'white', border:'none', borderRadius:'14px', fontWeight:700, cursor:'pointer', fontSize:'0.95rem' }}>📄 Ver CV Actual</button>
                <button onClick={() => cvRef.current?.click()} disabled={isUploading} style={{ padding:'14px 28px', background:'#e0f7ff', color:'#00A9E0', border:'1px solid #7dd3fc', borderRadius:'14px', fontWeight:700, cursor:'pointer', fontSize:'0.95rem' }}>{isUploading ? 'Subiendo...' : '⬆️ Subir Nuevo CV'}</button>
              </div>
              <div onClick={() => cvRef.current?.click()} style={{ border:'2px dashed #cbd5e1', padding:'40px', borderRadius:'20px', cursor:'pointer', transition:'all 0.2s' }} onMouseOver={e => (e.currentTarget.style.borderColor='var(--ucc-navy)')} onMouseOut={e => (e.currentTarget.style.borderColor='#cbd5e1')}>
                <p style={{ color:'#94a3b8', margin:0 }}>Arrastra tu PDF aquí o haz clic para seleccionarlo</p>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
