const $=(s,p=document)=>p.querySelector(s), $$=(s,p=document)=>[...p.querySelectorAll(s)];
function esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function fmt(d){if(!d)return'';return d.replaceAll('-','.')}
async function getJSON(path){const r=await fetch(path,{cache:'no-store'});if(!r.ok)throw Error(path);return r.json()}
function articleURL(id){return `/pages/article/?id=${encodeURIComponent(id)}`}
function setToday(){const el=$('#todayLabel');if(!el)return;const d=new Date();const days=['일','월','화','수','목','금','토'];el.textContent=`${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} (${days[d.getDay()]})`}
function closeMegas(except=null){$$('.nav-item.open').filter(x=>x!==except).forEach(x=>x.classList.remove('open'))}
function setupNav(){
 const util=$('#utilityBtn'),panel=$('#utilityPanel');
 if(util&&panel)util.onclick=e=>{e.stopPropagation();closeMegas();panel.classList.toggle('open');util.setAttribute('aria-expanded',panel.classList.contains('open'))};
 $$('.nav-btn').forEach(btn=>btn.addEventListener('click',e=>{if(innerWidth<=900){e.preventDefault();e.stopPropagation();panel?.classList.remove('open');const item=btn.closest('.nav-item');const willOpen=!item.classList.contains('open');closeMegas(item);item.classList.toggle('open',willOpen)}}));
 document.addEventListener('click',e=>{if(innerWidth<=900&&!e.target.closest('.mega'))closeMegas();if(!e.target.closest('#utilityPanel')&&!e.target.closest('#utilityBtn'))panel?.classList.remove('open')});
 addEventListener('resize',()=>{if(innerWidth>900){closeMegas();panel?.classList.remove('open')}})
}
function visualClass(a,i=0){const s=a.visualStyle||((i===0)?'spotlight':'normal');if(s==='top')return'glow';if(s==='breaking')return'breaking-card';if(s==='spotlight')return'spotlight';return''}
function card(a,i=0){const cls=visualClass(a,i);const img=a.image?`style="background-image:url('${esc(a.image)}')"`:'';return `<a class="news-card ${cls}" href="${articleURL(a.id)}"><div class="thumb" ${img}></div><div class="body"><span class="badge">${esc(a.category||'뉴스')}</span><h3>${esc(a.title)}</h3><div class="news-date">${esc(fmt(a.date))}</div></div></a>`}
function latestRow(a){const img=a.image?`style="background-image:url('${esc(a.image)}')"`:'';return `<a class="latest-row" href="${articleURL(a.id)}"><div class="thumb" ${img}></div><div><span class="badge">${esc(a.category||'뉴스')}</span><h3>${esc(a.title)}</h3><div class="news-date">${esc(fmt(a.date))}</div></div></a>`}
async function loadHome(){
 const target=$('#homeNews');if(!target)return;const data=await getJSON('/data/news.json');
 target.innerHTML=data.slice(0,8).map(card).join('');
 const lead=data.find(x=>x.featured)||data[0];if(lead){$('#leadTitle').textContent=lead.title;$('#leadSummary').textContent=lead.summary||'';$('#leadMeta').textContent=`TOP NEWS · ${lead.category} · ${fmt(lead.date)}`;$('#leadLink').href=articleURL(lead.id);if(lead.image)$('#leadMedia').style.backgroundImage=`url('${lead.image}')`}
 const breaking=data.find(x=>x.visualStyle==='breaking')||data[1]||data[0];if(breaking)$('#breakingText').textContent=breaking.title;
 const latest=$('#latestNews');if(latest)latest.innerHTML=[...data].sort((a,b)=>(b.date||'').localeCompare(a.date||'')).slice(0,6).map(latestRow).join('');
 const attention=$('#attentionList');if(attention)attention.innerHTML=data.slice(0,5).map(a=>`<li><a href="${articleURL(a.id)}">${esc(a.title)}</a></li>`).join('');
}
async function loadNewsroom(){const list=$('#articleList');if(!list)return;let data=await getJSON('/data/news.json');const q=new URLSearchParams(location.search);const cat=q.get('cat');const term=(q.get('q')||'').trim().toLowerCase();if(cat)data=data.filter(x=>x.category===cat);if(term)data=data.filter(x=>(x.title+' '+(x.subtitle||'')+' '+(x.summary||'')+' '+(x.tags||[]).join(' ')+' '+(x.relatedOrgs||[]).join(' ')).toLowerCase().includes(term));list.innerHTML=data.map(a=>`<a class="article-row" href="${articleURL(a.id)}"><div class="thumb" ${a.image?`style="background-image:url('${esc(a.image)}')"`:''}></div><div class="body"><span class="badge">${esc(a.category||'뉴스')}</span><h3>${esc(a.title)}</h3><div class="muted">${esc(fmt(a.date))} · ${esc(a.author||'편집부')}</div><p>${esc(a.summary||'')}</p></div></a>`).join('')||'<p>해당 조건의 기사가 없습니다.</p>'}
async function loadArticle(){const shell=$('#articleShell');if(!shell)return;const id=new URLSearchParams(location.search).get('id');const data=await getJSON('/data/news.json');const a=data.find(x=>x.id===id)||data[0];if(!a)return;document.title=`${a.title} | Global News24`;$('#aCat').textContent=a.category||'뉴스';$('#aTitle').textContent=a.title;$('#aSub').textContent=a.subtitle||a.summary||'';$('#aMeta').innerHTML=`<span>${esc(fmt(a.date))}</span><span>${esc(a.author||'편집부')}</span><span>Global News24</span>`;if(a.image)$('#aHero').style.backgroundImage=`url('${a.image}')`;const body=Array.isArray(a.content)?a.content:(Array.isArray(a.body)?a.body:[a.summary||'']);$('#aBody').innerHTML=body.map(p=>`<p>${esc(p)}</p>`).join('');$('#aSource').innerHTML=`<strong>자료·출처</strong><br>${esc(a.sourceName||'Global News24')}${a.sourceUrl?` · <a href="${esc(a.sourceUrl)}" target="_blank" rel="noopener">원문/관련자료</a>`:''}`}
document.addEventListener('DOMContentLoaded',()=>{setToday();setupNav();loadHome().catch(console.error);loadNewsroom().catch(console.error);loadArticle().catch(console.error)})
