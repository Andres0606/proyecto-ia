const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function diagnose() {
  const userId = 'a3929139-7968-47a4-ae07-a659842b3996';
  
  console.log("--- DIAGNÓSTICO DE RUTA ---");
  
  // 1. Consultar DB
  const { data: user, error: dbError } = await supabase
    .from('users')
    .select('cv_url')
    .eq('id', userId)
    .single();

  if (dbError) {
    console.error("❌ Error al consultar DB:", dbError.message);
  } else {
    console.log("📄 Ruta guardada en DB (cv_url):", user.cv_url);
  }

  // 2. Listar archivos en el bucket
  console.log("\n--- ARCHIVOS EN EL BUCKET 'hojas-de-vida' ---");
  const { data: files, error: storageError } = await supabase.storage
    .from('hojas-de-vida')
    .list(userId, { limit: 10 });

  if (storageError) {
    console.error("❌ Error al listar Storage:", storageError.message);
  } else if (files && files.length > 0) {
    files.forEach(f => {
      console.log(`✅ Archivo encontrado: ${userId}/${f.name}`);
    });
  } else {
    console.log("⚠️ No se encontraron archivos para este usuario en el bucket.");
  }
}

diagnose();
