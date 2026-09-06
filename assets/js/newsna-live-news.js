(() => {
  'use strict';
  const cfg = window.GN24_SUPABASE;
  const supabaseLib = window.supabase;
  const latestEl = document.getElementById('newsnaLatestNews');
  const noticeEl = document.getElementById('newsnaNotices');
  const statusEl = document.getElementById('newsnaNewsStatus');

  const esc = (v='') => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
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
    const hamb=document.getElementById('hamb'), mega=document.getElementById('mega');
    if (!hero || !chat) return;

    const style=document.createElement('style');
    style.textContent=`
      html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}button,a{-webkit-tap-highlight-color:transparent}.hero{isolation:isolate}.visual:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 78% 65%,rgba(89,204,255,.18),transparent 34%);pointer-events:none;animation:newsnaGlow 4s ease-in-out infinite}
      .newsna{animation:newsnaFloat 4.8s ease-in-out infinite;filter:drop-shadow(0 18px 24px rgba(0,0,0,.28))}.newsna .face{animation:newsnaNod 5.6s ease-in-out infinite}.newsna .body:before{content:"● ONLINE";position:absolute;top:132px;left:42px;color:#7fffb3;font-size:9px;font-weight:900;letter-spacing:.08em}
      .assistant{position:relative}.assistant:after{content:"NEWSNA · OFFICIAL GUIDE";position:absolute;right:13px;bottom:7px;color:#8aa0b0;font-size:8px;font-weight:900;letter-spacing:.08em;pointer-events:none}.ashead{position:relative;padding-left:46px}.ashead:before{content:"N";position:absolute;left:14px;top:10px;width:25px;height:25px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#0877d7,#55c9ff);color:#fff;font-size:11px;font-weight:1000;box-shadow:0 0 0 4px #e8f5ff}
      .msg{position:relative;box-shadow:0 5px 14px rgba(6,23,45,.06);animation:newsnaPop .22s ease both}.msg.bot{margin-right:8%;border-top-left-radius:5px}.msg.user{border-top-right-radius:5px}.msg.bot:before{content:"";position:absolute;left:-6px;top:10px;border-width:0 7px 8px 0;border-style:solid;border-color:transparent #dce7ef transparent transparent}.msg.user:after{content:"";position:absolute;right:-6px;top:10px;border-width:0 0 8px 7px;border-style:solid;border-color:transparent transparent transparent #0877d7}
      .tools button,.choices button,.quick a,.actions a,.faqtools button,.hamb{min-height:44px}.tools button{transition:.2s}.tools button:hover{transform:translateY(-1px);box-shadow:0 6px 14px rgba(0,70,140,.22)}.tools button.newsna-on{background:#fff;color:#0868bc;border-color:#bfe3ff}.choices button{transition:.18s}.choices button:hover{transform:translateY(-1px);background:#fff;border-color:#65b9ef;box-shadow:0 5px 12px rgba(8,119,215,.11)}
      .hero.newsna-full{min-height:100dvh;border-radius:0}.hero.newsna-full .panel{min-height:100dvh}.hero.newsna-full .chat{max-height:48dvh}.newsna-toast{position:fixed;left:50%;bottom:max(24px,env(safe-area-inset-bottom));z-index:999;transform:translate(-50%,18px);opacity:0;background:#06172d;color:#fff;border:1px solid #ffffff35;padding:11px 16px;border-radius:999px;font-size:12px;font-weight:850;box-shadow:0 10px 30px #0005;transition:.25s;max-width:calc(100% - 28px);text-align:center}.newsna-toast.show{opacity:1;transform:translate(-50%,0)}
      @media(max-width:600px){body{overflow-x:hidden}.wrap{width:min(100% - 16px,1180px)}.headin{height:58px;gap:8px}.brand{font-size:13px;white-space:nowrap}.brand img{width:34px}.hamb{margin-left:auto;width:44px;height:44px}.mega{inset:58px 0 auto;padding:10px 8px;max-height:calc(100dvh - 58px);overflow:auto}.mg{gap:8px}.mg section{padding:12px}.mg a{min-height:42px;display:flex;align-items:center}.page{padding-top:8px}.hero{border-radius:18px;min-height:0}.visual{min-height:300px;padding:22px 20px}.visual h1{font-size:31px;line-height:1.08;max-width:68%;margin:8px 0}.visual p{max-width:61%;font-size:12px;line-height:1.5}.newsna{right:-8px;bottom:4px}.panel{padding:10px}.tools{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:8px}.tools button{padding:8px 5px;font-size:11px;white-space:nowrap}.assistant{border-radius:16px}.ashead{font-size:13px;padding:13px 10px 13px 43px}.chat{min-height:150px;max-height:34dvh;padding:10px}.msg{font-size:13px;line-height:1.5;margin:6px 0;padding:10px 11px}.choices{grid-template-columns:1fr;padding:0 10px 10px;gap:6px}.choices button{padding:11px;font-size:13px}.actions{padding:0 10px 14px}.actions a{display:inline-flex;align-items:center;padding:9px 12px}.quick{grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin-top:9px}.quick a{padding:12px 6px}.quick span{font-size:23px}.quick b{font-size:12px}.live{margin-top:20px}.sectitle{align-items:flex-start;gap:8px}.sectitle h2{font-size:21px}.sectitle small{font-size:10px}.notice,.newsbox{padding:14px;border-radius:15px}.latest{grid-template-columns:1fr}.live-news-card{display:grid;grid-template-columns:112px 1fr}.live-news-thumb{height:100%;min-height:104px}.live-news-copy{padding:9px}.live-news-copy b{font-size:12px}.live-news-copy p{font-size:10px;-webkit-line-clamp:2}.faqsec{margin-top:20px}.faq summary{padding:13px;font-size:13px;line-height:1.45}.ans{font-size:13px}.faqtools{flex-shrink:0}.banner{padding:18px;font-size:13px}.ver{text-align:center;font-size:9px}.hero.newsna-full{display:block;overflow:auto}.hero.newsna-full .visual{min-height:220px}.hero.newsna-full .panel{min-height:auto}.hero.newsna-full .chat{max-height:38dvh}}
      @media(max-width:370px){.brand{font-size:11px}.visual h1{font-size:27px}.visual p{max-width:58%}.tools button{font-size:10px}.quick{grid-template-columns:1fr 1fr}}
      @keyframes newsnaFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}@keyframes newsnaNod{0%,85%,100%{transform:rotate(0)}90%{transform:rotate(2deg)}95%{transform:rotate(-1deg)}}@keyframes newsnaGlow{50%{opacity:.55}}@keyframes newsnaPop{from{opacity:0;transform:translateY(5px) scale(.99)}to{opacity:1;transform:none}}
      @media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}.newsna,.newsna .face,.visual:before,.msg{animation:none!important}}
    `;
    document.head.appendChild(style);

    const toast=document.createElement('div'); toast.className='newsna-toast'; toast.setAttribute('role','status'); toast.setAttribute('aria-live','polite'); document.body.appendChild(toast);
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
    if (hamb && mega) {
      hamb.setAttribute('aria-label','전체 메뉴 열기');hamb.setAttribute('aria-controls','mega');hamb.setAttribute('aria-expanded',String(mega.classList.contains('open')));
      hamb.addEventListener('click',()=>setTimeout(()=>{const open=mega.classList.contains('open');hamb.setAttribute('aria-expanded',String(open));hamb.setAttribute('aria-label',open?'전체 메뉴 닫기':'전체 메뉴 열기')},0));
      mega.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{mega.classList.remove('open');hamb.setAttribute('aria-expanded','false');hamb.setAttribute('aria-label','전체 메뉴 열기')}));
      document.addEventListener('keydown',e=>{if(e.key==='Escape'&&mega.classList.contains('open')){mega.classList.remove('open');hamb.setAttribute('aria-expanded','false');hamb.focus()}});
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