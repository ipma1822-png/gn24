// Public reader URL follows app.js articleURL; publication is checked anonymously.
(()=>{
'use strict';
const view=document.getElementById('publicArticleView'),copy=document.getElementById('publicArticleCopy'),note=document.getElementById('publicArticleStatus');
if(!view||!copy||!note)return;
let sequence=0,confirmedUrl='';
function disable(message){confirmedUrl='';view.disabled=copy.disabled=true;note.textContent=message;}
async function refresh(){
 const token=++sequence,id=document.getElementById('fId')?.value.trim();
 disable(id?'공개 발행 확인 중…':'기사를 선택하세요.');if(!id)return;
 try{
  const cfg=window.GN24_SUPABASE;
  if(!cfg?.url||!cfg.anonKey)throw Error('공개 연결 설정을 확인할 수 없습니다.');
  const query=new URLSearchParams({select:'id,is_published',id:'eq.'+id,is_published:'eq.true',limit:'1'});
  const res=await fetch(cfg.url.replace(/\/$/,'')+'/rest/v1/gn24_articles?'+query,{cache:'no-store',headers:{apikey:cfg.anonKey}});
  if(!res.ok)throw Error('공개 발행 확인 실패 · 다시 선택해 주세요.');
  const rows=await res.json();if(token!==sequence)return;
  if(!rows.some(a=>a.id===id&&a.is_published===true)){disable('미발행 또는 비공개 기사입니다.');return;}
  const url=new URL('/pages/article/?id='+encodeURIComponent(id),location.origin).href;
  const page=await fetch(url,{cache:'no-store',credentials:'omit'});
  if(token!==sequence)return;
  if(!page.ok)throw Error('공개 URL 접속을 확인할 수 없습니다.');
  confirmedUrl=url;view.disabled=copy.disabled=false;note.textContent='공개 기사 확인됨';
 }catch(e){if(token===sequence)disable(e.message);}
}
view.addEventListener('click',()=>{if(confirmedUrl)window.open(confirmedUrl,'_blank','noopener,noreferrer');});
copy.addEventListener('click',async()=>{const url=confirmedUrl;if(!url)return;try{await navigator.clipboard.writeText(url);if(url===confirmedUrl)note.textContent='기사 주소 복사 완료';}catch{if(url===confirmedUrl)note.textContent='복사 실패 · 브라우저 클립보드 권한을 확인하세요.';}});
document.addEventListener('gn24:article-form-loaded',refresh);
document.getElementById('fId')?.addEventListener('input',refresh);
refresh();
})();
