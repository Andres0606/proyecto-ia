const supabase = require('../config/supabase');

const applyToVacancy = async (req, res) => {
  try {
    const { userId, vacancyId } = req.body;
    if (!userId || !vacancyId) return res.status(400).json({ success: false, message: 'Faltan datos' });

    const { data: existing } = await supabase
      .from('postulaciones')
      .select('id').eq('user_id', userId).eq('vacante_id', vacancyId).maybeSingle();

    if (existing) return res.status(400).json({ success: false, message: 'Ya te has postulado.' });

    const { data: userData } = await supabase.from('users').select('cv_url, rol_id').eq('id', userId).maybeSingle();
    if (!userData) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    const rol = Number(userData?.rol_id);

    if (rol === 3 || rol === 4) return res.status(403).json({ success: false, message: 'No tienes permisos.' });

    if (rol === 2) {
      const { data: subData } = await supabase.from('suscripciones').select('tipo_plan').eq('user_id', userId).maybeSingle();
      if (!subData || subData.tipo_plan !== 'Plan Completo') {
        return res.status(403).json({ success: false, message: 'Plan insuficiente o suscripción no activa.' });
      }
    }

    const { data, error } = await supabase.from('postulaciones').insert([{
      user_id: userId, vacante_id: vacancyId, cv_url: userData?.cv_url, estado: 'postulado'
    }]).select();

    if (error) throw error;
    return res.status(201).json({ success: true, message: 'Postulación exitosa', application: data[0] });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const getUserApplications = async (req, res) => {
  const { userId } = req.params;
  const cleanUserId = String(userId).trim();
  
  console.log(`--- INICIO RECONSTRUCCIÓN: Postulaciones para [${cleanUserId}] ---`);

  try {
    // PASO 1: Obtener solo las IDs de las postulaciones
    console.log('1. Consultando tabla postulaciones...');
    const { data: rawApps, error: appsError } = await supabase
      .from('postulaciones')
      .select('*')
      .eq('user_id', cleanUserId);

    if (appsError) {
      console.error('❌ Error fatal en paso 1:', appsError);
      return res.status(500).json({ 
        success: false, 
        message: 'Error al conectar con la tabla de postulaciones',
        debug: appsError.message 
      });
    }

    if (!rawApps || rawApps.length === 0) {
      console.log('ℹ️ El usuario no tiene postulaciones registradas.');
      return res.status(200).json({ success: true, applications: [] });
    }

    console.log(`2. Se encontraron ${rawApps.length} registros. Buscando detalles de vacantes...`);

    // PASO 2: Obtener vacantes asociadas de forma segura
    const vacancyIds = rawApps.map(a => a.vacante_id).filter(id => id != null);
    let vacancies = [];
    
    if (vacancyIds.length > 0) {
      const { data: vData, error: vError } = await supabase
        .from('vacantes')
        .select('*')
        .in('id', vacancyIds);
      
      if (!vError && vData) vacancies = vData;
      else console.warn('⚠️ No se pudieron cargar los detalles de las vacantes:', vError?.message);
    }

    // PASO 3: Obtener empresas asociadas
    const empresaIds = vacancies.map(v => v.empresa_id).filter(id => id != null);
    let companies = [];
    
    if (empresaIds.length > 0) {
      const { data: cData, error: cError } = await supabase
        .from('empresas')
        .select('*')
        .in('id', empresaIds);
        
      if (!cError && cData) companies = cData;
    }

    // PASO 4: Ensamblaje Final (Reverse Engineering)
    console.log('3. Ensamblando respuesta final...');
    const formattedApps = rawApps.map(app => {
      // Buscar la vacante correspondiente
      const vacancy = vacancies.find(v => v.id === app.vacante_id) || null;
      
      // Buscar la empresa si hay vacante
      let company = null;
      if (vacancy) {
        company = companies.find(c => c.id === vacancy.empresa_id) || { razon_social: 'Empresa no disponible' };
      }

      return {
        ...app,
        vacantes: vacancy ? {
          ...vacancy,
          empresas: company
        } : { cargo: 'Vacante no disponible', empresas: { razon_social: 'UCC' } }
      };
    });

    console.log(`✅ ÉXITO: Enviando ${formattedApps.length} postulaciones ensambladas.`);
    return res.status(200).json({
      success: true,
      applications: formattedApps
    });

  } catch (error) {
    console.error('❌ ERROR CRÍTICO EN RECONSTRUCCIÓN:', error);
    return res.status(500).json({
      success: false,
      message: 'Fallo total en el ensamblaje de postulaciones',
      error: error.message
    });
  }
};

module.exports = { applyToVacancy, getUserApplications };