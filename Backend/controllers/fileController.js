const supabase = require('../config/supabase');

const uploadProfileImage = async (req, res) => {
  try {
    const { userId } = req.body;
    const file = req.file;

    console.log(`🚀 Iniciando subida de foto para usuario: ${userId}`);

    if (!file) {
      return res.status(400).json({ success: false, message: 'No se recibió ningún archivo en la petición.' });
    }

    const fileName = `${userId}/${Date.now()}-${file.originalname}`;
    console.log(`📤 Subiendo archivo a Storage: ${fileName}`);

    const { error } = await supabase.storage
      .from('fotos-perfil')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (error) {
      console.error('❌ Error de Supabase Storage:', error);
      throw new Error(`Error en Storage: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('fotos-perfil')
      .getPublicUrl(fileName);

    console.log(`💾 Actualizando tabla users con URL: ${publicUrl}`);
    const { error: updateError } = await supabase
      .from('users')
      .update({ foto_url: publicUrl })
      .eq('id', userId);

    if (updateError) {
      console.error('❌ Error al actualizar tabla users:', updateError);
      throw new Error(`Error en DB: ${updateError.message}`);
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
    let { userId } = req.body;
    const file = req.file;

    if (userId) userId = String(userId).trim();

    console.log(`🚀 Iniciando subida de CV para usuario: [${userId}]`);

    if (!file) {
      return res.status(400).json({ success: false, message: 'No se recibió el archivo del CV.' });
    }

    if (!userId || userId === 'null' || userId === 'undefined') {
      return res.status(400).json({ success: false, message: 'ID de usuario no válido.' });
    }

    const fileName = `cv-${userId}-${Date.now()}.pdf`;

    console.log(`📤 Subiendo a bucket 'hojas-de-vida' como: ${fileName}`);

    const { error } = await supabase.storage
      .from('hojas-de-vida')
      .upload(fileName, file.buffer, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (error) {
      console.error('❌ ERROR DETALLADO DE SUPABASE STORAGE:', JSON.stringify(error, null, 2));
      throw new Error(`Error en Storage CV: ${error.message}`);
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({ cv_url: fileName })
      .eq('id', userId);

    if (updateError) {
      console.error('❌ Error al actualizar tabla users:', updateError);
      throw new Error(`Error en DB CV: ${updateError.message}`);
    }

    return res.status(200).json({
      success: true,
      message: 'Hoja de vida subida con éxito.',
      path: fileName
    });

  } catch (error) {
    console.error('💥 Error fatal en uploadResume:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getResumeUrl = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`🔍 Buscando CV para el usuario: ${userId}`);

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('cv_url')
      .eq('id', userId)
      .maybeSingle();

    if (userError || !user?.cv_url) {
      console.log(`⚠️ No se encontró cv_url en la DB para el usuario ${userId}`);
      return res.status(404).json({ success: false, message: 'No se encontró una hoja de vida para este usuario.' });
    }

    const cleanPath = user.cv_url.trim();
    console.log(`📂 Intentando recuperar archivo de Storage: "${cleanPath}"`);

    if (cleanPath.startsWith('http')) {
      return res.status(200).json({ success: true, url: cleanPath });
    }

    const { data, error } = await supabase.storage
      .from('hojas-de-vida')
      .createSignedUrl(cleanPath, 60);

    if (error) {
      console.error(`❌ Error de Supabase al crear Signed URL para "${cleanPath}":`, error.message);
      return res.status(404).json({ success: false, message: 'No se pudo generar el enlace. Es posible que el archivo ya no exista en el servidor.' });
    }

    console.log('✅ URL firmada generada exitosamente.');
    return res.status(200).json({ success: true, url: data.signedUrl });

  } catch (error) {
    console.error('💥 Error en getResumeUrl:', error.message);
    return res.status(500).json({ success: false, message: 'Error al generar el enlace del CV: ' + error.message });
  }
};

module.exports = { uploadProfileImage, uploadResume, getResumeUrl };