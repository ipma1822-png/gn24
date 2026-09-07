// Global News24 v3.19.0 Supabase configuration
// GLOBAL-NEWS24 전용 Supabase 프로젝트 연결
// 브라우저에는 Publishable Key만 사용합니다.
// Secret Key / service_role Key / Database Password는 절대 넣지 않습니다.

window.GN24_SUPABASE = {
  url: "https://plqqowwdbgixtczzyanr.supabase.co",
  anonKey: "sb_publishable_EnPEZ3d5-hXuJdb8Qrve3A_WB9gLcQy",
  bucket: "news-images"
};

// GN24 ARTICLE REGION SELECTOR v3.19.0
// 기사 작성 화면에서 전국 공통 또는 17개 시·도 지역판을 선택합니다.
(() => {
  if (!/^\/admin-news\.html$/.test(location.pathname)) return;
  const regions=[['','전국 공통 · 지역판 지정 안 함'],['seoul','서울'],['busan','부산'],['daegu','대구'],['incheon','인천'],['gwangju','광주'],['daejeon','대전'],['ulsan','울산'],['sejong','세종'],['gyeonggi','경기'],['gangwon','강원'],['chungbuk','충북'],['chungnam','충남'],['jeonbuk','전북'],['jeonnam','전남'],['gyeongbuk','경북'],['gyeongnam','경남'],['jeju','제주']];
  let lastId='',loadingId='';
  function select(){return document.querySelector('#fRegionCode')}
  function id(){return (document.querySelector('#fId')?.value||'').trim()}
  function installUI(){
    if(select())return true;
    const category=document.querySelector('#fCategory');if(!category)return false;
    const row=document.createElement('div');row.className='form-grid two gn24-region-select-row';
    row.innerHTML=`<label>지역판 선택<select id="fRegionCode">${regions.map(([v,n])=>`<option value="${v}">${n}</option>`).join('')}</select><small style="display:block;margin-top:6px;color:#6c7a8c">예: 청주 기사 → 충북 선택 · 본사 메인과 충북 지역판에 함께 연결</small></label><div class="reporter-link-guide"><b>17개 지역판</b><span>기사 제목에는 지역판 이름을 억지로 붙이지 않습니다. 실제 취재 지역에 맞는 시·도만 선택하세요.</span></div>`;
    category.closest('.form-grid.two')?.insertAdjacentElement('afterend',row);
    document.querySelectorAll('.admin-brand small').forEach(x=>x.textContent='기사 편집실 · v3.19.0');
    const notice=document.querySelector('.notice strong');if(notice)notice.textContent='온라인 편집국 CMS · v3.19.0';
    return true;
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
  installUI();patchSupabase();watch();setInterval(watch,250);
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
