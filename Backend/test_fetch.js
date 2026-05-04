const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testFetchProfile() {
  const { data: profile, error } = await supabase
    .from('users')
    .select('*, roles(nombre)')
    .eq('id', '7a92a44a-0e54-463f-b5ec-fd6356ca7766')
    .single();

  console.log('Profile:', JSON.stringify(profile, null, 2));
  if (error) console.error('Error:', error);
}

testFetchProfile();
