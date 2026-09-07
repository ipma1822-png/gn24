(() => {
'use strict';
const BUILD='v3.18.5';
const S={breaking:false,ranking:false,editor:false,mobileCss:false,badge:false,leadFill:false,attentionFill:false};
const clean=s=>(s||'').replace(/\s+/g,' ').trim();
function ensureMobileCss(){
 if(S.mobileCss)return;
 if(document.querySelector('link[data-gn24-mobile-newsroom]')){S.mobileCss=true;return;}
 const link=document.createElement('link');
 link.rel='stylesheet';
 link.href='/assets/css/mobile-newsroom.css?v=3.18.5';
 link.dataset.gn24MobileNewsroom=BUILD;
 document.head.appendChild(link);
 S.mobileCss=true;
}
function buildBadge(){
 let badge=document.getElementById('gn24BuildBadge');
 if(badge){badge.textContent='GN24 '+BUILD;return;}
 badge=document.createElement('div');
 badge.id='gn24BuildBadge';
 badge.textContent='GN24 '+BUILD;
 badge.setAttribute('aria-label','GLOBAL NEWS24 현재 배포 버전 '+BUILD);
 Object.assign(badge.style,{position:'fixed',right:'8px',bottom:'8px',zIndex:'9999',padding:'4px 7px',borderRadius:'5px',background:'rgba(5,15,32,.82)',border:'1px solid rgba(200,157,53,.55)',color:'#d7b85a',font:'700 10px/1.2 Arial,sans-serif',letterSpacing:'.5px',pointerEvents:'none',opacity:'.9'});
 document.body.appendChild(badge); S.badge=true;
}
function links(sel,limit=10){
 const seen=new Set(),out=[];
 document.querySelectorAll(sel).forEach(a=>{
  const t=clean(a.textContent);
  if(t.length<4||seen.has(t))return;
  seen.add(t); out.push({href:a.getAttribute('href')||'#',title:t});
 });
 return out.slice(0,limit);
}
function fillLeadGap(){
 if(innerWidth>900)return false;
 const layout=document.querySelector('.lead-layout');
 const lead=document.getElementById('leadLink');
 const rankingBox=layout?.querySelector('.ranking');
 const rows=[...document.querySelectorAll('#latestNews .latest-row')];
 if(!layout||!lead||!rankingBox||rows.length<3)return false;
 let box=layout.querySelector('.gn24-lead-fill');
 if(!box){
   box=document.createElement('div');
   box.className='gn24-lead-fill';
   box.innerHTML='<div class="gn24-lead-fill-head"><b>주요 기사</b><a href="/pages/newsroom/">더보기 →</a></div><div class="gn24-lead-fill-list"></div>';
   layout.insertBefore(box,rankingBox);
 }
 const list=box.querySelector('.gn24-lead-fill-list');
 if(!list)return false;
 const leadHref=lead.getAttribute('href')||'';
 const chosen=rows.filter(r=>(r.getAttribute('href')||'')!==leadHref).slice(0,5);
 if(!chosen.length)return false;
 list.innerHTML='';
 chosen.forEach(r=>{const c=r.cloneNode(true);c.classList.add('gn24-lead-fill-row');list.appendChild(c);});
 S.leadFill=true; return true;
}
function fillAttentionGap(){
 if(innerWidth>900)return false;
 const list=document.getElementById('attentionList');
 if(!list)return false;
 const current=[...list.querySelectorAll('a')];
 const seen=new Set(current.map(a=>clean(a.textContent)));
 const candidates=[...document.querySelectorAll('#latestNews .latest-row, #homeNews .news-card, #topLatest a')];
 for(const node of candidates){
   if(list.children.length>=12)break;
   const a=node.matches('a')?node:node.querySelector('a');
   const title=clean((a||node).textContent);
   const href=(a||node).getAttribute?.('href')||'#';
   if(title.length<4||seen.has(title))continue;
   const li=document.createElement('li');
   const link=document.createElement('a');
   link.href=href; link.textContent=title;
   li.appendChild(link); list.appendChild(li); seen.add(title);
 }
 S.attentionFill=list.children.length>=8;
 return S.attentionFill;
}
function balanceNewsColumns(){
 if(innerWidth>900)return false;
 const latest=document.getElementById('latestNews');
 const attention=document.querySelector('.attention-panel');
 const list=document.getElementById('attentionList');
 if(!latest||!attention||!list)return false;
 const latestRows=[...latest.querySelectorAll('.latest-row')];
 const attentionRows=[...list.children];
 latestRows.forEach((r,i)=>{r.style.display=i<8?'grid':'none';});
 attentionRows.forEach((r,i)=>{r.style.display=i<10?'':'none';});
 requestAnimationFrame(()=>{
   let guard=0;
   while(guard++<8){
     const lh=latest.getBoundingClientRect().height;
     const ah=attention.getBoundingClientRect().height;
     const diff=lh-ah;
     if(Math.abs(diff)<42)break;
     if(diff>42){
       const hidden=[...list.children].find(li=>getComputedStyle(li).display==='none');
       if(hidden){hidden.style.display='';continue;}
       const visibleLatest=[...latest.querySelectorAll('.latest-row')].filter(r=>getComputedStyle(r).display!=='none');
       if(visibleLatest.length>6){visibleLatest.at(-1).style.display='none';continue;}
       break;
     }else{
       const visibleAttention=[...list.children].filter(li=>getComputedStyle(li).display!=='none');
       if(visibleAttention.length>7){visibleAttention.at(-1).style.display='none';continue;}
       const hiddenLatest=[...latest.querySelectorAll('.latest-row')].find(r=>getComputedStyle(r).display==='none');
       if(hiddenLatest){hiddenLatest.style.display='grid';continue;}
       break;
     }
   }
 });
 return true;
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
 [...original.children].slice(0,9).forEach((li,idx)=>{const c=li.cloneNode(true),a=c.querySelector('a');if(a)a.setAttribute('data-fixed-rank',String(idx+1).padStart(2,'0'));track.appendChild(c);});
 original.classList.add('gn24-ranking-source');
 original.parentNode.insertBefore(viewport,original); viewport.appendChild(track);
 const size=()=>requestAnimationFrame(()=>{let total=0;[...track.children].forEach(el=>{const cs=getComputedStyle(el);total+=el.getBoundingClientRect().height+(parseFloat(cs.marginTop)||0)+(parseFloat(cs.marginBottom)||0);});if(total>0)viewport.style.height=Math.ceil(total)+'px';});
 size(); window.addEventListener('resize',size); S.ranking=true;
 if(innerWidth<=900)return true;
 let busy=false,timer=null;
 function move(){if(busy||track.children.length<9)return;busy=true;const first=track.firstElementChild,cs=getComputedStyle(first);const d=first.getBoundingClientRect().height+(parseFloat(cs.marginTop)||0)+(parseFloat(cs.marginBottom)||0);track.style.transition='transform 1.25s ease-in-out';track.style.transform=`translate3d(0,-${d}px,0)`;setTimeout(()=>{track.style.transition='none';track.appendChild(first);track.style.transform='translate3d(0,0,0)';void track.offsetHeight;busy=false;},1300);}
 const start=()=>{clearInterval(timer);timer=setInterval(move,5000)};viewport.onmouseenter=()=>clearInterval(timer);viewport.onmouseleave=start;start();return true;
}
function editor(){
 if(S.editor)return true;
 const grid=document.getElementById('homeNews'); if(!grid||grid.children.length<2)return false;
 if(innerWidth<=900){grid.classList.add('gn24-editor-mobile-static');S.editor=true;return true;}
 let viewport=grid.parentElement;
 if(!viewport.classList.contains('gn24-editor-viewport')){viewport=document.createElement('div');viewport.className='gn24-editor-viewport';grid.parentNode.insertBefore(viewport,grid);viewport.appendChild(grid);}
 grid.classList.add('gn24-editor-row'); S.editor=true; let busy=false,timer=null;
 function move(){if(busy||grid.children.length<2)return;busy=true;const first=grid.firstElementChild,gap=parseFloat(getComputedStyle(grid).gap)||16,step=first.getBoundingClientRect().width+gap;grid.style.transition='transform 1.35s ease-in-out';grid.style.transform=`translate3d(-${step}px,0,0)`;setTimeout(()=>{grid.style.transition='none';grid.appendChild(first);grid.style.transform='translate3d(0,0,0)';void grid.offsetWidth;busy=false;},1400);}
 const start=()=>{clearInterval(timer);timer=setInterval(move,5400)};viewport.onmouseenter=()=>clearInterval(timer);viewport.onmouseleave=start;start();return true;
}
function init(){ensureMobileCss();buildBadge();breaking();ranking();editor();fillLeadGap();fillAttentionGap();balanceNewsColumns();}
document.addEventListener('DOMContentLoaded',()=>{init();[500,1000,1800,3000,5000,7500].forEach(ms=>setTimeout(init,ms));});
new MutationObserver(()=>requestAnimationFrame(init)).observe(document.documentElement,{childList:true,subtree:true});
})();