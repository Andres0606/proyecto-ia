const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testLogin() {
  // 1. Authenticate (simulate what userController does)
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@gmail.com', // Using lowercase just in case
    password: 'admin123'
  });

  if (error) {
    console.error('Auth Error:', error.message);
    // If it fails with wrong email, let's try the Exact one from DB
    const { data: d2, error: e2 } = await supabase.auth.signInWithPassword({
      email: 'Admin@gmail.com',
      password: 'admin123'
    });
    if (e2) {
       console.error('Auth Error 2:', e2.message);
       return;
    }
    data.user = d2.user;
  }

  console.log('User ID from Auth:', data.user.id);

  // 2. Fetch profile exactly like backend
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*, roles(nombre)')
    .eq('id', data.user.id)
    .single();

  if (profileError) {
    console.error('Profile Error:', profileError);
  }

  console.log('Profile:', JSON.stringify(profile, null, 2));
}

testLogin();
