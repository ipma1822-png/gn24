(()=>{
'use strict';
const cfg=window.GN24_SUPABASE||{};
const status=document.querySelector('#cmsStatus'), loginBtn=document.querySelector('#cmsLoginBtn'), pubBtn=document.querySelector('#cmsPublishBtn');
const configured=!!(cfg.url&&cfg.anonKey&&window.supabase);
let sb=null;
function setStatus(t,on=false){if(!status)return;status.textContent=t;status.className=on?'cms-online':'cms-offline'}
if(!configured){setStatus('Supabase 미연결 · GitHub 안전 편집 모드'); if(pubBtn)pubBtn.disabled=true; return;}
sb=window.supabase.createClient(cfg.url,cfg.anonKey);
async function session(){return (await sb.auth.getSession()).data.session}
async function refresh(){
 const s=await session();
 setStatus(s?`온라인 연결 · ${s.user.email}`:'연결됨 · 로그인 필요',!!s);
 if(loginBtn)loginBtn.textContent=s?'로그아웃':'관리자 로그인';
 if(pubBtn)pubBtn.disabled=!s;
}
async function login(){
 const s=await session();
 if(s){await sb.auth.signOut();return refresh();}
 const email=prompt('Global News24 관리자 이메일을 입력하세요.');
 if(!email)return;
 const {error}=await sb.auth.signInWithOtp({email,options:{emailRedirectTo:location.href.split('?')[0]}});
 if(error)return alert('로그인 요청 실패: '+error.message);
 alert('이메일로 로그인 링크를 보냈습니다. 링크를 눌러 다시 접속하세요.');
}
function formArticle(){
 const v=id=>document.querySelector(id);
 return {
  id:v('#fId').value.trim(), date:v('#fDate').value, title:v('#fTitle').value.trim(),
  subtitle:v('#fSubtitle').value.trim(), category:v('#fCategory').value, author:v('#fAuthor').value.trim(),
  summary:v('#fSummary').value.trim(), image:v('#fImage').value.trim(), image_caption:v('#fImageCaption').value.trim(),
  content:v('#fContent').value, source_name:v('#fSourceName').value.trim(), source_url:v('#fSourceUrl').value.trim(),
  tags:v('#fTags').value.split(',').map(x=>x.trim()).filter(Boolean), featured:v('#fFeatured').checked,
  pinned:v('#fPinned').checked, visual_style:v('#fVisualStyle').value, is_published:v('#fPublished')?.checked!==false,
  updated_at:new Date().toISOString()
 };
}
async function publish(){
 const s=await session(); if(!s)return alert('관리자 로그인이 필요합니다.');
 const a=formArticle(); if(!a.title)return alert('기사 제목을 입력해 주세요.');
 const file=document.querySelector('#imageInput')?.files?.[0];
 if(file){
   const name=document.querySelector('#imageFilename').value.trim()||file.name;
   const path=`${a.date||'undated'}/${name}`;
   const up=await sb.storage.from(cfg.bucket||'news-images').upload(path,file,{upsert:true,contentType:file.type});
   if(up.error)return alert('이미지 업로드 실패: '+up.error.message);
   a.image=sb.storage.from(cfg.bucket||'news-images').getPublicUrl(path).data.publicUrl;
   document.querySelector('#fImage').value=a.image;
 }
 const {error}=await sb.from('gn24_articles').upsert(a,{onConflict:'id'});
 if(error)return alert('온라인 발행 실패: '+error.message);
 alert(a.is_published?'온라인 발행이 완료되었습니다.':'비공개 상태로 저장되었습니다.');
}
loginBtn?.addEventListener('click',login); pubBtn?.addEventListener('click',publish);
sb.auth.onAuthStateChange(()=>refresh()); refresh();
})();