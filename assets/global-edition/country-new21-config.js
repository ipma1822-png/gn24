/* Additional country routes reuse the existing registry profiles and shared live loader. */
(() => {
  const countries = {
  "algeria": [
    "DZ",
    "Algeria"
  ],
  "tunisia": [
    "TN",
    "Tunisia"
  ],
  "ghana": [
    "GH",
    "Ghana"
  ],
  "ethiopia": [
    "ET",
    "Ethiopia"
  ],
  "netherlands": [
    "NL",
    "Netherlands"
  ],
  "portugal": [
    "PT",
    "Portugal"
  ],
  "poland": [
    "PL",
    "Poland"
  ],
  "greece": [
    "GR",
    "Greece"
  ],
  "georgia": [
    "GE",
    "Georgia"
  ],
  "bangladesh": [
    "BD",
    "Bangladesh"
  ],
  "sri-lanka": [
    "LK",
    "Sri Lanka"
  ],
  "singapore": [
    "SG",
    "Singapore"
  ],
  "iraq": [
    "IQ",
    "Iraq"
  ],
  "jordan": [
    "JO",
    "Jordan"
  ],
  "kazakhstan": [
    "KZ",
    "Kazakhstan"
  ],
  "syria": [
    "SY",
    "Syria"
  ],
  "costa-rica": [
    "CR",
    "Costa Rica"
  ],
  "chile": [
    "CL",
    "Chile"
  ],
  "peru": [
    "PE",
    "Peru"
  ],
  "uruguay": [
    "UY",
    "Uruguay"
  ],
  "venezuela": [
    "VE",
    "Venezuela"
  ]
};
  const slug = location.pathname.split('/').filter(Boolean)[0] || '';
  const country = countries[slug];
  const registry = window.GN24_COUNTRY_REGISTRY;
  if (!country || !registry) return;
  const spanish = ['costa-rica','chile','peru','uruguay','venezuela'].includes(slug);
  const base = registry[spanish ? 'cuba' : 'philippines'];
  window.GN24_COUNTRY_CONFIG = Object.freeze({
    ...base,
    countryCode: country[0], slug, countryName: country[1],
    countryLabel: country[1], editionName: country[1].toUpperCase() + ' EDITION',
    language: spanish ? 'es' : 'en', locale: (spanish ? 'es-' : 'en-') + country[0],
    status: 'ACTIVE',
    ui: {...base.ui, intro: '', notice: ''}
  });
})();
