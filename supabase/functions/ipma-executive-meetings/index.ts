const headers={"Content-Type":"application/json","Cache-Control":"no-store","Access-Control-Allow-Origin":"https://news24.ai.kr","Access-Control-Allow-Headers":"authorization, apikey, content-type, x-client-info","Access-Control-Allow-Methods":"POST, OPTIONS","Vary":"Origin"};
const reply=(body:unknown,status:number)=>new Response(JSON.stringify(body),{status,headers});
Deno.serve(async(req:Request)=>{
 const origin=req.headers.get("origin");if(origin && origin!=="https://news24.ai.kr")return reply({ok:false,error:"FORBIDDEN"},403);
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers});
 if(req.method!=="POST")return reply({ok:false,error:"METHOD_NOT_ALLOWED"},405);
 try{
  const reader=req.body?.getReader();if(!reader)return reply({ok:false,error:"INVALID_REQUEST"},400);
  const chunks:Uint8Array[]=[];let size=0;
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>16000){await reader.cancel();return reply({ok:false,error:"INVALID_REQUEST"},400);}chunks.push(value);}
  const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}
  const body=JSON.parse(new TextDecoder().decode(bytes));
  if(typeof body.token!=="string" || !/^[a-f0-9]{64}$/.test(body.token))return reply({ok:false,error:"INVALID_SESSION"},401);
  const action=body.action??"list";
  if(!["list","detail","opinion"].includes(action))return reply({ok:false,error:"INVALID_REQUEST"},400);
  if(action!=="list" && (typeof body.id!=="string" || !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(body.id)))return reply({ok:false,error:"INVALID_REQUEST"},400);
  if(action==="opinion" && (typeof body.body!=="string" || !body.body.trim() || body.body.length>3000))return reply({ok:false,error:"INVALID_OPINION"},400);
  if(body.offset!==undefined && (!Number.isSafeInteger(body.offset)||body.offset<0||body.offset>100000))return reply({ok:false,error:"INVALID_REQUEST"},400);
  const url=Deno.env.get("SUPABASE_URL"),key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if(!url||!key)return reply({ok:false,error:"UNAVAILABLE"},503);
  const r=await fetch(url+"/rest/v1/rpc/ipma_meeting_access",{method:"POST",headers:{apikey:key,Authorization:"Bearer "+key,"Content-Type":"application/json"},body:JSON.stringify({p_token:body.token,p_action:action,p_id:action==="list"?null:body.id,p_body:action==="opinion"?body.body:null,p_offset:body.offset??0})});
  if(!r.ok)return reply({ok:false,error:"UNAVAILABLE"},503);
  const data=await r.json();return reply(data,data.ok?200:data.error==="INVALID_SESSION"?401:data.error==="NOT_FOUND"?404:data.error==="MEETING_CLOSED"?409:data.error==="RATE_LIMITED"?429:400);
 }catch{return reply({ok:false,error:"INVALID_REQUEST"},400);}
});
