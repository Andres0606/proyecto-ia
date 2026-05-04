const supabase = require('../config/supabase');

const registerUser = async (req, res) => {
  const { email, password, nombre_completo, telefono, rol_id, extraData, cedula, fecha_nacimiento, genero } = req.body;

  try {
    // 1. Crear el usuario en Supabase Auth usando el ADMIN SDK (service_role)
    // Esto evita que el usuario tenga que confirmar email si no quieres
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Lo marcamos como confirmado automáticamente
      user_metadata: { full_name: nombre_completo, role: rol_id === 2 ? 'empresa' : 'egresado' }
    });

    if (authError) throw authError;

    const userId = authData.user.id;

    // 2. Insertar en la tabla 'public.users'
    const { error: userError } = await supabase
      .from('users')
      .insert([{ 
        id: userId, 
        nombre_completo, 
        correo: email, 
        telefono, 
        cedula,
        fecha_nacimiento,
        genero,
        rol_id 
      }]);

    if (userError) throw userError;

    // 3. Insertar en tabla específica según el rol
    if (rol_id === 1) { // Egresado
      const { error: profileError } = await supabase
        .from('perfiles_usuarios')
        .insert([{
          user_id: userId,
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
          user_id: userId,
          razon_social: extraData.razon_social,
          nit: extraData.nit,
          sector_economico: extraData.sector_economico,
          tamano_empresa: extraData.tamano_empresa,
          tipo_empresa: extraData.tipo_empresa,
          ciudad: extraData.ciudad,
          correo: email,
          telefono: telefono
        }]);
      if (companyError) throw companyError;
    }

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado y perfil creado con éxito.'
    });

  } catch (error) {
    console.error('❌ Error en registerUser:', error.message);
    return res.status(500).json({
      success: false,
      message: 'No se pudo completar el registro.',
      error: error.message
    });
  }
};

module.exports = { registerUser };
