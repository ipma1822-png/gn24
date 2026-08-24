(() => {
'use strict';
const S={breaking:false,ranking:false,editor:false};
const clean=s=>(s||'').replace(/\s+/g,' ').trim();
function links(sel,limit=10){
 const seen=new Set(),out=[];
 document.querySelectorAll(sel).forEach(a=>{
  const t=clean(a.textContent);
  if(t.length<4||seen.has(t))return;
  seen.add(t); out.push({href:a.getAttribute('href')||'#',title:t});
 });
 return out.slice(0,limit);
}
function breaking(){
 if(S.breaking)return true;
 const box=document.querySelector('.breaking .ticker'); if(!box)return false;
 const a=links('#topLatest a, #homeNews a, #latestNews a, #attentionList a',10); if(a.length<3)return false;
 const one=a.map((x,i)=>`<a class="gn24-breaking-item" href="${x.href}"><em>${i?'NEWS':'속보'}</em><span>${x.title}</span><i>◆</i></a>`).join('');
 box.innerHTML=`<div class="gn24-breaking-track">${one}${one}</div>`; S.breaking=true; return true;
}
function ranking(){
 if(S.ranking)return true;
 const original=document.getElementById('topLatest');
 if(!original||original.children.length<9)return false;
 const viewport=document.createElement('div'); viewport.className='gn24-ranking-viewport gn24-ranking-all9';
 const track=document.createElement('div'); track.className='gn24-ranking-track';
 [...original.children].slice(0,9).forEach((li,idx)=>{
   const c=li.cloneNode(true),a=c.querySelector('a');
   if(a)a.setAttribute('data-fixed-rank',String(idx+1).padStart(2,'0'));
   track.appendChild(c);
 });
 original.classList.add('gn24-ranking-source');
 original.parentNode.insertBefore(viewport,original); viewport.appendChild(track);

 const size=()=>requestAnimationFrame(()=>{
   let total=0;
   [...track.children].forEach(el=>{
     const cs=getComputedStyle(el);
     total+=el.getBoundingClientRect().height+(parseFloat(cs.marginTop)||0)+(parseFloat(cs.marginBottom)||0);
   });
   if(total>0)viewport.style.height=Math.ceil(total)+'px';
 });
 size(); window.addEventListener('resize',size);

 S.ranking=true; let busy=false,timer=null;
 function move(){
  if(busy||track.children.length<9)return; busy=true;
  const first=track.firstElementChild,cs=getComputedStyle(first);
  const d=first.getBoundingClientRect().height+(parseFloat(cs.marginTop)||0)+(parseFloat(cs.marginBottom)||0);
  track.style.transition='transform 1.25s ease-in-out';
  track.style.transform=`translate3d(0,-${d}px,0)`;
  setTimeout(()=>{
    track.style.transition='none'; track.appendChild(first); track.style.transform='translate3d(0,0,0)';
    void track.offsetHeight; busy=false;
  },1300);
 }
 const start=()=>{clearInterval(timer);timer=setInterval(move,5000)};
 viewport.onmouseenter=()=>clearInterval(timer); viewport.onmouseleave=start; start(); return true;
}
function editor(){
 if(S.editor)return true;
 const grid=document.getElementById('homeNews'); if(!grid||grid.children.length<2)return false;
 let viewport=grid.parentElement;
 if(!viewport.classList.contains('gn24-editor-viewport')){
   viewport=document.createElement('div'); viewport.className='gn24-editor-viewport';
   grid.parentNode.insertBefore(viewport,grid); viewport.appendChild(grid);
 }
 grid.classList.add('gn24-editor-row'); S.editor=true; let busy=false,timer=null;
 function move(){
  if(busy||grid.children.length<2)return; busy=true;
  const first=grid.firstElementChild,gap=parseFloat(getComputedStyle(grid).gap)||16;
  const step=first.getBoundingClientRect().width+gap;
  grid.style.transition='transform 1.35s ease-in-out';
  grid.style.transform=`translate3d(-${step}px,0,0)`;
  setTimeout(()=>{
   grid.style.transition='none'; grid.appendChild(first); grid.style.transform='translate3d(0,0,0)';
   void grid.offsetWidth; busy=false;
  },1400);
 }
 const start=()=>{clearInterval(timer);timer=setInterval(move,5400)};
 viewport.onmouseenter=()=>clearInterval(timer); viewport.onmouseleave=start; start(); return true;
}
function init(){breaking();ranking();editor();}
document.addEventListener('DOMContentLoaded',()=>{init();[500,1000,1800,3000,5000,7500].forEach(ms=>setTimeout(init,ms));});
new MutationObserver(()=>requestAnimationFrame(init)).observe(document.documentElement,{childList:true,subtree:true});
})();