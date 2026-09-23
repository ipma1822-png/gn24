/* GLOBAL NEWS24 · Country Live Feed v0.1.0
   Pilot: Morocco. Reads only public articles assigned to the current country slug.
   No schema changes; domestic renderers are not touched. */
(() => {
  'use strict';

  const loadRenderer = () => {
    if (document.querySelector('script[data-gn24-country-renderer]')) return;
    const script = document.createElement('script');
    script.src = '/assets/global-edition/country-edition.js?v=0.2.0';
    script.defer = true;
    script.dataset.gn24CountryRenderer = 'live-feed';
    document.head.appendChild(script);
  };

  const config = window.GN24_COUNTRY_CONFIG;
  const cfg = window.GN24_SUPABASE || {};
  if (!config || !cfg.url || !cfg.anonKey) {
    loadRenderer();
    return;
  }

  const categoryMap = Object.freeze({
    '속보':'global',
    '공지':'local',
    '국내소식':'local',
    '국제뉴스':'global',
    '경제':'local',
    '사회':'local',
    '청소년·문화':'local',
    '무도·스포츠':'martial',
    '안전·드론':'safety',
    '안전·구조':'safety',
    '공익':'local',
    'AI·혁신기술':'technology',
    '오피니언':'local',
    '보도자료':'local'
  });

  const body = value => {
    if (Array.isArray(value)) return value.map(String).filter(Boolean);
    return String(value || '').split(/\n\s*\n/).map(x => x.trim()).filter(Boolean);
  };

  const mapArticle = row => ({
    id: String(row.id || ''),
    scope: 'country-local',
    category: categoryMap[row.category] || 'local',
    date: String(row.date || ''),
    image: row.image || null,
    title: String(row.title || ''),
    summary: String(row.summary || row.subtitle || ''),
    body: body(row.content),
    sourceName: String(row.source_name || 'GLOBAL NEWS24'),
    featured: !!(row.pinned || row.featured)
  });

  const slug = String(config.slug || '').trim();
  const base = cfg.url.replace(/\/$/, '');
  const fields = 'id,date,title,subtitle,category,summary,image,content,source_name,featured,pinned';
  const query = new URLSearchParams({
    select: fields,
    region_code: 'eq.' + slug,
    is_published: 'eq.true',
    visibility_scope: 'eq.public',
    order: 'date.desc,id.desc'
  });

  fetch(base + '/rest/v1/gn24_articles?' + query.toString(), {
    cache: 'no-store',
    headers: { apikey: cfg.anonKey, Authorization: 'Bearer ' + cfg.anonKey }
  })
    .then(response => {
      if (!response.ok) throw new Error('Country feed HTTP ' + response.status);
      return response.json();
    })
    .then(rows => {
      if (Array.isArray(rows)) {
        window.GN24_COUNTRY_CONTENT = Object.freeze(rows.map(mapArticle).filter(a => a.id && a.title));
      }
    })
    .catch(error => console.warn('GN24 country live feed fallback', error))
    .finally(loadRenderer);
})();
