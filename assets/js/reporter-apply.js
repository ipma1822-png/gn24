(()=>{
'use strict';
const form=document.querySelector('#reporterApplyForm');
const statusBox=document.querySelector('#applyStatus');
const submitBtn=document.querySelector('#applySubmit');
const cfg=window.GN24_SUPABASE||{};
const base=String(cfg.url||'').replace(/\/$/,'');
const key=String(cfg.anonKey||'');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
function ref(){
  try{return crypto.randomUUID().replaceAll('-','').slice(0,12).toUpperCase();}
  catch(e){return 'GN24'+Date.now().toString(36).toUpperCase()+Math.random().toString(36).slice(2,6).toUpperCase();}
}
function setStatus(text,mode='info'){
  if(!statusBox)return;
  statusBox.hidden=false;
  statusBox.className='apply-status '+mode;
  statusBox.innerHTML=text;
}
function value(name){return String(form.elements[name]?.value||'').trim();}
function specialties(){return value('specialties').split(',').map(x=>x.trim()).filter(Boolean).slice(0,12);}
async function submit(e){
  e.preventDefault();
  if(!form)return;
  if(value('website')) return;
  if(!base||!key){setStatus('온라인 지원 시스템 연결 정보를 확인할 수 없습니다. 잠시 후 다시 시도해 주세요.','error');return;}
  if(!form.reportValidity())return;
  if(!form.elements.consent_privacy.checked){setStatus('개인정보 수집·이용 동의가 필요합니다.','error');return;}
  const clientRef=ref();
  const row={
    client_ref:clientRef,
    name:value('name'),
    phone:value('phone'),
    email:value('email'),
    country:value('country')||'대한민국',
    region:value('region'),
    application_type:value('application_type'),
    specialties:specialties(),
    experience:value('experience'),
    introduction:value('introduction'),
    portfolio_url:value('portfolio_url'),
    photo_url:'',
    consent_privacy:true,
    status:'pending'
  };
  submitBtn.disabled=true;
  submitBtn.textContent='지원서 전송 중…';
  setStatus('Global News24 본사로 지원서를 전송하고 있습니다.','info');
  try{
    const r=await fetch(base+'/rest/v1/gn24_reporter_applications',{
      method:'POST',
      headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json',Prefer:'return=minimal'},
      body:JSON.stringify(row)
    });
    if(!r.ok)throw new Error(await r.text());
    form.reset();
    setStatus(`<strong>지원서가 정상 접수되었습니다.</strong><br>접수번호 <b>${esc(clientRef)}</b><br><small>본사 검토 후 등록 여부가 결정됩니다. 접수번호는 문의 시 확인용으로 보관해 주세요.</small>`,'success');
  }catch(err){
    console.error(err);
    setStatus('지원서 접수 중 오류가 발생했습니다. 입력 내용을 확인한 뒤 다시 시도해 주세요. 계속 문제가 있으면 Global News24 문의 페이지를 이용해 주세요.','error');
  }finally{
    submitBtn.disabled=false;
    submitBtn.textContent='기자 지원서 제출';
  }
}
if(form)form.addEventListener('submit',submit);
})();