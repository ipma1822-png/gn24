/* Global News24 v3.4.3 · homepage live newsroom motion */
(() => {
  const REDUCED = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const HERO_MS = 6500;

  document.addEventListener('DOMContentLoaded', () => {
    // app.js가 먼저 Supabase 기사 데이터를 렌더링할 시간을 준다.
    window.setTimeout(initMotion, 450);
  });

  async function initMotion(){
    if (typeof loadNewsData !== 'function' || typeof sortNews !== 'function') return;
    let data=[];
    try{ data=sortNews(await loadNewsData()); }catch(e){ console.warn('GN24 motion data:',e); }
    if(!data.length) return;

    setupBreaking(data);
    setupHero(data);
    setupEditorsPick();
    setupLiveNews();
  }

  function setupBreaking(data){
    const ticker=document.querySelector('.breaking .ticker');
    if(!ticker) return;
    const picks=[
      ...data.filter(a=>a.visualStyle==='breaking'),
      ...data.filter(a=>a.pinned),
      ...data.filter(a=>a.featured),
      ...data
    ].filter((a,i,arr)=>a?.id && arr.findIndex(x=>x?.id===a.id)===i).slice(0,8);
    if(!picks.length) return;
    const one=picks.map(a=>`<a class="gn24-breaking-item" href="${articleURL(a.id)}"><em>${esc(a.category||'속보')}</em><span>${esc(a.title||'')}</span><i></i></a>`).join('');
    ticker.innerHTML=`<div class="gn24-breaking-track">${one}${one}</div>`;
  }

  function setupHero(data){
    const story=document.getElementById('leadLink');
    if(!story) return;
    const candidates=[
      ...data.filter(a=>a.pinned),
      ...data.filter(a=>a.featured),
      ...data
    ].filter((a,i,arr)=>a?.id && arr.findIndex(x=>x?.id===a.id)===i).slice(0,5);
    if(candidates.length<2) return;

    let idx=0, timer=null, paused=false;
    const controls=document.createElement('div');
    controls.className='gn24-hero-controls';
    controls.setAttribute('aria-label','주요뉴스 자동 전환');
    controls.innerHTML=candidates.map((_,i)=>`<button type="button" class="gn24-hero-dot${i===0?' active':''}" aria-label="주요뉴스 ${i+1}"></button>`).join('')+`<button type="button" class="gn24-hero-pause" aria-label="자동 전환 정지">Ⅱ</button>`;
    const progress=document.createElement('div');
    progress.className='gn24-hero-progress';
    progress.innerHTML='<span></span>';
    story.append(progress,controls);

    const dots=[...controls.querySelectorAll('.gn24-hero-dot')];
    const pauseBtn=controls.querySelector('.gn24-hero-pause');

    const paint=(item,animate=true)=>{
      if(!item) return;
      const doPaint=()=>{
        document.getElementById('leadTitle').textContent=item.title||'';
        document.getElementById('leadSummary').textContent=item.summary||'';
        document.getElementById('leadMeta').textContent=`TOP NEWS · ${item.category||'뉴스'} · ${fmt(item.date)}`;
        story.href=articleURL(item.id);
        applyBg(document.getElementById('leadMedia'),item.image);
        dots.forEach((d,i)=>d.classList.toggle('active',i===idx));
        story.classList.remove('gn24-hero-changing');
        story.classList.remove('gn24-hero-active'); void story.offsetWidth; story.classList.add('gn24-hero-active');
        restartProgress();
      };
      if(!animate || REDUCED){ doPaint(); return; }
      story.classList.add('gn24-hero-changing');
      setTimeout(doPaint,300);
    };
    const next=()=>{idx=(idx+1)%candidates.length;paint(candidates[idx]);};
    const restart=()=>{clearInterval(timer); if(!paused&&!REDUCED) timer=setInterval(next,HERO_MS);};
    const restartProgress=()=>{
      progress.classList.remove('running'); void progress.offsetWidth;
      if(!paused&&!REDUCED) progress.classList.add('running');
    };
    dots.forEach((d,i)=>d.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();idx=i;paint(candidates[idx]);restart();}));
    pauseBtn.addEventListener('click',e=>{
      e.preventDefault();e.stopPropagation();paused=!paused;pauseBtn.textContent=paused?'▶':'Ⅱ';pauseBtn.setAttribute('aria-label',paused?'자동 전환 시작':'자동 전환 정지');restart();restartProgress();
    });
    story.addEventListener('mouseenter',()=>{if(!REDUCED)clearInterval(timer)});
    story.addEventListener('mouseleave',restart);
    paint(candidates[0],false); restart();
  }

  function setupEditorsPick(){
    const grid=document.getElementById('homeNews');
    if(!grid || grid.children.length<5) return;
    const section=grid.closest('.section');
    const head=section?.querySelector('.section-head');
    grid.classList.add('gn24-motion-row');
    const viewport=document.createElement('div');
    viewport.className='gn24-editor-viewport';
    grid.parentNode.insertBefore(viewport,grid); viewport.appendChild(grid);

    const nav=document.createElement('div'); nav.className='gn24-editor-nav';
    nav.innerHTML='<button type="button" aria-label="이전 주요뉴스">‹</button><button type="button" aria-label="다음 주요뉴스">›</button>';
    head?.appendChild(nav);
    const [prev,next]=nav.querySelectorAll('button');
    let step=0,timer=null;
    const max=Math.max(0,grid.children.length-4);
    const move=(n)=>{
      if(innerWidth<=900){grid.scrollBy({left:n>step?grid.clientWidth*.72:-grid.clientWidth*.72,behavior:'smooth'});step=n;return;}
      step=Math.max(0,Math.min(max,n));
      const card=grid.children[0]; if(!card)return;
      const gap=16; const x=step*(card.getBoundingClientRect().width+gap);
      grid.style.transform=`translateX(-${x}px)`;
    };
    const advance=()=>{move(step>=max?0:step+1)};
    prev?.addEventListener('click',()=>{move(step<=0?max:step-1);restart()});
    next?.addEventListener('click',()=>{advance();restart()});
    const restart=()=>{clearInterval(timer);if(!REDUCED&&innerWidth>900)timer=setInterval(advance,5200)};
    viewport.addEventListener('mouseenter',()=>clearInterval(timer)); viewport.addEventListener('mouseleave',restart);
    addEventListener('resize',()=>{if(innerWidth<=900)grid.style.transform='';else move(Math.min(step,max));restart()});
    restart();
  }

  function setupLiveNews(){
    const list=document.getElementById('attentionList');
    if(!list || list.children.length<4 || REDUCED) return;
    list.classList.add('gn24-live-list');
    // 한 줄씩 위로 이동한 뒤 첫 항목을 맨 뒤로 보내어 끊김 없이 순환한다.
    let busy=false;
    setInterval(()=>{
      if(busy || !list.firstElementChild) return;
      busy=true;
      const first=list.firstElementChild;
      const h=first.getBoundingClientRect().height;
      list.style.transform=`translateY(-${h}px)`;
      setTimeout(()=>{
        list.style.transition='none';
        list.appendChild(first);
        list.style.transform='translateY(0)';
        void list.offsetWidth;
        list.style.transition='transform .6s var(--gn24-motion-ease)';
        busy=false;
      },620);
    },4200);
  }
})();
