(()=>{
'use strict';
const $=(s,p=document)=>p.querySelector(s);
const esc=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const region=(document.body.dataset.region||'').toLowerCase(),regionName=document.body.dataset.regionName||region,hqCode=(document.body.dataset.hqCode||region).toUpperCase();
const DEFAULT_IMAGE='/assets/images/news/gn24-default-news.svg';
function cfg(){return window.GN24_SUPABASE||{}}
async function rest(path){const c=cfg();if(!c.url||!c.anonKey)throw new Error('Regional data connection unavailable');const r=await fetch(c.url.replace(/\/$/,'')+'/rest/v1/'+path,{cache:'no-store',headers:{apikey:c.anonKey}});if(!r.ok)throw new Error('Regional data request failed: '+r.status);return r.json()}
function articleURL(id){return '/share/'+encodeURIComponent(id)+'/'}
function fmt(d){return d?String(d).replaceAll('-','.') : ''}
function bg(src){return `style="background-image:url('${esc(src||DEFAULT_IMAGE)}'),url('${DEFAULT_IMAGE}')"`}
function card(a){return `<a class="regional-card" href="${articleURL(a.id)}"><div class="regional-thumb" ${bg(a.image)}></div><div class="regional-card-body"><span>${esc(a.category||'뉴스')}</span><h3>${esc(a.title||'')}</h3><p>${esc(a.summary||'')}</p><small>${esc(fmt(a.date))} · ${esc(a.author||'Global News24')}</small></div></a>`}
function compact(a){return `<a class="regional-compact" href="${articleURL(a.id)}"><div class="regional-compact-thumb" ${bg(a.image)}></div><div><span>${esc(a.category||'뉴스')}</span><b>${esc(a.title||'')}</b><small>${esc(fmt(a.date))}</small></div></a>`}
async function loadEditor(){const box=$('#regionalEditor');if(!box)return;try{const rs=await rest(`gn24_reporters?select=id,name,role,status,regional_hq_code,organization_position&status=eq.active&regional_hq_code=eq.${encodeURIComponent(hqCode)}&order=display_order.asc&limit=10`);const head=(rs||[]).find(r=>(r.organization_position||'').includes('지사장'));const reporters=(rs||[]).filter(r=>r.id!==head?.id);const parts=[];if(head)parts.push(`${head.name} ${head.organization_position||head.role||'지사장'}`);if(reporters.length)parts.push(reporters.map(r=>`${r.name} ${r.role||'지역기자'}`).join(' · '));box.textContent=parts.length?parts.join(' / '):'본사 관리'}catch(e){box.textContent='본사 관리'}}
async function loadNews(){try{
 const all=await rest('gn24_articles?select=id,date,title,category,author,summary,image,region_code,is_published&is_published=eq.true&order=date.desc,created_at.desc&limit=100');
 const local=all.filter(a=>(a.region_code||'').toLowerCase()===region),hq=all.filter(a=>(a.region_code||'').toLowerCase()!==region);
 window.GN24_REGIONAL_LOCAL=local;renderCategoryMega();
 const q=new URLSearchParams(location.search),cat=q.get('cat');const localView=cat?local.filter(a=>a.category===cat):local,hqView=cat?hq.filter(a=>a.category===cat):hq;
 const localSorted=[...localView].sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
 const hqSorted=[...hqView].sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
 const blended=[...localSorted,...hqSorted.filter(a=>!localSorted.some(l=>l.id===a.id))];
 $('#regionalCount')&&($('#regionalCount').textContent=localSorted.length?regionName+' 기사 '+localSorted.length+'건':regionName+' 기사 준비 중');
 const lead=localSorted[0];const hero=$('#regionalLead');if(hero){if(lead){hero.href=articleURL(lead.id);hero.innerHTML=`<div class="regional-lead-image" ${bg(lead.image)}></div><div><span>${esc(lead.category||regionName+'뉴스')}</span><h2>${esc(lead.title)}</h2><p>${esc(lead.summary||'')}</p><small>${esc(fmt(lead.date))} · ${esc(lead.author||'Global News24')}</small></div>`}else{hero.removeAttribute('href');hero.innerHTML=''}}
 const list=$('#regionalNews');if(list){const rows=localSorted.filter(a=>!lead||a.id!==lead.id);list.innerHTML=rows.length?rows.slice(0,11).map(card).join(''):`<div class="regional-empty"><b>${esc(regionName)} 지역기사를 준비 중입니다.</b><p>전국 주요뉴스는 아래 GLOBAL NEWS24 섹션에서 확인할 수 있습니다.</p></div>`}
 const national=$('#regionalNational');if(national)national.innerHTML=hq.slice(0,6).map(card).join('');
 const used=new Set(blended.slice(0,12).map(a=>a.id));const latest=$('#regionalLatest');if(latest)latest.innerHTML=all.filter(a=>!used.has(a.id)).slice(0,16).map(compact).join('');
 const martial=$('#regionalMartial');if(martial)martial.innerHTML=all.filter(a=>(a.category||'').includes('무도')||JSON.stringify(a).includes('태권')).slice(0,6).map(compact).join('');
 const safety=$('#regionalSafety');if(safety)safety.innerHTML=all.filter(a=>JSON.stringify(a).includes('안전')||JSON.stringify(a).includes('드론')).slice(0,6).map(compact).join('');
 const pub=$('#regionalPublic');if(pub)pub.innerHTML=all.filter(a=>(a.category||'')==='공익'||JSON.stringify(a).includes('교육')||JSON.stringify(a).includes('문화')).slice(0,6).map(compact).join('');
}catch(e){const list=$('#regionalNews');if(list)list.innerHTML='<div class="regional-empty"><b>뉴스를 불러오지 못했습니다.</b><p>잠시 후 다시 확인해 주세요.</p></div>';console.warn('GN24 regional newsroom',e)}}
const catLabels={'국내소식':'행정·정책','사회':'사회·안전','경제':'경제·산업','청소년·문화':'교육·문화','무도·스포츠':'스포츠·무도','공익':'지역소식'};
let activeMegaCat='';
function renderCategoryMega(cat=activeMegaCat){const mega=$('#regionalCategoryMega'),items=$('#regionalCategoryItems'),title=$('#regionalCategoryTitle'),allLink=$('#regionalCategoryAll');if(!mega||!items||!cat)return;activeMegaCat=cat;const local=window.GN24_REGIONAL_LOCAL||[];const rows=local.filter(a=>a.category===cat).slice(0,4);title.textContent=(catLabels[cat]||cat)+' · '+regionName;allLink.href=location.pathname+'?cat='+encodeURIComponent(cat);items.innerHTML=rows.length?rows.map(compact).join(''):'<div class="regional-category-empty">등록된 '+esc(regionName)+' 기사를 준비 중입니다.</div>';}
function categoryNav(){const mega=$('#regionalCategoryMega'),buttons=[...document.querySelectorAll('[data-regional-menu-cat]')];if(!mega||!buttons.length)return;const open=(btn)=>{buttons.forEach(b=>b.classList.toggle('active',b===btn));activeMegaCat=btn.dataset.regionalMenuCat;renderCategoryMega();mega.hidden=false;btn.setAttribute('aria-expanded','true');buttons.filter(b=>b!==btn).forEach(b=>b.setAttribute('aria-expanded','false'))};const close=()=>{mega.hidden=true;buttons.forEach(b=>{b.classList.remove('active');b.setAttribute('aria-expanded','false')})};buttons.forEach(btn=>{btn.setAttribute('aria-expanded','false');btn.addEventListener('mouseenter',()=>{if(matchMedia('(hover:hover) and (pointer:fine)').matches)open(btn)});btn.addEventListener('focus',()=>open(btn));btn.addEventListener('click',e=>{e.preventDefault();if(!mega.hidden&&activeMegaCat===btn.dataset.regionalMenuCat)close();else open(btn)})});mega.addEventListener('mouseleave',()=>{if(matchMedia('(hover:hover) and (pointer:fine)').matches)close()});document.addEventListener('click',e=>{if(!mega.hidden&&!e.target.closest('.regional-tabs'))close()})}
function nav(){document.querySelectorAll('[data-regional-cat]').forEach(a=>{const cat=a.dataset.regionalCat||'';a.href=cat?location.pathname+'?cat='+encodeURIComponent(cat):location.pathname})}
nav();categoryNav();loadEditor();loadNews();
})();