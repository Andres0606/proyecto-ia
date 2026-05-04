const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://eqncdpzboevfpagjytqr.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxbmNkcHpib2V2ZnBhZ2p5dHFyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzg2NjkzOSwiZXhwIjoyMDkzNDQyOTM5fQ.FHHgu_98A-I-TwCuVsTdlUb9sNendWe99nN0HPSjgU4';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
  const { data, error } = await supabase.storage.from('hojas-de-vida').createSignedUrl('a3929139-7968-47a4-ae07-a659842b3996/1777882664243-cv.pdf', 60);
  console.log("Signed URL:", data, error);
}
check();
