(()=>{'use strict';
const cfg=window.GN24_SUPABASE||{},sb=window.supabase.createClient(cfg.url,cfg.anonKey),$=id=>document.getElementById(id);
let fixedRegion='',isHQ=false,rows=[],articles=[];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=v=>v?new Date(v).toLocaleString('ko-KR'):'-';
function metricsFor(id){const ra=articles.filter(a=>a.reporter_id===id&&a.is_published===true);return{published:ra.length,latest:ra.map(a=>a.updated_at||a.created_at).filter(Boolean).sort().reverse()[0]||null}}
function statusLabel(v){return({active:'활동',pending:'승인대기',suspended:'활동정지',terminated:'해촉'})[v]||v}
function render(){const region=isHQ?$('region').value:fixedRegion,data=rows.filter(r=>!region||r.region===region);$('count').textContent=data.length+'명';$('list').innerHTML=data.length?data.map(r=>{const m=metricsFor(r.id),recent=[m.latest,r.updated_at||r.created_at].filter(Boolean).sort().reverse()[0];return '<article class="card"><div class="identity"><img class="avatar" src="'+esc(r.photo_url||'/assets/images/logos/gn24-icon.svg')+'" alt=""><div><span class="badge">'+esc(statusLabel(r.status))+'</span><h2>'+esc(r.name)+'</h2><div class="meta">'+esc(r.reporter_number||'기자번호 미부여')+'</div></div></div><p>담당지역 · '+esc(r.region||'지역 미지정')+'</p><div class="metrics"><div><b>'+m.published+'</b><span>발행 기사</span></div><div><b>'+esc(fmt(recent))+'</b><span>최근 활동</span></div></div><p class="spec">전문분야 · '+esc(Array.isArray(r.specialties)?r.specialties.join(', ')||'미등록':'미등록')+'</p></article>'}).join(''):'<div class="card">해당 지역의 기자가 없습니다.</div>'}
async function load(){const {data:session,error:sessionError}=await sb.auth.getSession();if(sessionError||!session.session)throw Error('LOGIN_REQUIRED');
let q=sb.from('gn24_reporters').select('id,name,photo_url,reporter_number,status,region,specialties,created_at,updated_at').order('name');if(!isHQ)q=q.eq('region',fixedRegion);
const {data,error}=await q;if(error)throw error;rows=(data||[]).filter(r=>isHQ||r.region===fixedRegion);
articles=[];const ids=rows.map(r=>r.id);
for(let i=0;i<ids.length;i+=100){const {data:aa,error:ae}=await sb.from('gn24_articles').select('id,reporter_id,is_published,created_at,updated_at').in('reporter_id',ids.slice(i,i+100)).eq('is_published',true).eq('visibility_scope','public');if(ae)throw ae;articles.push(...aa||[])}
if(isHQ){const current=$('region').value;$('region').innerHTML='<option value="">전국</option>'+[...new Set(rows.map(r=>r.region).filter(Boolean))].sort().map(r=>'<option value="'+esc(r)+'">'+esc(r)+'</option>').join('');$('region').value=current}
render()}
async function init(){try{const {data,error}=await sb.auth.getSession();if(error||!data.session)throw Error('LOGIN_REQUIRED');const admin=await sb.rpc('is_gn24_admin');if(admin.error)throw admin.error;isHQ=admin.data===true;
if(!isHQ){const scope=await sb.rpc('gn24_my_regional_scope');if(scope.error)throw scope.error;const s=Array.isArray(scope.data)?scope.data[0]:scope.data;if(s?.scope_type!=='regional_hq'||!s.regional_hq_code)throw Error('REGIONAL_HQ_REQUIRED');const h=await sb.from('gn24_regional_headquarters').select('region_name').eq('code',s.regional_hq_code).single();if(h.error||!h.data?.region_name)throw Error('REGION_REQUIRED');fixedRegion=h.data.region_name;$('region').innerHTML='<option>'+esc(fixedRegion)+'</option>';$('region').value=fixedRegion;$('region').disabled=true}
$('scope').textContent=isHQ?'본사 관리자 · 전국':fixedRegion+' 지역본부 · 조회 전용';await load();$('guard').hidden=true;$('content').hidden=false;$('region').addEventListener('change',render);$('reload').addEventListener('click',()=>load().catch(fail));
}catch(e){fail(e)}}
function fail(e){console.error(e);$('content').hidden=true;$('guard').hidden=false;$('guard').textContent='본사 관리자 또는 시·도본부장 권한이 필요합니다. 지역운영센터에서 로그인 후 이용해 주세요.'}
document.addEventListener('DOMContentLoaded',init);
})();