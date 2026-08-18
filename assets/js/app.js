const $=(s,p=document)=>p.querySelector(s), $$=(s,p=document)=>[...p.querySelectorAll(s)];
function esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))} function fmt(d){return d?d.replaceAll('-','.') : ''}
async function getJSON(path){const r=await fetch(path,{cache:'no-store'});if(!r.ok)throw Error(path);return r.json()} function articleURL(id){return `/pages/article/?id=${encodeURIComponent(id)}`}
function setToday(){const el=$('#todayLabel');if(!el)return;const d=new Date(),days=['일','월','화','수','목','금','토'];el.textContent=`${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} ${days[d.getDay()]}요일`}
function closeMegas(except=null){$$('.nav-item.open').filter(x=>x!==except).forEach(x=>x.classList.remove('open'))}
function setupNav(){const util=$('#utilityBtn'),panel=$('#utilityPanel');if(util&&panel)util.onclick=e=>{e.stopPropagation();closeMegas();panel.classList.toggle('open');util.setAttribute('aria-expanded',panel.classList.contains('open'))};$$('.nav-btn').forEach(btn=>btn.onclick=e=>{if(innerWidth<=900){e.preventDefault();e.stopPropagation();panel?.classList.remove('open');const item=btn.closest('.nav-item'),open=!item.classList.contains('open');closeMegas(item);item.classList.toggle('open',open)}});document.addEventListener('click',e=>{if(innerWidth<=900&&!e.target.closest('.mega'))closeMegas();if(!e.target.closest('#utilityPanel')&&!e.target.closest('#utilityBtn'))panel?.classList.remove('open')});addEventListener('resize',()=>{if(innerWidth>900){closeMegas();panel?.classList.remove('open')}})}
function visualClass(a,i=0){const s=a.visualStyle||((i===0)?'spotlight':'normal');return s==='breaking'?'breaking-card':(s==='top'?'glow':(s==='spotlight'?'spotlight':''))}
function card(a,i=0){const img=a.image?`style="background-image:url('${esc(a.image)}')"`:'';return `<a class="news-card ${visualClass(a,i)}" href="${articleURL(a.id)}"><div class="thumb" ${img}></div><div class="body"><span class="badge">${esc(a.category||'뉴스')}</span><h3>${esc(a.title)}</h3><div class="news-date">${esc(fmt(a.date))}</div></div></a>`}
function latestRow(a){const img=a.image?`style="background-image:url('${esc(a.image)}')"`:'';return `<a class="latest-row" href="${articleURL(a.id)}"><div class="thumb" ${img}></div><div><span class="badge">${esc(a.category||'뉴스')}</span><h3>${esc(a.title)}</h3><div class="news-date">${esc(fmt(a.date))}</div></div></a>`}
function mini(a){const img=a.image?`style="background-image:url('${esc(a.image)}')"`:'';return `<a class="mini-story" href="${articleURL(a.id)}"><div class="thumb" ${img}></div><div><b>${esc(a.title)}</b><small>${esc(fmt(a.date))}</small></div></a>`}
async function loadHome(){const target=$('#homeNews');if(!target)return;const data=await getJSON('/data/news.json');target.innerHTML=data.slice(0,8).map(card).join('');const lead=data.find(x=>x.featured)||data[0];if(lead){$('#leadTitle').textContent=lead.title;$('#leadSummary').textContent=lead.summary||'';$('#leadMeta').textContent=`TOP NEWS · ${lead.category||'뉴스'} · ${fmt(lead.date)}`;$('#leadLink').href=articleURL(lead.id);if(lead.image)$('#leadMedia').style.backgroundImage=`url('${lead.image}')`}const breaking=data.find(x=>x.visualStyle==='breaking')||data[1]||data[0];if(breaking)$('#breakingText').textContent=breaking.title;const sorted=[...data].sort((a,b)=>(b.date||'').localeCompare(a.date||''));$('#topLatest')&&($('#topLatest').innerHTML=sorted.slice(0,7).map(a=>`<li><a href="${articleURL(a.id)}">${esc(a.title)}</a></li>`).join(''));$('#latestNews')&&($('#latestNews').innerHTML=sorted.slice(0,8).map(latestRow).join(''));$('#attentionList')&&($('#attentionList').innerHTML=data.slice(0,6).map(a=>`<li><a href="${articleURL(a.id)}">${esc(a.title)}</a></li>`).join(''));const by=(test)=>data.filter(test).slice(0,4).map(mini).join('');$('#beatMartial')&&($('#beatMartial').innerHTML=by(a=>(a.category||'').includes('무도')||JSON.stringify(a).includes('태권')));$('#beatSafety')&&($('#beatSafety').innerHTML=by(a=>JSON.stringify(a).includes('드론')||JSON.stringify(a).includes('안전')));$('#beatActs')&&($('#beatActs').innerHTML=by(a=>JSON.stringify(a).toLowerCase().includes('acts')||JSON.stringify(a).includes('선교'))||sorted.slice(0,3).map(mini).join(''))}
async function loadNewsroom(){const list=$('#articleList');if(!list)return;let data=await getJSON('/data/news.json');const q=new URLSearchParams(location.search),cat=q.get('cat'),term=(q.get('q')||'').trim().toLowerCase();if(cat)data=data.filter(x=>x.category===cat);if(term)data=data.filter(x=>JSON.stringify(x).toLowerCase().includes(term));list.innerHTML=data.map(a=>`<a class="article-row" href="${articleURL(a.id)}"><div class="thumb" ${a.image?`style="background-image:url('${esc(a.image)}')"`:''}></div><div class="body"><span class="badge">${esc(a.category||'뉴스')}</span><h3>${esc(a.title)}</h3><div class="muted">${esc(fmt(a.date))} · ${esc(a.author||'편집부')}</div><p>${esc(a.summary||'')}</p></div></a>`).join('')||'<p>해당 조건의 기사가 없습니다.</p>'}
async function loadArticle(){const shell=$('#articleShell');if(!shell)return;const id=new URLSearchParams(location.search).get('id'),data=await getJSON('/data/news.json'),a=data.find(x=>x.id===id)||data[0];if(!a)return;document.title=`${a.title} | Global News24`;$('#aCat').textContent=a.category||'뉴스';$('#aTitle').textContent=a.title;$('#aSub').textContent=a.subtitle||a.summary||'';$('#aMeta').innerHTML=`<span>${esc(fmt(a.date))}</span><span>${esc(a.author||'편집부')}</span><span>Global News24</span>`;if(a.image)$('#aHero').style.backgroundImage=`url('${a.image}')`;const body=Array.isArray(a.content)?a.content:(Array.isArray(a.body)?a.body:[a.summary||'']);$('#aBody').innerHTML=body.map(p=>`<p>${esc(p)}</p>`).join('');$('#aSource')&&($('#aSource').innerHTML=`<strong>자료·출처</strong><br>${esc(a.sourceName||'Global News24')}${a.sourceUrl?` · <a href="${esc(a.sourceUrl)}" target="_blank" rel="noopener">원문/관련자료</a>`:''}`)}
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
