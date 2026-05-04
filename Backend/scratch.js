const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://eqncdpzboevfpagjytqr.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxbmNkcHpib2V2ZnBhZ2p5dHFyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzg2NjkzOSwiZXhwIjoyMDkzNDQyOTM5fQ.FHHgu_98A-I-TwCuVsTdlUb9sNendWe99nN0HPSjgU4';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
  console.log("Checking buckets...");
  const { data, error } = await supabase.storage.listBuckets();
  if (error) console.error("Error:", error.message);
  else {
    console.log("Buckets:", data.map(b => b.name + ' (public: ' + b.public + ')').join(', '));
  }
}
check();
