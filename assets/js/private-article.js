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
    if(!session)return state('관계자 전용 기사입니다','기자센터 또는 관리자 편집실에서 로그인 후 다시 열어주세요.',true);
    const {data,error}=await sb.from('gn24_articles').select('*').eq('id',id).eq('is_published',false).maybeSingle();
    if(error)return state('기사를 불러오지 못했습니다',error.message||'데이터베이스 보안정책을 확인해 주세요.');
    if(!data)return state('관리자 전용 기사가 없습니다','기사가 공개로 전환되었거나 삭제되었을 수 있습니다.');
    const labels={staff:'관계자 공개 · 기자/지사장',branch_head:'지사장 공개 · 지사장/본사 관리자',admin:'관리자 전용 · 나만 보기'}; const scopeLabel=labels[data.visibility_scope]||'내부 공개';
    document.title=`${data.title} | ${scopeLabel} | Global News24`;
    const body=paragraphs(data.content).map(p=>`<p>${esc(p)}</p>`).join('');
    const tags=(Array.isArray(data.tags)?data.tags:[]).map(t=>`<span>#${esc(t)}</span>`).join('');
    root.innerHTML=`<div class="private-notice">🔒 ${esc(scopeLabel)} 내부자료 · 뉴스 홈·검색·기사목록에 표시되지 않습니다.</div><article><span class="private-badge">${esc(data.category||'내부자료')}</span><h1>${esc(data.title)}</h1><p class="private-sub">${esc(data.subtitle||data.summary||'')}</p><div class="private-meta"><span>${esc(String(data.date||'').replaceAll('-','.'))}</span><span>${esc(data.author||'Global News24 편집부')}</span><span>권한 인증 완료</span></div>${data.image?`<img class="private-hero" src="${esc(data.image)}" alt="${esc(data.title)}">`:''}${data.image_caption?`<p class="private-caption">${esc(data.image_caption)}</p>`:''}<div class="private-body">${body}</div>${tags?`<div class="private-tags">${tags}</div>`:''}</article>`;
  }
  run().catch(error=>state('오류가 발생했습니다',error?.message||String(error)));
})();
