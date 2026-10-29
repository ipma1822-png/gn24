(()=>{'use strict';
const cfg=window.GN24_SUPABASE,form=document.getElementById('communityPublishForm'),message=document.getElementById('communityPublishMessage');
if(!form||!cfg?.url||!cfg?.anonKey)return;
const api=cfg.url.replace(/\/$/,'');
const params=new URLSearchParams(location.search);const sourceParam=params.get('submission_id'),categoryParam=params.get('category');if(sourceParam&&/^[0-9a-f-]{36}$/i.test(sourceParam))form.elements.submission_id.value=sourceParam;if(categoryParam&&Array.from(form.elements.category.options).some(o=>o.value===categoryParam))form.elements.category.value=categoryParam;
const auth=()=>window.supabase.createClient(cfg.url,cfg.anonKey).auth.getSession();
async function request(path,token,options={}){const response=await fetch(api+path,{...options,headers:{apikey:cfg.anonKey,Authorization:'Bearer '+token,'Content-Type':'application/json',Prefer:'return=minimal'}});if(!response.ok)throw Error('HTTP '+response.status);if(response.status===204||response.status===201||options.method==='POST'&&path.startsWith('/rest/v1/gn24_daejeon_community_posts'))return null;return response.json()}
form.addEventListener('submit',async event=>{
event.preventDefault();message.textContent='본사 권한을 확인하는 중입니다.';
try{const {data}=await auth(),token=data.session?.access_token;if(!token)throw Error('login');
const allowed=await request('/rest/v1/rpc/is_gn24_admin',token,{method:'POST',body:'{}'});if(allowed!==true)throw Error('hq only');
const sourceId=form.elements.submission_id.value.trim(),category=form.elements.category.value;
const source=await request('/rest/v1/gn24_participant_submissions?select=id,region,status,source_notes,consent_original_work,consent_publication_review&id=eq.'+encodeURIComponent(sourceId)+'&limit=1',token);
const row=source?.[0];if(!row||row.region!=='대전'||row.status!=='accepted'||!row.consent_original_work||!row.consent_publication_review||!row.source_notes.split(/\r?\n/).includes('유형: '+category))throw Error('not eligible');
const title=form.elements.title.value.trim(),body=form.elements.body.value.trim();
if(title.length<2||title.length>160||body.length<20||body.length>5000)throw Error('length');
if(!confirm('연락처, 이메일, 동의 없는 제3자 정보가 공개 문구에 없는지 확인했습니까?'))return;
await request('/rest/v1/gn24_daejeon_community_posts',token,{method:'POST',body:JSON.stringify({submission_id:sourceId,category,title,body})});
message.textContent='본사 게시 등록을 완료했습니다.';form.reset();
}catch(e){message.textContent='게시하지 못했습니다. 본사 권한, 채택 상태, 유형 일치 또는 DB 준비 상태를 확인해 주세요.'}
});
})();