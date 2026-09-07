(()=>{
'use strict';
const REGION_LABELS={seoul:'서울',busan:'부산',daegu:'대구',incheon:'인천',gwangju:'광주',daejeon:'대전',ulsan:'울산',sejong:'세종',gyeonggi:'경기',gangwon:'강원',chungbuk:'충북',chungnam:'충남',jeonbuk:'전북',jeonnam:'전남',gyeongbuk:'경북',gyeongnam:'경남',jeju:'제주'};
const select=()=>document.getElementById('fRegionCode');
const idInput=()=>document.getElementById('fId');
let lastId='',loadingId='',manualSince=0;

function currentRegion(){return select()?.value||'';}
function markManual(){manualSince=Date.now();}
async function loadRegionForId(id){
  const el=select(),cfg=window.GN24_SUPABASE||{};
  if(!el||!id||!cfg.url||!cfg.anonKey||loadingId===id)return;
  loadingId=id;
  try{
    const url=cfg.url.replace(/\/$/,'')+'/rest/v1/gn24_articles?select=region_code&id=eq.'+encodeURIComponent(id)+'&limit=1';
    const r=await fetch(url,{cache:'no-store',headers:{apikey:cfg.anonKey}});
    if(!r.ok)return;
    const rows=await r.json();
    if(idInput()?.value!==id)return;
    el.value=rows?.[0]?.region_code||'';
    el.dataset.loadedFor=id;
  }catch(e){console.warn('GN24 region selector:',e)}finally{loadingId='';}
}
function watchArticle(){
  const id=(idInput()?.value||'').trim();
  if(!id||id===lastId)return;
  lastId=id;
  const el=select();
  if(el){el.value='';el.dataset.loadedFor='';}
  setTimeout(()=>loadRegionForId(id),80);
}
function patchSupabase(){
  const lib=window.supabase;
  if(!lib?.createClient||lib.__gn24RegionPatched)return;
  const original=lib.createClient.bind(lib);
  lib.createClient=(...args)=>{
    const client=original(...args);
    const originalFrom=client.from.bind(client);
    client.from=(table)=>{
      const q=originalFrom(table);
      if(table!=='gn24_articles'||!q?.upsert)return q;
      const originalUpsert=q.upsert.bind(q);
      q.upsert=(values,options)=>{
        if(!Array.isArray(values)&&values&&typeof values==='object'){
          values={...values,region_code:currentRegion()||null};
        }
        return originalUpsert(values,options);
      };
      return q;
    };
    return client;
  };
  lib.__gn24RegionPatched=true;
}
function init(){
  const el=select();
  if(!el)return;
  el.addEventListener('change',markManual);
  patchSupabase();
  watchArticle();
  setInterval(watchArticle,250);
  const pub=document.getElementById('cmsPublishBtn');
  pub?.addEventListener('click',()=>{
    const name=REGION_LABELS[currentRegion()]||'전국 공통';
    const detail=document.getElementById('cmsDetail');
    if(detail)detail.textContent='발행 지역판: '+name+(currentRegion()?' · 본사 메인에도 함께 노출':'');
  },true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();