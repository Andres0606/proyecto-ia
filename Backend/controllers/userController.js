const supabase = require('../config/supabase');

const registerUser = async (req, res) => {
  const { id, nombre_completo, correo, telefono, rol_id, extraData } = req.body;

  try {
    // 1. Insertar en la tabla 'users'
    const { error: userError } = await supabase
      .from('users')
      .insert([{ id, nombre_completo, correo, telefono, rol_id }]);

    if (userError) throw userError;

    // 2. Insertar en tabla específica según el rol
    if (rol_id === 1) { // Egresado
      const { error: profileError } = await supabase
        .from('perfiles_usuarios')
        .insert([{
          user_id: id,
          nivel_formacion: extraData.nivel_formacion,
          programa_academico: extraData.programa_academico,
          estrato: parseInt(extraData.estrato),
          estado_civil: extraData.estado_civil,
          numero_hijos: parseInt(extraData.numero_hijos),
          ingreso_mensual: parseFloat(extraData.ingreso_mensual),
          sector_economico: extraData.sector_economico,
          area_desempeno: extraData.area_desempeno,
          emprendimiento: extraData.emprendimiento === 'si'
        }]);
      if (profileError) throw profileError;
    } 
    else if (rol_id === 2) { // Empresa
      const { error: companyError } = await supabase
        .from('empresas')
        .insert([{
          user_id: id,
          razon_social: extraData.razon_social,
          nit: extraData.nit,
          sector_economico: extraData.sector_economico,
          tamano_empresa: extraData.tamano_empresa,
          tipo_empresa: extraData.tipo_empresa,
          ciudad: extraData.ciudad,
          correo: correo,
          telefono: telefono
        }]);
      if (companyError) throw companyError;
    }

    return res.status(201).json({
      success: true,
      message: 'Usuario y perfil creados correctamente.'
    });

  } catch (error) {
    console.error('❌ Error en registerUser:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Error al procesar el registro.',
      error: error.message
    });
  }
};

module.exports = { registerUser };
