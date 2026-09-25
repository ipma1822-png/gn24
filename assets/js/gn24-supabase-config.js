// Global News24 v3.19.0 Supabase configuration
// GLOBAL-NEWS24 전용 Supabase 프로젝트 연결
// 브라우저에는 Publishable Key만 사용합니다.
// Secret Key / service_role Key / Database Password는 절대 넣지 않습니다.

window.GN24_SUPABASE = {
  url: "https://plqqowwdbgixtczzyanr.supabase.co",
  anonKey: "sb_publishable_EnPEZ3d5-hXuJdb8Qrve3A_WB9gLcQy",
  bucket: "news-images"
};

// GN24 ARTICLE REGION SELECTOR v3.20.0
// 국내 17개는 기존 구조를 보존하고 GLOBAL EDITION은 32-country Registry를 읽습니다.
(() => {
  if (!/^\/admin-news\.html$/.test(location.pathname)) return;

  const domesticRegions=[
    ['','전국 공통 · 지역판 지정 안 함'],
    ['seoul','서울'],['busan','부산'],['daegu','대구'],['incheon','인천'],['gwangju','광주'],['daejeon','대전'],
    ['ulsan','울산'],['sejong','세종'],['gyeonggi','경기'],['gangwon','강원'],['chungbuk','충북'],['chungnam','충남'],
    ['jeonbuk','전북'],['jeonnam','전남'],['gyeongbuk','경북'],['gyeongnam','경남'],['jeju','제주']
  ];
  const legacyGlobal=[
    ['morocco','🌍 GLOBAL · 모로코'],['spain','🌍 GLOBAL · 스페인'],['iran','🌍 GLOBAL · 이란'],['nepal','🌍 GLOBAL · 네팔']
  ];
  const koByCode=Object.freeze({
    CN:'중국',JP:'일본',PH:'필리핀',ID:'인도네시아',MY:'말레이시아',TH:'태국',VN:'베트남',NP:'네팔',IN:'인도',PK:'파키스탄',
    IR:'이란',AE:'UAE',SA:'사우디아라비아',TR:'튀르키예',MA:'모로코',EG:'이집트',ZA:'남아프리카공화국',ES:'스페인',
    GB:'영국',FR:'프랑스',DE:'독일',IT:'이탈리아',CA:'캐나다',US:'미국',MX:'멕시코',BR:'브라질',AR:'아르헨티나',
    CO:'콜롬비아',AU:'호주',NZ:'뉴질랜드',KE:'케냐',NG:'나이지리아'
  });

  let regions=[...domesticRegions,...legacyGlobal];
  let lastId='',loadingId='',registryReady=false;

  function select(){return document.querySelector('#fRegionCode')}
  function id(){return (document.querySelector('#fId')?.value||'').trim()}
  function buildGlobalRegions(){
    const registry=window.GN24_COUNTRY_REGISTRY;
    if(!registry||typeof registry!=='object'){
      console.warn('GN24 country registry unavailable; keeping domestic + legacy GLOBAL selector.');
      return false;
    }
    const countries=Object.values(registry);
    const slugs=countries.map(x=>x?.slug).filter(Boolean);
    const codes=countries.map(x=>x?.countryCode).filter(Boolean);
    if(countries.length!==32||slugs.length!==32||new Set(slugs).size!==32||codes.length!==32||new Set(codes).size!==32){
      console.warn('GN24 country registry validation failed; keeping domestic + legacy GLOBAL selector.');
      return false;
    }
    const globals=countries.map(country=>[
      country.slug,
      '🌍 GLOBAL · '+(koByCode[country.countryCode]||country.countryLabel||country.countryName||country.editionName||country.slug)
    ]);
    regions=[...domesticRegions,...globals];
    registryReady=true;
    return true;
  }
  function optionHTML(){return regions.map(([v,n])=>`<option value="${v}">${n}</option>`).join('')}
  function refreshOptions(){
    const sel=select();if(!sel)return;
    const old=sel.value;
    sel.innerHTML=optionHTML();
    if([...sel.options].some(o=>o.value===old))sel.value=old;
  }
  function installUI(){
    if(select())return true;
    const category=document.querySelector('#fCategory');if(!category)return false;
    const row=document.createElement('div');row.className='form-grid two gn24-region-select-row';
    row.innerHTML=`<label>배포판 선택<select id="fRegionCode">${optionHTML()}</select><small style="display:block;margin-top:6px;color:#6c7a8c">국내: 실제 취재 시·도 선택 · 해외: GLOBAL EDITION 국가 선택</small></label><div class="reporter-link-guide"><b>17개 지역판 + GLOBAL EDITION 32</b><span>국내 기사 흐름은 그대로 유지합니다. 해외판 기사는 해당 GLOBAL EDITION 국가만 선택하세요.</span></div>`;
    category.closest('.form-grid.two')?.insertAdjacentElement('afterend',row);
    document.querySelectorAll('.admin-brand small').forEach(x=>x.textContent='기사 편집실 · v3.21.0');
    const notice=document.querySelector('.notice strong');if(notice)notice.textContent='온라인 편집국 CMS · v3.21.0';
    return true;
  }
  function loadRegistry(){
    if(buildGlobalRegions()){refreshOptions();return;}
    if(document.querySelector('script[data-gn24-country-registry]'))return;
    const script=document.createElement('script');
    script.src='/assets/global-edition/country-registry.js?v=1.0.0';
    script.dataset.gn24CountryRegistry='1';
    script.onload=()=>{if(buildGlobalRegions())refreshOptions()};
    script.onerror=()=>console.warn('GN24 country registry load failed; legacy GLOBAL selector remains available.');
    document.head.appendChild(script);
  }
  async function loadRegion(articleId){
    if(!articleId||loadingId===articleId||!select())return;loadingId=articleId;
    try{const cfg=window.GN24_SUPABASE;const url=cfg.url.replace(/\/$/,'')+'/rest/v1/gn24_articles?select=region_code&id=eq.'+encodeURIComponent(articleId)+'&limit=1';const r=await fetch(url,{cache:'no-store',headers:{apikey:cfg.anonKey}});if(!r.ok)return;const rows=await r.json();if(id()===articleId)select().value=rows?.[0]?.region_code||'';}catch(e){console.warn('GN24 region load',e)}finally{loadingId=''}}
  function watch(){if(!installUI())return;const current=id();if(!current||current===lastId)return;lastId=current;select().value='';setTimeout(()=>loadRegion(current),60)}
  function patchSupabase(){
    if(!window.supabase?.createClient||window.supabase.__gn24RegionPatched)return;
    const original=window.supabase.createClient.bind(window.supabase);
    window.supabase.createClient=(...args)=>{const client=original(...args),from=client.from.bind(client);client.from=(table)=>{const q=from(table);if(table!=='gn24_articles'||!q?.upsert)return q;const upsert=q.upsert.bind(q);q.upsert=(values,options)=>{if(!Array.isArray(values)&&values&&typeof values==='object')values={...values,region_code:select()?.value||null};return upsert(values,options)};return q};return client};
    window.supabase.__gn24RegionPatched=true;
  }

  installUI();loadRegistry();patchSupabase();watch();setInterval(watch,250);
})();

