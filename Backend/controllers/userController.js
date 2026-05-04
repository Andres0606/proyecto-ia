const supabase = require('../config/supabase');

// Ruta de prueba
const healthCheck = (req, res) => {
  res.json({ status: 'ok', version: '1.0.2', message: 'Backend UCC Egresados funcionando 🚀' });
};

const registerUser = async (req, res) => {
  console.log('📥 Datos recibidos en el registro:', req.body);
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

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Autenticar con Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // 2. Traer información extra del perfil (opcional pero recomendado)
    const { data: profile } = await supabase
      .from('users')
      .select('*, roles(nombre)')
      .eq('id', data.user.id)
      .single();

    return res.status(200).json({
      success: true,
      message: 'Login exitoso.',
      session: data.session,
      user: {
        ...data.user,
        profile: profile
      }
    });

  } catch (error) {
    console.error('❌ Error en loginUser:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Credenciales inválidas o error en el servidor.',
      error: error.message
    });
  }
};

const getFullProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        perfiles_usuarios (*)
      `)
      .eq('id', userId)
      .single();

    if (error) throw error;

    // Mapeo inverso para el Frontend (Sincronización con Diagnóstico)
    if (data.perfiles_usuarios && data.perfiles_usuarios.length > 0) {
      const p = data.perfiles_usuarios[0];
      const estratoReverse = { 1: "Uno", 2: "Dos", 3: "Tres", 4: "Cuatro", 5: "Cinco", 6: "Seis" };
      const hijosReverse = { 0: "Cero", 1: "Uno", 2: "Dos", 3: "Tres", 4: "Cuatro", 5: "Cinco" };
      const ingresoReverse = { 1: "1 SML o menos", 2.5: "2-3 SML", 4: "3-5 SML", 6: "5 SML o mas" };

      p.estrato = estratoReverse[p.estrato] || p.estrato;
      p.numero_hijos = hijosReverse[p.numero_hijos] || p.numero_hijos;
      p.ingreso_mensual = ingresoReverse[p.ingreso_mensual] || p.ingreso_mensual;
      p.emprendimiento = p.emprendimiento ? "Si" : "No";
    }

    return res.status(200).json({ success: true, profile: data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { userData, profileData } = req.body;

    // 1. Mapeo de valores de texto a tipos de la BD (Sincronización con Diagnóstico)
    const estratoMap = { "Uno": 1, "Dos": 2, "Tres": 3, "Cuatro": 4, "Cinco": 5, "Seis": 6 };
    const hijosMap = { "Cero": 0, "Uno": 1, "Dos": 2, "Tres": 3, "Cuatro": 4, "Cinco": 5 };
    const ingresoMap = { "1 SML o menos": 1, "2-3 SML": 2.5, "3-5 SML": 4, "5 SML o mas": 6 };

    // 2. Actualizar tabla users
    const { error: userError } = await supabase
      .from('users')
      .update({ telefono: userData.telefono })
      .eq('id', userId);

    if (userError) throw userError;

    // 3. Preparar datos para perfiles_usuarios
    const dbProfileData = {
      user_id: userId,
      nivel_formacion: profileData.nivel_formacion,
      programa_academico: profileData.programa_academico,
      estrato: estratoMap[profileData.estrato] || null,
      estado_civil: profileData.estado_civil,
      numero_hijos: hijosMap[profileData.numero_hijos] || 0,
      ingreso_mensual: ingresoMap[profileData.ingreso_mensual] || null,
      sector_economico: profileData.sector_economico,
      area_desempeno: profileData.area_desempeno,
      emprendimiento: profileData.emprendimiento === 'Si'
    };

    const { error: profileError } = await supabase
      .from('perfiles_usuarios')
      .upsert(dbProfileData, { onConflict: 'user_id' });

    if (profileError) throw profileError;

    return res.status(200).json({ success: true, message: 'Perfil actualizado con éxito.' });
  } catch (error) {
    console.error("❌ Error actualizando perfil:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { registerUser, loginUser, getFullProfile, updateProfile };
