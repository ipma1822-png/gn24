(() => {
  'use strict';
  const cfg = window.GN24_SUPABASE;
  const supabaseLib = window.supabase;
  const latestEl = document.getElementById('newsnaLatestNews');
  const noticeEl = document.getElementById('newsnaNotices');
  const statusEl = document.getElementById('newsnaNewsStatus');

  const esc = (v='') => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#039;'}[c]));
  const articleHref = id => `/pages/article/?id=${encodeURIComponent(id)}`;
  const fmt = d => {
    if (!d) return '';
    const x = String(d).slice(0,10).split('-');
    return x.length === 3 ? `${x[0]}.${x[1]}.${x[2]}` : esc(d);
  };
  const imgStyle = url => url ? ` style="background-image:url('${String(url).replace(/'/g,'%27')}')"` : '';

  function renderNews(items) {
    if (!latestEl) return;
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

  async function loadNews() {
    if (!latestEl || !cfg || !supabaseLib?.createClient) return;
    if (statusEl) statusEl.textContent = '최신 기사 불러오는 중…';
    const client = supabaseLib.createClient(cfg.url, cfg.anonKey, {auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
    const { data, error } = await client.from('gn24_articles')
      .select('id,date,title,subtitle,category,author,summary,image,pinned,featured,created_at')
      .eq('is_published', true).order('date',{ascending:false}).order('created_at',{ascending:false}).limit(12);
    if (error) throw error;
    const rows = Array.isArray(data) ? data : [];
    renderNews(rows.slice(0,6));
    renderNotices(rows.filter(x => x.category === '공지'));
    if (statusEl) statusEl.textContent = rows.length ? `Supabase 실시간 원본 · ${fmt(rows[0].date)} 기준` : '공개 기사 없음';
  }

  function enhanceNewsna() {
    const hero=document.querySelector('.hero'), visual=document.querySelector('.visual'), newsna=document.querySelector('.newsna');
    const chat=document.getElementById('chat'), voice=document.getElementById('voice'), reset=document.getElementById('reset'), full=document.getElementById('full');
    if (!hero || !chat) return;

    const style=document.createElement('style');
    style.textContent=`
      .hero{isolation:isolate}.visual:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 78% 65%,rgba(89,204,255,.18),transparent 34%);pointer-events:none;animation:newsnaGlow 4s ease-in-out infinite}
      .newsna{animation:newsnaFloat 4.8s ease-in-out infinite;filter:drop-shadow(0 18px 24px rgba(0,0,0,.28))}.newsna .face{animation:newsnaNod 5.6s ease-in-out infinite}.newsna .body:before{content:"● ONLINE";position:absolute;top:132px;left:42px;color:#7fffb3;font-size:9px;font-weight:900;letter-spacing:.08em}
      .assistant{position:relative}.assistant:after{content:"NEWSNA · OFFICIAL GUIDE";position:absolute;right:13px;bottom:7px;color:#8aa0b0;font-size:8px;font-weight:900;letter-spacing:.08em;pointer-events:none}.ashead{position:relative;padding-left:46px}.ashead:before{content:"N";position:absolute;left:14px;top:10px;width:25px;height:25px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#0877d7,#55c9ff);color:#fff;font-size:11px;font-weight:1000;box-shadow:0 0 0 4px #e8f5ff}
      .msg{position:relative;box-shadow:0 5px 14px rgba(6,23,45,.06);animation:newsnaPop .22s ease both}.msg.bot{margin-right:8%;border-top-left-radius:5px}.msg.user{border-top-right-radius:5px}.msg.bot:before{content:"";position:absolute;left:-6px;top:10px;border-width:0 7px 8px 0;border-style:solid;border-color:transparent #dce7ef transparent transparent}.msg.user:after{content:"";position:absolute;right:-6px;top:10px;border-width:0 0 8px 7px;border-style:solid;border-color:transparent transparent transparent #0877d7}
      .tools button{transition:.2s}.tools button:hover{transform:translateY(-1px);box-shadow:0 6px 14px rgba(0,70,140,.22)}.tools button.newsna-on{background:#fff;color:#0868bc;border-color:#bfe3ff}.choices button{transition:.18s}.choices button:hover{transform:translateY(-1px);background:#fff;border-color:#65b9ef;box-shadow:0 5px 12px rgba(8,119,215,.11)}
      .hero.newsna-full{min-height:100vh;border-radius:0}.hero.newsna-full .panel{min-height:100vh}.hero.newsna-full .chat{max-height:48vh}.newsna-toast{position:fixed;left:50%;bottom:24px;z-index:999;transform:translate(-50%,18px);opacity:0;background:#06172d;color:#fff;border:1px solid #ffffff35;padding:11px 16px;border-radius:999px;font-size:12px;font-weight:850;box-shadow:0 10px 30px #0005;transition:.25s}.newsna-toast.show{opacity:1;transform:translate(-50%,0)}
      @keyframes newsnaFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}@keyframes newsnaNod{0%,85%,100%{transform:rotate(0)}90%{transform:rotate(2deg)}95%{transform:rotate(-1deg)}}@keyframes newsnaGlow{50%{opacity:.55}}@keyframes newsnaPop{from{opacity:0;transform:translateY(5px) scale(.99)}to{opacity:1;transform:none}}
      @media(prefers-reduced-motion:reduce){.newsna,.newsna .face,.visual:before,.msg{animation:none!important}}
    `;
    document.head.appendChild(style);

    const toast=document.createElement('div'); toast.className='newsna-toast'; document.body.appendChild(toast);
    let toastTimer; const sayToast=t=>{toast.textContent=t;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),1800)};

    if (voice) {
      const syncVoice=()=>{const on=/켜짐/.test(voice.textContent);voice.classList.toggle('newsna-on',on);voice.setAttribute('aria-pressed',String(on));voice.title=on?'뉴스나 음성안내를 끕니다':'뉴스나 음성안내를 켭니다'};
      voice.addEventListener('click',()=>{setTimeout(()=>{syncVoice();sayToast(/켜짐/.test(voice.textContent)?'뉴스나 음성안내가 켜졌습니다.':'뉴스나 음성안내가 꺼졌습니다.')},0)});syncVoice();
    }
    if (reset) reset.addEventListener('click',()=>{if('speechSynthesis' in window) speechSynthesis.cancel();sayToast('뉴스나와의 대화를 처음부터 시작합니다.')});
    if (full) {
      const syncFull=()=>{const on=!!document.fullscreenElement;hero.classList.toggle('newsna-full',on);full.textContent=on?'↙ 전체화면 종료':'⛶ 전체화면';full.setAttribute('aria-pressed',String(on))};
      document.addEventListener('fullscreenchange',syncFull);syncFull();
    }
    document.addEventListener('visibilitychange',()=>{if(document.hidden&&'speechSynthesis' in window)speechSynthesis.cancel()});
    chat.setAttribute('aria-live','polite'); chat.setAttribute('aria-label','뉴스나 대화 내용');
    if (visual) visual.setAttribute('aria-label','GLOBAL NEWS24 AI 안내비서 뉴스나');
    if (newsna) newsna.setAttribute('aria-hidden','true');
  }

  enhanceNewsna();
  loadNews().catch(err => {
    console.error('[NEWSNA LIVE NEWS]', err);
    if (statusEl) statusEl.textContent = '최신 기사 연결 확인 필요';
    if (latestEl) latestEl.innerHTML = '<div class="live-empty">기사 원본 연결을 확인하고 있습니다. GLOBAL NEWS24 뉴스룸에서 최신 기사를 확인해 주세요.</div>';
    renderNotices([]);
  });
})();