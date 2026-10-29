(()=>{'use strict';
const cfg=window.GN24_SUPABASE,form=document.getElementById('communityPublishForm'),message=document.getElementById('communityPublishMessage');
if(!form||!cfg?.url||!cfg?.anonKey)return;
const api=cfg.url.replace(/\/$/,'');
const params=new URLSearchParams(location.search);const sourceParam=params.get('submission_id'),categoryParam=params.get('category');if(sourceParam&&/^[0-9a-f-]{36}$/i.test(sourceParam))form.elements.submission_id.value=sourceParam;if(categoryParam&&Array.from(form.elements.category.options).some(o=>o.value===categoryParam))form.elements.category.value=categoryParam;
const authClient=window.supabase.createClient(cfg.url,cfg.anonKey);const auth=()=>authClient.auth.getSession();
async function request(path,token,options={}){const response=await fetch(api+path,{...options,headers:{apikey:cfg.anonKey,Authorization:'Bearer '+token,'Content-Type':'application/json',Prefer:'return=minimal'}});if(!response.ok)throw Error('HTTP '+response.status);if(response.status===204||response.status===201||options.method==='POST'&&path.startsWith('/rest/v1/gn24_daejeon_community_posts'))return null;return response.json()}
const withdrawButton=document.getElementById('communityWithdrawButton'),withdrawInput=document.getElementById('communityWithdrawSubmissionId'),withdrawMessage=document.getElementById('communityWithdrawMessage');
if(withdrawButton&&withdrawInput&&withdrawMessage)withdrawButton.addEventListener('click',async()=>{
const sourceId=withdrawInput.value.trim();
if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sourceId)){withdrawMessage.textContent='접수 UUID 형식을 확인해 주세요.';return;}
withdrawButton.disabled=true;withdrawMessage.textContent='본사 권한과 게시 상태를 확인하는 중입니다.';
try{
const {data}=await auth(),token=data.session?.access_token;if(!token)throw Error('login');
const allowed=await request('/rest/v1/rpc/is_gn24_admin',token,{method:'POST',body:'{}'});if(allowed!==true)throw Error('hq only');
const existing=await request('/rest/v1/gn24_daejeon_community_posts?select=id,title&submission_id=eq.'+encodeURIComponent(sourceId)+'&limit=1',token);
if(!existing?.length){withdrawMessage.textContent='공개된 소식을 찾을 수 없습니다.';return;}
if(!confirm('다음 공개 소식을 취소하시겠습니까?\\n'+existing[0].title+'\\n원본 접수는 유지됩니다.')){withdrawMessage.textContent='취소 요청을 중단했습니다.';return;}
await request('/rest/v1/gn24_daejeon_community_posts?submission_id=eq.'+encodeURIComponent(sourceId),token,{method:'DELETE'});
withdrawMessage.textContent='공개 게시 취소 요청을 완료했습니다. 공개 목록에서 제거되었는지 확인해 주세요.';withdrawInput.value='';
}catch(e){withdrawMessage.textContent='게시 취소에 실패했습니다. 본사 권한과 접수번호를 확인해 주세요.';}
finally{withdrawButton.disabled=false;}
});
form.addEventListener('submit',async event=>{
event.preventDefault();message.textContent='본사 권한을 확인하는 중입니다.';
try{const {data}=await auth(),token=data.session?.access_token;if(!token)throw Error('login');
const allowed=await request('/rest/v1/rpc/is_gn24_admin',token,{method:'POST',body:'{}'});if(allowed!==true)throw Error('hq only');
const sourceId=form.elements.submission_id.value.trim(),category=form.elements.category.value;
if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sourceId))throw Error('invalid source id');
const source=await request('/rest/v1/gn24_participant_submissions?select=id,region,status,source_notes,consent_original_work,consent_publication_review&id=eq.'+encodeURIComponent(sourceId)+'&limit=1',token);
const row=source?.[0];if(!row||row.region!=='대전'||row.status!=='accepted'||!row.consent_original_work||!row.consent_publication_review||!row.source_notes.split(/\r?\n/).includes('유형: '+category))throw Error('not eligible');
const existing=await request('/rest/v1/gn24_daejeon_community_posts?select=id&submission_id=eq.'+encodeURIComponent(sourceId)+'&limit=1',token);if(existing?.length)throw Error('already published');
const title=form.elements.title.value.trim(),body=form.elements.body.value.trim();
if(title.length<2||title.length>160||body.length<20||body.length>5000)throw Error('length');
if(!confirm('연락처, 이메일, 동의 없는 제3자 정보가 공개 문구에 없는지 확인했습니까?'))return;
await request('/rest/v1/gn24_daejeon_community_posts',token,{method:'POST',body:JSON.stringify({submission_id:sourceId,category,title,body})});
message.textContent='본사 게시 등록을 완료했습니다.';form.reset();
}catch(e){message.textContent=e.message==='already published'?'이미 게시된 접수 건입니다. 중복 게시할 수 없습니다.':'게시하지 못했습니다. 본사 권한, 채택 상태, 유형 일치 또는 DB 준비 상태를 확인해 주세요.'}
});
})();