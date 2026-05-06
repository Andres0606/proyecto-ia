const supabase = require('../config/supabase');

const applyToVacancy = async (req, res) => {
  try {
    const { userId, vacancyId } = req.body;

    if (!userId || !vacancyId) {
      return res.status(400).json({ success: false, message: 'Faltan datos obligatorios' });
    }

    // 1. Verificar si el usuario ya se postuló
    const { data: existing } = await supabase
      .from('postulaciones')
      .select('id')
      .eq('user_id', userId)
      .eq('vacante_id', vacancyId)
      .single();

    if (existing) {
      return res.status(400).json({ success: false, message: 'Ya te has postulado a esta vacante anteriormente.' });
    }

    // 2. Obtener la Hoja de Vida del usuario
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('cv_url, rol_id')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    // 3. Validar reglas de negocio (Rol y Plan)
    const rol = Number(userData.rol_id);
    
    // Empresas y Admins no pueden postularse
    if (rol === 3 || rol === 4) {
      return res.status(403).json({ success: false, message: 'Tu cuenta no tiene permisos para postularse a vacantes.' });
    }

    // SI ES EXTERNO (Rol 2), DEBE TENER PLAN COMPLETO
    if (rol === 2) {
      const { data: subData } = await supabase
        .from('suscripciones')
        .select('tipo_plan')
        .eq('user_id', userId)
        .single();

      if (!subData || subData.tipo_plan !== 'Plan Completo') {
        return res.status(403).json({ 
          success: false, 
          message: 'Tu plan actual no permite postulaciones. Adquiere el "Plan Completo" para continuar.' 
        });
      }
    }

    // 4. Crear la postulación
    const { data, error } = await supabase
      .from('postulaciones')
      .insert([{
        user_id: userId,
        vacante_id: vacancyId,
        cv_url: userData.cv_url,
        estado: 'postulado'
      }])
      .select();

    if (error) throw error;

    return res.status(201).json({ 
      success: true, 
      message: '¡Postulación exitosa! La empresa revisará tu perfil pronto.', 
      application: data[0] 
    });

  } catch (error) {
    console.error('❌ Error en postulación:', error);
    return res.status(500).json({ success: false, message: 'Error interno al procesar la postulación', error: error.message });
  }
};

const getUserApplications = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`📂 Buscando postulaciones para UserID: [${userId}]`);
    
    const { data, error } = await supabase
      .from('postulaciones')
// ...
      .select(`
        *,
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

    if (error) throw error;

    return res.status(200).json({ success: true, applications: data });
  } catch (error) {
    console.error('❌ Error al obtener postulaciones:', error);
    return res.status(500).json({ success: false, message: 'Error al obtener historial de postulaciones' });
  }
};

module.exports = { applyToVacancy, getUserApplications };
