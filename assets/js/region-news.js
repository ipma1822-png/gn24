(() => {
  const REGIONS={
    seoul:'서울',busan:'부산',daegu:'대구',incheon:'인천',gwangju:'광주',daejeon:'대전',ulsan:'울산',sejong:'세종',
    gyeonggi:'경기',gangwon:'강원',chungbuk:'충북',chungnam:'충남',jeonbuk:'전북',jeonnam:'전남',gyeongbuk:'경북',gyeongnam:'경남',jeju:'제주'
  };
  const esc=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt=(d='')=>String(d||'').replaceAll('-','.');
  const region=document.body?.dataset?.region||new URLSearchParams(location.search).get('r')||'';
  const regionName=REGIONS[region]||'지역';
  const defaultImage='/assets/images/news/gn24-default-news.svg';
  function articleURL(id){return `/pages/article/?id=${encodeURIComponent(id)}`}
  function setText(id,text){const el=document.getElementById(id);if(el)el.textContent=text}
  function applyRegionLabels(){
    setText('regionName',regionName); setText('regionName2',regionName); setText('regionName3',regionName);
    document.title=`GLOBAL NEWS24 ${regionName} | 지역뉴스`;
    document.querySelectorAll('[data-region-tab]').forEach(el=>{if(el.dataset.regionTab===region)el.classList.add('active')});
  }
  async function getConfig(){
    if(window.GN24_SUPABASE) return window.GN24_SUPABASE;
    await new Promise(resolve=>{const s=document.createElement('script');s.src='/assets/js/gn24-supabase-config.js?v=3.16.0';s.onload=resolve;s.onerror=resolve;document.head.appendChild(s)});
    return window.GN24_SUPABASE||{};
  }
  async function loadRows(){
    const cfg=await getConfig();
    if(!cfg.url||!cfg.anonKey||!REGIONS[region]) return [];
    const base=cfg.url.replace(/\/$/,'');
    const query=`/rest/v1/gn24_articles?select=id,date,title,subtitle,category,author,summary,image,image_caption,region_code,is_published,created_at&is_published=eq.true&region_code=eq.${encodeURIComponent(region)}&order=date.desc,created_at.desc`;
    const r=await fetch(base+query,{cache:'no-store',headers:{apikey:cfg.anonKey}});
    if(!r.ok) throw new Error('지역 기사 불러오기 실패');
    return await r.json();
  }
  function mediaStyle(src){return `background-image:url('${esc(src||defaultImage)}'),url('${defaultImage}')`}
  function lead(a){return `<a class="region-lead" href="${articleURL(a.id)}"><div class="region-lead-media" style="${mediaStyle(a.image)}"></div><div class="region-lead-body"><span class="region-badge">${esc(a.category||regionName+'뉴스')}</span><h3>${esc(a.title)}</h3><div class="region-date">${esc(fmt(a.date))} · ${esc(a.author||'Global News24 편집부')}</div><p class="region-summary">${esc(a.summary||'')}</p></div></a>`}
  function card(a){return `<a class="region-card" href="${articleURL(a.id)}"><div class="region-card-media" style="${mediaStyle(a.image)}"></div><div class="region-card-body"><span class="region-badge">${esc(a.category||regionName+'뉴스')}</span><h3>${esc(a.title)}</h3><div class="region-date">${esc(fmt(a.date))}</div></div></a>`}
  async function init(){
    applyRegionLabels();
    const leadBox=document.getElementById('regionLead'), listBox=document.getElementById('regionList');
    if(!leadBox||!listBox) return;
    try{
      const rows=await loadRows();
      setText('regionCount',`${rows.length.toLocaleString('ko-KR')}건`);
      if(!rows.length){
        leadBox.innerHTML=`<div class="region-empty"><b>현재 ${esc(regionName)} 지역판에 등록된 기사가 없습니다.</b><br>지역 기사가 발행되면 이곳에 자동으로 모입니다.</div>`;
        listBox.innerHTML=''; return;
      }
      leadBox.innerHTML=lead(rows[0]);
      listBox.innerHTML=rows.slice(1,13).map(card).join('')||`<div class="region-empty">추가 지역 기사가 등록되면 자동으로 표시됩니다.</div>`;
    }catch(e){
      console.error(e);
      leadBox.innerHTML='<div class="region-empty">지역뉴스를 불러오지 못했습니다. 잠시 후 다시 확인해주세요.</div>';
      listBox.innerHTML='';
    }
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();
