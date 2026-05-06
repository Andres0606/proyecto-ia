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
      user_metadata: { full_name: nombre_completo, role: rol_id === 3 ? 'empresa' : rol_id === 2 ? 'externo' : 'egresado' }
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
    else if (rol_id === 3) { // Empresa
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
    else if (rol_id === 2) { // Externo
      // Los externos por ahora solo van en la tabla users general
      // pero podríamos insertar algo en perfiles_usuarios si fuera necesario
    }

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado y perfil creado con éxito.'
    });

  } catch (error) {
    console.error('❌ ERROR DETALLADO EN REGISTRO:', error);
    
    let userMessage = 'No se pudo completar el registro.';
    if (error.message?.includes('users_correo_key')) userMessage = 'El correo electrónico ya está registrado.';
    if (error.message?.includes('empresas_nit_key')) userMessage = 'El NIT ingresado ya pertenece a otra empresa.';
    if (error.code === '23505') userMessage = 'Ya existe un registro con esos datos únicos (Email o NIT).';

    return res.status(500).json({
      success: false,
      message: userMessage,
      error: error.message,
      detail: error.details || error.hint || null
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

    // 2. Traer información extra del perfil
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error('⚠️ Error al obtener perfil en login:', profileError.message);
    }

    const { data: subscription } = await supabase
      .from('suscripciones')
      .select('*')
      .eq('user_id', data.user.id)
      .single();

    return res.status(200).json({
      success: true,
      message: 'Login exitoso.',
      session: data.session,
      user: {
        ...data.user,
        profile: {
          ...profile,
          suscripcion: subscription || null
        }
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
    const cleanUserId = String(userId).trim();
    console.log('🔍 Iniciando recuperación de perfil para:', cleanUserId);

    // PASO 1: Obtener el usuario base
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', cleanUserId)
      .single();

    if (userError || !user) {
      console.error('❌ Error obteniendo usuario:', userError?.message);
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    // PASO 2: Obtener el perfil profesional o de empresa
    const { data: profileEntries } = await supabase
      .from('perfiles_usuarios')
      .select('*')
      .eq('user_id', cleanUserId);

    const { data: companyData } = await supabase
      .from('empresas')
      .select('*')
      .eq('user_id', cleanUserId)
      .single();

    // Usamos maybeSingle() para evitar que lance error si no hay registro
    const { data: subscription } = await supabase
      .from('suscripciones')
      .select('*')
      .eq('user_id', cleanUserId)
      .maybeSingle();

    // Unir los datos
    const profileData = {
      ...user,
      perfiles_usuarios: profileEntries || [],
      empresa: companyData || null,
      suscripcion: subscription || null
    };

    // Mapeo inverso (Sincronización con Diagnóstico)
    if (profileData.perfiles_usuarios.length > 0) {
      const p = profileData.perfiles_usuarios[0];
      const estratoReverse = { 1: "Uno", 2: "Dos", 3: "Tres", 4: "Cuatro", 5: "Cinco", 6: "Seis" };
      const hijosReverse = { 0: "Cero", 1: "Uno", 2: "Dos", 3: "Tres", 4: "Cuatro", 5: "Cinco" };
      const ingresoReverse = { 1: "1 SML o menos", 2.5: "2-3 SML", 4: "3-5 SML", 6: "5 SML o mas" };

      if (p.estrato !== null) p.estrato = estratoReverse[p.estrato] || String(p.estrato);
      if (p.numero_hijos !== null) p.numero_hijos = hijosReverse[p.numero_hijos] || String(p.numero_hijos);
      if (p.ingreso_mensual !== null) p.ingreso_mensual = ingresoReverse[p.ingreso_mensual] || String(p.ingreso_mensual);

      if (typeof p.emprendimiento === 'boolean') {
        p.emprendimiento = p.emprendimiento ? "Si" : "No";
      }

      console.log('✅ Datos profesionales encontrados y mapeados:', p);
    }

    return res.status(200).json({ success: true, profile: profileData });
  } catch (error) {
    console.error('❌ Error crítico en getFullProfile:', error.message);
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
      .update({
        nombre_completo: userData.nombre_completo,
        correo: userData.correo,
        telefono: userData.telefono,
        fecha_nacimiento: userData.fecha_nacimiento,
        genero: userData.genero
      })
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
      .upsert(dbProfileData, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      });

    if (profileError) {
      console.error("❌ Error de Supabase (perfiles_usuarios):", profileError);
      return res.status(400).json({
        success: false,
        message: `Error en tabla perfiles_usuarios: ${profileError.message}`,
        details: profileError.details
      });
    }

    return res.status(200).json({ success: true, message: 'Perfil actualizado con éxito.' });
  } catch (error) {
    console.error("❌ Error crítico en updateProfile:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const subscribe = async (req, res) => {
  try {
    let { userId, planType } = req.body;
    if (!userId || !planType) return res.status(400).json({ success: false, message: 'userId y planType son requeridos' });

    // Limpiar el ID por si viene con espacios
    userId = String(userId).trim();

    const fecha_inicio = new Date().toISOString().split('T')[0];
    let fecha_fin = null;
    let estado = 'activo';

    if (planType === 'Plan Completo') {
      const date = new Date();
      date.setDate(date.getDate() + 30);
      fecha_fin = date.toISOString().split('T')[0];
    }

    console.log(`💳 Procesando suscripción: Usuario [${userId}] -> Plan [${planType}]`);

    const { error } = await supabase
      .from('suscripciones')
      .upsert({
        user_id: userId,
        tipo_plan: planType,
        fecha_inicio,
        fecha_fin,
        estado
      }, { onConflict: 'user_id' });

    if (error) {
      console.error("❌ ERROR DETALLADO EN SUSCRIPCIÓN:", JSON.stringify(error, null, 2));
      return res.status(500).json({ 
        success: false, 
        message: 'Error en la base de datos al procesar suscripción', 
        error: error.message,
        hint: error.hint
      });
    }

    return res.status(200).json({ success: true, message: `Suscripción al ${planType} exitosa` });
  } catch (error) {
    console.error("❌ Error crítico en subscribe:", error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
  }
};

const updatePlan = async (req, res) => {
  try {
    let { userId, tipoPlan, planType, tipo_plan } = req.body;
    const finalPlan = tipoPlan || planType || tipo_plan;
    
    if (!userId || !finalPlan) {
      return res.status(400).json({ success: false, message: 'ID de usuario y Plan son obligatorios' });
    }

    // 1. Limpieza absoluta del ID
    const cleanUserId = String(userId).trim();

    // 2. VERIFICACIÓN: ¿Existe el usuario en la tabla public.users?
    const { data: userExists, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', cleanUserId)
      .maybeSingle();

    if (userError || !userExists) {
      console.error("❌ El usuario no existe en la tabla public.users:", cleanUserId);
      return res.status(404).json({ 
        success: false, 
        message: 'No se puede actualizar el plan: El usuario no existe en la base de datos pública.',
        error: userError?.message 
      });
    }

    const fecha_inicio = new Date().toISOString().split('T')[0];
    let fecha_fin = null;
    if (finalPlan === 'Plan Completo') {
      const date = new Date();
      date.setDate(date.getDate() + 30);
      fecha_fin = date.toISOString().split('T')[0];
    }

    // 3. OPERACIÓN DE BD: Crear o Actualizar Suscripción
    console.log(`💾 Intentando escribir en suscripciones para: ${cleanUserId} con plan: ${finalPlan}`);
    
    const { data: subData, error: subError } = await supabase
      .from('suscripciones')
      .upsert({
        user_id: cleanUserId,
        tipo_plan: finalPlan,
        fecha_inicio: fecha_inicio,
        fecha_fin: fecha_fin,
        estado: 'activo' // Aseguramos que el estado siempre sea activo al actualizar
      }, { onConflict: 'user_id' });

    if (subError) {
      console.error("❌ ERROR ESPECÍFICO DE SUPABASE:", subError);
      return res.status(500).json({ 
        success: false, 
        message: 'Error al escribir en la base de datos de suscripciones', 
        error: subError.message,
        details: subError.details
      });
    }

    console.log("✅ OPERACIÓN EXITOSA");
    return res.status(200).json({ 
      success: true, 
      message: `Plan ${finalPlan} actualizado con éxito.`,
    });

  } catch (error) {
    console.error("❌ ERROR CRÍTICO NO CONTROLADO:", error);
    return res.status(500).json({ 
      success: false, 
      message: 'Fallo crítico en el servidor', 
      error: error.message 
    });
  }
};

module.exports = { registerUser, loginUser, getFullProfile, updateProfile, subscribe, updatePlan };
