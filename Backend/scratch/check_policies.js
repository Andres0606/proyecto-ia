const supabase = require('../config/supabase');

async function test() {
  console.log('Listing Policies...');
  
  try {
    const { data, error } = await supabase
      .rpc('get_policies'); // This might not exist
      
    if (error) {
      // Try raw SQL if possible, but JS client doesn't support it directly
      // Let's just try to select from a system table
      const { data: pols, error: polError } = await supabase
        .from('pg_policies') // This won't work via PostgREST usually
        .select('*');
      console.log('Pol Error:', polError?.message);
    } else {
      console.log('Policies:', data);
    }
  } catch (e) {
    console.error('Catch Error:', e);
  }
}

test();
