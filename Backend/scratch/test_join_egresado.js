const supabase = require('../config/supabase');

async function test() {
  const userId = 'a3929139-7968-47a4-ae07-a659842b3996';
  console.log('Testing JOIN for Egresado:', userId);
  
  try {
    const { data: apps, error: appsError } = await supabase
      .from('postulaciones')
      .select('*, vacantes:vacante_id(*, empresas:empresa_id(*))')
      .eq('user_id', userId)
      .order('fecha_postulacion', { ascending: false });
      
    if (appsError) {
      console.error('JOIN Error:', appsError);
    } else {
      console.log('JOIN Success! Apps found:', apps.length);
      if (apps.length > 0) {
        console.log('First App Vacante:', apps[0].vacantes);
      }
    }

  } catch (e) {
    console.error('Catch Error:', e);
  }
}

test();
