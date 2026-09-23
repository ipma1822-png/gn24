/* Shared GLOBAL NEWS24 quick navigation: included by each edition, never country-specific. */
(function () {
  'use strict';
  if (document.getElementById('gn24QuickMenu')) return;

  var countries = {
    china:'CN', japan:'JP', philippines:'PH', indonesia:'ID', malaysia:'MY',
    thailand:'TH', vietnam:'VN', nepal:'NP', india:'IN', pakistan:'PK',
    iran:'IR', uae:'AE', 'saudi-arabia':'SA', turkiye:'TR', morocco:'MA',
    egypt:'EG', 'south-africa':'ZA', spain:'ES', uk:'GB', france:'FR',
    germany:'DE', italy:'IT', canada:'CA', usa:'US', mexico:'MX',
    brazil:'BR', argentina:'AR', colombia:'CO', australia:'AU', 'new-zealand':'NZ'
  };
  function flag(code) {
    return code.replace(/./g, function (c) { return String.fromCodePoint(127397 + c.charCodeAt(0)); });
  }
  function editionLabel() {
    var parts = location.pathname.toLowerCase().split('/').filter(Boolean);
    if (!parts.length) return 'GLOBAL NEWS24 HQ';
    if (parts[0] === 'region' && parts[1] === 'chungbuk') return '🇰🇷 CHUNGBUK';
    if (parts[0] === 'region') return 'KOREA + WORLD NETWORK';
    if (parts[0] === 'ulsan') return '🇰🇷 ULSAN';
    if (parts[0] === 'chungbuk') return '🇰🇷 CHUNGBUK';
    var slug = parts[0];
    var registry = window.GN24_COUNTRY_REGISTRY || {};
    var config = registry[slug];
    var code = (config && config.countryCode) || countries[slug];
    var name = (config && config.editionName) || slug.replace(/-/g, ' ').toUpperCase();
    return code ? flag(code) + ' ' + name.replace(/\s+EDITION$/i, '') : 'GLOBAL NEWS24';
  }
  function element(tag, className, text) {
    var node = document.createElement(tag);
    node.className = className;
    node.textContent = text;
    return node;
  }
  function init() {
    if (!document.body || document.getElementById('gn24QuickMenu')) return;
    var root = element('nav', 'gn24-quick-menu', '');
    root.id = 'gn24QuickMenu';
    root.setAttribute('aria-label', 'GLOBAL NEWS24 빠른 이동');
    var toggle = element('button', 'gn24-quick-toggle', '🌐');
    toggle.type = 'button';
    toggle.setAttribute('aria-label', 'GLOBAL QUICK MENU 열기');
    toggle.setAttribute('aria-controls', 'gn24QuickPanel');
    toggle.setAttribute('aria-expanded', 'false');
    var label = element('span', 'gn24-quick-toggle-label', 'GLOBAL');
    toggle.appendChild(label);
    var panel = element('div', 'gn24-quick-panel', '');
    panel.id = 'gn24QuickPanel';
    panel.hidden = true;
    panel.appendChild(element('div', 'gn24-quick-heading', '🌐 GLOBAL QUICK MENU'));
    function link(text, href) {
      var item = element('a', 'gn24-quick-link', text);
      item.href = href;
      panel.appendChild(item);
      return item;
    }
    link('🏠 GLOBAL NEWS24 HOME', '/');
    var current = element('div', 'gn24-quick-current', '📍 ' + editionLabel());
    current.setAttribute('aria-label', 'CURRENT EDITION: ' + editionLabel());
    panel.appendChild(current);
    link('🌐 WORLD EDITIONS', '/region/#global-editions');
    link('🔎 SEARCH', '/pages/newsroom/');
    var top = element('button', 'gn24-quick-link', '↑ TOP');
    top.type = 'button';
    panel.appendChild(top);
    root.appendChild(toggle);
    root.appendChild(panel);
    document.body.appendChild(root);
    function close(restoreFocus) {
      panel.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'GLOBAL QUICK MENU 열기');
      if (restoreFocus) toggle.focus();
    }
    toggle.addEventListener('click', function () {
      var opening = panel.hidden;
      panel.hidden = !opening;
      toggle.setAttribute('aria-expanded', String(opening));
      toggle.setAttribute('aria-label', opening ? 'GLOBAL QUICK MENU 닫기' : 'GLOBAL QUICK MENU 열기');
    });
    top.addEventListener('click', function () {
      close(false);
      window.scrollTo({top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
    });
    document.addEventListener('click', function (event) { if (!root.contains(event.target)) close(false); });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && !panel.hidden) close(true); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
}());
