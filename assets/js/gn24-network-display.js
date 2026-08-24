/* GN24 v3.4.9 · electric network scoreboard */
(() => {
  'use strict';

  function findPanel(){
    const all = [...document.querySelectorAll('section,div,aside')];
    return all.find(el => {
      const t=(el.textContent||'').replace(/\s+/g,' ').trim();
      return t.includes('글로벌 취재·협력 네트워크') &&
             /[\d,]+\s*\+?/.test(t);
    });
  }

  function decorate(){
    const panel=findPanel();
    if(!panel || panel.dataset.gn24ElectricDone==='1') return false;

    panel.classList.add('gn24-network-electric');

    // Find the largest/most likely numeric element inside the network panel.
    const candidates=[...panel.querySelectorAll('strong,b,span,div,p')].filter(el=>{
      const t=(el.textContent||'').trim();
      return /^[\d,]+\+?$/.test(t);
    });

    let numberEl=candidates.sort((a,b)=>{
      const af=parseFloat(getComputedStyle(a).fontSize)||0;
      const bf=parseFloat(getComputedStyle(b).fontSize)||0;
      return bf-af;
    })[0];

    if(!numberEl){
      // Last resort: wrap numeric text in panel.
      const walker=document.createTreeWalker(panel,NodeFilter.SHOW_TEXT);
      let node;
      while(node=walker.nextNode()){
        if(/^[\s]*[\d,]+\+?[\s]*$/.test(node.nodeValue||'')){
          const span=document.createElement('span');
          span.textContent=node.nodeValue.trim();
          node.parentNode.replaceChild(span,node);
          numberEl=span;
          break;
        }
      }
    }
    if(!numberEl) return false;

    numberEl.classList.add('gn24-electric-number');

    // Add a pulsing live indicator beside the existing small caption if possible.
    const captions=[...panel.querySelectorAll('small,span,p,div')].filter(el=>{
      const t=(el.textContent||'').toUpperCase();
      return t.includes('LIVE') && !el.classList.contains('gn24-electric-number');
    });
    if(captions[0] && !captions[0].querySelector('.gn24-electric-live-dot')){
      const dot=document.createElement('i');
      dot.className='gn24-electric-live-dot';
      captions[0].prepend(dot);
    }

    panel.dataset.gn24ElectricDone='1';
    return true;
  }

  document.addEventListener('DOMContentLoaded',()=>{
    decorate();
    [300,700,1200,2000,3500].forEach(ms=>setTimeout(decorate,ms));
  });

  new MutationObserver(()=>requestAnimationFrame(decorate))
    .observe(document.documentElement,{childList:true,subtree:true});
})();