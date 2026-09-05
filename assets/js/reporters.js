(()=>{
'use strict';
const $=(s,p=document)=>p.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const cfg=window.GN24_SUPABASE||{};
const base=String(cfg.url||'').replace(/\/$/,'');
const key=String(cfg.anonKey||'');
async function db(path){
  const r=await fetch(base+'/rest/v1/'+path,{headers:{apikey:key,Authorization:'Bearer '+key}});
  if(!r.ok)throw new Error(await r.text());return r.json();
}
async function publicReporters(){
  const r=await fetch(base+'/rest/v1/rpc/gn24_public_reporters',{method:'POST',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'},body:'{}'});
  if(!r.ok)throw new Error(await r.text());return r.json();
}
const articleUrl=id=>`/pages/article/?id=${encodeURIComponent(id)}`;
const imgStyle=u=>u?`style="background-image:url('${esc(u)}')"`:'';
const reporterNo=r=>r.reporter_number?`<small class="reporter-number">기자번호 · ${esc(r.reporter_number)}</small>`:'';

async function run(){
  const box=$('#reporterDirectory');
  if(!box)return;
  try{
    const reporters=await publicReporters();
    const id=new URLSearchParams(location.search).get('id');
    if(id){
      const r=reporters.find(x=>x.id===id);
      if(!r){box.innerHTML='<p>해당 기자 정보를 찾을 수 없습니다.</p>';return;}
      document.title=`${r.name} 기자 | Global News24`;
      const articles=await db(`gn24_articles?reporter_id=eq.${encodeURIComponent(id)}&is_published=eq.true&select=id,title,summary,image,date,category&order=date.desc,id.desc`);
      box.innerHTML=`<article class="reporter-profile-detail">
        <div class="reporter-detail-photo" ${imgStyle(r.photo_url)}>${r.photo_url?'':esc((r.name||'기').slice(0,1))}</div>
        <div class="reporter-detail-copy"><span>${esc(r.role||'기자')} · ${esc(r.affiliation||'Global News24')}</span><h2>${esc(r.name)}</h2>
        ${reporterNo(r)}
        <p>${esc(r.bio||'Global News24 기자입니다.')}</p>
        <div class="reporter-tags">${(r.specialties||[]).map(x=>`<i>${esc(x)}</i>`).join('')}</div>
        ${r.region?`<small>담당지역 · ${esc(r.region)}</small>`:''}${r.public_email?`<small>이메일 · ${esc(r.public_email)}</small>`:''}</div>
      </article>
      <div class="reporter-articles-head"><h2>${esc(r.name)} 기자의 기사</h2><b>${articles.length}건</b></div>
      <div class="reporter-article-grid">${articles.map(a=>`<a href="${articleUrl(a.id)}"><div class="thumb" ${imgStyle(a.image)}></div><span>${esc(a.category||'뉴스')} · ${esc(a.date||'')}</span><h3>${esc(a.title)}</h3><p>${esc(a.summary||'')}</p></a>`).join('')||'<p>등록된 기사가 없습니다.</p>'}</div>`;
      return;
    }
    box.innerHTML=`<div class="reporter-directory-grid">${reporters.map(r=>`<a class="reporter-directory-card" href="/pages/reporters/?id=${encodeURIComponent(r.id)}">
      <div class="reporter-directory-photo" ${imgStyle(r.photo_url)}>${r.photo_url?'':esc((r.name||'기').slice(0,1))}</div>
      <div><span>${esc(r.role||'기자')}</span><h2>${esc(r.name)}</h2>${reporterNo(r)}<small>${esc(r.affiliation||'Global News24')}${r.region?' · '+esc(r.region):''}</small>
      <p>${esc(r.bio||'Global News24 기자입니다.')}</p><div class="reporter-tags">${(r.specialties||[]).slice(0,4).map(x=>`<i>${esc(x)}</i>`).join('')}</div></div>
    </a>`).join('')}</div>`;
  }catch(e){console.error(e);box.innerHTML='<p>기자 정보를 불러오지 못했습니다.</p>'}
}
document.addEventListener('DOMContentLoaded',run);
})();