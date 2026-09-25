/* Shared country-edition renderer v0.3.0. Local stories lead; network stories fill without home-page duplication. */
(() => {
  'use strict';
  const config = window.GN24_COUNTRY_CONFIG;
  const articles = Array.isArray(window.GN24_COUNTRY_CONTENT) ? window.GN24_COUNTRY_CONTENT : [];
  const root = document.getElementById('globalEditionRoot');
  const main = document.getElementById('globalMain');
  if (!config || !root || !main) return;
  const base = '/' + String(config.slug || '').replace(/^\/+|\/+$/g, '') + '/';
  const mediaBase = '/assets/global-edition/data/';
  const fallback = mediaBase + 'fallback.svg';
  const params = new URLSearchParams(location.search);
  const ui = config.ui;
  document.documentElement.lang = config.language;
  document.documentElement.dir = config.direction;
  document.body.dir = config.direction;
  root.dir = config.direction;
  document.title = config.editionName + ' · GLOBAL NEWS24';
  const $ = id => document.getElementById(id);
  const text = (tag,value,className) => {const e=document.createElement(tag);if(className)e.className=className;e.textContent=String(value??'');return e;};
  const link = (label,href,className) => {const e=text('a',label,className);e.href=href;return e;};
  const pageUrl = (view,extra={}) => {const q=new URLSearchParams();if(view&&view!=='home')q.set('view',view);Object.entries(extra).forEach(([k,v])=>{if(v)q.set(k,v)});const s=q.toString();return base+(s?'?'+s:'');};
  const formatDate = value => {if(!/^\d{4}-\d{2}-\d{2}$/.test(String(value)))return '';const d=new Date(value+'T12:00:00Z');return Number.isNaN(d.getTime())?'':new Intl.DateTimeFormat(config.locale,{year:'numeric',month:'short',day:'numeric',timeZone:'UTC'}).format(d);};
  const imageSource = value => {if(!value)return fallback;if(/^https:\/\//i.test(value))return value;if(/^[a-z0-9-]+\.svg$/i.test(value))return mediaBase+value;return fallback;};
  const media = article => {const box=text('span','','global-edition-media');const img=document.createElement('img');img.src=imageSource(article.image);img.alt='';img.loading='lazy';img.onerror=()=>{img.onerror=null;img.src=fallback};box.append(img);return box;};
  const category = key => ui[key] || String(key??'');
  const badge = a => (a.scope==='country-local'?ui.country:ui.feed)+' · '+category(a.category);
  const storyHref = a => pageUrl('article',{id:a.id});
  const card = a => {const el=link('',storyHref(a),'global-edition-card');el.append(media(a));const c=text('div','','global-edition-card-copy');c.append(text('span',badge(a),'global-edition-meta'),text('h3',a.title),text('p',a.summary));const t=text('time',formatDate(a.date));t.dateTime=a.date;c.append(t);el.append(c);return el;};
  const row = a => {const el=link('',storyHref(a),'global-edition-news-row');el.append(media(a));const c=text('div','');c.append(text('span',badge(a),'global-edition-meta'),text('h3',a.title),text('p',a.summary));el.append(c);return el;};
  const section = (title,list,id) => {if(!list.length)return;const s=text('section','','global-edition-section');if(id)s.id=id;const h=text('div','','global-edition-section-head');h.append(text('h2',title),link(ui.more+' ↗',pageUrl('newsroom'),'global-edition-more'));const g=text('div','','global-edition-cards');list.slice(0,3).forEach(a=>g.append(card(a)));s.append(h,g);main.append(s);};
  const intro = (title,desc) => {const b=text('div','','global-edition-intro');b.append(text('span',config.countryLabel+' · '+ui.edition,'global-edition-eyebrow'),text('h1',title),text('p',desc));main.append(b);};

  const home = () => {
    intro(config.editionName,ui.intro);
    const local=articles.filter(a=>a.scope==='country-local');
    const network=articles.filter(a=>a.scope==='global-feed');
    const lead=local.find(a=>a.featured)||local[0]||articles.find(a=>a.featured)||articles[0];
    if(!lead)return;
    const used=new Set([lead.id]);
    const take=(pool,count)=>{const out=[];for(const a of pool){if(out.length>=count)break;if(!used.has(a.id)){used.add(a.id);out.push(a)}}return out};
    const fill=(primary,count)=>{const out=take(primary,count);if(out.length<count)out.push(...take(articles,count-out.length));return out};

    const layout=text('div','','global-edition-lead-grid');
    const featured=link('',storyHref(lead),'global-edition-lead');featured.append(media(lead));
    const copy=text('div','','global-edition-lead-copy');copy.append(text('span',ui.top+' · '+badge(lead),'global-edition-meta'),text('h2',lead.title),text('p',lead.summary));featured.append(copy);
    const side=text('aside','','global-edition-side');side.append(text('h2',ui.latest));
    fill(network,4).forEach(a=>{const item=link('',storyHref(a));item.append(text('span',a.title),text('small',formatDate(a.date)));side.append(item)});
    layout.append(featured,side);main.append(layout);

    section(ui.main,fill(network,3),'main-news');
    section(ui.local,take(local,3),'local-news');
    section(ui.global,take(network,3),'global-news');
    [['martial','martial'],['safety','safety'],['technology','technology'],['cooperation','cooperation']].forEach(([label,key])=>{
      section(ui[label],take(articles.filter(a=>a.category===key),3),key);
    });
  };

  const newsroom = () => {intro(ui.newsroom,ui.intro);const form=text('form','','global-edition-search');form.action=base;form.method='get';const hidden=document.createElement('input');hidden.type='hidden';hidden.name='view';hidden.value='newsroom';form.append(hidden);const input=document.createElement('input');input.type='search';input.name='q';input.value=params.get('q')||'';input.placeholder=ui.search;input.setAttribute('aria-label',ui.search);const submit=text('button',ui.searchButton);submit.type='submit';form.append(input,submit);main.append(form);const filters=text('nav','','global-edition-filters');filters.setAttribute('aria-label',ui.newsroom);[['',ui.all],['local',ui.local],['global',ui.global],['martial',ui.martial],['safety',ui.safety],['technology',ui.technology],['cooperation',ui.cooperation]].forEach(([key,label])=>{const item=link(label,pageUrl('newsroom',{cat:key}),'global-edition-filter');if((params.get('cat')||'')===key)item.setAttribute('aria-current','page');filters.append(item)});main.append(filters);const q=(params.get('q')||'').trim().toLocaleLowerCase(config.locale);const selected=params.get('cat')||'';const list=articles.filter(a=>(!selected||(selected==='local'?a.scope==='country-local':selected==='global'?a.scope==='global-feed':a.category===selected))&&(!q||[a.title,a.summary,a.category].join(' ').toLocaleLowerCase(config.locale).includes(q)));const results=text('div','','global-edition-news-list');if(!list.length)results.append(text('p',ui.noResults,'global-edition-empty'));else list.forEach(a=>results.append(row(a)));main.append(results);};
  const articlePage = () => {const a=articles.find(x=>x.id===params.get('id'));if(!a){intro(ui.articleMissing,ui.notice);main.append(link(ui.back,pageUrl('newsroom')));return}document.title=a.title+' · '+config.editionName;const panel=text('article','','global-edition-article');panel.append(link(ui.back,pageUrl('newsroom')));panel.append(text('p',badge(a),'global-edition-meta'),text('h1',a.title),text('p',a.summary,'global-edition-article-summary'));panel.append(media(a));panel.append(text('p',ui.published+': '+formatDate(a.date),'global-edition-meta'));const body=text('div','','global-edition-article-body');(Array.isArray(a.body)?a.body:[]).forEach(p=>body.append(text('p',p)));panel.append(body,text('p',ui.source+': '+(a.sourceName||'GLOBAL NEWS24'),'global-edition-source'));main.append(panel);};
  $('editionName').textContent=config.editionName;$('countryName').textContent=config.countryName;$('editionStatus').textContent=ui.status+': '+config.status;$('footerNotice').textContent=ui.notice;$('footerNetworkStatus').textContent=config.localNetworkStatus;$('networkTop').textContent=ui.network+' ↗';$('networkFooter').textContent=ui.network+' ↗';
  [['home',ui.home],['newsroom',ui.newsroom],['main-news',ui.main],['local-news',ui.local],['global-news',ui.global]].forEach(([key,label])=>$('globalNav').append(link(label,['home','newsroom'].includes(key)?pageUrl(key):pageUrl('home')+'#'+key)));
  const view=params.get('view');if(view==='article')articlePage();else if(view==='newsroom')newsroom();else home();
})();