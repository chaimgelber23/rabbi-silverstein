const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const { data, error } = await supabase.from('shiurim').select('*').or('title.ilike.%Simcha of Hashem%,title.ilike.%Megilla%');
    if (error) {
        console.error("Error fetching:", error);
        return;
    }

    console.log("Found shiurim:", data.map(d => ({ title: d.title, category: d.categoryId })));
}
run();
