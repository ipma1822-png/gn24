/* GN24 v3.21.0 · 47 EDITION VISUAL GRID SELECTOR
 * UI-only adapter. The existing #fRegionCode SELECT remains the data/form compatibility layer.
 */
(() => {
  if (!/^\/admin-news\.html$/.test(location.pathname)) return;

  const DOMESTIC = new Set(['seoul','busan','daegu','incheon','gwangju','daejeon','ulsan','sejong','gyeonggi','gangwon','chungbuk','chungnam','jeonbuk','jeonnam','gyeongbuk','gyeongnam','jeju']);
  const EXPECTED_DOMESTIC = 17;
  const EXPECTED_GLOBAL = 30;
  let root = null;
  let select = null;
  let lastValue = Symbol('init');

  const cleanLabel = (option) => String(option?.textContent || '')
    .replace(/^🌍\s*GLOBAL\s*·\s*/i, '')
    .replace(/^🌐\s*GLOBAL\s*·\s*/i, '')
    .trim();

  function classifyOptions() {
    const options = [...select.options];
    const national = options.find(o => o.value === '');
    const domestic = options.filter(o => DOMESTIC.has(o.value));
    const global = options.filter(o => o.value && !DOMESTIC.has(o.value));
    return { national, domestic, global };
  }

  function button(option, type) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'gn24-edition-grid-btn';
    b.dataset.value = option.value;
    b.dataset.kind = type;
    b.setAttribute('aria-pressed', 'false');
    b.textContent = type === 'national' ? '🇰🇷 전국 공통 · 지역판 지정 안 함' : cleanLabel(option);
    b.addEventListener('click', () => {
      select.value = option.value;
      select.dispatchEvent(new Event('input', { bubbles: true }));
      select.dispatchEvent(new Event('change', { bubbles: true }));
      sync();
    });
    return b;
  }

  function section(title, options, type) {
    const box = document.createElement('section');
    box.className = 'gn24-edition-grid-section';
    const h = document.createElement('h3');
    h.textContent = title;
    const grid = document.createElement('div');
    grid.className = 'gn24-edition-grid-buttons';
    grid.setAttribute('role', 'group');
    grid.setAttribute('aria-label', title);
    options.forEach(o => grid.appendChild(button(o, type)));
    box.append(h, grid);
    return box;
  }

  function currentText(value) {
    if (!value) return '🇰🇷 전국 공통';
    const option = [...select.options].find(o => o.value === value);
    const label = cleanLabel(option);
    return DOMESTIC.has(value) ? `🇰🇷 ${label} 지역판` : `🌐 ${label} · GLOBAL EDITION`;
  }

  function sync() {
    if (!root || !select) return;
    const value = select.value || '';
    root.querySelectorAll('.gn24-edition-grid-btn').forEach(b => {
      const active = b.dataset.value === value;
      b.classList.toggle('active', active);
      b.setAttribute('aria-pressed', active ? 'true' : 'false');
      const base = b.dataset.kind === 'national' ? '🇰🇷 전국 공통 · 지역판 지정 안 함' : cleanLabel([...select.options].find(o => o.value === b.dataset.value));
      b.textContent = active ? '✓ ' + base : base;
    });
    const current = root.querySelector('[data-gn24-current-edition]');
    if (current) current.textContent = currentText(value);
    lastValue = value;
  }

  function fail(message) {
    console.warn('GN24 visual edition grid:', message);
    if (root) root.remove();
    root = null;
    if (select) {
      select.classList.remove('gn24-select-compat-hidden');
      select.removeAttribute('aria-hidden');
      select.closest('.gn24-region-select-row')?.classList.remove('gn24-region-legacy-hidden');
    }
  }

  function build() {
    select = document.querySelector('#fRegionCode');
    if (!select || root) return false;

    const { national, domestic, global } = classifyOptions();
    if (!national || domestic.length !== EXPECTED_DOMESTIC || global.length !== EXPECTED_GLOBAL) return false;
    const allValues = [...domestic, ...global].map(o => o.value);
    if (new Set(allValues).size !== EXPECTED_DOMESTIC + EXPECTED_GLOBAL) {
      fail('duplicate or missing edition values');
      return false;
    }

    const row = select.closest('.gn24-region-select-row');
    const label = select.closest('label');
    if (!row || !label) {
      fail('existing SELECT container not found');
      return false;
    }

    root = document.createElement('div');
    root.className = 'gn24-edition-grid-selector';
    root.innerHTML = `
      <div class="gn24-edition-grid-head">
        <div><b>배포판 선택</b><small>전국 공통 + 대한민국 지역판 17 + GLOBAL EDITION 30</small></div>
        <div class="gn24-edition-current"><span>현재 배포판</span><strong data-gn24-current-edition></strong></div>
      </div>
    `;
    const nationalWrap = document.createElement('div');
    nationalWrap.className = 'gn24-edition-national';
    nationalWrap.appendChild(button(national, 'national'));
    root.appendChild(nationalWrap);
    root.appendChild(section('🇰🇷 대한민국 지역판 · 17', domestic, 'domestic'));
    root.appendChild(section('🌐 GLOBAL EDITION · 30', global, 'global'));

    row.insertAdjacentElement('beforebegin', root);
    select.classList.add('gn24-select-compat-hidden');
    select.setAttribute('aria-hidden', 'true');
    row.classList.add('gn24-region-legacy-hidden');
    sync();
    return true;
  }

  function boot() {
    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      const s = document.querySelector('#fRegionCode');
      if (s) {
        select = s;
        const counts = classifyOptions();
        if (counts.domestic.length === EXPECTED_DOMESTIC && counts.global.length === EXPECTED_GLOBAL) {
          clearInterval(timer);
          try {
            if (!build()) fail('initialization did not complete');
          } catch (e) {
            fail(e?.message || e);
          }
          return;
        }
      }
      if (tries >= 80) {
        clearInterval(timer);
        fail('30-country SELECT was not ready; fallback SELECT remains visible');
      }
    }, 100);
  }

  document.addEventListener('change', e => {
    if (e.target?.id === 'fRegionCode') sync();
  });
  document.addEventListener('input', e => {
    if (e.target?.id === 'fRegionCode') sync();
  });

  const observer = new MutationObserver(() => {
    if (!root || !select) return;
    if ((select.value || '') !== lastValue) sync();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });

  setInterval(() => {
    if (root && select && (select.value || '') !== lastValue) sync();
  }, 200);

  boot();
})();
