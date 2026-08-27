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
  if(currentSession&&adminOK){setTimeout(refreshCommentCounts,0);setTimeout(loadReporters,150);}
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
    category:value('#fCategory'), reporter_id:value('#fReporterId').trim()||null, author:value('#fAuthor').trim()||'Global News24 편집부', summary:value('#fSummary').trim(),
    image:value('#fImage').trim(), image_caption:value('#fImageCaption').trim(), gallery_images:window.GN24GalleryAdmin?.value?.()||[], content:value('#fContent'),
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
  try{
    if(window.GN24GalleryAdmin){
      a.gallery_images=await window.GN24GalleryAdmin.uploadPending(sb,cfg.bucket||'news-images',a,(done,total)=>setStatus(`추가 사진 업로드 중… ${done}/${total}`,'busy','최대 10장의 기사 갤러리를 저장하고 있습니다.'));
    }
  }catch(e){setStatus('추가 사진 업로드 오류','off',e.message);return alert(e.message);}
  setStatus('기사 DB 저장 중…','busy');
  const {data,error}=await sb.from('gn24_articles').upsert(a,{onConflict:'id'}).select('*').single();
  if(error){setStatus('온라인 저장 실패','off',error.message);return alert('온라인 저장 실패: '+error.message);}
  if(window.GN24Admin?.syncSavedArticle) window.GN24Admin.syncSavedArticle(data||a);
  setStatus('온라인 연결 · 관리자 인증','on',`기사·이미지 저장 완료 · 공유 OG는 최대 5분 내 자동생성 · ${new Date().toLocaleTimeString('ko-KR')}`);
  alert(a.is_published?'온라인 기사 저장·발행 완료':'비공개 기사로 온라인 저장 완료');
}
function normalizeLegacy(x){
  const content=Array.isArray(x.content)?x.content.join('\n\n'):(x.content||'');
  return {id:x.id,date:x.date,title:x.title||'',subtitle:x.subtitle||'',category:x.category||'국내소식',reporter_id:x.reporterId||x.reporter_id||null,author:x.author||'Global News24 편집부',summary:x.summary||'',image:x.image||'',image_caption:x.imageCaption||x.image_caption||'',gallery_images:Array.isArray(x.galleryImages)?x.galleryImages:(Array.isArray(x.gallery_images)?x.gallery_images:[]),content,source_name:x.sourceName||x.source_name||'',source_url:x.sourceUrl||x.source_url||'',tags:Array.isArray(x.tags)?x.tags:[],featured:!!x.featured,pinned:!!x.pinned,visual_style:x.visualStyle||x.visual_style||'normal',is_published:x.isPublished!==false&&x.is_published!==false,updated_at:new Date().toISOString()};
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

const commentManageBtn=$('#commentManageBtn'), commentManager=$('#commentManager'),
      commentList=$('#adminCommentList'), commentManagerStatus=$('#commentManagerStatus'),
      pendingBadge=$('#pendingCommentBadge');
let commentFilter='pending';

function escComment(v){
  return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}
function commentDate(v){
  if(!v)return '';
  try{return new Date(v).toLocaleString('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'});}
  catch(e){return String(v);}
}
async function refreshCommentCounts(){
  if(!(currentSession&&adminOK))return;
  const states=['pending','approved','hidden'];
  const counts={};
  for(const st of states){
    const {count,error}=await sb.from('gn24_article_comments').select('id',{count:'exact',head:true}).eq('status',st);
    counts[st]=error?0:(count||0);
  }
  $('#pendingCount').textContent=counts.pending;
  $('#approvedCount').textContent=counts.approved;
  $('#hiddenCount').textContent=counts.hidden;
  if(pendingBadge){
    pendingBadge.textContent=counts.pending;
    pendingBadge.classList.toggle('has-pending',counts.pending>0);
  }
}
async function loadAdminComments(filter=commentFilter){
  if(!(await requireAdmin()))return;
  commentFilter=filter;
  document.querySelectorAll('[data-comment-filter]').forEach(b=>b.classList.toggle('active',b.dataset.commentFilter===filter));
  if(commentManagerStatus)commentManagerStatus.textContent='댓글을 불러오는 중…';
  const {data,error}=await sb.from('gn24_article_comments')
    .select('id,article_id,nickname,content,status,created_at,updated_at')
    .eq('status',filter).order('created_at',{ascending:false}).limit(200);
  if(error){
    if(commentManagerStatus)commentManagerStatus.textContent='댓글 불러오기 실패: '+error.message;
    return;
  }
  const rows=data||[];
  if(commentManagerStatus)commentManagerStatus.textContent=`${filter==='pending'?'승인대기':filter==='approved'?'공개':'숨김'} 댓글 ${rows.length}건`;
  if(!rows.length){
    commentList.innerHTML='<div class="admin-comment-empty">해당 댓글이 없습니다.</div>';
    await refreshCommentCounts(); return;
  }
  const articleIds=[...new Set(rows.map(x=>x.article_id).filter(Boolean))];
  let titles={};
  if(articleIds.length){
    const {data:arts}=await sb.from('gn24_articles').select('id,title').in('id',articleIds);
    (arts||[]).forEach(a=>titles[a.id]=a.title);
  }
  commentList.innerHTML=rows.map(c=>`
    <article class="admin-comment-card" data-comment-id="${c.id}">
      <div class="admin-comment-top">
        <div><span class="comment-state ${escComment(c.status)}">${c.status==='pending'?'승인대기':c.status==='approved'?'공개':'숨김'}</span>
        <b>${escComment(c.nickname||'독자')}</b><time>${escComment(commentDate(c.created_at))}</time></div>
        <small>${escComment(c.article_id||'')}</small>
      </div>
      <a class="admin-comment-article" href="/pages/article/?id=${encodeURIComponent(c.article_id||'')}" target="_blank" rel="noopener">${escComment(titles[c.article_id]||'기사 확인')}</a>
      <p>${escComment(c.content||'').replace(/\n/g,'<br>')}</p>
      <div class="admin-comment-actions">
        ${c.status!=='approved'?`<button class="btn small approve-comment" type="button">✓ 승인·공개</button>`:''}
        ${c.status!=='hidden'?`<button class="btn small hide-comment" type="button">숨김</button>`:''}
        <button class="btn danger small delete-comment" type="button">삭제</button>
      </div>
    </article>`).join('');
  await refreshCommentCounts();
}
async function setCommentStatus(id,newStatus){
  if(!(await requireAdmin()))return;
  const label=newStatus==='approved'?'승인·공개':'숨김';
  if(!confirm(`이 댓글을 ${label} 처리할까요?`))return;
  const {error}=await sb.from('gn24_article_comments').update({status:newStatus,updated_at:new Date().toISOString()}).eq('id',id);
  if(error)return alert('댓글 처리 실패: '+error.message);
  await loadAdminComments(commentFilter);
}
async function deleteComment(id){
  if(!(await requireAdmin()))return;
  if(!confirm('이 댓글을 완전히 삭제할까요? 삭제 후 복구할 수 없습니다.'))return;
  const {error}=await sb.from('gn24_article_comments').delete().eq('id',id);
  if(error)return alert('댓글 삭제 실패: '+error.message);
  await loadAdminComments(commentFilter);
}
commentManageBtn?.addEventListener('click',async()=>{
  if(!(await requireAdmin()))return;
  commentManager.hidden=false;
  commentManager.scrollIntoView({behavior:'smooth',block:'start'});
  await loadAdminComments('pending');
});
$('#commentCloseBtn')?.addEventListener('click',()=>{commentManager.hidden=true;});
$('#commentRefreshBtn')?.addEventListener('click',()=>loadAdminComments(commentFilter));
document.querySelectorAll('[data-comment-filter]').forEach(b=>b.addEventListener('click',()=>loadAdminComments(b.dataset.commentFilter)));
commentList?.addEventListener('click',e=>{
  const card=e.target.closest('[data-comment-id]'); if(!card)return;
  const id=card.dataset.commentId;
  if(e.target.closest('.approve-comment'))setCommentStatus(id,'approved');
  else if(e.target.closest('.hide-comment'))setCommentStatus(id,'hidden');
  else if(e.target.closest('.delete-comment'))deleteComment(id);
});