// GN24 ADMIN DELETE SYNC HOTFIX v3.13.9
// 온라인 삭제의 의미를 명확히 하고, 삭제 직후 Supabase 원본 목록으로 관리자 화면을 자동 동기화합니다.
(() => {
  if (!/^\/admin-news\.html$/.test(location.pathname)) return;

  document.addEventListener('click', async (event) => {
    const button = event.target.closest?.('#cmsDeleteBtn');
    if (!button || button.disabled) return;

    // 기존 news-cms.js의 삭제 핸들러보다 먼저 처리합니다.
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const id = (document.querySelector('#fId')?.value || '').trim();
    const title = (document.querySelector('#fTitle')?.value || '').trim();
    if (!id) {
      alert('삭제할 기사 ID가 없습니다.');
      return;
    }

    const ok = confirm(
      `이 온라인 기사를 완전히 삭제할까요?\n\n${title ? title + '\n' : ''}${id}\n\n` +
      '✓ Supabase 온라인 기사 DB에서는 완전히 삭제됩니다.\n' +
      '✓ 홈페이지·뉴스목록에서는 더 이상 표시되지 않습니다.\n' +
      '※ GitHub data/news.json 백업 원본은 안전을 위해 자동 삭제하지 않습니다.'
    );
    if (!ok) return;

    const status = document.querySelector('#cmsStatus');
    const detail = document.querySelector('#cmsDetail');
    const setStatus = (text, extra = '') => {
      if (status) text && (status.textContent = text);
      if (detail && extra) detail.textContent = extra;
    };

    try {
      if (!window.supabase) throw new Error('Supabase 모듈이 준비되지 않았습니다.');
      const cfg = window.GN24_SUPABASE || {};
      const sb = window.supabase.createClient(cfg.url, cfg.anonKey);

      const { data: sessionData } = await sb.auth.getSession();
      if (!sessionData?.session) throw new Error('관리자 로그인이 필요합니다.');

      const { data: adminOK, error: adminError } = await sb.rpc('is_gn24_admin');
      if (adminError || adminOK !== true) throw new Error('Global News24 관리자 권한을 확인할 수 없습니다.');

      setStatus('온라인 기사 완전 삭제 중…', id);
      const { error: deleteError } = await sb.from('gn24_articles').delete().eq('id', id);
      if (deleteError) throw deleteError;

      // 실제 삭제 여부를 다시 확인합니다.
      const { data: remaining, error: verifyError } = await sb
        .from('gn24_articles')
        .select('id')
        .eq('id', id)
        .limit(1);
      if (verifyError) throw verifyError;
      if (Array.isArray(remaining) && remaining.length) throw new Error('삭제 확인에 실패했습니다. DB에 기사가 남아 있습니다.');

      // 삭제 후 관리자 목록을 Supabase DB 원본으로 즉시 다시 동기화합니다.
      const { data: rows, error: loadError } = await sb
        .from('gn24_articles')
        .select('*')
        .order('date', { ascending: false })
        .order('id', { ascending: false });
      if (loadError) throw loadError;
      if (window.GN24Admin?.loadDbArticles) {
        await window.GN24Admin.loadDbArticles(rows || []);
      }

      setStatus('온라인 삭제 완료 · 목록 자동갱신', `Supabase DB 삭제 확인 완료 · 현재 ${(rows || []).length}건`);
      alert(
        '온라인 기사 삭제가 완료되었습니다.\n\n' +
        '• Supabase 기사 DB: 삭제 완료\n' +
        '• 홈페이지/기사목록: 삭제 반영\n' +
        '• 관리자 목록: 자동갱신 완료\n' +
        '• GitHub data/news.json: 백업 원본 유지'
      );
    } catch (error) {
      console.error('GN24 online delete sync error', error);
      setStatus('온라인 삭제 실패', error?.message || String(error));
      alert('온라인 삭제 처리 중 오류가 발생했습니다.\n' + (error?.message || error));
    }
  }, true);
})();

// NEWSNA v1.9 — Hand Wizard personal-link bridge.
// 일반 방문에는 아무 변화가 없고, 기자안내센터의 유효한 ?m= 개인 링크에서만 로드합니다.
(() => {
  if (!/^\/pages\/reporter-guide\/?$/.test(location.pathname)) return;
  const id = new URLSearchParams(location.search).get('m');
  if (!id || !/^[A-Za-z0-9]{8,24}$/.test(id)) return;
  if (document.querySelector('script[data-newsna-personalization]')) return;
  const script = document.createElement('script');
  script.src = '/assets/js/newsna-personalization.js?v=1.2';
  script.defer = true;
  script.dataset.newsnaPersonalization = 'v1.2';
  document.head.appendChild(script);
})();
