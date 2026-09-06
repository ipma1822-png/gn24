// Global News24 v3.2.0 Supabase configuration
// GLOBAL-NEWS24 전용 Supabase 프로젝트 연결
// 브라우저에는 Publishable Key만 사용합니다.
// Secret Key / service_role Key / Database Password는 절대 넣지 않습니다.

window.GN24_SUPABASE = {
  url: "https://plqqowwdbgixtczzyanr.supabase.co",
  anonKey: "sb_publishable_EnPEZ3d5-hXuJdb8Qrve3A_WB9gLcQy",
  bucket: "news-images"
};

// NEWSNA v1.9 — Hand Wizard personal-link bridge.
// 일반 방문에는 아무 변화가 없고, 기자안내센터의 유효한 ?m= 개인 링크에서만 로드합니다.
(() => {
  if (!/^\/pages\/reporter-guide\/?$/.test(location.pathname)) return;
  const id = new URLSearchParams(location.search).get('m');
  if (!id || !/^[A-Za-z0-9]{8,24}$/.test(id)) return;
  if (document.querySelector('script[data-newsna-personalization]')) return;
  const script = document.createElement('script');
  script.src = '/assets/js/newsna-personalization.js?v=1.2';
  script.defer = true;
  script.dataset.newsnaPersonalization = 'v1.2';
  document.head.appendChild(script);
})();
