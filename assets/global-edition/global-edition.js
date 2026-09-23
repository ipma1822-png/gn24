/* Reusable renderer. Config and approved content are separate inputs. */
(() => {
  'use strict';
  const BASE = '/global-edition-master/';
  const MEDIA = '/assets/global-edition/data/';
  const FALLBACK = MEDIA + 'fallback.svg';
  const params = new URLSearchParams(location.search);
  const profile = params.get('profile') === 'rtl' ? 'rtl' : 'ltr';
  const config = window.GN24_GLOBAL_CONFIG?.[profile];
  const articles = Array.isArray(window.GN24_GLOBAL_SAMPLE_CONTENT) ? window.GN24_GLOBAL_SAMPLE_CONTENT : [];
  const root = document.getElementById('globalEditionRoot');
  const main = document.getElementById('globalMain');
  if (!config || !root || !main) return;

  document.documentElement.lang = config.language;
  document.documentElement.dir = config.direction;
  document.body.dir = config.direction;
  document.title = `${config.editionName} · TEST / DEVELOPMENT`;
  const ui = config.ui;
  const $ = id => document.getElementById(id);
  const text = (tag, value, className) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    element.textContent = String(value ?? '');
    return element;
  };
  const link = (label, href, className) => {
    const element = text('a', label, className);
    element.href = href;
    return element;
  };
  const pageUrl = (view, additional = {}) => {
    const query = new URLSearchParams({profile});
    if (view && view !== 'home') query.set('view', view);
    Object.entries(additional).forEach(([key, value]) => {if (value) query.set(key, value);});
    return BASE + '?' + query.toString();
  };
  const formatDate = value => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return '';
    const date = new Date(`${value}T12:00:00Z`);
    return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat(config.locale, {year:'numeric',month:'short',day:'numeric',timeZone:'UTC'}).format(date);
  };
  const imageSource = value => {
    if (!value) return FALLBACK;
    if (/^https:\/\//i.test(value)) return value;
    if (/^[a-z0-9-]+\.svg$/i.test(value)) return MEDIA + value;
    return FALLBACK;
  };
  const media = article => {
    const box = text('span', '', 'global-edition-media');
    const image = document.createElement('img');
    image.src = imageSource(article.image);
    image.alt = '';
    image.loading = 'lazy';
    image.onerror = () => {image.onerror = null; image.src = FALLBACK;};
    box.append(image);
    return box;
  };
  const category = key => ui[key] || String(key ?? '');
  const badge = article => `${article.scope === 'country-local' ? ui.country : ui.feed} · ${category(article.category)}`;
  const storyHref = article => pageUrl('article', {id: article.id});
  const card = article => {
    const element = link('', storyHref(article), 'global-edition-card');
    element.append(media(article));
    const copy = text('div', '', 'global-edition-card-copy');
    copy.append(text('span', badge(article), 'global-edition-meta'), text('h3', article.title), text('p', article.summary));
    const date = text('time', formatDate(article.date));
    date.dateTime = article.date;
    copy.append(date);
    element.append(copy);
    return element;
  };
  const row = article => {
    const element = link('', storyHref(article), 'global-edition-news-row');
    element.append(media(article));
    const copy = text('div', '');
    copy.append(text('span', badge(article), 'global-edition-meta'), text('h3', article.title), text('p', article.summary));
    element.append(copy);
    return element;
  };
  const section = (title, list, id) => {
    if (!list.length) return;
    const block = text('section', '', 'global-edition-section');
    if (id) block.id = id;
    const heading = text('div', '', 'global-edition-section-head');
    heading.append(text('h2', title), link(ui.more + ' ↗', pageUrl('newsroom'), 'global-edition-more'));
    const grid = text('div', '', 'global-edition-cards');
    list.slice(0, 3).forEach(article => grid.append(card(article)));
    block.append(heading, grid);
    main.append(block);
  };
  const intro = (title, description) => {
    const block = text('div', '', 'global-edition-intro');
    block.append(text('span', `${config.countryLabel} · ${ui.development}`, 'global-edition-eyebrow'), text('h1', title), text('p', description));
    main.append(block);
  };
  const home = () => {
    intro(config.editionName, ui.intro);
    const lead = articles.find(article => article.featured) || articles[0];
    if (!lead) return;
    const layout = text('div', '', 'global-edition-lead-grid');
    const featured = link('', storyHref(lead), 'global-edition-lead');
    featured.append(media(lead));
    const copy = text('div', '', 'global-edition-lead-copy');
    copy.append(text('span', `${ui.top} · ${badge(lead)}`, 'global-edition-meta'), text('h2', lead.title), text('p', lead.summary));
    featured.append(copy);
    const side = text('aside', '', 'global-edition-side');
    side.append(text('h2', ui.latest));
    articles.filter(article => article !== lead).slice(0, 4).forEach(article => {
      const item = link('', storyHref(article));
      item.append(text('span', article.title), text('small', formatDate(article.date)));
      side.append(item);
    });
    layout.append(featured, side);
    main.append(layout);
    section(ui.main, articles.filter(article => article !== lead), 'main-news');
    section(ui.local, articles.filter(article => article.scope === 'country-local'), 'local-news');
    section(ui.global, articles.filter(article => article.scope === 'global-feed'), 'global-news');
    [['martial','martial'],['safety','safety'],['technology','technology'],['cooperation','cooperation']].forEach(([label, key]) => section(ui[label], articles.filter(article => article.category === key), key));
  };
  const newsroom = () => {
    intro(ui.newsroom, ui.intro);
    const form = text('form', '', 'global-edition-search');
    form.action = BASE;
    form.method = 'get';
    for (const [name,value] of [['profile',profile],['view','newsroom']]) {
      const hidden = document.createElement('input'); hidden.type = 'hidden'; hidden.name = name; hidden.value = value; form.append(hidden);
    }
    const input = document.createElement('input'); input.type='search'; input.name='q'; input.value=params.get('q')||''; input.placeholder=ui.search; input.setAttribute('aria-label',ui.search);
    const submit = text('button', ui.searchButton); submit.type='submit';
    form.append(input,submit);
    main.append(form);
    const filters = text('nav', '', 'global-edition-filters');
    filters.setAttribute('aria-label',ui.newsroom);
    [['',ui.all],['local',ui.local],['global',ui.global],['martial',ui.martial],['safety',ui.safety],['technology',ui.technology],['cooperation',ui.cooperation]].forEach(([key,label]) => {
      const item = link(label,pageUrl('newsroom',{cat:key}), 'global-edition-filter');
      if ((params.get('cat')||'') === key) item.setAttribute('aria-current','page');
      filters.append(item);
    });
    main.append(filters);
    const query = (params.get('q')||'').trim().toLocaleLowerCase(config.locale);
    const selected = params.get('cat')||'';
    const list = articles.filter(article => (!selected || article.category === selected) && (!query || [article.title,article.summary,article.category].join(' ').toLocaleLowerCase(config.locale).includes(query)));
    const results = text('div', '', 'global-edition-news-list');
    if (!list.length) results.append(text('p',ui.noResults,'global-edition-empty'));
    else list.forEach(article => results.append(row(article)));
    main.append(results);
  };
  const articlePage = () => {
    const article = articles.find(item => item.id === params.get('id'));
    if (!article) {intro(ui.articleMissing,ui.notice);main.append(link(ui.back,pageUrl('newsroom')));return;}
    document.title = `${article.title} · ${config.editionName} · TEST`;
    const panel = text('article', '', 'global-edition-article');
    panel.append(link('← ' + ui.back,pageUrl('newsroom')));
    panel.append(text('p', badge(article), 'global-edition-meta'), text('h1',article.title), text('p',article.summary,'global-edition-article-summary'));
    panel.append(media(article));
    const date = text('p',`${ui.published}: ${formatDate(article.date)}`,'global-edition-meta');
    panel.append(date);
    const body = text('div', '', 'global-edition-article-body');
    (Array.isArray(article.body) ? article.body : []).forEach(paragraph => body.append(text('p',paragraph)));
    panel.append(body,text('p',`${ui.source}: ${article.sourceName || 'Development Sample'}`,'global-edition-source'));
    main.append(panel);
  };
  $('editionName').textContent = config.editionName;
  $('countryName').textContent = config.countryName;
  $('editionStatus').textContent = `${ui.status}: ${config.status}`;
  $('footerNotice').textContent = ui.notice;
  $('footerNetworkStatus').textContent = config.localNetworkStatus;
  $('networkTop').textContent = ui.network + ' ↗';
  $('networkFooter').textContent = ui.network + ' ↗';
  document.querySelectorAll('[data-profile]').forEach(element => {
    const selected = element.dataset.profile === profile;
    element.href = pageUrl(params.get('view')||'home', {profile:element.dataset.profile,id:params.get('id'),cat:params.get('cat'),q:params.get('q')}).replace(/profile=(ltr|rtl)/,`profile=${element.dataset.profile}`);
    if (selected) element.setAttribute('aria-current','true');
  });
  [['home',ui.home],['newsroom',ui.newsroom],['main-news',ui.main],['local-news',ui.local],['global-news',ui.global]].forEach(([key,label]) => {
    $('globalNav').append(link(label, ['home','newsroom'].includes(key) ? pageUrl(key) : pageUrl('home') + '#' + key));
  });
  const view = params.get('view');
  if (view === 'article') articlePage();
  else if (view === 'newsroom') newsroom();
  else home();
})();
