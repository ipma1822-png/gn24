/* GLOBAL NEWS24 shared quick navigation v1.1.0 */
(function () {
  'use strict';
  if (document.getElementById('gn24QuickMenu')) return;
  var countries={china:'CN',japan:'JP',philippines:'PH',indonesia:'ID',malaysia:'MY',thailand:'TH',vietnam:'VN',nepal:'NP',india:'IN',pakistan:'PK',iran:'IR',uae:'AE','saudi-arabia':'SA',turkiye:'TR',morocco:'MA',egypt:'EG','south-africa':'ZA',spain:'ES',uk:'GB',france:'FR',germany:'DE',italy:'IT',canada:'CA',usa:'US',mexico:'MX',brazil:'BR',argentina:'AR',colombia:'CO',australia:'AU','new-zealand':'NZ'};
  var open=[['china','CN','CHINA'],['japan','JP','JAPAN'],['philippines','PH','PHILIPPINES'],['indonesia','ID','INDONESIA'],['malaysia','MY','MALAYSIA'],['thailand','TH','THAILAND'],['vietnam','VN','VIETNAM'],['nepal','NP','NEPAL'],['india','IN','INDIA'],['pakistan','PK','PAKISTAN'],['iran','IR','IRAN'],['morocco','MA','MOROCCO'],['spain','ES','SPAIN'],['canada','CA','CANADA']];
  function flag(code){return code.replace(/./g,function(c){return String.fromCodePoint(127397+c.charCodeAt(0))})}
  function editionLabel(){var parts=location.pathname.toLowerCase().split('/').filter(Boolean);if(!parts.length)return'GLOBAL NEWS24 HQ';if(parts[0]==='region')return'KOREA + WORLD NETWORK';if(parts[0]==='ulsan')return'🇰🇷 ULSAN';if(parts[0]==='chungbuk')return'🇰🇷 CHUNGBUK';var slug=parts[0],registry=window.GN24_COUNTRY_REGISTRY||{},config=registry[slug],code=(config&&config.countryCode)||countries[slug],name=(config&&config.editionName)||slug.replace(/-/g,' ').toUpperCase();return code?flag(code)+' '+name.replace(/\s+EDITION$/i,''):'GLOBAL NEWS24'}
  function element(tag,className,value){var n=document.createElement(tag);n.className=className;n.textContent=value;return n}
  function init(){
    if(!document.body||document.getElementById('gn24QuickMenu'))return;
    var root=element('nav','gn24-quick-menu','');root.id='gn24QuickMenu';root.setAttribute('aria-label','GLOBAL NEWS24 quick navigation');
    var toggle=element('button','gn24-quick-toggle','☰');toggle.type='button';toggle.setAttribute('aria-label','GLOBAL MENU 열기');toggle.setAttribute('aria-controls','gn24QuickPanel');toggle.setAttribute('aria-expanded','false');
    var label=element('span','gn24-quick-toggle-label','GLOBAL');toggle.appendChild(label);
    var panel=element('div','gn24-quick-panel','');panel.id='gn24QuickPanel';panel.hidden=true;panel.appendChild(element('div','gn24-quick-heading','🌐 GLOBAL NEWS24 NETWORK'));
    function add(text,href){var a=element('a','gn24-quick-link',text);a.href=href;panel.appendChild(a);return a}
    add('🏠 GLOBAL NEWS24 HOME','/');
    var current=element('div','gn24-quick-current','📍 '+editionLabel());panel.appendChild(current);
    add('🇰🇷 KOREA · 17 REGIONS','/region/#korea-regions');
    add('🌐 WORLD NETWORK · ALL 30','/region/#global-editions');
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