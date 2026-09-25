/* GLOBAL NEWS24 UNIVERSAL MEGA NAV v1.2 */
(function(){
'use strict';
var regions=[['서울','/seoul/'],['부산','/busan/'],['대구','/daegu/'],['인천','/incheon/'],['광주','/gwangju/'],['대전','/daejeon/'],['울산','/ulsan/'],['세종','/sejong/'],['경기','/gyeonggi/'],['강원','/gangwon/'],['충북','/chungbuk/'],['충남','/chungnam/'],['전북','/jeonbuk/'],['전남','/jeonnam/'],['경북','/gyeongbuk/'],['경남','/gyeongnam/'],['제주','/jeju/']];
var groups=[
['ASIA',[['🇨🇳','CHINA','china',1],['🇯🇵','JAPAN','japan',1],['🇵🇭','PHILIPPINES','philippines',1],['🇮🇩','INDONESIA','indonesia',1],['🇲🇾','MALAYSIA','malaysia',1],['🇹🇭','THAILAND','thailand',1],['🇻🇳','VIETNAM','vietnam',1],['🇳🇵','NEPAL','nepal',1],['🇮🇳','INDIA','india',1],['🇵🇰','PAKISTAN','pakistan',1]]],
['MIDDLE EAST · AFRICA',[['🇮🇷','IRAN','iran',1],['🇦🇪','UAE','uae',0],['🇸🇦','SAUDI ARABIA','saudi-arabia',0],['🇹🇷','TÜRKİYE','turkiye',0],['🇲🇦','MOROCCO','morocco',1],['🇪🇬','EGYPT','egypt',0],['🇿🇦','SOUTH AFRICA','south-africa',0]]],
['EUROPE',[['🇪🇸','SPAIN','spain',1],['🇬🇧','UK','uk',0],['🇫🇷','FRANCE','france',0],['🇩🇪','GERMANY','germany',0],['🇮🇹','ITALY','italy',0]]],
['AMERICAS · OCEANIA',[['🇨🇦','CANADA','canada',1],['🇺🇸','USA','usa',0],['🇲🇽','MEXICO','mexico',0],['🇧🇷','BRAZIL','brazil',0],['🇦🇷','ARGENTINA','argentina',0],['🇨🇴','COLOMBIA','colombia',0],['🇦🇺','AUSTRALIA','australia',0],['🇳🇿','NEW ZEALAND','new-zealand',0]]]
];
function countryMarkup(){return groups.map(function(g){return '<section class="gn24-country-group"><h3>'+g[0]+'</h3>'+g[1].map(function(c){return '<a class="gn24-country-link '+(c[3]?'is-open':'is-founding')+'" href="/'+c[2]+'/"><span>'+c[0]+' '+c[1]+'</span><small>'+(c[3]?'OPEN':'FOUNDING')+'</small></a>'}).join('')+'</section>'}).join('')}
function regionMarkup(){return '<div class="gn24-mega-grid">'+regions.map(function(r){return '<a href="'+r[1]+'">'+r[0]+'</a>'}).join('')+'</div>'}
function fillHome(){var box=document.getElementById('gn24MegaCountries');if(box)box.innerHTML=countryMarkup()}
function installBar(){
 if(document.querySelector('.gn24-universal-bar'))return;
 var header=document.querySelector('.global-edition-header,.regional-site-header');
 if(!header&&document.getElementById('gn24MegaCountries')){
   header=document.querySelector('header')||document.querySelector('.site-header')||document.querySelector('.header');
   if(header)document.body.classList.add('gn24-hq-mega-ready');
 }
 if(!header)return;
 var bar=document.createElement('nav');bar.className='gn24-universal-bar';bar.setAttribute('aria-label','GLOBAL NEWS24 network editions');
 bar.innerHTML='<div class="gn24-universal-kicker">GLOBAL NEWS24 NETWORK</div><div class="gn24-universal-inner"><button class="gn24-universal-btn" data-kind="korea">🇰🇷 대한민국 17개 ▼</button><button class="gn24-universal-btn" data-kind="world"><span class="gn24-world-pc">🌐 GLOBAL 30 ▼</span><span class="gn24-world-mobile">🌐 세계 30개 ▼</span></button></div><div class="gn24-universal-panel" hidden></div>';
 header.appendChild(bar);var panel=bar.querySelector('.gn24-universal-panel');
 bar.addEventListener('click',function(e){var b=e.target.closest('[data-kind]');if(!b)return;var same=panel.dataset.kind===b.dataset.kind&&!panel.hidden;panel.dataset.kind=b.dataset.kind;panel.innerHTML=b.dataset.kind==='korea'?'<h2>대한민국 17개 지역판</h2>'+regionMarkup()+'<a class="gn24-mega-all" href="/region/#korea-regions">지역판 전체보기 →</a>':'<h2>GLOBAL 30 EDITIONS</h2><div class="gn24-mega-countries">'+countryMarkup()+'</div><a class="gn24-mega-all" href="/region/#global-editions">WORLD NETWORK 전체보기 →</a>';panel.hidden=same});
 document.addEventListener('click',function(e){if(!bar.contains(e.target))panel.hidden=true});
}
function init(){fillHome();installBar()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
}());