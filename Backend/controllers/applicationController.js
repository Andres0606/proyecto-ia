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

    // Usamos un join de Supabase para obtener todo en una sola consulta
    // '*, vacantes(*, empresas(*))' trae la postulación, su vacante y la empresa de esa vacante
    const { data: apps, error: appsError } = await supabase
      .from('postulaciones')
      .select('*, vacantes:vacante_id(*, empresas:empresa_id(*))')
      .eq('user_id', cleanUserId)
      .order('fecha_postulacion', { ascending: false });

    if (appsError) {
      console.error('❌ Error en consulta join de postulaciones:', appsError);
      return res.status(500).json({ success: false, message: appsError.message, code: appsError.code });
    }

    if (!apps) return res.status(200).json({ success: true, applications: [] });

    console.log(`✅ Se encontraron ${apps.length} postulaciones para el usuario [${cleanUserId}].`);
    return res.status(200).json({ success: true, applications: apps });
  } catch (error) {
    console.error('❌ Error crítico en getUserApplications:', error);
    return res.status(500).json({ success: false, message: error.message || 'Error interno del servidor' });
  }
};

module.exports = { applyToVacancy, getUserApplications };
