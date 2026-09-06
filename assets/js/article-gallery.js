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

/* ===== GN24 v3.13.2 · reporter rank / HQ article byline ===== */
(()=>{
  'use strict';
  const HQ={SEOUL:'서울',BUSAN:'부산',DAEGU:'대구',INCHEON:'인천',GWANGJU:'광주',DAEJEON:'대전',ULSAN:'울산',SEJONG:'세종',GYEONGGI:'경기',GANGWON:'강원',CHUNGBUK:'충북',CHUNGNAM:'충남',JEONBUK:'전북',JEONNAM:'전남',GYEONGBUK:'경북',GYEONGNAM:'경남',JEJU:'제주'};
  const safe=v=>String(v??'').trim();
  const ensureConfig=()=>new Promise(resolve=>{if(window.GN24_SUPABASE)return resolve(window.GN24_SUPABASE);const existing=document.querySelector('script[src*="gn24-supabase-config"]');if(existing){existing.addEventListener('load',()=>resolve(window.GN24_SUPABASE||{}),{once:true});setTimeout(()=>resolve(window.GN24_SUPABASE||{}),2000);return}const s=document.createElement('script');s.src='/assets/js/gn24-supabase-config.js?v=3.13.2';s.onload=()=>resolve(window.GN24_SUPABASE||{});s.onerror=()=>resolve({});document.head.append(s)});
  async function api(path,opt={}){const cfg=await ensureConfig();if(!cfg.url||!cfg.anonKey)throw new Error('Supabase 설정 없음');const r=await fetch(cfg.url.replace(/\/$/,'')+'/rest/v1/'+path,{cache:'no-store',...opt,headers:{apikey:cfg.anonKey,Authorization:'Bearer '+cfg.anonKey,'Content-Type':'application/json',...(opt.headers||{})}});if(!r.ok)throw new Error(await r.text());return r.status===204?null:r.json()}
  function hqLabel(code){return HQ[code]?(HQ[code]+'본부'):''}
  function byline(r,fallback){const name=safe(r?.name)||safe(fallback)||'Global News24 편집부';const rank=safe(r?.reporter_rank);const hq=hqLabel(r?.regional_hq_code);return [name,rank,hq].filter(Boolean).join(' | ').replace(' | 기자 | ',' 기자 | ').replace(/^(.*?) \| (기자|선임기자|수석기자)(?: \| |$)/,'$1 $2$3')}
  window.setupArticleReporter=async function(article){
    const authorName=document.getElementById('articleAuthorName');
    const avatar=document.querySelector('.article-author-card .author-avatar');
    const info=document.querySelector('.article-author-card .author-info');
    const more=document.querySelector('.article-author-card .author-more');
    let reporterId=safe(article?.reporterId);
    let fallback=safe(article?.author)||'Global News24 편집부';
    try{
      if(!reporterId&&article?.id){
        const rows=await api(`gn24_articles?id=eq.${encodeURIComponent(article.id)}&select=reporter_id,author&limit=1`);
        reporterId=safe(rows?.[0]?.reporter_id);
        fallback=safe(rows?.[0]?.author)||fallback;
      }
      if(!reporterId){if(authorName)authorName.textContent=fallback;if(more)more.href='/pages/reporters/';return;}
      const reporters=await api('rpc/gn24_public_reporters',{method:'POST',body:'{}'});
      const r=(Array.isArray(reporters)?reporters:[]).find(x=>String(x.id)===reporterId);
      if(!r){if(authorName)authorName.textContent=fallback;return;}
      const label=byline(r,fallback);
      if(authorName)authorName.textContent=label;
      const meta=document.getElementById('aMeta');
      const metaSpans=meta?.querySelectorAll(':scope > span');
      if(metaSpans&&metaSpans[1])metaSpans[1].textContent=label;
      if(avatar){if(r.photo_url){avatar.textContent='';avatar.style.backgroundImage=`url("${String(r.photo_url).replace(/"/g,'%22')}")`;avatar.classList.add('reporter-photo')}else avatar.textContent=(safe(r.name)||'GN').slice(0,1)}
      const span=info?.querySelector('span');
      const p=info?.querySelector('p');
      const details=[safe(r.reporter_type),safe(r.organization_position),hqLabel(r.regional_hq_code),safe(r.affiliation),safe(r.region)].filter(Boolean);
      if(span)span.textContent=details.join(' · ')||'Global News24 기자';
      if(p)p.textContent=safe(r.bio)||`${safe(r.name)} ${safe(r.reporter_rank)||'기자'}의 Global News24 기사입니다.`;
      if(more){more.href=`/pages/reporters/?id=${encodeURIComponent(r.id)}`;more.textContent='기자 프로필·다른 기사 보기 ›'}
    }catch(e){console.warn('GN24 reporter identity load failed',e);if(authorName&&!authorName.textContent)authorName.textContent=fallback}
  };
})();
