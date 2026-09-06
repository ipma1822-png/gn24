(() => {
  'use strict';
  const id = new URLSearchParams(location.search).get('m');
  if (!id || !/^[A-Za-z0-9]{8,24}$/.test(id)) return;

  const esc = (v='') => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

  function render(card) {
    if (!card?.name) return;
    const name = String(card.name).trim().slice(0,40);
    const honor = String(card.honor || '님').trim().slice(0,20);
    const message = String(card.message || '').trim().slice(0,500);
    const chat = document.getElementById('chat');
    const ashead = document.querySelector('.ashead');
    const assistant = document.querySelector('.assistant');
    if (!chat || !assistant) return;
    document.title = `${name} ${honor}께 · 뉴스나 | GLOBAL NEWS24`;
    if (ashead) ashead.textContent = `${name} ${honor}, 안녕하세요. GLOBAL NEWS24 기자 안내비서 뉴스나입니다. 😊`;
    const el = document.createElement('section');
    el.className = 'newsna-personal-card';
    el.innerHTML = `<div class="newsna-personal-avatar">N</div><div><small>손안의 마법사 · 개인 초대</small><b>${esc(name)} ${esc(honor)}께</b>${message ? `<p>${esc(message)}</p>` : ''}</div>`;
    assistant.insertBefore(el, chat);
    const first = chat.querySelector('.msg.bot');
    if (first) first.textContent = `${name} ${honor}, 반갑습니다. 궁금하신 내용을 선택해 주세요. 뉴스나가 공식 기준으로 안내해 드리겠습니다.`;
    const style = document.createElement('style');
    style.textContent = `.newsna-personal-card{display:flex;gap:11px;align-items:center;margin:12px 14px 0;padding:12px;border:1px solid #bfe1f7;border-radius:15px;background:linear-gradient(135deg,#eef8ff,#fff)}.newsna-personal-avatar{width:48px;height:48px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#0877d7,#55c9ff);color:#fff;font-weight:1000;flex:0 0 auto}.newsna-personal-card small{display:block;color:#0877d7;font-size:10px;font-weight:900}.newsna-personal-card b{display:block;margin-top:2px;font-size:13px}.newsna-personal-card p{margin:4px 0 0;color:#536979;font-size:11px;line-height:1.45}@media(max-width:600px){.newsna-personal-card{margin:9px 10px 0;padding:10px}.newsna-personal-avatar{width:42px;height:42px}}`;
    document.head.appendChild(style);
  }

  window.NewsnaPersonalization = { id, render };
})();