const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no están definidos en .env');
  process.exit(1);
}

// Cliente con service_role para bypass de RLS en el Backend
const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = supabase;
