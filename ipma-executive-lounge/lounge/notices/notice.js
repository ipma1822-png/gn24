(() => {
 const endpoint="https://plqqowwdbgixtczzyanr.supabase.co/functions/v1/ipma-executive-notices";
 const key="ipma_executive_session",gate="/ipma-executive-lounge/";
 const home=document.getElementById("noticeHome")!==null;
 const root=document.getElementById(home?"noticeHome":"noticeShell");
 const status=document.getElementById("noticeStatus");
 const list=document.getElementById("noticeList");
 const params=new URLSearchParams(location.search);
 const id=home?null:params.get("id");
 const rawPage=Number(params.get("page")||0);
 const page=Number.isSafeInteger(rawPage)&&rawPage>=0&&rawPage<=5000?rawPage:0;
 let timer,run=0;
 const date=value=>new Intl.DateTimeFormat("ko-KR",{timeZone:"Asia/Seoul",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date(value));
 function leave(){clearTimeout(timer);root.hidden=true;list.replaceChildren();sessionStorage.removeItem(key);location.replace(gate);}
 async function load(){
  const current=++run;clearTimeout(timer);root.hidden=true;
  const detail=document.getElementById("noticeDetail");if(detail)detail.hidden=true;
  try{
   const token=sessionStorage.getItem(key);if(!token){leave();return;}
   const body={token,home,offset:home?0:page*20};if(id)body.id=id;
   const response=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body),cache:"no-store"});
   const data=await response.json();if(current!==run)return;
   if(sessionStorage.getItem(key)!==token || response.status===401){leave();return;}
   if(!response.ok || !data.ok){
    status.textContent=data.error==="NOT_FOUND"?"공지를 찾을 수 없습니다.":"공지를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.";
    list.replaceChildren();root.hidden=false;return;
   }
   status.textContent="";
   if(id){
    const n=data.notice;
    document.getElementById("noticeTitle").textContent=n.title;
    document.getElementById("noticeMeta").textContent=(n.is_important?"중요공지 · ":"")+date(n.created_at);
    document.getElementById("noticeBody").textContent=n.body;
    document.getElementById("noticeDetail").hidden=false;
   }else{
    list.replaceChildren();
    for(const n of data.notices){
     const item=document.createElement("li"),link=document.createElement("a"),meta=document.createElement("div");
     link.href="/ipma-executive-lounge/lounge/notices/?id="+encodeURIComponent(n.id);link.textContent=n.title;
     if(n.is_important){const badge=document.createElement("span");badge.className="notice-badge";badge.textContent="중요";link.prepend(badge);}
     meta.className="notice-meta";meta.textContent=date(n.created_at);item.append(link,meta);list.append(item);
    }
    if(!data.notices.length)status.textContent="등록된 공지가 없습니다.";
    if(!home){const prev=document.getElementById("noticePrevious"),next=document.getElementById("noticeNext");prev.hidden=page===0;prev.href="?page="+(page-1);next.hidden=(page+1)*20>=data.total;next.href="?page="+(page+1);}
   }
   root.hidden=false;timer=setTimeout(load,60000);
  }catch{if(current===run){list.replaceChildren();status.textContent="공지를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.";root.hidden=false;}}
 }
 window.addEventListener("pageshow",load);
 window.addEventListener("pagehide",()=>{run++;clearTimeout(timer);root.hidden=true;list.replaceChildren();const body=document.getElementById("noticeBody");if(body)body.textContent="";});
 document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")load();});
})();
