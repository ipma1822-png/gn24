// IPMA authentication base; intentionally not connected to the public gate.
const headers = {
 "Content-Type": "application/json",
 "Cache-Control": "no-store",
 "Access-Control-Allow-Origin": "https://news24.ai.kr",
 "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
 "Access-Control-Allow-Methods": "POST, OPTIONS",
 "Vary": "Origin",
};
const reply = (data: unknown, status: number) => new Response(JSON.stringify(data), {status, headers});
Deno.serve(async (req: Request) => {
 const origin = req.headers.get("origin");
 if (origin && origin !== "https://news24.ai.kr") return reply({ok:false,error:"FORBIDDEN"},403);
 if (req.method === "OPTIONS") return new Response(null,{status:204,headers});
 if (req.method !== "POST") return reply({ok:false,error:"METHOD_NOT_ALLOWED"},405);
 try {
  const reader = req.body?.getReader();
  if (!reader) return reply({ok:false,error:"INVALID_REQUEST"},400);
  const chunks: Uint8Array[] = []; let size=0;
  while (true) {
   const {done,value}=await reader.read(); if(done) break;
   size+=value.length;
   if(size>1024){await reader.cancel();return reply({ok:false,error:"INVALID_REQUEST"},400);}
   chunks.push(value);
  }
  const bytes=new Uint8Array(size);let offset=0;
  for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  const body=JSON.parse(new TextDecoder().decode(bytes));
  let rpc: string; let args: Record<string,string>;
  if(body.action==="session"){
   if(typeof body.token!=="string" || !/^[a-f0-9]{64}$/.test(body.token))
    return reply({ok:false,error:"INVALID_SESSION"},401);
   rpc="ipma_validate_executive_session";args={p_token:body.token};
  } else if(body.action===undefined || body.action==="login"){
   if(typeof body.name!=="string" || !body.name.trim() || body.name.trim().length>80 ||
      typeof body.pin!=="string" || !/^[0-9]{6}$/.test(body.pin))
    return reply({ok:false,error:"INVALID_CREDENTIALS"},401);
   rpc="ipma_authenticate_executive";args={p_name:body.name.trim(),p_pin:body.pin};
  } else return reply({ok:false,error:"INVALID_REQUEST"},400);
  const url=Deno.env.get("SUPABASE_URL");
  const key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if(!url || !key) return reply({ok:false,error:"UNAVAILABLE"},503);
  const result=await fetch(url+"/rest/v1/rpc/"+rpc,{
   method:"POST",headers:{"apikey":key,"Authorization":"Bearer "+key,"Content-Type":"application/json"},
   body:JSON.stringify(args),
  });
  if(!result.ok) return reply({ok:false,error:"UNAVAILABLE"},503);
  const data=await result.json();
  return reply(data,data.ok?200:data.error==="RATE_LIMITED"?429:401);
 } catch {
  return reply({ok:false,error:"INVALID_REQUEST"},400);
 }
});
