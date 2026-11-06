const fs = require('fs');
let envFile = '';
try { envFile = fs.readFileSync('.env.local', 'utf8'); } catch(e) { envFile = fs.readFileSync('.env', 'utf8'); }
const env = {};
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
  const { data: sites, error: sErr } = await supabase.from('websites').select('id, name, subdomain, custom_domain');
  console.log('Sites:', JSON.stringify(sites, null, 2), 'Error:', sErr);
  const { data: pages, error: pErr } = await supabase.from('pages').select('id, website_id, slug, status, published_revision_id, draft_revision_id');
  console.log('Pages count:', pages?.length, 'Pages:', JSON.stringify(pages, null, 2), 'Error:', pErr);
}
run();

