const supabase = require('../config/supabase');

const applyToVacancy = async (req, res) => {
  try {
    const { userId, vacancyId } = req.body;
    if (!userId || !vacancyId) return res.status(400).json({ success: false, message: 'Faltan datos' });

    const { data: existing } = await supabase
      .from('postulaciones')
      .select('id').eq('user_id', userId).eq('vacante_id', vacancyId).single();

    if (existing) return res.status(400).json({ success: false, message: 'Ya te has postulado.' });

    const { data: userData } = await supabase.from('users').select('cv_url, rol_id').eq('id', userId).single();
    const rol = Number(userData?.rol_id);

    if (rol === 3 || rol === 4) return res.status(403).json({ success: false, message: 'No tienes permisos.' });

    if (rol === 2) {
      const { data: subData } = await supabase.from('suscripciones').select('tipo_plan').eq('user_id', userId).single();
      if (!subData || subData.tipo_plan !== 'Plan Completo') {
        return res.status(403).json({ success: false, message: 'Plan insuficiente.' });
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
    console.log(`📂 Buscando postulaciones para UserID: [${userId}]`);

    // Intentar con join completo primero
    const { data, error } = await supabase
      .from('postulaciones')
      .select(`
        id,
        estado,
        fecha_postulacion,
        cv_url,
        vacante_id,
        vacantes (
          id,
          cargo,
          modalidad,
          empresas (
            razon_social
          )
        )
      `)
      .eq('user_id', userId)
      .order('fecha_postulacion', { ascending: false });

    if (error) {
      console.error('❌ Error con join:', error.message);
      // Fallback: query simple sin join
      const { data: simple, error: err2 } = await supabase
        .from('postulaciones')
        .select('id, estado, fecha_postulacion, cv_url, vacante_id')
        .eq('user_id', userId)
        .order('fecha_postulacion', { ascending: false });

      if (err2) {
        console.error('❌ Error fallback:', err2.message);
        return res.status(500).json({ success: false, message: err2.message });
      }
      return res.status(200).json({ success: true, applications: simple || [] });
    }

    return res.status(200).json({ success: true, applications: data || [] });
  } catch (error) {
    console.error('❌ Error inesperado getUserApplications:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { applyToVacancy, getUserApplications };
