const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, anonKey);

async function testAnon() {
  console.log("Testing ANON key...");
  const { data, error } = await supabase.from('users').select('id').limit(1);
  console.log("Users select with ANON:", error ? error.message : "Success");
}
testAnon();
