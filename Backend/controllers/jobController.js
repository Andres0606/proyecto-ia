const supabase = require('../config/supabase');

const createVacancy = async (req, res) => {
  try {
    let {
      userId, cargo, area_desempeno, programa_requerido,
      nivel_formacion, salario, tipo_contrato,
      duracion_contrato, modalidad, ubicacion, descripcion,
      numero_vacantes
    } = req.body;

    if (!userId) return res.status(400).json({ success: false, message: 'userId es requerido' });

    const cleanId = String(userId).trim().split(':')[0];

    const { data: empresa, error: empError } = await supabase
      .from('empresas')
      .select('id')
      .eq('user_id', cleanId)
      .single();

    if (empError || !empresa) {
      console.error('Error buscando empresa para userId:', cleanId, empError);
      return res.status(404).json({ success: false, message: 'No se encontró la empresa asociada al usuario.' });
    }

    const empresa_id = empresa.id;

    const { data, error } = await supabase
      .from('vacantes')
      .insert([{
        empresa_id,
        cargo,
        area_desempeno,
        programa_requerido,
        nivel_formacion,
        salario: salario ? parseFloat(salario) : null,
        tipo_contrato,
        duracion_contrato,
        modalidad,
        ubicacion,
        descripcion,
        numero_vacantes: parseInt(numero_vacantes) || 1,
        estado: 'activa'
      }])
      .select();


    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: 'Vacante publicada con éxito',
      vacancy: data[0]
    });
  } catch (error) {
    console.error('❌ Error al crear vacante:', error);
    return res.status(500).json({ success: false, message: 'Error al publicar vacante', error: error.message });
  }
};

const getVacancies = async (req, res) => {
  try {
    console.log('📡 [SISTEMA] Iniciando carga de bolsa de empleo...');

    // 1. Obtener vacantes básicas
    const { data: vacancies, error } = await supabase
      .from('vacantes')
      .select('*')
      .or('estado.eq.activa,estado.is.null')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error Supabase al traer vacantes:', error);
      return res.status(200).json({ success: true, vacancies: [], message: 'Error de BD' });
    }

    if (!vacancies || vacancies.length === 0) {
      return res.status(200).json({ success: true, vacancies: [] });
    }

    // 2. Obtener empresas y sus logos en bloque para evitar consultas repetitivas
    const empresaIds = [...new Set(vacancies.map(v => v.empresa_id).filter(Boolean))];
    let empsMap = new Map();
    if (empresaIds.length > 0) {
      try {
        // Obtenemos datos básicos de la empresa y el user_id para buscar el logo
        const { data: emps } = await supabase.from('empresas').select('id, razon_social, ciudad, user_id').in('id', empresaIds);
        
        if (emps) {
          const userIds = emps.map(e => e.user_id).filter(Boolean);
          // Obtenemos los logos de la tabla users
          const { data: users } = await supabase.from('users').select('id, foto_url').in('id', userIds);
          
          const userLogosMap = new Map();
          if (users) users.forEach(u => userLogosMap.set(u.id, u.foto_url));
          
          emps.forEach(e => {
            empsMap.set(e.id, {
              ...e,
              logo: userLogosMap.get(e.user_id) || null
            });
          });
        }
      } catch (e) { console.error('Error cargando empresas/logos:', e); }
    }

    // 3. Procesamiento defensivo uno a uno
    const processed = vacancies.map(v => {
      try {
        const empresa = empsMap.get(v.empresa_id) || {};
        return {
          ...v,
          empresa_logo: empresa.logo || null, 
          empresas: {
            razon_social: empresa.razon_social || 'Empresa UCC',
            ciudad: empresa.ciudad || 'Colombia'
          }
        };
      } catch (innerErr) {
        console.error('Error procesando vacante individual:', v.id, innerErr);
        return {
          ...v,
          empresas: { razon_social: 'Empresa UCC', ciudad: 'Colombia' }
        };
      }
    });

    console.log(`✅ [SISTEMA] Bolsa cargada: ${processed.length} vacantes.`);
    return res.status(200).json({ success: true, vacancies: processed });

  } catch (error) {
    console.error('❌ ERROR CRÍTICO EN BOLSA:', error);
    return res.status(200).json({ success: true, vacancies: [], error: 'Fallback activado' });
  }
};

const getMyVacancies = async (req, res) => {
  try {
    const { userId } = req.params;
    const cleanId = String(userId).trim().split(':')[0];

    const { data: empresa } = await supabase
      .from('empresas')
      .select('id')
      .eq('user_id', cleanId)
      .single();

    if (!empresa) return res.status(404).json({ success: false, message: 'Empresa no encontrada' });

    const { data, error } = await supabase
      .from('vacantes')
      .select('*')
      .eq('empresa_id', empresa.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json({ success: true, vacancies: data });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const toggleVacancyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const { data, error } = await supabase
      .from('vacantes')
      .update({ estado })
      .eq('id', id)
      .select();

    if (error) throw error;

    return res.status(200).json({ success: true, vacancy: data[0] });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const deleteVacancy = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('vacantes')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return res.status(200).json({ success: true, message: 'Vacante eliminada' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { createVacancy, getVacancies, getMyVacancies, toggleVacancyStatus, deleteVacancy };