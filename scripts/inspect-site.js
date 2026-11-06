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
async function test() {
  const siteId = '26099443-c94e-4058-9a67-b57876057245';
  const { data: website } = await supabase.from('websites').select('*').eq('id', siteId).single();
  console.log('Website in DB:', website?.name, website?.subdomain);
  const { data: pages } = await supabase.from('pages').select('*').eq('website_id', siteId);
  console.log('Total pages in DB:', pages?.length);
  const home = pages?.find(p => p.slug === '/' || p.slug === 'home');
  console.log('Home page in DB:', home?.id, home?.slug, 'status:', home?.status, 'published_rev:', home?.published_revision_id, 'draft_rev:', home?.draft_revision_id);
  if (home && home.published_revision_id) {
    const { data: rev } = await supabase.from('page_revisions').select('*').eq('id', home.published_revision_id).single();
    console.log('Published Rev Sections:');
    rev.document?.sections?.forEach(s => {
      console.log(' -', s.componentId, 'props:', JSON.stringify(s.props));
    });
  }
}
test();

