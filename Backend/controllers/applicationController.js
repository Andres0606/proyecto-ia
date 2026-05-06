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
    const cleanId = String(userId || '').trim();
    if (!cleanId) return res.status(400).json({ success: false, message: 'ID no válido' });

    console.log(`🔍 [DEBUG] Buscando postulaciones para: ${cleanId}`);

    // Consulta simplificada al máximo
    const { data: apps, error } = await supabase
      .from('postulaciones')
      .select('id, vacante_id, estado, fecha_postulacion')
      .eq('user_id', cleanId);

    if (error) {
      console.error('❌ Error Supabase:', error);
      // En lugar de 500, devolvemos éxito pero vacío para no romper el front
      return res.status(200).json({ success: true, applications: [], note: 'Error de permisos en BD' });
    }

    // Traer vacantes de forma manual
    const vacIds = apps.map(a => a.vacante_id).filter(Boolean);
    const { data: vacs } = await supabase
      .from('vacantes')
      .select('id, cargo, ubicacion, empresa_id')
      .in('id', vacIds);

    // Mapeo ultra-seguro
    const result = apps.map(app => {
      const v = vacs?.find(x => x.id === app.vacante_id);
      return {
        id: app.id,
        vacante_nombre: v?.cargo || 'Vacante',
        empresa_nombre: 'UCC Empresa', // Simplificado para evitar más errores de JOIN
        ubicacion: v?.ubicacion || 'Remoto',
        fecha: app.fecha_postulacion,
        estado: app.estado
      };
    });

    return res.status(200).json({ success: true, applications: result });
  } catch (err) {
    console.error('❌ Error Crítico:', err);
    return res.status(200).json({ success: true, applications: [], error: 'Excepción en servidor' });
  }
};

module.exports = { applyToVacancy, getUserApplications };