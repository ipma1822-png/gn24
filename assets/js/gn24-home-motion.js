/* Global News24 v3.4.4 · visible newsroom scroll motion */
(() => {
  const REDUCED = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const HERO_MS = 6500;

  document.addEventListener('DOMContentLoaded', () => {
    // DOM 기반 모션은 기사 API와 무관하게 반드시 시작한다.
    window.setTimeout(() => {
      setupMostViewed();
      setupEditorsPick();
    }, 650);
    // 기사 데이터가 준비되면 속보/대표뉴스를 구성한다.
    window.setTimeout(initDataMotion, 500);
    // 혹시 API 호출이 늦거나 실패해도 화면에 있는 기사 제목으로 속보를 만든다.
    window.setTimeout(setupBreakingFallback, 1400);
  });

  async function initDataMotion(){
    if (typeof loadNewsData !== 'function' || typeof sortNews !== 'function') return;
    let data=[];
    try{ data=sortNews(await loadNewsData()); }catch(e){ console.warn('GN24 motion data:',e); }
    if(!data.length) return;
    setupBreaking(data);
    setupHero(data);
  }

  function makeBreakingItems(items){
    const ticker=document.querySelector('.breaking .ticker');
    if(!ticker || !items.length) return;
    const one=items.map(a=>`<a class="gn24-breaking-item" href="${a.href||'#'}"><em>${esc(a.category||'속보')}</em><span>${esc(a.title||'')}</span><i></i></a>`).join('');
    ticker.innerHTML=`<div class="gn24-breaking-track">${one}${one}</div>`;
  }

  function setupBreaking(data){
    const picks=[
      ...data.filter(a=>a.visualStyle==='breaking'),
      ...data.filter(a=>a.pinned),
      ...data.filter(a=>a.featured),
      ...data
    ].filter((a,i,arr)=>a?.id && arr.findIndex(x=>x?.id===a.id)===i).slice(0,9)
     .map(a=>({href:articleURL(a.id),category:a.category||'속보',title:a.title||''}));
    makeBreakingItems(picks);
  }

  function setupBreakingFallback(){
    if(document.querySelector('.gn24-breaking-track')) return;
    const links=[...document.querySelectorAll('#topLatest a, #homeNews a')]
      .map(a=>({href:a.href,category:'주요뉴스',title:(a.textContent||'').trim().replace(/\\s+/g,' ')}))
      .filter(x=>x.title.length>4);
    const unique=links.filter((x,i,a)=>a.findIndex(y=>y.title===x.title)===i).slice(0,9);
    if(unique.length) makeBreakingItems(unique);
  }

  function setupHero(data){
    const story=document.getElementById('leadLink');
    if(!story || story.dataset.motionReady==='1') return;
    const candidates=[
      ...data.filter(a=>a.pinned),
      ...data.filter(a=>a.featured),
      ...data
    ].filter((a,i,arr)=>a?.id && arr.findIndex(x=>x?.id===a.id)===i).slice(0,5);
    if(candidates.length<2) return;
    story.dataset.motionReady='1';
    let idx=0, timer=null, paused=false;
    const controls=document.createElement('div');
    controls.className='gn24-hero-controls';
    controls.setAttribute('aria-label','주요뉴스 자동 전환');
    controls.innerHTML=candidates.map((_,i)=>`<button type="button" class="gn24-hero-dot${i===0?' active':''}" aria-label="주요뉴스 ${i+1}"></button>`).join('')+`<button type="button" class="gn24-hero-pause" aria-label="자동 전환 정지">Ⅱ</button>`;
    const progress=document.createElement('div'); progress.className='gn24-hero-progress'; progress.innerHTML='<span></span>';
    story.append(progress,controls);
    const dots=[...controls.querySelectorAll('.gn24-hero-dot')], pauseBtn=controls.querySelector('.gn24-hero-pause');
    const paint=(item,animate=true)=>{
      if(!item)return;
      const doPaint=()=>{
        document.getElementById('leadTitle').textContent=item.title||'';
        document.getElementById('leadSummary').textContent=item.summary||'';
        document.getElementById('leadMeta').textContent=`TOP NEWS · ${item.category||'뉴스'} · ${fmt(item.date)}`;
        story.href=articleURL(item.id); applyBg(document.getElementById('leadMedia'),item.image);
        dots.forEach((d,i)=>d.classList.toggle('active',i===idx));
        story.classList.remove('gn24-hero-changing','gn24-hero-active'); void story.offsetWidth; story.classList.add('gn24-hero-active'); restartProgress();
      };
      if(!animate||REDUCED){doPaint();return;} story.classList.add('gn24-hero-changing'); setTimeout(doPaint,280);
    };
    const next=()=>{idx=(idx+1)%candidates.length;paint(candidates[idx]);};
    const restart=()=>{clearInterval(timer);if(!paused&&!REDUCED)timer=setInterval(next,HERO_MS);};
    const restartProgress=()=>{progress.classList.remove('running');void progress.offsetWidth;if(!paused&&!REDUCED)progress.classList.add('running');};
    dots.forEach((d,i)=>d.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();idx=i;paint(candidates[idx]);restart();}));
    pauseBtn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();paused=!paused;pauseBtn.textContent=paused?'▶':'Ⅱ';restart();restartProgress();});
    story.addEventListener('mouseenter',()=>clearInterval(timer)); story.addEventListener('mouseleave',restart);
    paint(candidates[0],false);restart();
  }

  // 많이 본 뉴스: 현재 9개를 그대로 유지하면서 한 줄씩 위로 천천히 순환.
  function setupMostViewed(){
    const list=document.getElementById('topLatest');
    if(!list || list.children.length<2 || list.dataset.scrollReady==='1') return;
    list.dataset.scrollReady='1';
    const box=list.closest('.ranking'); if(box) box.classList.add('gn24-ranking-scroll');
    if(REDUCED) return;
    let busy=false, timer=null;
    const next=()=>{
      if(busy || !list.firstElementChild) return;
      busy=true;
      const first=list.firstElementChild;
      const clone=first.cloneNode(true); clone.classList.add('gn24-rank-clone'); list.appendChild(clone);
      const h=first.getBoundingClientRect().height;
      list.style.transition='transform .95s cubic-bezier(.22,.61,.36,1)';
      list.style.transform=`translateY(-${h}px)`;
      setTimeout(()=>{
        list.style.transition='none'; list.appendChild(first); clone.remove(); list.style.transform='translateY(0)'; void list.offsetWidth;
        busy=false;
      },980);
    };
    const start=()=>{clearInterval(timer);timer=setInterval(next,3300)};
    list.addEventListener('mouseenter',()=>clearInterval(timer)); list.addEventListener('mouseleave',start); start();
  }

  // EDITOR'S PICK: 4장 모두 보이는 상태로 한 장씩 왼쪽으로 '탁' 이동하며 무한 순환.
  function setupEditorsPick(){
    const grid=document.getElementById('homeNews');
    if(!grid || grid.children.length<2 || grid.dataset.scrollReady==='1') return;
    grid.dataset.scrollReady='1';
    const section=grid.closest('.section'), head=section?.querySelector('.section-head');
    grid.classList.add('gn24-motion-row');
    const viewport=document.createElement('div'); viewport.className='gn24-editor-viewport';
    grid.parentNode.insertBefore(viewport,grid); viewport.appendChild(grid);
    const nav=document.createElement('div'); nav.className='gn24-editor-nav'; nav.innerHTML='<button type="button" aria-label="이전 주요뉴스">‹</button><button type="button" aria-label="다음 주요뉴스">›</button>';
    head?.appendChild(nav); const [prev,next]=nav.querySelectorAll('button');
    let busy=false,timer=null;
    const cardStep=()=>{const c=grid.firstElementChild;return c?c.getBoundingClientRect().width+16:0};
    const forward=()=>{
      if(busy||grid.children.length<2)return; busy=true;
      const first=grid.firstElementChild, clone=first.cloneNode(true); clone.classList.add('gn24-editor-clone'); grid.appendChild(clone);
      grid.style.transition='transform .78s cubic-bezier(.22,.61,.36,1)'; grid.style.transform=`translateX(-${cardStep()}px)`;
      setTimeout(()=>{grid.style.transition='none';grid.appendChild(first);clone.remove();grid.style.transform='translateX(0)';void grid.offsetWidth;busy=false;},810);
    };
    const backward=()=>{
      if(busy||grid.children.length<2)return; busy=true;
      const last=grid.lastElementChild, clone=last.cloneNode(true); clone.classList.add('gn24-editor-clone'); grid.insertBefore(clone,grid.firstElementChild);
      const step=cardStep(); grid.style.transition='none';grid.style.transform=`translateX(-${step}px)`;void grid.offsetWidth;
      grid.style.transition='transform .78s cubic-bezier(.22,.61,.36,1)';grid.style.transform='translateX(0)';
      setTimeout(()=>{grid.style.transition='none';grid.insertBefore(last,grid.firstElementChild);clone.remove();grid.style.transform='translateX(0)';void grid.offsetWidth;busy=false;},810);
    };
    const start=()=>{clearInterval(timer);if(!REDUCED&&innerWidth>900)timer=setInterval(forward,4400)};
    next?.addEventListener('click',()=>{forward();start()}); prev?.addEventListener('click',()=>{backward();start()});
    viewport.addEventListener('mouseenter',()=>clearInterval(timer));viewport.addEventListener('mouseleave',start);
    addEventListener('resize',()=>{grid.style.transform='translateX(0)';start()}); start();
  }
})();