/* ===== GN24 v3.3.1 · 기자 관리자 ===== */
const reporterManageBtn=$('#reporterManageBtn'), reporterManager=$('#reporterManager'),
      reporterList=$('#adminReporterList'), reporterForm=$('#reporterForm');
let reporterRows=[], reporterFilter='active', selectedReporterId='';

function reporterEsc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function reporterValue(id){return ($(id)?.value||'').trim()}
function reporterBlank(){
  selectedReporterId='';
  $('#rId').value=''; $('#rName').value=''; $('#rRole').value='기자'; $('#rAffiliation').value='Global News24';
  $('#rRegion').value=''; $('#rPhoto').value=''; $('#rSpecialties').value=''; $('#rEmail').value='';
  $('#rBio').value=''; $('#rStatus').value='active'; $('#rAccessLevel').value='reporter'; $('#rLoginEmail').value=''; $('#rOrder').value='100';
  $('#reporterManagerStatus').textContent='새 기자 정보를 입력하세요.';
}
function reporterFill(r){
  if(!r)return reporterBlank();
  selectedReporterId=r.id;
  $('#rId').value=r.id||''; $('#rName').value=r.name||''; $('#rRole').value=r.role||'기자';
  $('#rAffiliation').value=r.affiliation||'Global News24'; $('#rRegion').value=r.region||'';
  $('#rPhoto').value=r.photo_url||''; $('#rSpecialties').value=(r.specialties||[]).join(', ');
  $('#rEmail').value=r.public_email||''; $('#rBio').value=r.bio||''; $('#rStatus').value=r.status||'active'; $('#rAccessLevel').value=r.access_level||'reporter'; $('#rLoginEmail').value=r.login_email||'';
  $('#rOrder').value=String(r.display_order??100);
  $('#reporterManagerStatus').textContent=`${r.name} 기자 정보를 편집 중입니다.`;
}
function reporterRender(){
  document.querySelectorAll('[data-reporter-filter]').forEach(b=>b.classList.toggle('active',b.dataset.reporterFilter===reporterFilter));
  $('#reporterActiveCount').textContent=reporterRows.filter(r=>r.status==='active').length;
  $('#reporterPendingCount').textContent=reporterRows.filter(r=>r.status==='pending').length;
  $('#reporterSuspendedCount').textContent=reporterRows.filter(r=>r.status==='suspended').length;
  const rows=reporterRows.filter(r=>r.status===reporterFilter);
  reporterList.innerHTML=rows.length?rows.map(r=>`
    <button type="button" class="admin-reporter-item ${r.id===selectedReporterId?'active':''}" data-reporter-id="${reporterEsc(r.id)}">
      <span class="admin-reporter-avatar" ${r.photo_url?`style="background-image:url('${reporterEsc(r.photo_url)}')"`:''}>${r.photo_url?'':reporterEsc((r.name||'기').slice(0,1))}</span>
      <span><b>${reporterEsc(r.name)}</b><small>${reporterEsc(r.role||'기자')} · ${reporterEsc(({editor:'편집국',reporter:'정식기자',contributor:'객원기자'})[r.access_level]||'정식기자')} · ${reporterEsc(r.affiliation||'Global News24')}</small></span>
    </button>`).join(''):'<div class="admin-comment-empty">해당 기자가 없습니다.</div>';
}
async function loadReporters(){
  if(!(await requireAdmin()))return;
  const {data,error}=await sb.from('gn24_reporters').select('*').order('display_order',{ascending:true}).order('name',{ascending:true});
  if(error){$('#reporterManagerStatus').textContent='기자 불러오기 실패: '+error.message;return;}
  reporterRows=data||[];
  reporterRender();
  refreshReporterSelect();
}
function refreshReporterSelect(){
  const sel=$('#fReporterId'); if(!sel)return;
  const old=sel.value;
  sel.innerHTML='<option value="">직접 입력 / 편집부</option>'+reporterRows.filter(r=>r.status==='active').map(r=>`<option value="${reporterEsc(r.id)}">${reporterEsc(r.name)} · ${reporterEsc(r.role||'기자')}</option>`).join('');
  if([...sel.options].some(o=>o.value===old))sel.value=old;
}
async function saveReporter(e){
  e.preventDefault();
  if(!(await requireAdmin()))return;
  const id=reporterValue('#rId').replace(/[^A-Za-z0-9._-]+/g,'-');
  const name=reporterValue('#rName');
  if(!id||!name)return alert('기자 ID와 이름은 필수입니다.');
  const row={
    id,name,role:reporterValue('#rRole')||'기자',affiliation:reporterValue('#rAffiliation')||'Global News24',
    photo_url:reporterValue('#rPhoto'),bio:reporterValue('#rBio'),
    specialties:reporterValue('#rSpecialties').split(',').map(x=>x.trim()).filter(Boolean),
    region:reporterValue('#rRegion'),public_email:reporterValue('#rEmail'),
    status:$('#rStatus').value||'active',access_level:$('#rAccessLevel').value||'reporter',login_email:reporterValue('#rLoginEmail')||null,display_order:Number($('#rOrder').value||100),
    updated_at:new Date().toISOString()
  };
  const {error}=await sb.from('gn24_reporters').upsert(row,{onConflict:'id'});
  if(error)return alert('기자 저장 실패: '+error.message);
  selectedReporterId=id;
  $('#reporterManagerStatus').textContent='기자 정보가 저장되었습니다.';
  await loadReporters();
}
async function deleteReporter(){
  if(!(await requireAdmin()))return;
  const id=selectedReporterId||reporterValue('#rId'); if(!id)return alert('삭제할 기자를 선택하세요.');
  const r=reporterRows.find(x=>x.id===id);
  if(!confirm(`${r?.name||id} 기자 정보를 삭제할까요?\n\n연결된 기존 기사의 작성자명은 유지됩니다.`))return;
  const {error}=await sb.from('gn24_reporters').delete().eq('id',id);
  if(error)return alert('기자 삭제 실패: '+error.message);
  reporterBlank(); await loadReporters();
}

