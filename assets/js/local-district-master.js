/* GN24 DISTRICT MASTER v1. Existing loader remains untouched; explicit opt-in. */
(function(){
'use strict';
const source=document.getElementById('gn24LocalConfig'),params=new URLSearchParams(location.search),code=params.get('district');
if(!source||!code)return;
const config=JSON.parse(source.textContent),district=(config.districts||[]).find(d=>d.code===code),region=document.body.dataset.region,name=document.body.dataset.regionName||region;
const list=document.getElementById('regionalNews'),hero=document.getElementById('regionalLead'),count=document.getElementById('regionalCount');if(!list||!hero||!region)return;
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const url=a=>'/share/'+encodeURIComponent(a.id)+'/',image=a=>`style="background-image:url('${esc(a.image||'/assets/images/news/gn24-default-news.svg')}'),url('/assets/images/news/gn24-default-news.svg')"`,date=a=>esc(String(a.date||'').replaceAll('-','.'));
let rows=null,error=false;
function render(){
 if(rows===null&&!error){hero.removeAttribute('href');hero.replaceChildren();list.innerHTML='<div class="regional-empty"><b>지역뉴스를 불러오는 중입니다.</b></div>';return}
 const lead=window.GN24_LOCAL_GRID?null:rows&&rows[0];
 const leadHTML=lead?`<div class="regional-lead-image" ${image(lead)}></div><div><span>${esc(lead.category||'뉴스')}</span><h2>${esc(lead.title)}</h2><p>${esc(lead.summary)}</p><small>${date(lead)} · ${esc(lead.author||'Global News24')}</small></div>`:'';
 const listHTML=error?'<div class="regional-empty"><b>지역뉴스를 불러오지 못했습니다.</b><p>잠시 후 다시 확인해 주세요.</p></div>':rows.length&&window.GN24_LOCAL_GRID?window.GN24_LOCAL_GRID(rows):rows.length?rows.slice(1).map(a=>`<a class="regional-card" href="${url(a)}"><div class="regional-thumb" ${image(a)}></div><div class="regional-card-body"><span>${esc(a.category||'뉴스')}</span><h3>${esc(a.title)}</h3><p>${esc(a.summary)}</p><small>${date(a)} · ${esc(a.author||'Global News24')}</small></div></a>`).join(''):'<div class="regional-empty"><b>등록된 지역뉴스가 없습니다</b><p><a href="/'+encodeURIComponent(region)+'/">전체 '+esc(name)+'뉴스 보기</a></p></div>';
 if(hero.innerHTML!==leadHTML)hero.innerHTML=leadHTML;if(lead)hero.href=url(lead);else hero.removeAttribute('href');
 if(list.innerHTML!==listHTML)list.innerHTML=listHTML;
 const label=name+' · '+(district?district.name:'지역')+' 기사 '+(rows?rows.length:0)+'건';if(count&&count.textContent!==label)count.textContent=label;
}
// The original asynchronous loader may finish later. Restore only this local view.
const observer=new MutationObserver(()=>{observer.disconnect();render();observe()});
function observe(){[list,hero,count].filter(Boolean).forEach(el=>observer.observe(el,{childList:true,subtree:true}))}
render();observe();
async function load(){
 if(!district){rows=[];render();return}
 try{
 const c=window.GN24_SUPABASE;if(!c||!c.url||!c.anonKey)throw Error('Missing connection');
 const fields='id,date,title,category,author,summary,image,region_code,tags',query=new URLSearchParams({select:fields,region_code:'eq.'+region,is_published:'eq.true',order:'date.desc,created_at.desc'});
 // Exact structured tags; never infer a district from title/body or another region.
 const tags=district.tags||['district:'+district.code];query.set('or','('+tags.map(t=>'tags.cs.{'+JSON.stringify(t)+'}').join(',')+')');
 const cat=params.get('cat');if(cat)query.set('category','eq.'+cat);
 const response=await fetch(c.url.replace(/\/$/,'')+'/rest/v1/gn24_articles?'+query,{cache:'no-store',headers:{apikey:c.anonKey}});if(!response.ok)throw Error('District request failed');
 const data=await response.json();rows=data.filter(a=>a.region_code===region&&Array.isArray(a.tags)&&tags.some(t=>a.tags.includes(t)));
 }catch(e){error=true;console.warn('GN24 district news',e)}
 render();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});else load();
}());
