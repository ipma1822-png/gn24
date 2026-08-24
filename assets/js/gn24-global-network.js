/* Global News24 v3.4.2
   IPMA Gateway와 동일한 GMS 공개 통계 RPC를 읽어
   '글로벌 취재·협력 네트워크' 숫자 하나만 표시합니다. */
(() => {
  const IPMA_GMS_URL = 'https://ojxarsfaewehwjidwgac.supabase.co';
  const IPMA_GMS_KEY = 'sb_publishable_ZoAZrV5rDmYDLxhXlnEXCw_lPqJfin0';

  function statObj(data){
    if(Array.isArray(data)) return data[0] || null;
    return data && typeof data === 'object' ? data : null;
  }

  function animateNumber(el,target){
    const end=Math.max(0,Number(target)||0), start=performance.now(), duration=1300;
    function frame(now){
      const p=Math.min(1,(now-start)/duration), eased=1-Math.pow(1-p,3);
      el.textContent=Math.floor(end*eased).toLocaleString('ko-KR');
      if(p<1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  async function loadGlobalNetwork(){
    const number=document.getElementById('gn24GlobalNetwork');
    const status=document.getElementById('gn24GlobalNetworkStatus');
    if(!number) return;
    try{
      const res=await fetch(`${IPMA_GMS_URL}/rest/v1/rpc/gms_get_gateway_stats_v1`,{
        method:'POST',
        cache:'no-store',
        headers:{
          apikey:IPMA_GMS_KEY,
          Authorization:`Bearer ${IPMA_GMS_KEY}`,
          'Content-Type':'application/json'
        },
        body:'{}'
      });
      const raw=await res.json().catch(()=>null);
      if(!res.ok) throw new Error(raw?.message || `HTTP ${res.status}`);
      const stats=statObj(raw);
      const total=Number(stats?.public_members_total);
      if(!Number.isFinite(total)) throw new Error('public_members_total missing');
      number.textContent='0';
      animateNumber(number,total);
      if(status) status.textContent='LIVE · GLOBAL NETWORK';
    }catch(err){
      console.warn('GN24 global network:',err);
      number.textContent='—';
      if(status) status.textContent='NETWORK DATA CONNECTING';
    }
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',loadGlobalNetwork,{once:true});
  }else{
    loadGlobalNetwork();
  }
})();
