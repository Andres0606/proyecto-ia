const supabase = require('../config/supabase');

const createVacancy = async (req, res) => {
  try {
    const { 
      userId, cargo, area_desempeno, programa_requerido, 
      nivel_formacion, salario, tipo_contrato, 
      duracion_contrato, modalidad, ubicacion, descripcion 
    } = req.body;

    if (!userId) return res.status(400).json({ success: false, message: 'userId es requerido' });

    // 1. Obtener el empresa_id basado en el user_id
    const { data: empresa, error: empError } = await supabase
      .from('empresas')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (empError || !empresa) {
      console.error('Error buscando empresa:', empError);
      return res.status(404).json({ success: false, message: 'No se encontró la empresa asociada al usuario' });
    }

    const empresa_id = empresa.id;

    // 2. Insertar la vacante
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
        descripcion
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
    // Traemos las vacantes junto con la información de la empresa
    const { data, error } = await supabase
      .from('vacantes')
      .select(`
        *,
        empresas (
          razon_social,
          ciudad,
          nit
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Obtener también la URL de la foto de cada empresa (desde la tabla users vinculada)
    // Esto es opcional pero mejora mucho la visualización
    const vacanciesWithLogos = await Promise.all(data.map(async (v) => {
      const { data: userData } = await supabase
        .from('users')
        .select('foto_url')
        .eq('id', v.empresas.user_id) // Asumiendo que empresas tiene user_id como FK
        .single();
      
      return { ...v, empresa_logo: userData?.foto_url || null };
    }));

    return res.status(200).json({ success: true, vacancies: vacanciesWithLogos });
  } catch (error) {
    console.error('❌ Error al obtener vacantes:', error);
    return res.status(500).json({ success: false, message: 'Error al obtener vacantes', error: error.message });
  }
};

module.exports = { createVacancy, getVacancies };
