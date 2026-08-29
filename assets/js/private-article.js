(()=>{
  'use strict';
  const root=document.getElementById('privateArticle');
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const state=(title,message,login=false)=>{root.innerHTML=`<section class="private-state"><div class="lock">🔒</div><h1>${esc(title)}</h1><p>${esc(message)}</p>${login?'<a href="/admin-news.html">관리자 로그인</a>':''}</section>`};
  const paragraphs=value=>{
    const rows=Array.isArray(value)?value:String(value||'').split(/\n\s*\n/);
    return rows.map(x=>String(x).trim()).filter(Boolean);
  };
  async function run(){
    const id=new URLSearchParams(location.search).get('id');
    if(!id)return state('기사 주소가 올바르지 않습니다','기사 ID가 없습니다.');
    const cfg=window.GN24_SUPABASE||{};
    if(!(cfg.url&&cfg.anonKey&&window.supabase))return state('연결 설정을 확인해 주세요','기사 데이터베이스에 연결할 수 없습니다.');
    const sb=window.supabase.createClient(cfg.url,cfg.anonKey);
    const {data:{session}}=await sb.auth.getSession();
    if(!session)return state('관리자 전용 기사입니다','기사 편집실에서 관리자 로그인 후 다시 이 주소를 열어주세요.',true);
    const {data:isAdmin,error:adminError}=await sb.rpc('is_gn24_admin');
    if(adminError||isAdmin!==true)return state('접근 권한이 없습니다','Global News24 관리자 계정만 열람할 수 있습니다.');
    const {data,error}=await sb.from('gn24_articles').select('*').eq('id',id).eq('is_published',false).maybeSingle();
    if(error)return state('기사를 불러오지 못했습니다',error.message||'데이터베이스 보안정책을 확인해 주세요.');
    if(!data)return state('관리자 전용 기사가 없습니다','기사가 공개로 전환되었거나 삭제되었을 수 있습니다.');
    document.title=`${data.title} | 관리자 전용 | Global News24`;
    const body=paragraphs(data.content).map(p=>`<p>${esc(p)}</p>`).join('');
    const tags=(Array.isArray(data.tags)?data.tags:[]).map(t=>`<span>#${esc(t)}</span>`).join('');
    root.innerHTML=`<div class="private-notice">🔒 관리자 전용 내부자료 · 뉴스 홈·검색·기사목록에 표시되지 않습니다.</div><article><span class="private-badge">${esc(data.category||'내부자료')}</span><h1>${esc(data.title)}</h1><p class="private-sub">${esc(data.subtitle||data.summary||'')}</p><div class="private-meta"><span>${esc(String(data.date||'').replaceAll('-','.'))}</span><span>${esc(data.author||'Global News24 편집부')}</span><span>열람자 · ${esc(session.user.email||'관리자')}</span></div>${data.image?`<img class="private-hero" src="${esc(data.image)}" alt="${esc(data.title)}">`:''}${data.image_caption?`<p class="private-caption">${esc(data.image_caption)}</p>`:''}<div class="private-body">${body}</div>${tags?`<div class="private-tags">${tags}</div>`:''}</article>`;
  }
  run().catch(error=>state('오류가 발생했습니다',error?.message||String(error)));
})();
