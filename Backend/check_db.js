const { createClient } = require('@supabase/supabase-js');
const s = createClient('https://eqncdpzboevfpagjytqr.supabase.co', 'FHHgu_98A-I-TwCuVsTdlUb9sNendWe99nN0HPSjgU4');
s.from('postulaciones')
  .select('*')
  .eq('user_id', 'a3929139-7968-47a4-ae07-a659842b3996')
  .then(r => {
    console.log(JSON.stringify(r, null, 2));
  });
