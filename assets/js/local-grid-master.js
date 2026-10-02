/* Opt-in local news card renderer. Fetching and article URLs remain unchanged. */
(function(){
'use strict';
if(!document.body.hasAttribute('data-local-news-grid'))return;
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
window.GN24_LOCAL_GRID=function(rows){return rows.slice(0,8).map(a=>`<a class="regional-card" href="/share/${encodeURIComponent(a.id)}/"><div class="regional-thumb" style="background-image:url('${esc(a.image||'/assets/images/news/gn24-default-news.svg')}'),url('/assets/images/news/gn24-default-news.svg')"></div><div class="regional-card-body"><span>${esc(a.category||'뉴스')}</span><h3>${esc(a.title)}</h3></div></a>`).join('')};
}());
