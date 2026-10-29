const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const script=fs.readFileSync('assets/js/daejeon-community-hq.js','utf8');
function harness({admin=true,sourceStatus='accepted',existing=false,postStatus=201}={}){
const fields={submission_id:{value:'11111111-1111-4111-8111-111111111111'},category:{value:'지역 알림',options:[{value:'지역 알림'}]},title:{value:'공개 제목'},body:{value:'게시 승인 테스트용 공개 문구이며 개인정보는 포함하지 않습니다.'}};
let handler,posts=0;
const form={elements:fields,addEventListener:(type,fn)=>{if(type==='submit')handler=fn},reset(){}},message={textContent:''};
const fetch=async(url,opt)=>{const path=String(url);let body=null,status=200;
if(path.includes('/rpc/is_gn24_admin'))body=admin;
else if(path.includes('/gn24_participant_submissions'))body=[{id:fields.submission_id.value,region:'대전',status:sourceStatus,source_notes:'유형: 지역 알림',consent_original_work:true,consent_publication_review:true}];
else if(path.includes('/gn24_daejeon_community_posts')&&opt.method==='POST'){posts++;status=postStatus;}
else if(path.includes('/gn24_daejeon_community_posts'))body=existing?[{id:'published'}]:[];
else throw Error('unexpected fetch '+path);
return {ok:true,status,json:async()=>body};};
const context={window:{GN24_SUPABASE:{url:'https://example.invalid',anonKey:'public'},supabase:{createClient:()=>({auth:{getSession:async()=>({data:{session:{access_token:'fake-token'}}})}})}},document:{getElementById:id=>id==='communityPublishForm'?form:message},location:{search:''},URLSearchParams,fetch,confirm:()=>true,console};
vm.runInNewContext(script,context);
return {submit:async()=>handler({preventDefault(){}}),get posts(){return posts},get message(){return message.textContent}};
}
test('HQ accepted Daejeon post publishes once and handles empty 201 response',async()=>{const h=harness();await h.submit();assert.equal(h.posts,1);assert.match(h.message,/완료/);});
test('non-HQ cannot publish',async()=>{const h=harness({admin:false});await h.submit();assert.equal(h.posts,0);});
test('non-accepted submission cannot publish',async()=>{const h=harness({sourceStatus:'submitted'});await h.submit();assert.equal(h.posts,0);});
test('duplicate source cannot publish',async()=>{const h=harness({existing:true});await h.submit();assert.equal(h.posts,0);assert.match(h.message,/중복/);});
