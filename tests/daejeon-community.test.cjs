const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=path=>fs.readFileSync(path,'utf8');
test('Daejeon community pilot stays isolated',()=>{
const home=read('daejeon/community/index.html');
const contact=read('pages/contact/index.html');
assert.match(home,/community=daejeon/);
assert.match(contact,/communityPilot/);
for(const category of ['경조사','행사 소식','인물 동정','개업·이전','단체 소식','지역 알림'])assert.ok(contact.includes(category));
});
test('Public list only uses safe textContent rendering',()=>{
const js=read('assets/js/daejeon-community-public.js');
assert.match(js,/\.textContent=p\.title/);
assert.match(js,/\.textContent=p\.body/);
assert.doesNotMatch(js,/innerHTML|insertAdjacentHTML/);
assert.match(js,/gn24_daejeon_community_posts/);
});
test('HQ publisher checks role and accepted source',()=>{
const js=read('assets/js/daejeon-community-hq.js');
assert.match(js,/rpc\/is_gn24_admin/);
assert.match(js,/row\.region!=='대전'/);
assert.match(js,/row\.status!=='accepted'/);
assert.match(js,/consent_original_work/);
assert.match(js,/consent_publication_review/);
assert.match(js,/response\.status===201/);
});
test('RLS publication policy prevents regional direct publishing',()=>{
const sql=read('docs/daejeon-community-publication.sql');
assert.match(sql,/enable row level security/i);
assert.match(sql,/for insert to authenticated/i);
assert.match(sql,/is_gn24_admin\(\)/);
assert.match(sql,/source\.region\s*=\s*'대전'/);
assert.match(sql,/source\.status\s*=\s*'accepted'/);
assert.doesNotMatch(sql,/grant insert[^;]*to anon/i);
});
test('Existing article and social share route conventions remain unchanged',()=>{
const region=read('daejeon/index.html');
assert.match(region,/regional-newsroom\.js/);
const admin=read('pages/admin-local-tips/index.html');
assert.match(admin,/pages\/article\/\?id=/);
});
