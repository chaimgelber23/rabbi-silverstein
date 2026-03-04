const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
    const { data } = await supabase.from('shiurim').select('*').or('title.ilike.%Simcha of Hashem%,title.ilike.%Megilla%');
    console.log(JSON.stringify(data, null, 2));
}
run();
