/* GLOBAL NEWS24 shared quick navigation v1.2.0 */
(function () {
  'use strict';
  if (document.getElementById('gn24QuickMenu')) return;
  var countries={china:'CN',japan:'JP',philippines:'PH',indonesia:'ID',malaysia:'MY',thailand:'TH',vietnam:'VN',nepal:'NP',india:'IN',pakistan:'PK',mongolia:'MN',iran:'IR',uae:'AE','saudi-arabia':'SA',turkiye:'TR',morocco:'MA',egypt:'EG','south-africa':'ZA',kenya:'KE',nigeria:'NG',spain:'ES',uk:'GB',france:'FR',germany:'DE',italy:'IT',russia:'RU',canada:'CA',usa:'US',mexico:'MX',brazil:'BR',argentina:'AR',colombia:'CO',panama:'PA',australia:'AU','new-zealand':'NZ'};
  var open=[['china','CN','CHINA'],['japan','JP','JAPAN'],['philippines','PH','PHILIPPINES'],['indonesia','ID','INDONESIA'],['malaysia','MY','MALAYSIA'],['thailand','TH','THAILAND'],['vietnam','VN','VIETNAM'],['nepal','NP','NEPAL'],['india','IN','INDIA'],['pakistan','PK','PAKISTAN'],['mongolia','MN','MONGOLIA'],['iran','IR','IRAN'],['morocco','MA','MOROCCO'],['egypt','EG','EGYPT'],['south-africa','ZA','SOUTH AFRICA'],['kenya','KE','KENYA'],['nigeria','NG','NIGERIA'],['spain','ES','SPAIN'],['uk','GB','UNITED KINGDOM'],['france','FR','FRANCE'],['germany','DE','GERMANY'],['italy','IT','ITALY'],['russia','RU','RUSSIA'],['canada','CA','CANADA'],['usa','US','USA'],['mexico','MX','MEXICO'],['brazil','BR','BRAZIL'],['argentina','AR','ARGENTINA'],['panama','PA','PANAMA'],['australia','AU','AUSTRALIA'],['new-zealand','NZ','NEW ZEALAND']];
  function flag(code){return code.replace(/./g,function(c){return String.fromCodePoint(127397+c.charCodeAt(0))})}
  function editionLabel(){var parts=location.pathname.toLowerCase().split('/').filter(Boolean);if(!parts.length)return'GLOBAL NEWS24 HQ';if(parts[0]==='region')return'KOREA + WORLD NETWORK';if(parts[0]==='ulsan')return'🇰🇷 ULSAN';if(parts[0]==='chungbuk')return'🇰🇷 CHUNGBUK';var slug=parts[0],registry=window.GN24_COUNTRY_REGISTRY||{},config=registry[slug],code=(config&&config.countryCode)||countries[slug],name=(config&&config.editionName)||slug.replace(/-/g,' ').toUpperCase();return code?flag(code)+' '+name.replace(/\s+EDITION$/i,''):'GLOBAL NEWS24'}
  function element(tag,className,value){var n=document.createElement(tag);n.className=className;n.textContent=value;return n}
  var welcome={
    china:'欢迎来到 GLOBAL NEWS24 中国版',japan:'GLOBAL NEWS24 日本版へようこそ',philippines:'Welcome to GLOBAL NEWS24 Philippines Edition',indonesia:'Selamat datang di GLOBAL NEWS24 Edisi Indonesia',malaysia:'Selamat datang ke GLOBAL NEWS24 Edisi Malaysia',thailand:'ยินดีต้อนรับสู่ GLOBAL NEWS24 ฉบับประเทศไทย',vietnam:'Chào mừng đến với GLOBAL NEWS24 phiên bản Việt Nam',nepal:'GLOBAL NEWS24 नेपाल संस्करणमा स्वागत छ',india:'Welcome to GLOBAL NEWS24 India Edition',pakistan:'GLOBAL NEWS24 پاکستان ایڈیشن میں خوش آمدید',mongolia:'GLOBAL NEWS24 Монгол хувилбарт тавтай морилно уу',iran:'به نسخه ایران GLOBAL NEWS24 خوش آمدید',morocco:'مرحبًا بكم في النسخة المغربية من GLOBAL NEWS24',egypt:'مرحبًا بكم في النسخة المصرية من GLOBAL NEWS24','south-africa':'Welcome to GLOBAL NEWS24 South Africa Edition',kenya:'Welcome to GLOBAL NEWS24 Kenya Edition',nigeria:'Welcome to GLOBAL NEWS24 Nigeria Edition',spain:'Bienvenidos a GLOBAL NEWS24 Edición España',uk:'Welcome to GLOBAL NEWS24 United Kingdom Edition',france:'Bienvenue sur GLOBAL NEWS24 Édition France',germany:'Willkommen bei GLOBAL NEWS24 Deutschland',italy:'Benvenuti su GLOBAL NEWS24 Edizione Italia',russia:'Добро пожаловать в GLOBAL NEWS24 Россия',canada:'Welcome to GLOBAL NEWS24 Canada Edition',usa:'Welcome to GLOBAL NEWS24 USA Edition',mexico:'Bienvenidos a GLOBAL NEWS24 Edición México',brazil:'Bem-vindos à GLOBAL NEWS24 Edição Brasil',argentina:'Bienvenidos a GLOBAL NEWS24 Edición Argentina',colombia:'Bienvenidos a GLOBAL NEWS24 Edición Colombia',panama:'Bienvenidos a GLOBAL NEWS24 Edición Panamá',australia:'Welcome to GLOBAL NEWS24 Australia Edition','new-zealand':'Welcome to GLOBAL NEWS24 New Zealand Edition'
  };
  function addEditionTicker(){
    var slug=location.pathname.toLowerCase().split('/').filter(Boolean)[0]||'';
    if(!countries[slug]||document.getElementById('gn24EditionTicker'))return;
    var bar=element('div','gn24-edition-ticker','');bar.id='gn24EditionTicker';bar.setAttribute('role','status');bar.setAttribute('aria-label','Global News24 edition welcome');
    var track=element('div','gn24-edition-ticker-track','');
    var msg=welcome[slug]||('Welcome to GLOBAL NEWS24 '+editionLabel()+' Edition');
    for(var i=0;i<4;i++){var span=element('span','gn24-edition-ticker-item','✦ '+msg+' · GLOBAL NEWS24 · FROM LOCAL TO GLOBAL');track.appendChild(span)}
    bar.appendChild(track);
    /* Force ticker motion inline so edition pages cannot override shared CSS animation. */
    track.style.position='relative';
    track.style.left='100%';
    track.style.animation='none';
    var x=0,last=0;
    function move(ts){
      if(!last)last=ts;
      x+=(ts-last)*0.055;
      last=ts;
      track.style.transform='translate3d('+(-x)+'px,0,0)';
      if(x>track.scrollWidth+bar.clientWidth){x=0;last=ts}
      requestAnimationFrame(move);
    }
    requestAnimationFrame(move);
    var header=document.querySelector('.site-header,header');if(header&&header.parentNode)header.parentNode.insertBefore(bar,header.nextSibling);else document.body.insertBefore(bar,document.body.firstChild);
  }
  function init(){
    if(!document.body||document.getElementById('gn24QuickMenu'))return;
    addEditionTicker();
    var root=element('nav','gn24-quick-menu','');root.id='gn24QuickMenu';root.setAttribute('aria-label','GLOBAL NEWS24 quick navigation');
    var toggle=element('button','gn24-quick-toggle','☰');toggle.type='button';toggle.setAttribute('aria-label','GLOBAL MENU 열기');toggle.setAttribute('aria-controls','gn24QuickPanel');toggle.setAttribute('aria-expanded','false');
    var label=element('span','gn24-quick-toggle-label','GLOBAL');toggle.appendChild(label);
    var panel=element('div','gn24-quick-panel','');panel.id='gn24QuickPanel';panel.hidden=true;panel.appendChild(element('div','gn24-quick-heading','🌐 GLOBAL NEWS24 NETWORK'));
    function add(text,href){var a=element('a','gn24-quick-link',text);a.href=href;panel.appendChild(a);return a}
    add('🏠 GLOBAL NEWS24 HOME','/');
    var current=element('div','gn24-quick-current','📍 '+editionLabel());panel.appendChild(current);
    add('🇰🇷 KOREA · 17 REGIONS','/region/#korea-regions');
    add('🌐 WORLD NETWORK · ALL 35','/region/#global-editions');
    panel.appendChild(element('div','gn24-quick-subheading','OPEN EDITIONS'));
    open.forEach(function(item){add(flag(item[1])+' '+item[2],'/'+item[0]+'/')});
    add('🔎 NEWSROOM / SEARCH','/pages/newsroom/');
    var top=element('button','gn24-quick-link','↑ TOP');top.type='button';panel.appendChild(top);
    root.append(toggle,panel);document.body.appendChild(root);
    function close(focus){panel.hidden=true;toggle.setAttribute('aria-expanded','false');if(focus)toggle.focus()}
    toggle.addEventListener('click',function(){var opening=panel.hidden;panel.hidden=!opening;toggle.setAttribute('aria-expanded',String(opening))});
    top.addEventListener('click',function(){close(false);window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})});
    document.addEventListener('click',function(e){if(!root.contains(e.target))close(false)});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!panel.hidden)close(true)});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
}());