reporterManageBtn?.addEventListener('click',async()=>{
  if(!(await requireAdmin()))return;
  reporterManager.hidden=false;
  reporterManager.scrollIntoView({behavior:'smooth',block:'start'});
  await loadReporters();
});
$('#reporterCloseBtn')?.addEventListener('click',()=>reporterManager.hidden=true);
$('#reporterRefreshBtn')?.addEventListener('click',loadReporters);
$('#reporterNewBtn')?.addEventListener('click',reporterBlank);
reporterForm?.addEventListener('submit',saveReporter);
$('#reporterDeleteBtn')?.addEventListener('click',deleteReporter);
document.querySelectorAll('[data-reporter-filter]').forEach(b=>b.addEventListener('click',()=>{reporterFilter=b.dataset.reporterFilter;reporterRender()}));
reporterList?.addEventListener('click',e=>{const b=e.target.closest('[data-reporter-id]');if(!b)return;reporterFill(reporterRows.find(r=>r.id===b.dataset.reporterId));reporterRender()});
$('#fReporterId')?.addEventListener('change',e=>{
  const r=reporterRows.find(x=>x.id===e.target.value);
  if(r&&$('#fAuthor'))$('#fAuthor').value=r.name;
});

loginBtn?.addEventListener('click',login);loadBtn?.addEventListener('click',loadDbArticles);pubBtn?.addEventListener('click',publish);migrateBtn?.addEventListener('click',migrate);onlineDeleteBtn?.addEventListener('click',deleteOnline);
sb.auth.onAuthStateChange(()=>setTimeout(refreshAuth,0));refreshAuth();
})();
