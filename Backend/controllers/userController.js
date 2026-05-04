const supabase = require('../config/supabase');

const registerUser = async (req, res) => {
  const { id, nombre_completo, correo, telefono, rol_id } = req.body;

  try {
    // Insertamos directamente en la tabla 'users' de la DB pública
    const { data, error } = await supabase
      .from('users')
      .insert([
        { id, nombre_completo, correo, telefono, rol_id }
      ])
      .select();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: 'Perfil de usuario creado correctamente en la base de datos.',
      data
    });
  } catch (error) {
    console.error('❌ Error en registerUser:', error.message);
    return res.status(500).json({
      success: false,
      message: 'No se pudo crear el perfil en la base de datos.',
      error: error.message
    });
  }
};

module.exports = {
  registerUser
};
