(() => {
 const endpoint="https://plqqowwdbgixtczzyanr.supabase.co/functions/v1/ipma-executive-auth";
 const dialog=document.getElementById("executiveAccess");
 const login=document.getElementById("executiveLogin");
 const change=document.getElementById("executivePinChange");
 const lounge=document.getElementById("executiveLounge");
 const message=document.getElementById("executiveMessage");
 let token="",generation=0;
 const errors={RATE_LIMITED:"시도 횟수를 초과했습니다. 잠시 후 다시 시도해 주세요.",PIN_UNCHANGED:"초기 PIN과 다른 개인 PIN을 입력해 주세요.",INVALID_PIN:"PIN은 숫자 6자리로 입력해 주세요.",INVALID_SESSION:"인증이 만료되었습니다. 다시 입장해 주세요.",UNAVAILABLE:"인증 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요."};
 function show(state){login.hidden=state!=="login";change.hidden=state!=="pin_change";lounge.hidden=state!=="lounge";message.textContent="";}
 async function request(body){
  const response=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body),cache:"no-store"});
  const data=await response.json();
  if(!response.ok || data.ok!==true) throw new Error(data.error || "UNAVAILABLE");
  return data;
 }
 async function enter(data,run){
  if(run!==generation) return;
  if(typeof data.token!=="string" || !/^[a-f0-9]{64}$/.test(data.token)) throw new Error("INVALID_SESSION");
  token=data.token;
  const session=await request({action:"session",token});
  if(run!==generation) return;
  if(session.status!=="ACTIVE") throw new Error("INVALID_SESSION");
  if(session.scope==="pin_change"){show("pin_change");document.getElementById("personalPin").focus();}
  else if(session.scope==="lounge" && session.must_change_pin===false){
   document.getElementById("executiveWelcome").textContent=(session.name || "")+" 임원님, 환영합니다.";
   document.getElementById("executiveProfile").textContent=[session.position,session.organization].filter(Boolean).join(" · ");
   show("lounge");
  } else throw new Error("INVALID_SESSION");
 }
 function failure(error,run){
  if(run!==generation) return;
  if(error.message==="INVALID_SESSION"){token="";show("login");}
  message.textContent=errors[error.message] || "성명과 PIN 또는 활동 상태를 확인해 주세요.";
 }
 document.getElementById("executiveEntry").addEventListener("click",()=>{generation++;token="";login.reset();change.reset();show("login");dialog.showModal();document.getElementById("executiveName").focus();});
 document.getElementById("executiveClose").addEventListener("click",()=>dialog.close());
 dialog.addEventListener("close",()=>{generation++;token="";login.reset();change.reset();show("login");});
 login.addEventListener("submit",async(event)=>{
  event.preventDefault();const run=generation;const submit=login.querySelector('button[type="submit"]');
  if(submit.disabled) return;
  submit.disabled=true;message.textContent="인증 중입니다.";
  const name=document.getElementById("executiveName").value.trim();
  const pin=document.getElementById("executivePin").value;
  try{await enter(await request({action:"login",name,pin}),run);}
  catch(error){failure(error,run);}
  finally{document.getElementById("executivePin").value="";submit.disabled=false;}
 });
 change.addEventListener("submit",async(event)=>{
  event.preventDefault();const run=generation;const submit=change.querySelector('button[type="submit"]');
  if(submit.disabled) return;
  const pin=document.getElementById("personalPin").value;
  if(pin!==document.getElementById("personalPinConfirm").value){message.textContent="새 PIN과 확인 PIN이 일치하지 않습니다.";return;}
  submit.disabled=true;message.textContent="PIN을 변경하고 있습니다.";
  try{await enter(await request({action:"change_pin",token,new_pin:pin}),run);}
  catch(error){failure(error,run);}
  finally{change.reset();submit.disabled=false;}
 });
})();
