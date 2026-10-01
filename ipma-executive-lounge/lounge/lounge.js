(() => {
 const gate="/ipma-executive-lounge/";
 const key="ipma_executive_session";
 const root=document.getElementById("loungeShell");
 let expiryTimer;
 function leave(){clearTimeout(expiryTimer);root.hidden=true;sessionStorage.removeItem(key);location.replace(gate);}
 async function validate(){
  root.hidden=true;
  try{
   const token=sessionStorage.getItem(key);
   if(!token || !/^[a-f0-9]{64}$/.test(token)){leave();return;}
   const response=await fetch("https://plqqowwdbgixtczzyanr.supabase.co/functions/v1/ipma-executive-auth",{
    method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"session",token}),cache:"no-store"
   });
   const session=await response.json();
   if(!response.ok || session.ok!==true || session.status!=="ACTIVE" || session.scope!=="lounge" || session.must_change_pin!==false){leave();return;}
   if(sessionStorage.getItem(key)!==token){leave();return;}
   document.getElementById("executiveName").textContent=session.name || "";
   document.getElementById("executiveTitle").textContent=session.position || "임원";
   document.getElementById("executivePosition").textContent=session.position || "—";
   document.getElementById("executiveOrganization").textContent=session.organization || "—";
   document.getElementById("executiveStatus").textContent=session.status;
   root.hidden=false;
   clearTimeout(expiryTimer);expiryTimer=setTimeout(validate,60000);
  }catch{leave();}
 }
 window.addEventListener("pageshow",validate);
 document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")validate();});
 document.getElementById("leaveLounge").addEventListener("click",leave);
})();
