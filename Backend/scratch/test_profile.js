const supabase = require('../config/supabase');

async function test() {
  const userId = '9a4787a8-1cbb-4aa5-81e7-e788493c1c46';
  console.log('Testing Profile for Externo:', userId);
  
  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    if (userError) console.error('User Error:', userError);
    else console.log('User Data:', user);
    
    const { data: profile, error: profError } = await supabase
      .from('perfiles_usuarios')
      .select('*')
      .eq('user_id', userId);
      
    if (profError) console.error('Profile Error:', profError);
    else console.log('Profile Data:', profile);
    
    const { data: sub, error: subError } = await supabase
      .from('suscripciones')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (subError) console.error('Sub Error:', subError);
    else console.log('Sub Data:', sub);
    
    const { data: apps, error: appsError } = await supabase
      .from('postulaciones')
      .select('*')
      .eq('user_id', userId);
      
    if (appsError) console.error('Apps Error:', appsError);
    else {
      console.log('Apps Data length:', apps?.length);
      if (apps && apps.length > 0) {
        const vIds = [...new Set(apps.map(a => a.vacante_id))];
        console.log('Vacancy IDs:', vIds);
        const { data: vacs, error: vErr } = await supabase
          .from('vacantes')
          .select('*, empresas(*)')
          .in('id', vIds);
        if (vErr) console.error('Vacancy Join Error:', vErr);
        else console.log('Vacancies found:', vacs?.length);
      }
    }

  } catch (e) {
    console.error('Catch Error:', e);
  }
}

test();
