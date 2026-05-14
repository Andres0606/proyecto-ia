const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkUser() {
  const email = 'afsr1232018@gmail.com';
  console.log(`🔍 Buscando usuario: ${email}`);
  
  const { data: users, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error('❌ Error al listar usuarios:', error.message);
    return;
  }

  const user = users.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (user) {
    console.log('✅ Usuario encontrado en Auth:', user.id);
  } else {
    console.log('❌ Usuario NO encontrado en Auth.');
  }
}

checkUser();
