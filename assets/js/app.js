const $=(s,p=document)=>p.querySelector(s), $$=(s,p=document)=>[...p.querySelectorAll(s)];
function esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))} function fmt(d){return d?d.replaceAll('-','.') : ''}
async function getJSON(path){const r=await fetch(path,{cache:'no-store'});if(!r.ok)throw Error(path);return r.json()}
let __gn24NewsPromise=null;
function parseMaybeJSON(v,fallback=[]){if(Array.isArray(v))return v;if(v==null||v==='')return fallback;if(typeof v==='string'){try{const x=JSON.parse(v);return Array.isArray(x)?x:fallback}catch(e){return fallback}}return fallback}
function normalizeDbArticle(r){return {
  id:r.id||'',date:r.date||'',title:r.title||'',subtitle:r.subtitle||'',category:r.category||'뉴스',author:r.author||'Global News24 편집부',summary:r.summary||'',image:r.image||'',
  imageCaption:r.image_caption||'',content:parseMaybeJSON(r.content,r.content?String(r.content).split(/\n\s*\n|\r?\n(?=\S)/).map(s=>s.trim()).filter(Boolean):[]),sourceName:r.source_name||'Global News24',sourceUrl:r.source_url||'',tags:parseMaybeJSON(r.tags,[]),
  relatedOrgs:parseMaybeJSON(r.related_orgs,[]),linkLabel:r.link_label||'',linkUrl:r.link_url||'',featured:!!r.featured,pinned:!!r.pinned,visualStyle:r.visual_style||'normal',isPublished:r.is_published!==false,
  createdAt:r.created_at||'',updatedAt:r.updated_at||''
}}
function loadSupabaseConfig(){return new Promise(resolve=>{if(window.GN24_SUPABASE)return resolve(window.GN24_SUPABASE);const sc=document.createElement('script');sc.src='/assets/js/gn24-supabase-config.js?v=3.2.17';sc.onload=()=>resolve(window.GN24_SUPABASE||{});sc.onerror=()=>resolve({});document.head.appendChild(sc)})}
async function loadNewsData(){if(__gn24NewsPromise)return __gn24NewsPromise;__gn24NewsPromise=(async()=>{
  try{
    const cfg=await loadSupabaseConfig();
    if(cfg&&cfg.url&&cfg.anonKey){
      const endpoint=cfg.url.replace(/\/$/,'')+'/rest/v1/gn24_articles?select=*&is_published=eq.true&order=date.desc,created_at.desc';
      const r=await fetch(endpoint,{cache:'no-store',headers:{apikey:cfg.anonKey}});
      if(r.ok){
        const rows=await r.json();
        if(Array.isArray(rows)){
          const published=rows.map(normalizeDbArticle).filter(a=>a.isPublished!==false);
          if(published.length)return published;
          if(rows.length===0)return [];
        }
      }
    }
  }catch(e){console.warn('GN24 Supabase read fallback:',e)}
  return getJSON('/data/news.json');
})();return __gn24NewsPromise}
function articleURL(id){return `/pages/article/?id=${encodeURIComponent(id)}`}
function shareArticleSlug(id){return String(id||'article').replace(/[^A-Za-z0-9._-]+/g,'-').replace(/^-+|-+$/g,'')||'article'}
function shareArticleURL(id){return `${location.origin}/share/${shareArticleSlug(id)}/`}
const DEFAULT_NEWS_IMAGE='/assets/images/news/gn24-default-news.svg';
function bgStyle(src){const safe=esc(src||DEFAULT_NEWS_IMAGE);return `style=\"background-image:url('${safe}'),url('${DEFAULT_NEWS_IMAGE}')\"`}
function applyBg(el,src){if(!el)return;el.style.backgroundImage=`url('${src||DEFAULT_NEWS_IMAGE}'),url('${DEFAULT_NEWS_IMAGE}')`}
function publicOnly(data){return (Array.isArray(data)?data:[]).filter(a=>a && a.isPublished!==false && a.is_published!==false)}
function sortNews(data){return publicOnly(data).sort((a,b)=>
  String(b.date||'').localeCompare(String(a.date||'')) ||
  String(b.createdAt||b.created_at||'').localeCompare(String(a.createdAt||a.created_at||'')) ||
  String(b.updatedAt||b.updated_at||'').localeCompare(String(a.updatedAt||a.updated_at||'')) ||
  String(b.id||'').localeCompare(String(a.id||''))
)}
function setToday(){const el=$('#todayLabel');if(!el)return;const d=new Date(),days=['일','월','화','수','목','금','토'];el.textContent=`${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} ${days[d.getDay()]}요일`}
function closeMegas(except=null){$$('.nav-item.open').filter(x=>x!==except).forEach(x=>x.classList.remove('open'))}
function setupNav(){const util=$('#utilityBtn'),panel=$('#utilityPanel');if(util&&panel)util.onclick=e=>{e.stopPropagation();closeMegas();panel.classList.toggle('open');util.setAttribute('aria-expanded',panel.classList.contains('open'))};$$('.nav-btn').forEach(btn=>btn.onclick=e=>{if(innerWidth<=900){e.preventDefault();e.stopPropagation();panel?.classList.remove('open');const item=btn.closest('.nav-item'),open=!item.classList.contains('open');closeMegas(item);item.classList.toggle('open',open)}});document.addEventListener('click',e=>{if(innerWidth<=900&&!e.target.closest('.mega'))closeMegas();if(!e.target.closest('#utilityPanel')&&!e.target.closest('#utilityBtn'))panel?.classList.remove('open')});addEventListener('resize',()=>{if(innerWidth>900){closeMegas();panel?.classList.remove('open')}})}
function visualClass(a,i=0){const s=a.visualStyle||((i===0)?'spotlight':'normal');return s==='breaking'?'breaking-card':(s==='top'?'glow':(s==='spotlight'?'spotlight':''))}
function card(a,i=0){return `<a class="news-card ${visualClass(a,i)}" href="${articleURL(a.id)}"><div class="thumb" ${bgStyle(a.image)}></div><div class="body"><span class="badge">${esc(a.category||'뉴스')}</span><h3>${esc(a.title)}</h3><div class="news-date">${esc(fmt(a.date))}</div></div></a>`}
function latestRow(a){return `<a class="latest-row" href="${articleURL(a.id)}"><div class="thumb" ${bgStyle(a.image)}></div><div><span class="badge">${esc(a.category||'뉴스')}</span><h3>${esc(a.title)}</h3><div class="news-date">${esc(fmt(a.date))}</div></div></a>`}
function mini(a){return `<a class="mini-story" href="${articleURL(a.id)}"><div class="thumb" ${bgStyle(a.image)}></div><div><b>${esc(a.title)}</b><small>${esc(fmt(a.date))}</small></div></a>`}
async function loadHome(){
  const target=$('#homeNews');if(!target)return;
  const raw=await loadNewsData(), data=sortNews(raw);
  const lead=data.find(x=>x.pinned)||data.find(x=>x.featured)||data[0];
  const featured=data.filter(x=>x.featured&&(!lead||x.id!==lead.id));
  const editorPicks=[...featured,...data.filter(x=>(!lead||x.id!==lead.id)&&!x.featured)].slice(0,8);
  target.innerHTML=editorPicks.map(card).join('');
  if(lead){$('#leadTitle').textContent=lead.title;$('#leadSummary').textContent=lead.summary||'';$('#leadMeta').textContent=`TOP NEWS · ${lead.category||'뉴스'} · ${fmt(lead.date)}`;$('#leadLink').href=articleURL(lead.id);applyBg($('#leadMedia'),lead.image)}
  const breaking=data.find(x=>x.visualStyle==='breaking')||data[0];if(breaking)$('#breakingText').textContent=breaking.title;
  $('#latestNews')&&($('#latestNews').innerHTML=data.slice(0,10).map(latestRow).join(''));
  const attention=[...featured,...data.filter(x=>(!lead||x.id!==lead.id)&&!x.featured)].slice(0,6);
  $('#attentionList')&&($('#attentionList').innerHTML=attention.map(a=>`<li><a href="${articleURL(a.id)}">${esc(a.title)}</a></li>`).join(''));
  const by=(test)=>data.filter(test).slice(0,4).map(mini).join('');
  $('#beatMartial')&&($('#beatMartial').innerHTML=by(a=>(a.category||'').includes('무도')||JSON.stringify(a).includes('태권')));
  $('#beatSafety')&&($('#beatSafety').innerHTML=by(a=>JSON.stringify(a).includes('드론')||JSON.stringify(a).includes('안전')));
  $('#beatActs')&&($('#beatActs').innerHTML=by(a=>(a.category||'')==='공익'||JSON.stringify(a).includes('공익')||JSON.stringify(a).includes('봉사')||JSON.stringify(a).includes('지역사회'))||data.slice(0,3).map(mini).join(''));
  await renderHomePopular(data);
}
async function renderHomePopular(data){
  const box=$('#topLatest');if(!box)return;
  try{
    const rows=await gn24DbFetch('gn24_article_views?select=article_id,view_count&order=view_count.desc&limit=10')||[];
    const map=new Map(data.map(a=>[String(a.id),a]));
    const ranked=rows.map(r=>({a:map.get(String(r.article_id)),views:Number(r.view_count||0)})).filter(x=>x.a).slice(0,10);
    if(ranked.length){box.innerHTML=ranked.map(x=>`<li><a href="${articleURL(x.a.id)}">${esc(x.a.title)}</a><small class="home-view-count">${x.views.toLocaleString('ko-KR')}회</small></li>`).join('');return;}
  }catch(e){console.warn('GN24 home popular fallback',e)}
  box.innerHTML=data.slice(0,10).map(a=>`<li><a href="${articleURL(a.id)}">${esc(a.title)}</a></li>`).join('');
}
async function loadNewsroom(){const list=$('#articleList');if(!list)return;let data=sortNews(await loadNewsData());const q=new URLSearchParams(location.search),cat=q.get('cat'),term=(q.get('q')||'').trim().toLowerCase();if(cat)data=data.filter(x=>x.category===cat);if(term)data=data.filter(x=>JSON.stringify(x).toLowerCase().includes(term));list.innerHTML=data.map(a=>`<a class="article-row" href="${articleURL(a.id)}"><div class="thumb" ${bgStyle(a.image)}></div><div class="body"><span class="badge">${esc(a.category||'뉴스')}</span><h3>${esc(a.title)}</h3><div class="muted">${esc(fmt(a.date))} · ${esc(a.author||'편집부')}</div><p>${esc(a.summary||'')}</p></div></a>`).join('')||'<p>해당 조건의 기사가 없습니다.</p>'}
async function loadArticle(){const shell=$('#articleShell');if(!shell)return;const id=new URLSearchParams(location.search).get('id'),data=sortNews(await loadNewsData()),a=data.find(x=>x.id===id)||data[0];if(!a)return;document.title=`${a.title} | Global News24`;$('#aCat').textContent=a.category||'뉴스';$('#aTitle').textContent=a.title;$('#aSub').textContent=a.subtitle||a.summary||'';$('#aMeta').innerHTML=`<span>${esc(fmt(a.date))}</span><span>${esc(a.author||'Global News24 편집부')}</span><span>Global News24</span>`;applyBg($('#aHero'),a.image);const caption=$('#aCaption');if(caption)caption.textContent=a.imageCaption||`▲ ${a.title} 관련 이미지`;const body=Array.isArray(a.content)?a.content:(Array.isArray(a.body)?a.body:[a.summary||'']);const rawBody=body.flatMap(p=>String(p||'').split(/\n\s*\n|\r?\n(?=\S)/)).map(p=>p.trim()).filter(Boolean);const isSubheadText=p=>p.length<=48&&!/[.!?。！？]$/.test(p)&&!/(다|요)[.!?]?$/.test(p);const sentenceSplit=p=>{if(isSubheadText(p))return [p];const parts=(p.match(/[^.!?。！？]+[.!?。！？]+(?:[\"'”’)]*)|[^.!?。！？]+$/g)||[p]).map(x=>x.trim()).filter(Boolean);if(parts.length<=1)return [p];const groups=[];let buf='';let count=0;for(const sent of parts){const next=(buf?buf+' ':'')+sent;if(buf&&(count>=2||next.length>190)){groups.push(buf);buf=sent;count=1}else{buf=next;count++}}if(buf)groups.push(buf);return groups};const cleanBody=rawBody.flatMap(sentenceSplit);let paraIndex=0;$('#aBody').innerHTML=cleanBody.map((p)=>{if(isSubheadText(p))return `<h2 class="article-subhead">${esc(p)}</h2>`;const cls=paraIndex++===0?' class="article-lead"':'';return `<p${cls}>${esc(p)}</p>`}).join('');$('#aSource')&&($('#aSource').innerHTML=`<strong>자료·출처</strong><br>${esc(a.sourceName||'Global News24')}${a.sourceUrl?` · <a href="${esc(a.sourceUrl)}" target="_blank" rel="noopener">원문/관련자료</a>`:''}`);const tags=a.tags||[];
const rel=data.filter(x=>x.id!==a.id).map(x=>({x,score:(x.category===a.category?3:0)+(x.tags||[]).filter(t=>tags.includes(t)).length})).sort((m,n)=>n.score-m.score||String(n.x.date||'').localeCompare(String(m.x.date||''))).filter(m=>m.score>0).slice(0,4).map(m=>m.x);
const related=$('#aRelated');
if(related){related.innerHTML=(rel.length?rel:data.filter(x=>x.id!==a.id).slice(0,4)).map((x,i)=>card(x,i)).join('')}
const sideLatest=$('#sideLatest');
if(sideLatest){
  sideLatest.innerHTML=data.filter(x=>x.id!==a.id).slice(0,8).map((x,i)=>`<li><span class="side-rank">${String(i+1).padStart(2,'0')}</span><a href="${articleURL(x.id)}">${esc(x.title)}</a></li>`).join('');
}
const sideRelated=$('#sideRelated');
if(sideRelated){
  const sideRel=(rel.length?rel:data.filter(x=>x.id!==a.id).slice(0,4)).slice(0,4);
  sideRelated.innerHTML=sideRel.map(x=>`<a class="side-related-item" href="${articleURL(x.id)}"><div class="side-related-thumb" ${bgStyle(x.image)}></div><div><span>${esc(x.category||'뉴스')}</span><b>${esc(x.title)}</b></div></a>`).join('');
}

const authorName=$('#articleAuthorName');
if(authorName) authorName.textContent=a.author||'Global News24 편집부';

const bottomHeadline=$('#bottomHeadline');
if(bottomHeadline){
  const featured=data.filter(x=>x.id!==a.id && (x.featured||x.pinned)).slice(0,4);
  const rows=(featured.length?featured:data.filter(x=>x.id!==a.id).slice(0,4));
  bottomHeadline.innerHTML=rows.map(x=>`<a class="bottom-news-item" href="${articleURL(x.id)}"><div class="bottom-news-thumb" ${bgStyle(x.image)}></div><div><span>${esc(x.category||'뉴스')}</span><b>${esc(x.title)}</b></div></a>`).join('');
}
const bottomLatest=$('#bottomLatest');
if(bottomLatest){
  bottomLatest.innerHTML=data.filter(x=>x.id!==a.id).slice(0,6).map(x=>`<a class="bottom-latest-item" href="${articleURL(x.id)}">${esc(x.title)}</a>`).join('');
}

setArticleSocialMeta(a);
gn24PromoteStaticShareUrl(a);
setupArticleTools(a);
setupArticleCommunity(a);
setupArticleViewsAndPopular(a,data);
setupArticleReporter(a);
}
document.addEventListener('DOMContentLoaded',()=>{setToday();setupNav();loadHome().catch(console.error);loadNewsroom().catch(console.error);loadArticle().catch(console.error)})

// v3.1.4: mobile hamburger contains real accordion mega menus.
document.addEventListener('DOMContentLoaded',()=>{
  const panel=document.querySelector('#utilityPanel .utility-grid');
  if(!panel) return;

  // Remove the simple v3.1.1 mobile links if they exist.
  panel.querySelectorAll('.mobile-menu-title,.mobile-menu-links,.mobile-mega-wrap').forEach(el=>el.remove());

  const wrap=document.createElement('div');
  wrap.className='mobile-mega-wrap';
  wrap.innerHTML=`
    <div class="mobile-mega-title">뉴스 전체메뉴</div>
    <div class="mobile-quick-links">
      <a href="/">홈</a>
      <a class="urgent" href="/pages/newsroom/?q=속보">속보</a>
    </div>
    <div class="mobile-accordion"></div>`;

  const acc=wrap.querySelector('.mobile-accordion');
  document.querySelectorAll('.primary-nav .nav-item.has-mega').forEach((item,i)=>{
    const btn=item.querySelector('.nav-btn');
    const head=item.querySelector('.mega-head');
    const links=item.querySelector('.mega-links');
    if(!btn||!links) return;
    const section=document.createElement('section');
    section.className='mobile-mega-section';
    section.innerHTML=`
      <button class="mobile-mega-trigger" type="button" aria-expanded="false">
        <span><b>${esc(btn.textContent.trim())}</b>${head?.querySelector('span')?`<small>${esc(head.querySelector('span').textContent.trim())}</small>`:''}</span>
        <i>＋</i>
      </button>
      <div class="mobile-mega-panel"></div>`;
    const mp=section.querySelector('.mobile-mega-panel');
    links.querySelectorAll('a').forEach(a=>{
      const clone=a.cloneNode(true);
      mp.appendChild(clone);
    });
    section.querySelector('.mobile-mega-trigger').addEventListener('click',e=>{
      e.stopPropagation();
      const open=section.classList.toggle('open');
      section.querySelector('.mobile-mega-trigger').setAttribute('aria-expanded',String(open));
      section.querySelector('.mobile-mega-trigger i').textContent=open?'−':'＋';
      acc.querySelectorAll('.mobile-mega-section.open').forEach(other=>{
        if(other!==section){
          other.classList.remove('open');
          const ob=other.querySelector('.mobile-mega-trigger');
          ob.setAttribute('aria-expanded','false');
          ob.querySelector('i').textContent='＋';
        }
      });
    });
    acc.appendChild(section);
  });

  panel.prepend(wrap);
  document.querySelectorAll('.brand small').forEach(el=>el.textContent='글로벌뉴스24');
});

// v3.1.5: hint that the horizontal mobile menu continues to the right.
document.addEventListener('DOMContentLoaded',()=>{
  const nav=document.querySelector('.primary-nav');
  const scroller=nav?.querySelector('.nav-scroll');
  if(!nav||!scroller) return;
  const updateHint=()=>{
    const atEnd=scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth - 8;
    nav.classList.toggle('nav-at-end',atEnd);
  };
  scroller.addEventListener('scroll',updateHint,{passive:true});
  window.addEventListener('resize',updateHint);
  updateHint();
});


function setupArticleTools(article){
  const url=shareArticleURL(article?.id);
  const title=article?.title||document.title||'Global News24';
  const shareUrl=(kind)=>{
    if(kind==='kakao'){gn24ShareKakao(article);return;}
    const u=encodeURIComponent(url), t=encodeURIComponent(title);
    const urls={
      facebook:`https://www.facebook.com/sharer/sharer.php?u=${u}`,
      x:`https://twitter.com/intent/tweet?url=${u}&text=${t}`,
      band:`https://band.us/plugin/share?body=${t}%0A${u}`,
      telegram:`https://t.me/share/url?url=${u}&text=${t}`
    };
    if(kind==='native'){
      if(navigator.share) navigator.share({title,text:title,url}).catch(()=>{});
      else navigator.clipboard?.writeText(url).then(()=>alert('기사 링크를 복사했습니다.'));
      return;
    }
    if(urls[kind]) window.open(urls[kind],'gn24share','width=720,height=620,noopener,noreferrer');
  };
  document.querySelectorAll('[data-share]').forEach(btn=>{
    btn.onclick=()=>shareUrl(btn.dataset.share);
  });

  const shareHubTitle=document.getElementById('shareHubTitle');
  if(shareHubTitle) shareHubTitle.textContent=article?.title||'Global News24 기사';
  const shareHubThumb=document.getElementById('shareHubThumb');
  if(shareHubThumb && article?.image){
    shareHubThumb.style.backgroundImage=`url("${gn24AbsoluteUrl(article.image).replace(/"/g,'%22')}")`;
  }
  const shareHubMessage=document.getElementById('shareHubMessage');

  async function copyCurrentArticle(){
    try{
      await navigator.clipboard.writeText(url);
      if(shareHubMessage){
        shareHubMessage.textContent='기사 링크를 복사했습니다. 카카오톡이나 문자에 바로 붙여넣을 수 있습니다.';
        setTimeout(()=>{shareHubMessage.textContent='';},3200);
      }else alert('카카오·SNS용 기사 링크를 복사했습니다.');
    }catch(e){
      prompt('아래 주소를 복사하세요.',url);
    }
  }

  document.querySelectorAll('[data-copy-article]').forEach(btn=>{
    btn.onclick=copyCurrentArticle;
  });

  const copyBtn=document.getElementById('copyArticleLink');
  if(copyBtn) copyBtn.onclick=copyCurrentArticle;
  const printBtn=document.getElementById('printArticle');
  if(printBtn) printBtn.onclick=()=>window.print();

  let articleFont=16;
  const body=document.getElementById('aBody');
  const applyFont=()=>{
    articleFont=Math.max(14,Math.min(22,articleFont));
    if(body) body.style.setProperty('--reader-font-size',articleFont+'px');
  };
  const plus=document.getElementById('fontPlus');
  const minus=document.getElementById('fontMinus');
  if(plus) plus.onclick=()=>{articleFont+=1;applyFont();};
  if(minus) minus.onclick=()=>{articleFont-=1;applyFont();};
  applyFont();

}


/* ===== Global News24 v3.2.16 · Supabase reactions & comments ===== */
function gn24GetVisitorId(){
  const key='gn24-visitor-id';
  let id=localStorage.getItem(key);
  if(!id){
    id=(crypto?.randomUUID?.() || ('v-'+Date.now()+'-'+Math.random().toString(36).slice(2)));
    localStorage.setItem(key,id);
  }
  return id;
}

function gn24SupabaseInfo(){
  const cfg=window.GN24_SUPABASE||{};
  return {
    url:String(cfg.url||'').replace(/\/$/,''),
    key:String(cfg.anonKey||'')
  };
}

async function gn24DbFetch(path, options={}){
  const {url,key}=gn24SupabaseInfo();
  if(!url||!key) throw new Error('Supabase 연결 설정이 없습니다.');
  const headers={
    apikey:key,
    Authorization:`Bearer ${key}`,
    'Content-Type':'application/json',
    ...(options.headers||{})
  };
  const res=await fetch(url+'/rest/v1/'+path,{...options,headers});
  if(!res.ok){
    let msg='요청 처리 중 오류가 발생했습니다.';
    try{
      const body=await res.json();
      msg=body?.message||body?.details||body?.hint||msg;
    }catch(e){}
    const err=new Error(msg);
    err.status=res.status;
    throw err;
  }
  if(res.status===204) return null;
  const text=await res.text();
  return text ? JSON.parse(text) : null;
}

async function setupArticleCommunity(article){
  if(!article?.id) return;

  const articleId=String(article.id);
  const visitorId=gn24GetVisitorId();
  const bar=document.getElementById('articleReactionBar');
  const reactionMessage=document.getElementById('reactionMessage');

  async function loadReactions(){
    if(!bar) return;
    try{
      const rows=await gn24DbFetch(
        `gn24_article_reactions?article_id=eq.${encodeURIComponent(articleId)}&select=reaction_type`
      ) || [];

      const counts={like:0,heart:0,support:0,useful:0};
      rows.forEach(r=>{
        if(Object.prototype.hasOwnProperty.call(counts,r.reaction_type)) counts[r.reaction_type]++;
      });

      Object.entries(counts).forEach(([type,count])=>{
        const el=bar.querySelector(`[data-count="${type}"]`);
        if(el) el.textContent=String(count);
      });

      // Browser's own reaction state is private and is not inferred from public rows.
      ['like','heart','support','useful'].forEach(type=>{
        const pressed=localStorage.getItem(`gn24-reacted:${articleId}:${type}`)==='1';
        const btn=bar.querySelector(`[data-reaction="${type}"]`);
        if(btn){
          btn.classList.toggle('active',pressed);
          btn.setAttribute('aria-pressed',pressed?'true':'false');
        }
      });
    }catch(e){
      console.warn('GN24 reaction load failed:',e);
      if(reactionMessage) reactionMessage.textContent='반응 수를 불러오지 못했습니다.';
    }
  }

  if(bar){
    bar.querySelectorAll('[data-reaction]').forEach(btn=>{
      btn.addEventListener('click',async()=>{
        const type=btn.dataset.reaction;
        const localKey=`gn24-reacted:${articleId}:${type}`;
        if(localStorage.getItem(localKey)==='1'){
          if(reactionMessage) reactionMessage.textContent='이미 이 반응을 남기셨습니다.';
          return;
        }
        btn.disabled=true;
        if(reactionMessage) reactionMessage.textContent='반응을 저장하는 중입니다…';
        try{
          await gn24DbFetch('gn24_article_reactions',{
            method:'POST',
            headers:{Prefer:'return=minimal'},
            body:JSON.stringify({
              article_id:articleId,
              reaction_type:type,
              visitor_id:visitorId
            })
          });
          localStorage.setItem(localKey,'1');
          btn.classList.add('active');
          btn.setAttribute('aria-pressed','true');
          if(reactionMessage) reactionMessage.textContent='소중한 반응이 반영되었습니다.';
          await loadReactions();
        }catch(e){
          if(e.status===409){
            localStorage.setItem(localKey,'1');
            if(reactionMessage) reactionMessage.textContent='이미 이 반응을 남기셨습니다.';
            await loadReactions();
          }else{
            console.error(e);
            if(reactionMessage) reactionMessage.textContent='반응 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.';
          }
        }finally{
          btn.disabled=false;
        }
      });
    });
    loadReactions();
  }

  const form=document.getElementById('articleCommentForm');
  const list=document.getElementById('articleCommentList');
  const countEl=document.getElementById('approvedCommentCount');
  const message=document.getElementById('commentMessage');
  const nickname=document.getElementById('commentNickname');
  const content=document.getElementById('commentContent');
  const charCount=document.getElementById('commentCharCount');
  const submitBtn=document.getElementById('commentSubmitBtn');

  const savedNickname=localStorage.getItem('gn24-comment-nickname');
  if(nickname && savedNickname) nickname.value=savedNickname;

  if(content && charCount){
    const updateCount=()=>{charCount.textContent=`${content.value.length} / 1000`;};
    content.addEventListener('input',updateCount);
    updateCount();
  }

  async function loadComments(){
    if(!list) return;
    try{
      const rows=await gn24DbFetch(
        `gn24_article_comments?article_id=eq.${encodeURIComponent(articleId)}&status=eq.approved&select=id,nickname,content,created_at&order=created_at.desc`
      ) || [];
      if(countEl) countEl.textContent=String(rows.length);
      if(!rows.length){
        list.innerHTML='<div class="comment-empty">등록된 공개 댓글이 없습니다. 첫 의견을 남겨보세요.</div>';
        return;
      }
      list.innerHTML=rows.map(row=>{
        const date=row.created_at ? new Date(row.created_at).toLocaleString('ko-KR',{
          year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'
        }) : '';
        return `<article class="comment-item">
          <div class="comment-item-head"><b>${esc(row.nickname||'독자')}</b><span>${esc(date)}</span></div>
          <p>${esc(row.content||'').replace(/\n/g,'<br>')}</p>
        </article>`;
      }).join('');
    }catch(e){
      console.warn('GN24 comments load failed:',e);
      list.innerHTML='<div class="comment-empty">댓글을 불러오지 못했습니다.</div>';
    }
  }

  if(form){
    form.addEventListener('submit',async(ev)=>{
      ev.preventDefault();
      const nick=(nickname?.value||'').trim();
      const text=(content?.value||'').trim();
      if(nick.length<1||nick.length>30){
        if(message) message.textContent='닉네임은 1~30자로 입력해 주세요.';
        return;
      }
      if(text.length<2||text.length>1000){
        if(message) message.textContent='댓글은 2~1,000자로 입력해 주세요.';
        return;
      }
      if(submitBtn) submitBtn.disabled=true;
      if(message) message.textContent='댓글을 등록하는 중입니다…';
      try{
        await gn24DbFetch('gn24_article_comments',{
          method:'POST',
          headers:{Prefer:'return=minimal'},
          body:JSON.stringify({
            article_id:articleId,
            nickname:nick,
            content:text,
            visitor_id:visitorId,
            status:'pending'
          })
        });
        localStorage.setItem('gn24-comment-nickname',nick);
        if(content) content.value='';
        if(charCount) charCount.textContent='0 / 1000';
        if(message) message.textContent='댓글이 등록되었습니다. 관리자 확인 후 공개됩니다.';
      }catch(e){
        console.error(e);
        if(message) message.textContent='댓글 등록에 실패했습니다. 잠시 후 다시 시도해 주세요.';
      }finally{
        if(submitBtn) submitBtn.disabled=false;
      }
    });
  }

  loadComments();
}


/* ===== GN24 v3.2.19 · real views + popular news ===== */
async function setupArticleViewsAndPopular(article, allArticles){
  if(!article?.id) return;
  const articleId=String(article.id);
  const viewEl=document.getElementById('articleViewCount');

  try{
    // RPC increments once per page load. SQL function is SECURITY DEFINER.
    const {url,key}=gn24SupabaseInfo();
    if(url&&key){
      const res=await fetch(url+'/rest/v1/rpc/gn24_increment_article_view',{
        method:'POST',
        headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json'},
        body:JSON.stringify({p_article_id:articleId})
      });
      if(res.ok){
        const payload=await res.json();
        const count=Array.isArray(payload)?payload[0]:payload;
        if(viewEl) viewEl.textContent=Number(count||0).toLocaleString('ko-KR');
      }
    }
  }catch(e){ console.warn('GN24 view increment failed',e); }

  try{
    const rows=await gn24DbFetch('gn24_article_views?select=article_id,view_count&order=view_count.desc&limit=10')||[];
    const titleMap={};
    (allArticles||[]).forEach(a=>titleMap[String(a.id)]=a);
    const popular=document.getElementById('sidePopular');
    if(popular){
      popular.innerHTML=rows.map((r,i)=>{
        const a=titleMap[String(r.article_id)];
        if(!a) return '';
        return `<li><span class="side-rank">${String(i+1).padStart(2,'0')}</span><a href="${articleURL(a.id)}">${esc(a.title)}</a><small class="popular-views">${Number(r.view_count||0).toLocaleString('ko-KR')}</small></li>`;
      }).join('') || '<li class="popular-empty">조회 데이터가 쌓이는 중입니다.</li>';
    }
  }catch(e){ console.warn('GN24 popular load failed',e); }
}


/* ===== GN24 v3.2.20 · SNS / Kakao share ===== */
function gn24AbsoluteUrl(value){
  const raw=String(value||'').trim();
  if(!raw) return 'https://news24.ai.kr/assets/images/logos/gn24-og-default.jpg';
  try{return new URL(raw,location.origin).href;}catch(e){return raw;}
}
function gn24ArticleDescription(article){
  const raw=article?.summary || article?.subtitle ||
    (Array.isArray(article?.content)?article.content.join(' '):String(article?.content||''));
  return String(raw||'Global News24 디지털 뉴스룸').replace(/\s+/g,' ').trim().slice(0,180);
}
function gn24SetMeta(selector,attr,value){
  let el=document.head.querySelector(selector);
  if(!el){
    el=document.createElement('meta');
    const m=selector.match(/\[(property|name)="([^"]+)"\]/);
    if(m) el.setAttribute(m[1],m[2]);
    document.head.appendChild(el);
  }
  el.setAttribute(attr,value);
}
function setArticleSocialMeta(article){
  if(!article) return;
  const title=String(article.title||'Global News24');
  const desc=gn24ArticleDescription(article);
  const image=gn24AbsoluteUrl(article.image);
  const url=shareArticleURL(article.id);

  document.title=title+' | Global News24';
  const description=document.head.querySelector('meta[name="description"]');
  if(description) description.setAttribute('content',desc);

  gn24SetMeta('meta[property="og:type"]','content','article');
  gn24SetMeta('meta[property="og:site_name"]','content','Global News24');
  gn24SetMeta('meta[property="og:title"]','content',title);
  gn24SetMeta('meta[property="og:description"]','content',desc);
  gn24SetMeta('meta[property="og:image"]','content',image);
  gn24SetMeta('meta[property="og:url"]','content',url);
  gn24SetMeta('meta[name="twitter:card"]','content','summary_large_image');
  gn24SetMeta('meta[name="twitter:title"]','content',title);
  gn24SetMeta('meta[name="twitter:description"]','content',desc);
  gn24SetMeta('meta[name="twitter:image"]','content',image);

  let canonicalEl=document.head.querySelector('link[rel="canonical"]');
  if(!canonicalEl){canonicalEl=document.createElement('link');canonicalEl.rel='canonical';document.head.appendChild(canonicalEl);}
  canonicalEl.href=url;
}
// ===== GN24 v3.4.2 · robust Kakao SDK loader =====
const GN24_KAKAO_JS_KEY_FALLBACK='8622bbffea31804f3bd4f03c89f5d0c1';
function gn24KakaoKey(){
  return String(window.GN24_KAKAO?.javascriptKey||GN24_KAKAO_JS_KEY_FALLBACK||'').trim();
}
function gn24LoadKakaoSdk(){
  if(window.Kakao) return Promise.resolve(window.Kakao);
  if(window.__gn24KakaoSdkPromise) return window.__gn24KakaoSdkPromise;
  window.__gn24KakaoSdkPromise=new Promise((resolve,reject)=>{
    const existing=document.querySelector('script[data-gn24-kakao-sdk]');
    if(existing){
      existing.addEventListener('load',()=>resolve(window.Kakao),{once:true});
      existing.addEventListener('error',()=>reject(new Error('Kakao SDK load failed')),{once:true});
      return;
    }
    const script=document.createElement('script');
    script.src='https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js';
    script.async=true;
    script.dataset.gn24KakaoSdk='1';
    script.onload=()=>window.Kakao?resolve(window.Kakao):reject(new Error('Kakao SDK unavailable after load'));
    script.onerror=()=>reject(new Error('Kakao SDK load failed'));
    document.head.appendChild(script);
  });
  return window.__gn24KakaoSdkPromise;
}
async function gn24InitKakao(){
  const key=gn24KakaoKey();
  if(!key) throw new Error('Kakao JavaScript key missing');
  await gn24LoadKakaoSdk();
  if(!window.Kakao) throw new Error('Kakao SDK unavailable');
  if(!Kakao.isInitialized()) Kakao.init(key);
  if(!Kakao.isInitialized()) throw new Error('Kakao initialization failed');
  return true;
}
async function gn24ShareKakao(article){
  const title=String(article?.title||'Global News24');
  const desc=gn24ArticleDescription(article);
  const image=gn24AbsoluteUrl(article?.image);
  // v3.4.4: 미리보기는 기사 대표이미지, 클릭은 실제 기사 페이지로 연결
  const url=articleURL(article?.id);
  try{
    await gn24InitKakao();
    Kakao.Share.sendDefault({
      objectType:'feed',
      content:{
        title,
        description:desc,
        imageUrl:image,
        link:{mobileWebUrl:url,webUrl:url}
      },
      buttons:[{title:'기사 보기',link:{mobileWebUrl:url,webUrl:url}}]
    });
  }catch(e){
    console.error('GN24 Kakao share error:',e);
    alert('카카오톡 공유 연결에 실패했습니다. 페이지를 새로고침한 뒤 다시 눌러주세요.');
  }
}

// ===== GN24 v3.4.4 · safe article URL =====
// /share/<기사ID>/ 생성이 늦어져도 방문자가 404를 보지 않도록
// 주소창은 항상 실제 기사 URL(/pages/article/?id=...)을 유지합니다.
async function gn24PromoteStaticShareUrl(article){
  return;
}


async function setupArticleReporter(article){
  const authorName=document.getElementById('articleAuthorName');
  const avatar=document.querySelector('.article-author-card .author-avatar');
  const info=document.querySelector('.article-author-card .author-info');
  const more=document.querySelector('.article-author-card .author-more');
  if(!authorName)return;

  authorName.textContent=article?.author||'Global News24 편집부';
  if(!article?.reporterId){
    if(more) more.href='/pages/reporters/';
    return;
  }
  try{
    const rows=await gn24DbFetch(`gn24_reporters?id=eq.${encodeURIComponent(article.reporterId)}&status=eq.active&select=id,name,role,affiliation,photo_url,bio,specialties,region,public_email&limit=1`)||[];
    const r=rows[0]; if(!r)return;
    authorName.textContent=r.name||article.author||'Global News24 편집부';
    if(avatar){
      if(r.photo_url){
        avatar.textContent='';
        avatar.style.backgroundImage=`url("${String(r.photo_url).replace(/"/g,'%22')}")`;
        avatar.classList.add('reporter-photo');
      }else avatar.textContent=(r.name||'GN').slice(0,1);
    }
    const span=info?.querySelector('span');
    const p=info?.querySelector('p');
    if(span)span.textContent=[r.role,r.affiliation,r.region].filter(Boolean).join(' · ');
    if(p)p.textContent=r.bio||`${r.name} 기자의 Global News24 기사입니다.`;
    if(more){more.href=`/pages/reporters/?id=${encodeURIComponent(r.id)}`;more.textContent='기자 프로필·다른 기사 보기 ›';}
  }catch(e){console.warn('GN24 reporter profile load failed',e)}
}
