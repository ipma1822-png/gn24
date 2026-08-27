(()=>{
  'use strict';
  const root=document.querySelector('#articleGallery');if(!root)return;
  const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const id=new URLSearchParams(location.search).get('id');if(!id)return;
  const parse=v=>{if(Array.isArray(v))return v;if(typeof v==='string'){try{return JSON.parse(v)}catch{return []}}return []};
  let photos=[],index=0,lightbox=null;
  const ensureConfig=()=>new Promise(resolve=>{if(window.GN24_SUPABASE)return resolve(window.GN24_SUPABASE);const existing=document.querySelector('script[src*="gn24-supabase-config"]');if(existing){existing.addEventListener('load',()=>resolve(window.GN24_SUPABASE||{}),{once:true});setTimeout(()=>resolve(window.GN24_SUPABASE||{}),2000);return}const s=document.createElement('script');s.src='/assets/js/gn24-supabase-config.js?v=3.5.0';s.onload=()=>resolve(window.GN24_SUPABASE||{});s.onerror=()=>resolve({});document.head.append(s)});

  function normalize(rows){return parse(rows).slice(0,10).map(x=>typeof x==='string'?{url:x,caption:''}:{url:x?.url||x?.image||'',caption:x?.caption||''}).filter(x=>x.url)}
  function drawLightbox(){if(!lightbox)return;const p=photos[index];lightbox.querySelector('img').src=p.url;lightbox.querySelector('img').alt=p.caption||`기사 추가 사진 ${index+1}`;lightbox.querySelector('.gallery-lightbox-caption').textContent=p.caption||'';lightbox.querySelector('.gallery-lightbox-count').textContent=`${index+1} / ${photos.length}`}
  function open(i){index=i;lightbox.hidden=false;document.body.classList.add('gallery-open');drawLightbox();lightbox.querySelector('.gallery-lightbox-close').focus()}
  function close(){if(!lightbox)return;lightbox.hidden=true;document.body.classList.remove('gallery-open')}
  function move(step){index=(index+step+photos.length)%photos.length;drawLightbox()}
  function render(){
    if(!photos.length)return;
    root.hidden=false;
    root.innerHTML=`<div class="article-gallery-head"><h2>기사 사진 모음</h2><span>${photos.length}장 · 사진을 누르면 크게 볼 수 있습니다</span></div><div class="article-gallery-grid">${photos.map((p,i)=>`<button type="button" data-gallery-index="${i}"><img src="${esc(p.url)}" alt="${esc(p.caption||`기사 추가 사진 ${i+1}`)}" loading="lazy"><span>${esc(p.caption||`사진 ${i+1}`)}</span></button>`).join('')}</div>`;
    lightbox=document.createElement('div');lightbox.className='gallery-lightbox';lightbox.hidden=true;lightbox.innerHTML=`<div class="gallery-lightbox-backdrop" data-close></div><div class="gallery-lightbox-dialog" role="dialog" aria-modal="true" aria-label="기사 사진 크게 보기"><button type="button" class="gallery-lightbox-close" data-close aria-label="닫기">×</button><button type="button" class="gallery-lightbox-prev" aria-label="이전 사진">‹</button><img alt=""><button type="button" class="gallery-lightbox-next" aria-label="다음 사진">›</button><div class="gallery-lightbox-info"><span class="gallery-lightbox-caption"></span><b class="gallery-lightbox-count"></b></div></div>`;document.body.append(lightbox);
    root.addEventListener('click',e=>{const b=e.target.closest('[data-gallery-index]');if(b)open(Number(b.dataset.galleryIndex))});
    lightbox.addEventListener('click',e=>{if(e.target.closest('[data-close]'))close();else if(e.target.closest('.gallery-lightbox-prev'))move(-1);else if(e.target.closest('.gallery-lightbox-next'))move(1)});
    document.addEventListener('keydown',e=>{if(lightbox.hidden)return;if(e.key==='Escape')close();if(e.key==='ArrowLeft')move(-1);if(e.key==='ArrowRight')move(1)});
    let startX=0;lightbox.addEventListener('touchstart',e=>startX=e.touches[0].clientX,{passive:true});lightbox.addEventListener('touchend',e=>{const d=e.changedTouches[0].clientX-startX;if(Math.abs(d)>55)move(d>0?-1:1)},{passive:true});
  }
  async function load(){
    let rows=[];
    try{
      const cfg=await ensureConfig();
      if(cfg.url&&cfg.anonKey){const url=`${cfg.url.replace(/\/$/,'')}/rest/v1/gn24_articles?id=eq.${encodeURIComponent(id)}&select=gallery_images`;const r=await fetch(url,{cache:'no-store',headers:{apikey:cfg.anonKey}});if(r.ok){const data=await r.json();rows=data?.[0]?.gallery_images||[]}}
      if(!rows.length){const r=await fetch('/data/news.json?gallery='+Date.now(),{cache:'no-store'});if(r.ok){const data=await r.json();const a=(Array.isArray(data)?data:[]).find(x=>x.id===id);rows=a?.galleryImages||a?.gallery_images||[]}}
    }catch(e){console.warn('기사 갤러리 불러오기 실패:',e)}
    photos=normalize(rows);render();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load);else load();
})();
