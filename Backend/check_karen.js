const { createClient } = require('@supabase/supabase-js');
const s = createClient('https://eqncdpzboevfpagjytqr.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxbmNkcHpib2V2ZnBhZ2p5dHFyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzg2NjkzOSwiZXhwIjoyMDkzNDQyOTM5fQ.FHHgu_98A-I-TwCuVsTdlUb9sNendWe99nN0HPSjgU4');
s.from('users')
  .select('*')
  .ilike('nombre_completo', '%Karen%')
  .then(r => {
    console.log(JSON.stringify(r, null, 2));
  });
