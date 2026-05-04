const supabase = require('../config/supabase');

const uploadProfileImage = async (req, res) => {
  try {
    const { userId } = req.body;
    const file = req.file;

    console.log(`🚀 Iniciando subida de foto para usuario: ${userId}`);

    if (!file) {
      return res.status(400).json({ success: false, message: 'No se recibió ningún archivo en la petición.' });
    }

    // 1. Subir a Supabase Storage
    const fileName = `${userId}/${Date.now()}-${file.originalname}`;
    console.log(`📤 Subiendo archivo a Storage: ${fileName}`);
    
    const { data, error } = await supabase.storage
      .from('fotos-perfil')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (error) {
      console.error('❌ Error de Supabase Storage:', error);
      throw new Error(`Error en Storage: ${error.message}`);
    }

    // 2. Obtener la URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('fotos-perfil')
      .getPublicUrl(fileName);

    // 3. Actualizar el usuario en la tabla 'users'
    console.log(`💾 Actualizando tabla users con URL: ${publicUrl}`);
    const { error: updateError } = await supabase
      .from('users')
      .update({ foto_url: publicUrl })
      .eq('id', userId);

    if (updateError) {
      console.error('❌ Error al actualizar tabla users:', updateError);
      throw new Error(`Error en DB: ${updateError.message}. ¿Creaste la columna foto_url?`);
    }

    return res.status(200).json({
      success: true,
      message: 'Foto de perfil actualizada con éxito.',
      url: publicUrl
    });

  } catch (error) {
    console.error('💥 Error fatal en uploadProfileImage:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const uploadResume = async (req, res) => {
  try {
    const { userId } = req.body;
    const file = req.file;

    console.log(`🚀 Iniciando subida de CV para usuario: ${userId}`);

    if (!file) {
      return res.status(400).json({ success: false, message: 'No se recibió el archivo del CV.' });
    }

    // 1. Subir a Supabase Storage (Bucket privado)
    const fileName = `${userId}/${Date.now()}-cv.pdf`;
    console.log(`📤 Subiendo CV a Storage: ${fileName}`);

    const { data, error } = await supabase.storage
      .from('hojas-de-vida')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (error) {
      console.error('❌ Error de Supabase Storage (CV):', error);
      throw new Error(`Error en Storage CV: ${error.message}`);
    }

    // 2. Guardar la RUTA en la tabla 'users'
    console.log(`💾 Actualizando tabla users con ruta del CV: ${fileName}`);
    const { error: updateError } = await supabase
      .from('users')
      .update({ cv_url: fileName }) 
      .eq('id', userId);

    if (updateError) {
      console.error('❌ Error al actualizar tabla users (CV):', updateError);
      throw new Error(`Error en DB CV: ${updateError.message}. ¿Creaste la columna cv_url?`);
    }

    return res.status(200).json({
      success: true,
      message: 'Hoja de vida subida con éxito.',
      path: fileName
    });

  } catch (error) {
    console.error('💥 Error fatal en uploadResume:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getResumeUrl = async (req, res) => {
  try {
    const { userId } = req.params;

    // 1. Buscar la ruta del CV en la tabla users
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('cv_url')
      .eq('id', userId)
      .single();

    if (userError || !user?.cv_url) {
      return res.status(404).json({ success: false, message: 'No se encontró una hoja de vida para este usuario.' });
    }

    // 2. Crear una Signed URL (enlace temporal de 60 segundos)
    const { data, error } = await supabase.storage
      .from('hojas-de-vida')
      .createSignedUrl(user.cv_url, 60); // 60 segundos de validez

    if (error) throw error;

    return res.status(200).json({
      success: true,
      url: data.signedUrl
    });

  } catch (error) {
    console.error('💥 Error en getResumeUrl:', error.message);
    return res.status(500).json({ success: false, message: 'Error al generar el enlace del CV.' });
  }
};

module.exports = { uploadProfileImage, uploadResume, getResumeUrl };
