/* GLOBAL NEWS24 UNIVERSAL MEGA NAV v1.3 */
(function(){
'use strict';
var regions=[['서울','/seoul/'],['부산','/busan/'],['대구','/daegu/'],['인천','/incheon/'],['광주','/gwangju/'],['대전','/daejeon/'],['울산','/ulsan/'],['세종','/sejong/'],['경기','/gyeonggi/'],['강원','/gangwon/'],['충북','/chungbuk/'],['충남','/chungnam/'],['전북','/jeonbuk/'],['전남','/jeonnam/'],['경북','/gyeongbuk/'],['경남','/gyeongnam/'],['제주','/jeju/']];
var navI18n={
ko:{world:'세계 33개국',korea:'대한민국 17개 시·도',koreaTitle:'대한민국 17개 시·도 지역판',worldTitle:'세계 33개 국가판',regionsAll:'지역판 전체보기 →',worldAll:'세계 국가판 전체보기 →'},
en:{world:'33 Countries',korea:'17 Regions of South Korea',koreaTitle:'17 Regions of South Korea',worldTitle:'33 Global Editions',regionsAll:'View all Korea regions →',worldAll:'View all global editions →'},
zh:{world:'全球33个国家',korea:'韩国17个地区',koreaTitle:'韩国17个地区新闻版',worldTitle:'全球33个国家版',regionsAll:'查看韩国全部地区 →',worldAll:'查看全部国家版 →'},
ja:{world:'世界33か国',korea:'韓国17地域',koreaTitle:'韓国17地域版',worldTitle:'世界33か国版',regionsAll:'韓国の全地域を見る →',worldAll:'すべての国別版を見る →'},
id:{world:'33 Negara',korea:'17 Wilayah Korea Selatan',koreaTitle:'17 Wilayah Korea Selatan',worldTitle:'33 Edisi Negara',regionsAll:'Lihat semua wilayah Korea →',worldAll:'Lihat semua edisi negara →'},
th:{world:'33 ประเทศทั่วโลก',korea:'17 ภูมิภาคเกาหลีใต้',koreaTitle:'17 ภูมิภาคของเกาหลีใต้',worldTitle:'33 ฉบับประเทศทั่วโลก',regionsAll:'ดูทุกภูมิภาคของเกาหลี →',worldAll:'ดูฉบับประเทศทั้งหมด →'},
vi:{world:'33 quốc gia',korea:'17 khu vực Hàn Quốc',koreaTitle:'17 khu vực của Hàn Quốc',worldTitle:'33 ấn bản quốc gia',regionsAll:'Xem tất cả khu vực Hàn Quốc →',worldAll:'Xem tất cả ấn bản quốc gia →'},
ne:{world:'विश्वका ३३ देश',korea:'दक्षिण कोरियाका १७ क्षेत्र',koreaTitle:'दक्षिण कोरियाका १७ क्षेत्रीय संस्करण',worldTitle:'विश्वका ३३ देश संस्करण',regionsAll:'कोरियाका सबै क्षेत्र हेर्नुहोस् →',worldAll:'सबै देश संस्करण हेर्नुहोस् →'},
fa:{world:'۳۳ کشور جهان',korea:'۱۷ منطقه کره جنوبی',koreaTitle:'۱۷ نسخه منطقه‌ای کره جنوبی',worldTitle:'۳۳ نسخه کشوری جهان',regionsAll:'مشاهده همه مناطق کره →',worldAll:'مشاهده همه نسخه‌های کشوری →'},
ar:{world:'33 دولة حول العالم',korea:'17 منطقة في كوريا الجنوبية',koreaTitle:'17 منطقة في كوريا الجنوبية',worldTitle:'33 نسخة دولية',regionsAll:'عرض جميع مناطق كوريا →',worldAll:'عرض جميع النسخ الدولية →'},
tr:{world:'Dünyada 33 Ülke',korea:'Güney Kore’de 17 Bölge',koreaTitle:'Güney Kore’nin 17 Bölgesel Yayını',worldTitle:'33 Ülke Edisyonu',regionsAll:'Tüm Kore bölgelerini görüntüle →',worldAll:'Tüm ülke edisyonlarını görüntüle →'},
es:{world:'33 países',korea:'17 regiones de Corea del Sur',koreaTitle:'17 regiones de Corea del Sur',worldTitle:'33 ediciones nacionales',regionsAll:'Ver todas las regiones de Corea →',worldAll:'Ver todas las ediciones nacionales →'},
fr:{world:'33 pays',korea:'17 régions de Corée du Sud',koreaTitle:'17 régions de Corée du Sud',worldTitle:'33 éditions nationales',regionsAll:'Voir toutes les régions de Corée →',worldAll:'Voir toutes les éditions nationales →'},
de:{world:'33 Länder',korea:'17 Regionen Südkoreas',koreaTitle:'17 Regionen Südkoreas',worldTitle:'33 Länderausgaben',regionsAll:'Alle Regionen Koreas anzeigen →',worldAll:'Alle Länderausgaben anzeigen →'},
it:{world:'33 Paesi',korea:'17 regioni della Corea del Sud',koreaTitle:'17 regioni della Corea del Sud',worldTitle:'33 edizioni nazionali',regionsAll:'Vedi tutte le regioni della Corea →',worldAll:'Vedi tutte le edizioni nazionali →'},
pt:{world:'33 países',korea:'17 regiões da Coreia do Sul',koreaTitle:'17 regiões da Coreia do Sul',worldTitle:'33 edições nacionais',regionsAll:'Ver todas as regiões da Coreia →',worldAll:'Ver todas as edições nacionais →'},
ru:{world:'33 страны мира',korea:'17 регионов Южной Кореи',koreaTitle:'17 регионов Южной Кореи',worldTitle:'33 национальных издания',regionsAll:'Все регионы Кореи →',worldAll:'Все национальные издания →'}
};
function navLanguage(){
 var parts=location.pathname.toLowerCase().split('/').filter(Boolean),registry=window.GN24_COUNTRY_REGISTRY||{},cfg=registry[parts[0]];
 var raw=(cfg&&cfg.language)||document.documentElement.lang||'ko';var lang=String(raw).toLowerCase().split('-')[0];
 return navI18n[lang]||navI18n.en;
}
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
 var t=navLanguage();
 if(document.querySelector('.gn24-universal-bar'))return;
 var isHQ=!!document.getElementById('gn24MegaCountries');
 var header=isHQ?document.getElementById('siteHeader'):document.querySelector('.global-edition-header,.regional-site-header');
 if(!header)return;
 if(isHQ)document.body.classList.add('gn24-hq-mega-ready');
 var bar=document.createElement('nav');bar.className='gn24-universal-bar';bar.setAttribute('aria-label','GLOBAL NEWS24 network editions');
 bar.innerHTML='<div class="gn24-universal-kicker">GLOBAL NEWS24 NETWORK</div><div class="gn24-universal-inner"><button class="gn24-universal-btn" data-kind="korea">🇰🇷 '+t.korea+' ▼</button><button class="gn24-universal-btn" data-kind="world">🌐 '+t.world+' ▼</button></div><div class="gn24-universal-panel" hidden></div>';
 if(isHQ){var primary=header.querySelector('.primary-nav');if(primary&&primary.parentNode===header)primary.insertAdjacentElement('afterend',bar);else header.appendChild(bar)}else{header.appendChild(bar)}
 var panel=bar.querySelector('.gn24-universal-panel');
 bar.addEventListener('click',function(e){var b=e.target.closest('[data-kind]');if(!b)return;var same=panel.dataset.kind===b.dataset.kind&&!panel.hidden;panel.dataset.kind=b.dataset.kind;panel.innerHTML=b.dataset.kind==='korea'?'<h2>'+t.koreaTitle+'</h2>'+regionMarkup()+'<a class="gn24-mega-all" href="/region/#korea-regions">'+t.regionsAll+'</a>':'<h2>'+t.worldTitle+'</h2><div class="gn24-mega-countries">'+countryMarkup()+'</div><a class="gn24-mega-all" href="/region/#global-editions">'+t.worldAll+'</a>';panel.hidden=same});
 document.addEventListener('click',function(e){if(!bar.contains(e.target))panel.hidden=true});
}
function init(){fillHome();installBar()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
}());