const supabase = require('../config/supabase');

const uploadProfileImage = async (req, res) => {
  try {
    const { userId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: 'No se subió ningún archivo.' });
    }

    // 1. Subir a Supabase Storage
    const fileName = `${userId}/${Date.now()}-${file.originalname}`;
    const { data, error } = await supabase.storage
      .from('fotos-perfil')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (error) throw error;

    // 2. Obtener la URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('fotos-perfil')
      .getPublicUrl(fileName);

    // 3. Actualizar el usuario en la tabla 'users'
    const { error: updateError } = await supabase
      .from('users')
      .update({ foto_url: publicUrl })
      .eq('id', userId);

    if (updateError) throw updateError;

    return res.status(200).json({
      success: true,
      message: 'Foto de perfil actualizada.',
      url: publicUrl
    });

  } catch (error) {
    console.error('❌ Error en uploadProfileImage:', error.message);
    return res.status(500).json({ success: false, message: 'Error al subir la imagen.', error: error.message });
  }
};

const uploadResume = async (req, res) => {
  try {
    const { userId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: 'No se subió ningún archivo.' });
    }

    // 1. Subir a Supabase Storage (Bucket privado)
    const fileName = `${userId}/${Date.now()}-cv.pdf`;
    const { data, error } = await supabase.storage
      .from('hojas-de-vida')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (error) throw error;

    // 2. Guardar la RUTA en la tabla 'users' (antes estaba en perfiles_usuarios)
    const { error: updateError } = await supabase
      .from('users')
      .update({ cv_url: fileName }) 
      .eq('id', userId);

    if (updateError) throw updateError;

    return res.status(200).json({
      success: true,
      message: 'Hoja de vida subida con éxito.',
      path: fileName
    });

  } catch (error) {
    console.error('❌ Error en uploadResume:', error.message);
    return res.status(500).json({ success: false, message: 'Error al subir el CV.', error: error.message });
  }
};

module.exports = { uploadProfileImage, uploadResume };
