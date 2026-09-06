(() => {
  'use strict';
  const cfg = window.GN24_SUPABASE;
  const supabaseLib = window.supabase;
  const latestEl = document.getElementById('newsnaLatestNews');
  const noticeEl = document.getElementById('newsnaNotices');
  const statusEl = document.getElementById('newsnaNewsStatus');
  if (!latestEl || !cfg || !supabaseLib?.createClient) return;

  const client = supabaseLib.createClient(cfg.url, cfg.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
  });

  const esc = (v='') => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const articleHref = id => `/pages/article/?id=${encodeURIComponent(id)}`;
  const fmt = d => {
    if (!d) return '';
    const x = String(d).slice(0,10).split('-');
    return x.length === 3 ? `${x[0]}.${x[1]}.${x[2]}` : esc(d);
  };
  const imgStyle = url => url ? ` style="background-image:url('${String(url).replace(/'/g,'%27')}')"` : '';

  function renderNews(items) {
    if (!items?.length) {
      latestEl.innerHTML = '<div class="live-empty">현재 공개된 최신 기사를 불러오지 못했습니다.</div>';
      return;
    }
    latestEl.innerHTML = items.map((x,i) => `
      <a class="live-news-card${i===0?' lead':''}" href="${articleHref(x.id)}">
        <div class="live-news-thumb"${imgStyle(x.image)}><span>${esc(x.category || '뉴스')}</span></div>
        <div class="live-news-copy">
          <div class="live-news-meta">${fmt(x.date)} · ${esc(x.author || 'GLOBAL NEWS24')}</div>
          <b>${esc(x.title)}</b>
          <p>${esc(x.summary || x.subtitle || '')}</p>
        </div>
      </a>`).join('');
  }

  function renderNotices(items) {
    if (!noticeEl) return;
    if (!items?.length) {
      noticeEl.innerHTML = '<a href="/pages/reporter-recruit/">기자 모집 및 공식 안내 확인하기 →</a><a href="/pages/reporter-policy/">기자 운영규정 확인하기 →</a>';
      return;
    }
    noticeEl.innerHTML = items.slice(0,4).map(x => `<a href="${articleHref(x.id)}"><span>${fmt(x.date)}</span>${esc(x.title)}</a>`).join('');
  }

  async function load() {
    if (statusEl) statusEl.textContent = '최신 기사 불러오는 중…';
    const { data, error } = await client
      .from('gn24_articles')
      .select('id,date,title,subtitle,category,author,summary,image,pinned,featured,created_at')
      .eq('is_published', true)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(12);
    if (error) throw error;
    const rows = Array.isArray(data) ? data : [];
    renderNews(rows.slice(0,6));
    renderNotices(rows.filter(x => x.category === '공지'));
    if (statusEl) statusEl.textContent = rows.length ? `Supabase 실시간 원본 · ${fmt(rows[0].date)} 기준` : '공개 기사 없음';
  }

  load().catch(err => {
    console.error('[NEWSNA LIVE NEWS]', err);
    if (statusEl) statusEl.textContent = '최신 기사 연결 확인 필요';
    latestEl.innerHTML = '<div class="live-empty">기사 원본 연결을 확인하고 있습니다. GLOBAL NEWS24 뉴스룸에서 최신 기사를 확인해 주세요.</div>';
    renderNotices([]);
  });
})();