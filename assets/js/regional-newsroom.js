(()=>{
'use strict';
const $=(s,p=document)=>p.querySelector(s);
const esc=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const region=(document.body.dataset.region||'').toLowerCase();
const regionName=document.body.dataset.regionName||region;
const hqCode=(document.body.dataset.hqCode||region).toUpperCase();
const DEFAULT_IMAGE='/assets/images/news/gn24-default-news.svg';
function cfg(){return window.GN24_SUPABASE||{}}
async function rest(path){const c=cfg();if(!c.url||!c.anonKey)throw new Error('Regional data connection unavailable');const r=await fetch(c.url.replace(/\/$/,'')+'/rest/v1/'+path,{cache:'no-store',headers:{apikey:c.anonKey}});if(!r.ok)throw new Error('Regional data request failed: '+r.status);return r.json()}
function articleURL(id){return '/pages/article/?id='+encodeURIComponent(id)}
function fmt(d){return d?String(d).replaceAll('-','.') : ''}
function bg(src){return `style="background-image:url('${esc(src||DEFAULT_IMAGE)}'),url('${DEFAULT_IMAGE}')"`}
function row(a){return `<a class="regional-card" href="${articleURL(a.id)}"><div class="regional-thumb" ${bg(a.image)}></div><div class="regional-card-body"><span>${esc(a.category||'울산뉴스')}</span><h3>${esc(a.title||'')}</h3><p>${esc(a.summary||'')}</p><small>${esc(fmt(a.date))} · ${esc(a.author||'Global News24')}</small></div></a>`}
async function loadEditor(){
  const box=$('#regionalEditor');if(!box)return;
  try{
    const hqs=await rest(`gn24_regional_headquarters?select=code,name,region_name,head_reporter_id,status&code=eq.${encodeURIComponent(hqCode)}&limit=1`);
    const hq=hqs?.[0];
    if(!hq?.head_reporter_id){box.textContent='본사 관리';return;}
    const rs=await rest(`gn24_reporters?select=id,name,role,status&status=eq.active&id=eq.${encodeURIComponent(hq.head_reporter_id)}&limit=1`);
    const r=rs?.[0];box.textContent=r?`${r.name} ${r.role||'기자'}`:'본사 관리';
  }catch(e){box.textContent='본사 관리';console.warn('GN24 regional editor',e)}
}
async function loadNews(){
  const list=$('#regionalNews');if(!list)return;
  try{
    let data=await rest(`gn24_articles?select=id,date,title,subtitle,category,author,summary,image,region_code,is_published&is_published=eq.true&region_code=eq.${encodeURIComponent(region)}&order=date.desc,created_at.desc`);
    const q=new URLSearchParams(location.search);const cat=q.get('cat');if(cat)data=data.filter(a=>a.category===cat);
    $('#regionalCount')&&($('#regionalCount').textContent=`${data.length}건`);
    if(!data.length){list.innerHTML=`<div class="regional-empty"><b>${esc(regionName)} 뉴스룸 준비 완료</b><p>지역 담당자가 승인 요청한 기사가 발행되면 이곳에 자동으로 모입니다. 같은 기사 ID를 사용하므로 본사 노출을 위해 기사를 복제하지 않습니다.</p></div>`;return;}
    const lead=data[0];
    const hero=$('#regionalLead');if(hero){hero.href=articleURL(lead.id);hero.innerHTML=`<div class="regional-lead-image" ${bg(lead.image)}></div><div><span>${esc(lead.category||regionName+'뉴스')}</span><h2>${esc(lead.title)}</h2><p>${esc(lead.summary||'')}</p><small>${esc(fmt(lead.date))} · ${esc(lead.author||'Global News24')}</small></div>`;}
    list.innerHTML=data.slice(1).map(row).join('');
  }catch(e){list.innerHTML='<div class="regional-empty"><b>지역뉴스를 불러오지 못했습니다.</b><p>잠시 후 다시 확인해 주세요.</p></div>';console.warn('GN24 regional newsroom',e)}
}
function nav(){document.querySelectorAll('[data-regional-cat]').forEach(a=>{const cat=a.dataset.regionalCat||'';a.href=cat?`${location.pathname}?cat=${encodeURIComponent(cat)}`:location.pathname;});}
nav();loadEditor();loadNews();
})();