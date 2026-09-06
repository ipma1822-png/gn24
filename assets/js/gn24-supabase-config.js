// Global News24 v3.2.0 Supabase configuration
// GLOBAL-NEWS24 전용 Supabase 프로젝트 연결
// 브라우저에는 Publishable Key만 사용합니다.
// Secret Key / service_role Key / Database Password는 절대 넣지 않습니다.

window.GN24_SUPABASE = {
  url: "https://plqqowwdbgixtczzyanr.supabase.co",
  anonKey: "sb_publishable_EnPEZ3d5-hXuJdb8Qrve3A_WB9gLcQy",
  bucket: "news-images"
};

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
