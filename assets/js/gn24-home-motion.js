/* Global News24 v3.4.6 · readable newsroom motion */
(() => {
'use strict';
const S={breaking:false,ranking:false,editor:false};
const clean=s=>(s||'').replace(/\s+/g,' ').trim();

function links(sel,limit=10){
  const seen=new Set(), out=[];
  document.querySelectorAll(sel).forEach(a=>{
    const t=clean(a.textContent);
    if(t.length<4||seen.has(t)) return;
    seen.add(t); out.push({href:a.getAttribute('href')||'#',title:t});
  });
  return out.slice(0,limit);
}

function breaking(){
  if(S.breaking) return true;
  const box=document.querySelector('.breaking .ticker');
  if(!box) return false;
  const a=links('#topLatest a, #homeNews a, #latestNews a, #attentionList a',10);
  if(a.length<3) return false;
  const one=a.map((x,i)=>`<a class="gn24-breaking-item" href="${x.href}"><em>${i?'NEWS':'속보'}</em><span>${x.title}</span><i>◆</i></a>`).join('');
  box.innerHTML=`<div class="gn24-breaking-track">${one}${one}</div>`;
  S.breaking=true; return true;
}

function ranking(){
  if(S.ranking) return true;
  const list=document.getElementById('topLatest');
  if(!list||list.children.length<3) return false;
  const viewport=document.createElement('div');
  viewport.className='gn24-ranking-viewport';
  list.parentNode.insertBefore(viewport,list); viewport.appendChild(list);
  list.classList.add('gn24-ranking-list');
  S.ranking=true;
  let busy=false,timer;
  function move(){
    if(busy||list.children.length<2)return;
    busy=true;
    const first=list.firstElementChild;
    const h=first.getBoundingClientRect().height;
    list.style.transition='transform 1.45s ease-in-out';
    list.style.transform=`translateY(-${h}px)`;
    setTimeout(()=>{
      list.style.transition='none';
      list.appendChild(first);
      list.style.transform='translateY(0)';
      void list.offsetHeight;
      busy=false;
    },1500);
  }
  const start=()=>{clearInterval(timer);timer=setInterval(move,4800)};
  viewport.onmouseenter=()=>clearInterval(timer);
  viewport.onmouseleave=start; start(); return true;
}

function editor(){
  if(S.editor)return true;
  const grid=document.getElementById('homeNews');
  if(!grid||grid.children.length<2)return false;
  let viewport=grid.parentElement;
  if(!viewport.classList.contains('gn24-editor-viewport')){
    viewport=document.createElement('div'); viewport.className='gn24-editor-viewport';
    grid.parentNode.insertBefore(viewport,grid); viewport.appendChild(grid);
  }
  grid.classList.add('gn24-editor-row');
  S.editor=true;
  let busy=false,timer;
  function move(){
    if(busy||grid.children.length<2)return;
    busy=true;
    const first=grid.firstElementChild;
    const gap=parseFloat(getComputedStyle(grid).gap)||16;
    const step=first.getBoundingClientRect().width+gap;
    grid.style.transition='transform 1.35s ease-in-out';
    grid.style.transform=`translateX(-${step}px)`;
    setTimeout(()=>{
      grid.style.transition='none';
      grid.appendChild(first);
      grid.style.transform='translateX(0)';
      void grid.offsetWidth;
      busy=false;
    },1400);
  }
  const start=()=>{clearInterval(timer);timer=setInterval(move,5200)};
  viewport.onmouseenter=()=>clearInterval(timer);
  viewport.onmouseleave=start; start(); return true;
}

function init(){breaking();ranking();editor();}
document.addEventListener('DOMContentLoaded',()=>{
 init(); [500,1000,1800,3000,5000].forEach(x=>setTimeout(init,x));
});
new MutationObserver(()=>requestAnimationFrame(init))
 .observe(document.documentElement,{childList:true,subtree:true});
})();
