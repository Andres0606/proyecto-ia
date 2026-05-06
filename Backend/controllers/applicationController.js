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

    console.log(`🔍 [PROCESO SEGURO] Buscando postulaciones para: ${cleanId}`);

    // Paso 1: Obtener postulaciones base
    const { data: apps, error: appsError } = await supabase
      .from('postulaciones')
      .select('*')
      .eq('user_id', cleanId);

    if (appsError) throw appsError;
    if (!apps || apps.length === 0) return res.status(200).json({ success: true, applications: [] });

    // Paso 2: Obtener vacantes asociadas
    const vacIds = [...new Set(apps.map(a => a.vacante_id))];
    const { data: vacs, error: vacError } = await supabase
      .from('vacantes')
      .select('*')
      .in('id', vacIds);

    if (vacError) console.error('Error vacantes:', vacError);

    // Paso 3: Obtener empresas asociadas
    const empIds = [...new Set(vacs?.map(v => v.empresa_id).filter(Boolean) || [])];
    const { data: emps, error: empError } = await supabase
      .from('empresas')
      .select('*')
      .in('id', empIds);

    if (empError) console.error('Error empresas:', empError);

    // Paso 4: Ensamblaje Manual (Cero dependencias de Joins)
    const result = apps.map(app => {
      const v = vacs?.find(x => x.id === app.vacante_id);
      const e = emps?.find(y => y.id === v?.empresa_id);
      return {
        id: app.id,
        vacante_nombre: v?.cargo || 'Vacante no disponible',
        empresa_nombre: e?.razon_social || 'UCC / Empresa externa',
        ubicacion: v?.ubicacion || 'Remoto',
        fecha: app.fecha_postulacion,
        estado: app.estado
      };
    });

    console.log(`✅ [PROCESO SEGURO] Éxito: ${result.length} encontradas.`);
    return res.status(200).json({ success: true, applications: result });

  } catch (err) {
    console.error('❌ Error Crítico en getUserApplications:', err);
    return res.status(500).json({ success: false, message: 'Error interno al procesar postulaciones' });
  }
};

module.exports = { applyToVacancy, getUserApplications };