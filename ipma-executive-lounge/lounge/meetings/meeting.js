(() => {
 const endpoint="https://plqqowwdbgixtczzyanr.supabase.co/functions/v1/ipma-executive-meetings";
 const key="ipma_executive_session",gate="/ipma-executive-lounge/";
 const get=id=>document.getElementById(id),root=get("meetingShell"),list=get("meetingList"),detail=get("meetingDetail"),form=get("opinionForm");
 const params=new URLSearchParams(location.search),id=params.get("id"),raw=Number(params.get("page")||0);
 const page=Number.isSafeInteger(raw)&&raw>=0&&raw<=5000?raw:0;
 let timer,run=0,posting=false;
 const date=value=>value?new Intl.DateTimeFormat("ko-KR",{timeZone:"Asia/Seoul",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}).format(new Date(value)):"미정";
 function clear(){root.hidden=true;list.replaceChildren();detail.hidden=true;get("meetingOpinions").replaceChildren();get("meetingAgenda").textContent="";}
 function leave(){run++;clearTimeout(timer);clear();sessionStorage.removeItem(key);location.replace(gate);}
 async function request(body){
  const token=sessionStorage.getItem(key);if(!token){leave();throw new Error("INVALID_SESSION");}
  const r=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token,...body}),cache:"no-store"});
  const data=await r.json();
  if(r.status===401 || sessionStorage.getItem(key)!==token){leave();throw new Error("INVALID_SESSION");}
  if(!r.ok || !data.ok)throw new Error(data.error||"UNAVAILABLE");
  return data;
 }
 async function load(){
  if(posting)return;
  const current=++run;clearTimeout(timer);clear();
  try{
   const data=await request(id?{action:"detail",id}:{action:"list",offset:page*20});
   if(current!==run)return;
   get("meetingStatus").textContent="";
   if(id){
    const m=data.meeting;get("meetingTitle").textContent=m.title;
    get("meetingMeta").textContent=(m.status==="CLOSED"?"종료 · 기록":"진행 중")+" · 회의 일시: "+date(m.scheduled_at);
    get("meetingAgenda").textContent=m.agenda;
    const opinions=get("meetingOpinions");
    for(const o of data.opinions){
     const item=document.createElement("li"),author=document.createElement("h3"),meta=document.createElement("p"),body=document.createElement("p");
     author.textContent=o.author_name;meta.className="meta";meta.textContent=[o.author_position,o.author_organization,date(o.created_at)].filter(Boolean).join(" · ");
     body.className="text";body.textContent=o.body;item.append(author,meta,body);opinions.append(item);
    }
    get("opinionCount").textContent=data.opinion_total?("총 "+data.opinion_total+"건"+(data.opinion_total>100?" · 최근 100건 표시":"")):"등록된 의견이 없습니다.";
    form.hidden=m.status!=="OPEN";get("meetingClosed").hidden=m.status!=="CLOSED";detail.hidden=false;get("meetingPages").hidden=true;
   }else{
    for(const m of data.meetings){
     const item=document.createElement("li"),link=document.createElement("a"),badge=document.createElement("span"),meta=document.createElement("p");
     link.href="?id="+encodeURIComponent(m.id);link.textContent=m.title;badge.className="badge";badge.textContent=m.status==="CLOSED"?"종료 · 기록":"진행 중";link.prepend(badge);
     meta.className="meta";meta.textContent="회의 일시: "+date(m.scheduled_at);item.append(link,meta);list.append(item);
    }
    if(!data.meetings.length)get("meetingStatus").textContent="등록된 회의가 없습니다.";
    const prev=get("meetingPrevious"),next=get("meetingNext");prev.hidden=page===0;prev.href="?page="+(page-1);next.hidden=(page+1)*20>=data.total;next.href="?page="+(page+1);
   }
   root.hidden=false;timer=setTimeout(load,60000);
  }catch(e){if(current!==run||e.message==="INVALID_SESSION")return;get("meetingStatus").textContent=e.message==="NOT_FOUND"?"회의를 찾을 수 없습니다.":"회의를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.";root.hidden=false;}
 }
 form.addEventListener("submit",async(event)=>{
  event.preventDefault();if(posting)return;
  const body=get("opinionBody").value.trim();if(!body){get("opinionStatus").textContent="의견을 입력해 주세요.";return;}
  const current=run;posting=true;clearTimeout(timer);get("opinionSubmit").disabled=true;get("opinionStatus").textContent="등록 중입니다.";
  let reload=false;
  try{await request({action:"opinion",id,body});if(current!==run)return;get("opinionBody").value="";get("opinionStatus").textContent="의견이 등록되었습니다.";reload=true;}
  catch(e){if(current!==run||e.message==="INVALID_SESSION")return;
   get("opinionStatus").textContent=e.message==="RATE_LIMITED"?"15분에 최대 5건까지 등록할 수 있습니다.":e.message==="MEETING_CLOSED"?"종료된 회의에는 의견을 작성할 수 없습니다.":"의견을 등록하지 못했습니다. 다시 시도해 주세요.";
   if(e.message==="MEETING_CLOSED"){form.hidden=true;reload=true;}
  }finally{posting=false;get("opinionSubmit").disabled=false;if(current===run){if(reload)load();else timer=setTimeout(load,60000);}}
 });
 window.addEventListener("pageshow",load);
 window.addEventListener("pagehide",()=>{run++;clearTimeout(timer);clear();});
 document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")load();});
})();
