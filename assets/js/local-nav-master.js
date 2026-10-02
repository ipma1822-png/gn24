/* GN24 LOCAL MASTER v1 — region-neutral, explicit page opt-in only. */
(function(){
'use strict';
function init(){
 const nav=document.getElementById('gn24LocalNav'),source=document.getElementById('gn24LocalConfig');
 if(!nav||!source)return;
 const config=JSON.parse(source.textContent),region=document.body.dataset.region,name=document.body.dataset.regionName||region;
 if(!region)return;
 const home='/'+encodeURIComponent(region)+'/',office=home+'#'+encodeURIComponent(config.officeAnchor||'regionalEditor');
 const link=(label,url)=>({label,url}),contact='/pages/contact/',news='/junior/news/',reporters='/pages/reporters/';
 const groups=[
 {label:'지역뉴스',links:[link('주요뉴스',home+'#regionalNews'),link('최신뉴스',home+'#regionalLatest'),...['행정·정책','사회·안전','경제·산업','교육·문화','스포츠·무도','지역소식'].map((label,i)=>link(label,home+'?cat='+encodeURIComponent(['국내소식','사회','경제','청소년·문화','무도·스포츠','공익'][i])))]},
 {label:'시·군·구',note:name+' 지역뉴스',links:[link('전체 '+name+'뉴스',home),...(config.districts||[]).map(d=>link(d.name,home+'?district='+encodeURIComponent(d.code)+'#regionalNews'))]},
 {label:'지역본부',links:[link('소개',office),link('지사장',home+'#regionalEditor'),link('조직',office),link('활동',home+'#regionalNews'),link('공지','/regional-center/'),link('운영','/regional-center/rules/')]},
 {label:'기자단',links:[link('소개','/pages/reporter-guide/'),link('기자찾기',reporters),link('지역·전문기자',reporters),link('기자별기사',reporters),link('교육','/regional-center/training/'),link('참여','/pages/reporter-apply/')]},
 {label:'꿈나무',links:[link('뉴스',news),link('동네',news),link('학교',news),link('기자','/junior/'),link('우수기사',news),link('참여','/junior/join/')]},
 {label:'기관·단체',note:'분야별 기존 뉴스 및 제보',links:['교육','학교·대학','문화','체육·무술','청소년','봉사','학술','행사'].map((label,i)=>link(label,i===3?home+'?cat='+encodeURIComponent('무도·스포츠'):i===5?home+'?cat='+encodeURIComponent('공익'):home+'?cat='+encodeURIComponent('청소년·문화')))},
 {label:'시민참여',links:[link('뉴스제보',contact),link('사진제보',contact),link('행사제보',contact),link('기관소식',contact),link('기자 참여','/pages/reporter-apply/'),link('꿈나무 참여','/junior/join/'),link('협력문의',contact)]},
 {label:'파트너',note:'파트너 및 협력 문의',links:['공식파트너','협력기관','캠페인','상생광고'].map(label=>link(label,contact))}
 ];
 // Optional region data can override destinations without changing the MASTER.
 groups.forEach(g=>g.links.forEach(l=>{l.url=(config.links||{})[g.label+':'+l.label]||l.url}));
 const a=l=>{const el=document.createElement('a');el.textContent=l.label;el.href=l.url;if(/^https:\/\//.test(l.url)){el.target='_blank';el.rel='noopener';el.setAttribute('aria-label',l.label+' 공식 홈페이지 (새 창)')}return el};
 const row=document.createElement('div');row.className='wrap gn24-local-row';row.append(a(link('지역홈',home)));
 const panel=document.createElement('div');panel.id='gn24LocalMega';panel.className='gn24-local-mega';panel.hidden=true;
 const content=document.createElement('div');content.className='wrap';panel.append(content);
 let active=null;
 function close(){panel.hidden=true;active=null;row.querySelectorAll('button[data-group]').forEach(b=>b.setAttribute('aria-expanded','false'))}
 function open(i){close();active=i;const g=groups[i];content.replaceChildren();const heading=document.createElement('h2');heading.textContent=name+' · '+g.label;content.append(heading);if(g.note){const note=document.createElement('p');note.textContent=g.note;content.append(note)}const grid=document.createElement('div');grid.className='gn24-local-grid';g.links.forEach(l=>grid.append(a(l)));content.append(grid);panel.hidden=false;row.querySelector('[data-group="'+i+'"]').setAttribute('aria-expanded','true')}
 groups.forEach((g,i)=>{const button=document.createElement('button');button.type='button';button.textContent=g.label;button.dataset.group=i;button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls',panel.id);button.addEventListener('click',()=>active===i?close():open(i));row.append(button)});
 const all=document.createElement('button');all.type='button';all.textContent='☰';all.setAttribute('aria-label','전체 메뉴 열기');all.setAttribute('aria-controls','regionalMenuDrawer');all.setAttribute('aria-expanded','false');all.addEventListener('click',()=>{close();document.getElementById('regionalMenuOpen').click()});row.append(all);nav.append(row,panel);
 const drawer=document.getElementById('regionalMenuDrawer');
 if(drawer)new MutationObserver(()=>all.setAttribute('aria-expanded',String(!drawer.hidden))).observe(drawer,{attributes:true,attributeFilter:['hidden']});
 const body=document.getElementById('gn24LocalAll');if(body){body.replaceChildren();body.append(a(link('지역홈',home)));groups.forEach(g=>{const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent=g.label;details.append(summary);g.links.forEach(l=>details.append(a(l)));body.append(details)})}
 document.addEventListener('click',e=>{if(!nav.contains(e.target))close()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){const button=row.querySelector('[data-group="'+active+'"]');close();button.focus()}});
 nav.addEventListener('focusout',e=>{if(!nav.contains(e.relatedTarget))close()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
}());
