(()=>{
'use strict';
const cfg=window.GN24_SUPABASE||{};
const $=s=>document.querySelector(s);
const status=$('#cmsStatus'), detail=$('#cmsDetail'), loginBtn=$('#cmsLoginBtn'), loadBtn=$('#cmsLoadBtn'), pubBtn=$('#cmsPublishBtn'), migrateBtn=$('#cmsMigrateBtn'), onlineDeleteBtn=$('#cmsDeleteBtn');
const configured=!!(cfg.url&&cfg.anonKey&&window.supabase);
let sb=null, currentSession=null, adminOK=false;

function setStatus(text, mode='off', extra=''){
  if(status){status.textContent=text;status.className=mode==='on'?'cms-online':mode==='busy'?'cms-offline cms-busy':'cms-offline';}
  if(detail && extra) detail.textContent=extra;
}
function buttons(){
  const ready=!!currentSession&&adminOK;
  if(loginBtn) loginBtn.textContent=currentSession?'로그아웃':'관리자 로그인';
  [loadBtn,pubBtn,migrateBtn,onlineDeleteBtn].forEach(b=>{if(b)b.disabled=!ready;});
}
if(!configured){setStatus('Supabase 미연결','off','기존 GitHub/news.json 안전 편집 모드로 작동 중입니다.');buttons();return;}
sb=window.supabase.createClient(cfg.url,cfg.anonKey);

async function isAdmin(){
  if(!currentSession) return false;
  const {data,error}=await sb.rpc('is_gn24_admin');
  if(error){console.error(error);return false;}
  return data===true;
}
async function refreshAuth(){
  const {data}=await sb.auth.getSession(); currentSession=data.session;
  adminOK=await isAdmin();
  if(currentSession&&adminOK) setStatus(`온라인 연결 · 관리자 인증`,'on',currentSession.user.email);
  else if(currentSession) setStatus('로그인됨 · 관리자 권한 없음','off','Supabase gn24_admins 등록을 확인하세요.');
  else setStatus('연결됨 · 로그인 필요','off','관리자 계정으로 로그인하면 온라인 저장 기능이 활성화됩니다.');
  buttons();
}
async function login(){
  if(currentSession){await sb.auth.signOut();return refreshAuth();}
  const email=prompt('Global News24 관리자 이메일');
  if(!email)return;
  setStatus('로그인 링크 발송 중…','busy','이메일을 확인해 주세요.');
  const redirectTo='https://news24.ai.kr/admin-news.html';
  const {error}=await sb.auth.signInWithOtp({
    email:email.trim(),
    options:{emailRedirectTo:redirectTo,shouldCreateUser:false}
  });
  if(error){
    const msg=String(error.message||'');
    const friendly=/rate limit/i.test(msg)?'이메일 발송 제한에 걸렸습니다. 잠시 후 다시 한 번만 시도해 주세요.':msg;
    setStatus('로그인 링크 발송 실패','off',friendly);
    alert('로그인 링크 발송 실패: '+friendly);
    return;
  }
  setStatus('로그인 링크 발송 완료','busy','Gmail에서 방금 받은 로그인 링크를 누르면 이 편집실로 돌아옵니다. 비밀번호는 필요하지 않습니다.');
  alert('관리자 이메일로 로그인 링크를 보냈습니다.\n\nGmail에서 방금 받은 링크를 눌러주세요.\n비밀번호는 필요하지 않습니다.');
}
function formArticle(){
  const value=id=>$(id)?.value??'';
  const tags=value('#fTags').split(',').map(x=>x.trim()).filter(Boolean);
  return {
    id:value('#fId').trim(), date:value('#fDate'), title:value('#fTitle').trim(), subtitle:value('#fSubtitle').trim(),
    category:value('#fCategory'), author:value('#fAuthor').trim()||'Global News24 편집부', summary:value('#fSummary').trim(),
    image:value('#fImage').trim(), image_caption:value('#fImageCaption').trim(), content:value('#fContent'),
    source_name:value('#fSourceName').trim(), source_url:value('#fSourceUrl').trim(), tags,
    featured:!!$('#fFeatured')?.checked, pinned:!!$('#fPinned')?.checked,
    visual_style:value('#fVisualStyle')||'normal', is_published:$('#fPublished')?.checked!==false,
    updated_at:new Date().toISOString()
  };
}
async function requireAdmin(){
  const {data}=await sb.auth.getSession(); currentSession=data.session; adminOK=await isAdmin(); buttons();
  if(!currentSession){alert('관리자 로그인이 필요합니다.');return false;}
  if(!adminOK){alert('이 계정은 Global News24 관리자 목록에 등록되어 있지 않습니다.');return false;}
  return true;
}

async function loadDbArticles(){
  if(!(await requireAdmin()))return;
  if(!window.GN24Admin?.loadDbArticles){
    return alert('관리자 편집 모듈이 아직 준비되지 않았습니다. Ctrl+F5 후 다시 시도해 주세요.');
  }
  if(!confirm('Supabase DB의 현재 기사 목록을 편집실로 불러올까요?\n브라우저에 남아 있던 오래된 임시편집본은 초기화됩니다.'))return;
  setStatus('Supabase 기사 불러오는 중…','busy');
  const {data,error}=await sb.from('gn24_articles').select('*').order('date',{ascending:false}).order('id',{ascending:false});
  if(error){
    setStatus('DB 기사 불러오기 실패','off',error.message);
    return alert('Supabase 기사 불러오기 실패: '+error.message);
  }
  await window.GN24Admin.loadDbArticles(data||[]);
  setStatus('온라인 연결 · 관리자 인증','on',`Supabase 기사 ${(data||[]).length}건 불러옴`);
}

async function uploadSelectedImage(article){
  const input=$('#imageInput');
  let file=input?.files?.[0]||null;
  let pending=null;
  if(!file && window.GN24Admin?.getPendingImage){
    pending=await window.GN24Admin.getPendingImage();
    file=pending?.file||null;
  }
  if(!file)return article;

  const wantedName=($('#imageFilename')?.value||pending?.filename||file.name||'news-image.jpg').trim();
  const raw=wantedName.replace(/[^a-zA-Z0-9._-]+/g,'-')||'news-image.jpg';
  const folder=(article.date||new Date().toISOString().slice(0,10)).replace(/[^0-9-]/g,'');
  const articleFolder=String(article.id||'article').replace(/[^a-zA-Z0-9._-]+/g,'-');
  const path=`${folder}/${articleFolder}/${Date.now()}-${raw}`;

  setStatus('대표이미지 Storage 업로드 중…','busy','Supabase news-images 버킷에 업로드하고 있습니다.');
  const {error}=await sb.storage.from(cfg.bucket||'news-images').upload(path,file,{
    upsert:false,
    contentType:file.type||'image/jpeg',
    cacheControl:'3600'
  });
  if(error) throw new Error('이미지 업로드 실패: '+error.message);

  const {data}=sb.storage.from(cfg.bucket||'news-images').getPublicUrl(path);
  const publicUrl=data?.publicUrl;
  if(!publicUrl)throw new Error('이미지 공개 URL 생성에 실패했습니다.');
  article.image=publicUrl;
  if($('#fImage'))$('#fImage').value=publicUrl;
  if(window.GN24Admin?.markImageUploaded)await window.GN24Admin.markImageUploaded(publicUrl);
  return article;
}
async function publish(){
  if(!(await requireAdmin()))return;
  let a=formArticle(); if(!a.id||!a.title||!a.date)return alert('기사 ID·날짜·제목은 필수입니다.');
  try{a=await uploadSelectedImage(a);}catch(e){setStatus('이미지 업로드 오류','off',e.message);return alert(e.message);}
  setStatus('기사 DB 저장 중…','busy');
  const {data,error}=await sb.from('gn24_articles').upsert(a,{onConflict:'id'}).select('*').single();
  if(error){setStatus('온라인 저장 실패','off',error.message);return alert('온라인 저장 실패: '+error.message);}
  if(window.GN24Admin?.syncSavedArticle) window.GN24Admin.syncSavedArticle(data||a);
  setStatus('온라인 연결 · 관리자 인증','on',`기사·이미지 저장 완료 · 목록 자동갱신 · ${new Date().toLocaleTimeString('ko-KR')}`);
  alert(a.is_published?'온라인 기사 저장·발행 완료':'비공개 기사로 온라인 저장 완료');
}
function normalizeLegacy(x){
  const content=Array.isArray(x.content)?x.content.join('\n\n'):(x.content||'');
  return {id:x.id,date:x.date,title:x.title||'',subtitle:x.subtitle||'',category:x.category||'국내소식',author:x.author||'Global News24 편집부',summary:x.summary||'',image:x.image||'',image_caption:x.imageCaption||x.image_caption||'',content,source_name:x.sourceName||x.source_name||'',source_url:x.sourceUrl||x.source_url||'',tags:Array.isArray(x.tags)?x.tags:[],featured:!!x.featured,pinned:!!x.pinned,visual_style:x.visualStyle||x.visual_style||'normal',is_published:x.isPublished!==false&&x.is_published!==false,updated_at:new Date().toISOString()};
}
async function migrate(){
  if(!(await requireAdmin()))return;
  if(!confirm('현재 data/news.json의 기사를 Supabase DB로 이관할까요? 같은 ID는 최신 내용으로 갱신됩니다.'))return;
  setStatus('기존 기사 읽는 중…','busy');
  let res; try{res=await fetch('/data/news.json?v='+Date.now(),{cache:'no-store'});}catch(e){return alert('news.json 읽기 실패');}
  if(!res.ok)return alert('news.json 읽기 실패: '+res.status);
  const raw=await res.json(); const rows=(Array.isArray(raw)?raw:(raw.articles||raw.items||[])).map(normalizeLegacy);
  if(!rows.length)return alert('이관할 기사가 없습니다.');
  setStatus(`${rows.length}건 DB 이관 중…`,'busy');
  const {error}=await sb.from('gn24_articles').upsert(rows,{onConflict:'id'});
  if(error){setStatus('기사 이관 실패','off',error.message);return alert('기사 이관 실패: '+error.message);}
  setStatus('온라인 연결 · 관리자 인증','on',`기존 기사 ${rows.length}건 DB 이관 완료`);alert(`기존 기사 ${rows.length}건을 Supabase로 이관했습니다.`);
}
async function deleteOnline(){
  if(!(await requireAdmin()))return; const id=$('#fId')?.value.trim(); if(!id)return alert('삭제할 기사 ID가 없습니다.');
  if(!confirm(`온라인 DB에서 이 기사를 삭제할까요?\n${id}\n\nGitHub news.json 원본은 삭제되지 않습니다.`))return;
  setStatus('온라인 기사 삭제 중…','busy'); const {error}=await sb.from('gn24_articles').delete().eq('id',id);
  if(error){setStatus('온라인 삭제 실패','off',error.message);return alert('온라인 삭제 실패: '+error.message);}
  setStatus('온라인 연결 · 관리자 인증','on','온라인 DB 기사 삭제 완료');alert('Supabase DB에서 삭제했습니다.');
}
loginBtn?.addEventListener('click',login);loadBtn?.addEventListener('click',loadDbArticles);pubBtn?.addEventListener('click',publish);migrateBtn?.addEventListener('click',migrate);onlineDeleteBtn?.addEventListener('click',deleteOnline);
sb.auth.onAuthStateChange(()=>setTimeout(refreshAuth,0));refreshAuth();
})();
