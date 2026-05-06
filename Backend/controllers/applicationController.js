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
  try {
    const { userId } = req.params;
    const cleanUserId = String(userId).trim();
    console.log(`📂 Buscando postulaciones para UserID: [${cleanUserId}]`);

    // 1. Obtener las postulaciones base
    const { data: apps, error: appsError } = await supabase
      .from('postulaciones')
      .select('*')
      .eq('user_id', cleanUserId)
      .order('fecha_postulacion', { ascending: false });

    if (appsError) {
      console.error('❌ Error en appsError:', appsError);
      return res.status(500).json({ success: false, message: appsError.message, code: appsError.code });
    }

    if (!apps || apps.length === 0) return res.status(200).json({ success: true, applications: [] });

    // 2. Obtener los IDs de las vacantes
    const vacancyIds = [...new Set(apps.map(a => a.vacante_id))];

    // 3. Obtener los detalles de las vacantes
    const { data: vacancies, error: vacError } = await supabase
      .from('vacantes')
      .select('*, empresas(*)')
      .in('id', vacancyIds);

    // 4. Combinar los datos (Aun si vacError, enviamos lo que tenemos)
    const fullApps = apps.map(app => {
      const vacancy = vacancies?.find(v => v.id === app.vacante_id);
      return {
        ...app,
        vacantes: vacancy || null
      };
    });

    return res.status(200).json({ success: true, applications: fullApps });
  } catch (error) {
    console.error('❌ Error crítico en getUserApplications:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { applyToVacancy, getUserApplications };
