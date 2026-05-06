const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Hardcode temporal para descartar errores de variables de entorno en Railway
const supabaseUrl = 'https://eqncdpzboevfpagjytqr.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxbmNkcHpib2V2ZnBhZ2p5dHFyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzg2NjkzOSwiZXhwIjoyMDkzNDQyOTM5fQ.FHHgu_98A-I-TwCuVsTdlUb9sNendWe99nN0HPSjgU4';

// Cliente con service_role para bypass de RLS en el Backend
const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = supabase;
