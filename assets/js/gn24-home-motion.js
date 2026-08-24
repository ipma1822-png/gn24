/* Global News24 v3.4.5 · robust live motion
   - waits for app.js to finish rendering
   - MutationObserver catches late-rendered lists
   - ticker is built from the actual rendered article links
*/
(() => {
  'use strict';

  const state = {
    breaking: false,
    ranking: false,
    editor: false,
    hero: false
  };

  document.documentElement.classList.add('gn24-motion-js');

  const clean = s => (s || '').replace(/\s+/g,' ').trim();

  function uniqueLinks(selectors, limit=10){
    const seen = new Set(), out = [];
    document.querySelectorAll(selectors).forEach(a => {
      const title = clean(a.textContent);
      if (!title || title.length < 4 || seen.has(title)) return;
      seen.add(title);
      out.push({href:a.getAttribute('href') || '#', title});
    });
    return out.slice(0,limit);
  }

  function setupBreaking(){
    if (state.breaking) return true;
    const ticker = document.querySelector('.breaking .ticker');
    if (!ticker) return false;

    let links = uniqueLinks('#topLatest a, #homeNews a, #latestNews a, #attentionList a', 10);
    if (links.length < 3) return false;

    const items = links.map((x,i) =>
      `<a class="gn24-breaking-item" href="${x.href}"><em>${i===0?'속보':'NEWS'}</em><span>${x.title}</span><i></i></a>`
    ).join('');

    ticker.innerHTML = `<div class="gn24-breaking-track">${items}${items}</div>`;
    state.breaking = true;
    return true;
  }

  function setupRanking(){
    if (state.ranking) return true;
    const list = document.getElementById('topLatest');
    if (!list || list.children.length < 2) return false;

    state.ranking = true;
    list.dataset.scrollReady = '1';
    const box = list.closest('.ranking');
    if (box) box.classList.add('gn24-ranking-scroll');

    let busy = false;
    let timer = null;

    const move = () => {
      if (busy || list.children.length < 2) return;
      busy = true;
      const first = list.firstElementChild;
      const h = Math.max(42, first.getBoundingClientRect().height);
      list.style.transition = 'transform 1.05s cubic-bezier(.22,.61,.36,1)';
      list.style.transform = `translate3d(0,-${h}px,0)`;
      window.setTimeout(() => {
        list.style.transition = 'none';
        list.appendChild(first);
        list.style.transform = 'translate3d(0,0,0)';
        void list.offsetHeight;
        busy = false;
      }, 1080);
    };

    const start = () => {
      clearInterval(timer);
      timer = setInterval(move, 3000);
    };
    list.addEventListener('mouseenter', () => clearInterval(timer));
    list.addEventListener('mouseleave', start);
    start();
    return true;
  }

  function setupEditor(){
    if (state.editor) return true;
    const grid = document.getElementById('homeNews');
    if (!grid || grid.children.length < 2) return false;

    state.editor = true;
    grid.dataset.scrollReady = '1';

    if (!grid.parentElement.classList.contains('gn24-editor-viewport')) {
      const viewport = document.createElement('div');
      viewport.className = 'gn24-editor-viewport';
      grid.parentNode.insertBefore(viewport, grid);
      viewport.appendChild(grid);
    }
    grid.classList.add('gn24-motion-row');

    let busy = false;
    let timer = null;
    const step = () => {
      const c = grid.firstElementChild;
      if (!c) return 0;
      const gap = parseFloat(getComputedStyle(grid).gap) || 16;
      return c.getBoundingClientRect().width + gap;
    };

    const forward = () => {
      if (busy || grid.children.length < 2) return;
      busy = true;
      const first = grid.firstElementChild;
      const px = step();
      grid.style.transition = 'transform .9s cubic-bezier(.22,.61,.36,1)';
      grid.style.transform = `translate3d(-${px}px,0,0)`;
      setTimeout(() => {
        grid.style.transition = 'none';
        grid.appendChild(first);
        grid.style.transform = 'translate3d(0,0,0)';
        void grid.offsetWidth;
        busy = false;
      }, 930);
    };

    const start = () => {
      clearInterval(timer);
      timer = setInterval(forward, 3600);
    };
    grid.addEventListener('mouseenter', () => clearInterval(timer));
    grid.addEventListener('mouseleave', start);
    start();
    return true;
  }

  function setupHero(){
    if (state.hero) return true;
    const lead = document.getElementById('leadLink');
    const cards = [...document.querySelectorAll('#homeNews .news-card, #latestNews .latest-row')];
    if (!lead || cards.length < 2) return false;

    // Keep hero subtle; the user mainly requested the three obvious motions.
    lead.classList.add('gn24-hero-breathe');
    state.hero = true;
    return true;
  }

  function tryAll(){
    setupBreaking();
    setupRanking();
    setupEditor();
    setupHero();
  }

  // First attempts after app.js starts rendering.
  document.addEventListener('DOMContentLoaded', () => {
    tryAll();
    [300,700,1200,2000,3500,5500].forEach(ms => setTimeout(tryAll, ms));
  });

  // Catch Supabase/API late rendering and any later article refresh.
  const observer = new MutationObserver(() => {
    if (!state.breaking || !state.ranking || !state.editor || !state.hero) {
      requestAnimationFrame(tryAll);
    }
  });
  observer.observe(document.documentElement, {childList:true, subtree:true});

  // Debug marker available in console.
  window.GN24_MOTION_345 = state;
})();
