/* GLOBAL NEWS24 UNIVERSAL MEGA NAV v1.3 */
(function(){
'use strict';
var regions=[['서울','/seoul/'],['부산','/busan/'],['대구','/daegu/'],['인천','/incheon/'],['광주','/gwangju/'],['대전','/daejeon/'],['울산','/ulsan/'],['세종','/sejong/'],['경기','/gyeonggi/'],['강원','/gangwon/'],['충북','/chungbuk/'],['충남','/chungnam/'],['전북','/jeonbuk/'],['전남','/jeonnam/'],['경북','/gyeongbuk/'],['경남','/gyeongnam/'],['제주','/jeju/']];
var navI18n={
ko:{world:'세계 35개국',korea:'대한민국 17개 시·도',koreaTitle:'대한민국 17개 시·도 지역판',worldTitle:'세계 35개 국가판',regionsAll:'지역판 전체보기 →',worldAll:'세계 국가판 전체보기 →'},
en:{world:'35 Countries',korea:'17 Regions of South Korea',koreaTitle:'17 Regions of South Korea',worldTitle:'35 Global Editions',regionsAll:'View all Korea regions →',worldAll:'View all global editions →'},
zh:{world:'全球35个国家',korea:'韩国17个地区',koreaTitle:'韩国17个地区新闻版',worldTitle:'全球35个国家版',regionsAll:'查看韩国全部地区 →',worldAll:'查看全部国家版 →'},
ja:{world:'世界35か国',korea:'韓国17地域',koreaTitle:'韓国17地域版',worldTitle:'世界35か国版',regionsAll:'韓国の全地域を見る →',worldAll:'すべての国別版を見る →'},
id:{world:'35 Negara',korea:'17 Wilayah Korea Selatan',koreaTitle:'17 Wilayah Korea Selatan',worldTitle:'35 Edisi Negara',regionsAll:'Lihat semua wilayah Korea →',worldAll:'Lihat semua edisi negara →'},
th:{world:'35 ประเทศทั่วโลก',korea:'17 ภูมิภาคเกาหลีใต้',koreaTitle:'17 ภูมิภาคของเกาหลีใต้',worldTitle:'35 ฉบับประเทศทั่วโลก',regionsAll:'ดูทุกภูมิภาคของเกาหลี →',worldAll:'ดูฉบับประเทศทั้งหมด →'},
vi:{world:'35 quốc gia',korea:'17 khu vực Hàn Quốc',koreaTitle:'17 khu vực của Hàn Quốc',worldTitle:'35 ấn bản quốc gia',regionsAll:'Xem tất cả khu vực Hàn Quốc →',worldAll:'Xem tất cả ấn bản quốc gia →'},
ne:{world:'विश्वका ३५ देश',korea:'दक्षिण कोरियाका १७ क्षेत्र',koreaTitle:'दक्षिण कोरियाका १७ क्षेत्रीय संस्करण',worldTitle:'विश्वका ३५ देश संस्करण',regionsAll:'कोरियाका सबै क्षेत्र हेर्नुहोस् →',worldAll:'सबै देश संस्करण हेर्नुहोस् →'},
fa:{world:'۳۵ کشور جهان',korea:'۱۷ منطقه کره جنوبی',koreaTitle:'۱۷ نسخه منطقه‌ای کره جنوبی',worldTitle:'۳۵ نسخه کشوری جهان',regionsAll:'مشاهده همه مناطق کره →',worldAll:'مشاهده همه نسخه‌های کشوری →'},
ar:{world:'35 دولة حول العالم',korea:'17 منطقة في كوريا الجنوبية',koreaTitle:'17 منطقة في كوريا الجنوبية',worldTitle:'35 نسخة دولية',regionsAll:'عرض جميع مناطق كوريا →',worldAll:'عرض جميع النسخ الدولية →'},
tr:{world:'Dünyada 35 Ülke',korea:'Güney Kore’de 17 Bölge',koreaTitle:'Güney Kore’nin 17 Bölgesel Yayını',worldTitle:'35 Ülke Edisyonu',regionsAll:'Tüm Kore bölgelerini görüntüle →',worldAll:'Tüm ülke edisyonlarını görüntüle →'},
es:{world:'35 países',korea:'17 regiones de Corea del Sur',koreaTitle:'17 regiones de Corea del Sur',worldTitle:'35 ediciones nacionales',regionsAll:'Ver todas las regiones de Corea →',worldAll:'Ver todas las ediciones nacionales →'},
fr:{world:'35 pays',korea:'17 régions de Corée du Sud',koreaTitle:'17 régions de Corée du Sud',worldTitle:'35 éditions nationales',regionsAll:'Voir toutes les régions de Corée →',worldAll:'Voir toutes les éditions nationales →'},
de:{world:'35 Länder',korea:'17 Regionen Südkoreas',koreaTitle:'17 Regionen Südkoreas',worldTitle:'35 Länderausgaben',regionsAll:'Alle Regionen Koreas anzeigen →',worldAll:'Alle Länderausgaben anzeigen →'},
it:{world:'35 Paesi',korea:'17 regioni della Corea del Sud',koreaTitle:'17 regioni della Corea del Sud',worldTitle:'35 edizioni nazionali',regionsAll:'Vedi tutte le regioni della Corea →',worldAll:'Vedi tutte le edizioni nazionali →'},
pt:{world:'35 países',korea:'17 regiões da Coreia do Sul',koreaTitle:'17 regiões da Coreia do Sul',worldTitle:'35 edições nacionais',regionsAll:'Ver todas as regiões da Coreia →',worldAll:'Ver todas as edições nacionais →'},
ru:{world:'35 страны мира',korea:'17 регионов Южной Кореи',koreaTitle:'17 регионов Южной Кореи',worldTitle:'35 национальных издания',regionsAll:'Все регионы Кореи →',worldAll:'Все национальные издания →'}
};
function navLanguage(){
 var parts=location.pathname.toLowerCase().split('/').filter(Boolean),registry=window.GN24_COUNTRY_REGISTRY||{},cfg=registry[parts[0]];
 var raw=(cfg&&cfg.language)||document.documentElement.lang||'ko';var lang=String(raw).toLowerCase().split('-')[0];
 return navI18n[lang]||navI18n.en;
}
var groups=[
['ASIA',[['🇨🇳','CHINA','china',1],['🇯🇵','JAPAN','japan',1],['🇵🇭','PHILIPPINES','philippines',1],['🇮🇩','INDONESIA','indonesia',1],['🇲🇾','MALAYSIA','malaysia',1],['🇹🇭','THAILAND','thailand',1],['🇻🇳','VIETNAM','vietnam',1],['🇳🇵','NEPAL','nepal',1],['🇮🇳','INDIA','india',1],['🇵🇰','PAKISTAN','pakistan',1],['🇲🇳','MONGOLIA','mongolia',1]]],
['MIDDLE EAST',[['🇮🇷','IRAN','iran',1],['🇦🇪','UAE','uae',1],['🇸🇦','SAUDI ARABIA','saudi-arabia',1],['🇹🇷','TÜRKİYE','turkiye',1]]],
['AFRICA',[['🇲🇦','MOROCCO','morocco',1],['🇪🇬','EGYPT','egypt',1],['🇿🇦','SOUTH AFRICA','south-africa',1],['🇰🇪','KENYA','kenya',1],['🇳🇬','NIGERIA','nigeria',1]]],
['EUROPE',[['🇪🇸','SPAIN','spain',1],['🇬🇧','UNITED KINGDOM','uk',1],['🇫🇷','FRANCE','france',1],['🇩🇪','GERMANY','germany',1],['🇮🇹','ITALY','italy',1],['🇷🇺','RUSSIA','russia',1]]],
['NORTH AMERICA',[['🇨🇦','CANADA','canada',1],['🇺🇸','USA','usa',1],['🇲🇽','MEXICO','mexico',1]]],
['LATIN AMERICA',[['🇵🇦','PANAMA','panama',1]]],
['SOUTH AMERICA',[['🇧🇷','BRAZIL','brazil',1],['🇦🇷','ARGENTINA','argentina',1],['🇨🇴','COLOMBIA','colombia',1]]],
['OCEANIA',[['🇦🇺','AUSTRALIA','australia',1],['🇳🇿','NEW ZEALAND','new-zealand',1]]]
];
var regionNames={
ko:['서울','부산','대구','인천','광주','대전','울산','세종','경기','강원','충북','충남','전북','전남','경북','경남','제주'],
en:['Seoul','Busan','Daegu','Incheon','Gwangju','Daejeon','Ulsan','Sejong','Gyeonggi','Gangwon','Chungbuk','Chungnam','Jeonbuk','Jeonnam','Gyeongbuk','Gyeongnam','Jeju'],
ar:['سول','بوسان','دايغو','إنتشون','غوانغجو','دايجون','أولسان','سيجونغ','غيونغي','غانغوون','تشونغبوك','تشونغنام','جيونبوك','جيوننام','غيونغبوك','غيونغنام','جيجو'],
fr:['Séoul','Busan','Daegu','Incheon','Gwangju','Daejeon','Ulsan','Sejong','Gyeonggi','Gangwon','Chungcheong du Nord','Chungcheong du Sud','Jeolla du Nord','Jeolla du Sud','Gyeongsang du Nord','Gyeongsang du Sud','Jeju'],
es:['Seúl','Busan','Daegu','Incheon','Gwangju','Daejeon','Ulsan','Sejong','Gyeonggi','Gangwon','Chungcheong del Norte','Chungcheong del Sur','Jeolla del Norte','Jeolla del Sur','Gyeongsang del Norte','Gyeongsang del Sur','Jeju'],
zh:['首尔','釜山','大邱','仁川','光州','大田','蔚山','世宗','京畿','江原','忠北','忠南','全北','全南','庆北','庆南','济州'],
ja:['ソウル','釜山','大邱','仁川','光州','大田','蔚山','世宗','京畿','江原','忠北','忠南','全北','全南','慶北','慶南','済州'],
ru:['Сеул','Пусан','Тэгу','Инчхон','Кванджу','Тэджон','Ульсан','Седжон','Кёнгидо','Канвондо','Чхунчхон-Пукто','Чхунчхон-Намдо','Чолла-Пукто','Чолла-Намдо','Кёнсан-Пукто','Кёнсан-Намдо','Чеджу']
};
var groupNames={
ar:{ASIA:'آسيا','MIDDLE EAST':'الشرق الأوسط',AFRICA:'أفريقيا',EUROPE:'أوروبا','NORTH AMERICA':'أمريكا الشمالية','SOUTH AMERICA':'أمريكا الجنوبية',OCEANIA:'أوقيانوسيا'},
fr:{ASIA:'ASIE','MIDDLE EAST':'MOYEN-ORIENT',AFRICA:'AFRIQUE',EUROPE:'EUROPE','NORTH AMERICA':'AMÉRIQUE DU NORD','SOUTH AMERICA':'AMÉRIQUE DU SUD',OCEANIA:'OCÉANIE'},
es:{ASIA:'ASIA','MIDDLE EAST':'ORIENTE MEDIO',AFRICA:'ÁFRICA',EUROPE:'EUROPA','NORTH AMERICA':'AMÉRICA DEL NORTE','SOUTH AMERICA':'AMÉRICA DEL SUR',OCEANIA:'OCEANÍA'},
zh:{ASIA:'亚洲','MIDDLE EAST':'中东',AFRICA:'非洲',EUROPE:'欧洲','NORTH AMERICA':'北美洲','SOUTH AMERICA':'南美洲',OCEANIA:'大洋洲'},
ja:{ASIA:'アジア','MIDDLE EAST':'中東',AFRICA:'アフリカ',EUROPE:'ヨーロッパ','NORTH AMERICA':'北米','SOUTH AMERICA':'南米',OCEANIA:'オセアニア'},
ru:{ASIA:'АЗИЯ','MIDDLE EAST':'БЛИЖНИЙ ВОСТОК',AFRICA:'АФРИКА',EUROPE:'ЕВРОПА','NORTH AMERICA':'СЕВЕРНАЯ АМЕРИКА','SOUTH AMERICA':'ЮЖНАЯ АМЕРИКА',OCEANIA:'ОКЕАНИЯ'}
};
var statusNames={ar:{open:'النسخة متاحة'},fr:{open:'ÉDITION'},es:{open:'EDICIÓN'},zh:{open:'国家版'},ja:{open:'国別版'},ru:{open:'ВЕРСИЯ'},ko:{open:'국가판'},en:{open:'EDITION'}};
var countryNames={
ar:{china:'الصين',japan:'اليابان',philippines:'الفلبين',indonesia:'إندونيسيا',malaysia:'ماليزيا',thailand:'تايلاند',vietnam:'فيتنام',nepal:'نيبال',india:'الهند',pakistan:'باكستان',iran:'إيران',uae:'الإمارات العربية المتحدة','saudi-arabia':'المملكة العربية السعودية',turkiye:'تركيا',morocco:'المغرب',egypt:'مصر','south-africa':'جنوب أفريقيا',spain:'إسبانيا',uk:'المملكة المتحدة',france:'فرنسا',germany:'ألمانيا',italy:'إيطاليا',canada:'كندا',usa:'الولايات المتحدة',mexico:'المكسيك',brazil:'البرازيل',argentina:'الأرجنتين',colombia:'كولومبيا',australia:'أستراليا','new-zealand':'نيوزيلندا',mongolia:'منغوليا',russia:'روسيا',kenya:'كينيا',nigeria:'نيجيريا'},
fr:{china:'CHINE',japan:'JAPON',philippines:'PHILIPPINES',indonesia:'INDONÉSIE',malaysia:'MALAISIE',thailand:'THAÏLANDE',vietnam:'VIETNAM',nepal:'NÉPAL',india:'INDE',pakistan:'PAKISTAN',iran:'IRAN',uae:'ÉMIRATS ARABES UNIS','saudi-arabia':'ARABIE SAOUDITE',turkiye:'TURQUIE',morocco:'MAROC',egypt:'ÉGYPTE','south-africa':'AFRIQUE DU SUD',spain:'ESPAGNE',uk:'ROYAUME-UNI',france:'FRANCE',germany:'ALLEMAGNE',italy:'ITALIE',canada:'CANADA',usa:'ÉTATS-UNIS',mexico:'MEXIQUE',brazil:'BRÉSIL',argentina:'ARGENTINE',colombia:'COLOMBIE',australia:'AUSTRALIE','new-zealand':'NOUVELLE-ZÉLANDE',mongolia:'MONGOLIE',russia:'RUSSIE',kenya:'KENYA',nigeria:'NIGERIA'},
es:{china:'CHINA',japan:'JAPÓN',philippines:'FILIPINAS',indonesia:'INDONESIA',malaysia:'MALASIA',thailand:'TAILANDIA',vietnam:'VIETNAM',nepal:'NEPAL',india:'INDIA',pakistan:'PAKISTÁN',iran:'IRÁN',uae:'EMIRATOS ÁRABES UNIDOS','saudi-arabia':'ARABIA SAUDITA',turkiye:'TURQUÍA',morocco:'MARRUECOS',egypt:'EGIPTO','south-africa':'SUDÁFRICA',spain:'ESPAÑA',uk:'REINO UNIDO',france:'FRANCIA',germany:'ALEMANIA',italy:'ITALIA',canada:'CANADÁ',usa:'ESTADOS UNIDOS',mexico:'MÉXICO',brazil:'BRASIL',argentina:'ARGENTINA',colombia:'COLOMBIA',australia:'AUSTRALIA','new-zealand':'NUEVA ZELANDA',mongolia:'MONGOLIA',russia:'RUSIA',kenya:'KENIA',nigeria:'NIGERIA'}
};
function currentLang(){var parts=location.pathname.toLowerCase().split('/').filter(Boolean),registry=window.GN24_COUNTRY_REGISTRY||{},cfg=registry[parts[0]],raw=(cfg&&cfg.language)||document.documentElement.lang||'ko';return String(raw).toLowerCase().split('-')[0]}
function countryMarkup(){var lang=currentLang(),dict=countryNames[lang]||{},gd=groupNames[lang]||{},sd=statusNames[lang]||statusNames.en;return groups.map(function(g){return '<section class="gn24-country-group"><h3>'+(gd[g[0]]||g[0])+'</h3>'+g[1].map(function(x){var name=dict[x[2]]||x[1];return '<a class="gn24-country-link is-open" href="/'+x[2]+'/"><span>'+x[0]+' '+name+'</span><small>'+sd.open+' ↗</small></a>'}).join('')+'</section>'}).join('')}
function regionMarkup(){var lang=currentLang(),names=regionNames[lang]||regionNames.en;return '<div class="gn24-mega-grid">'+regions.map(function(r,i){return '<a href="'+r[1]+'">'+(names[i]||r[0])+'</a>'}).join('')+'</div>'}
function fillHome(){var box=document.getElementById('gn24MegaCountries');if(box)box.innerHTML=countryMarkup()}
function installBar(){
 var t=navLanguage();
 if(document.querySelector('.gn24-universal-bar'))return;
 var isHQ=!!document.getElementById('gn24MegaCountries');
 var header=isHQ?document.getElementById('siteHeader'):document.querySelector('.global-edition-header,.regional-site-header,.site-header');
 if(!header)return;
 if(isHQ)document.body.classList.add('gn24-hq-mega-ready');
 var bar=document.createElement('nav');bar.className='gn24-universal-bar';bar.setAttribute('aria-label','GLOBAL NEWS24 network editions');
 bar.innerHTML='<div class="gn24-universal-kicker">GLOBAL NEWS24 NETWORK</div><div class="gn24-universal-inner"><button class="gn24-universal-btn" data-kind="korea"><img src="https://flagcdn.com/w40/kr.png" alt="" width="18" height="12" style="width:18px;height:12px;object-fit:cover;vertical-align:-2px;margin-right:4px"> '+t.korea+' ▼</button><button class="gn24-universal-btn" data-kind="world">🌐 '+t.world+' ▼</button><a class="gn24-universal-btn" href="/junior/news/">🧒 꿈나무 기자단</a></div><div class="gn24-universal-panel" hidden></div>';
 if(isHQ){var primary=header.querySelector('.primary-nav');if(primary&&primary.parentNode===header)primary.insertAdjacentElement('afterend',bar);else header.appendChild(bar)}else{header.appendChild(bar)}
 var panel=bar.querySelector('.gn24-universal-panel');
 bar.addEventListener('click',function(e){var b=e.target.closest('[data-kind]');if(!b)return;var same=panel.dataset.kind===b.dataset.kind&&!panel.hidden;panel.dataset.kind=b.dataset.kind;panel.innerHTML=b.dataset.kind==='korea'?'<h2>'+t.koreaTitle+'</h2>'+regionMarkup()+'<a class="gn24-mega-all" href="/region/#korea-regions">'+t.regionsAll+'</a>':'<h2>'+t.worldTitle+'</h2><div class="gn24-mega-countries">'+countryMarkup()+'</div><a class="gn24-mega-all" href="/region/#global-editions">'+t.worldAll+'</a>';panel.hidden=same});
 document.addEventListener('click',function(e){if(!bar.contains(e.target))panel.hidden=true});
}
function init(){fillHome();installBar()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
}());