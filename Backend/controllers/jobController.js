const supabase = require('../config/supabase');

const createVacancy = async (req, res) => {
  try {
    let { 
      userId, cargo, area_desempeno, programa_requerido, 
      nivel_formacion, salario, tipo_contrato, 
      duracion_contrato, modalidad, ubicacion, descripcion 
    } = req.body;

    if (!userId) return res.status(400).json({ success: false, message: 'userId es requerido' });
    
    // Limpieza de ID
    const cleanId = String(userId).trim().split(':')[0];

    // 1. Obtener el empresa_id basado en el user_id
    const { data: empresa, error: empError } = await supabase
      .from('empresas')
      .select('id')
      .eq('user_id', cleanId)
      .single();

    if (empError || !empresa) {
      console.error('Error buscando empresa para userId:', cleanId, empError);
      return res.status(404).json({ success: false, message: 'No se encontró la empresa asociada al usuario. Por favor completa tu perfil de empresa.' });
    }

    const empresa_id = empresa.id;

    // 2. Insertar la vacante con estado 'activa' por defecto
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
        estado: 'activa' // Estado inicial
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
    const { data, error } = await supabase
      .from('vacantes')
      .select(`
        *,
        empresas (
          razon_social,
          ciudad,
          nit,
          user_id
        )
      `)
      .or('estado.eq.activa,estado.is.null')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error Supabase getVacancies:', error);
      return res.status(500).json({ success: false, message: 'Error al consultar vacantes' });
    }

    console.log(`📊 Bolsa de Empleo: Se encontraron ${data.length} vacantes potenciales.`);

    // Procesar vacantes de forma segura
    const vacanciesWithLogos = await Promise.all(data.map(async (v) => {
      let empresa_logo = null;
      
      // Solo buscar logo si la empresa existe y tiene user_id
      if (v.empresas && v.empresas.user_id) {
        const { data: userData } = await supabase
          .from('users')
          .select('foto_url')
          .eq('id', v.empresas.user_id)
          .single();
        
        empresa_logo = userData?.foto_url || null;
      }
      
      return { 
        ...v, 
        empresa_logo,
        // Asegurar que empresas no sea null para evitar errores en el frontend
        empresas: v.empresas || { razon_social: 'Empresa UCC', ciudad: 'No definida' }
      };
    }));

    return res.status(200).json({ success: true, vacancies: vacanciesWithLogos });
  } catch (error) {
    console.error('❌ Error crítico al obtener vacantes:', error);
    return res.status(500).json({ success: false, message: 'Error interno al cargar la bolsa de empleo' });
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
    const { estado } = req.body; // 'activa' o 'inactiva'

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
