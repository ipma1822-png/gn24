(()=>{'use strict';
const box=document.getElementById('communityPosts'),status=document.getElementById('communityStatus'),cfg=window.GN24_SUPABASE;
if(!box||!status||!cfg?.url||!cfg?.anonKey)return;
const endpoint=cfg.url.replace(/\/$/,'')+'/rest/v1/gn24_daejeon_community_posts?select=category,title,body,published_at&order=published_at.desc&limit=30';
fetch(endpoint,{headers:{apikey:cfg.anonKey,Authorization:'Bearer '+cfg.anonKey},cache:'no-store'})
.then(async r=>{if(!r.ok)throw Error('Not ready');return r.json()})
.then(posts=>{status.textContent=posts.length?'승인된 소식 '+posts.length+'건':'아직 승인된 소식이 없습니다.';
for(const p of posts){const card=document.createElement('article');card.className='cat';
const tag=document.createElement('small');tag.textContent=p.category||'지역 알림';
const title=document.createElement('strong');title.textContent=p.title||'';
const body=document.createElement('p');body.textContent=p.body||'';body.style.whiteSpace='pre-wrap';
const date=document.createElement('small');date.textContent=p.published_at?new Date(p.published_at).toLocaleDateString('ko-KR'):'';
card.append(tag,title,body,date);box.append(card)}
}).catch(()=>{status.textContent='공개 소식 목록은 준비 중입니다.'});
})();