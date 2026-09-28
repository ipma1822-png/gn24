import "jsr:@supabase/functions-js@2/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.95.0";
import bcrypt from "npm:bcryptjs@3.0.2";

const origin="https://news24.ai.kr",headers={"Access-Control-Allow-Origin":origin,"Access-Control-Allow-Headers":"content-type","Content-Type":"application/json; charset=utf-8"};
const failure="이름 또는 PIN을 확인해 주세요.";
const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers});
const hex=(b:ArrayBuffer)=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("");
const sha256=async(v:string)=>hex(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(v)));

Deno.serve(async(req)=>{
  if(req.method==="OPTIONS")return new Response("ok",{headers});
  if(req.method!=="POST")return reply({error:failure},405);
  try{
    const body=await req.json(),name=String(body.name??"").trim(),pin=String(body.pin??"");
    if(!name||name.length>100||!/^\d{4}$/.test(pin))return reply({error:failure},401);
    const ip=req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()||"unknown";
    const fingerprintHash=await sha256(ip+"|"+(req.headers.get("user-agent")??"unknown"));
    const client=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,{auth:{persistSession:false}});
    const since=new Date(Date.now()-900000).toISOString();
    const {count:ipCount,error:ipError}=await client.from("gn24_junior_login_attempts").select("id",{count:"exact",head:true}).gte("created_at",since).eq("request_fingerprint_hash",fingerprintHash);
    if(ipError)return reply({error:failure},500);
    if((ipCount??0)>=5)return reply({error:failure},429);
    const {data:reporters,error:lookupError}=await client.from("gn24_junior_reporters").select("internal_id,reporter_id,pin_hash").eq("real_name",name).eq("status","ACTIVE");
    if(lookupError)return reply({error:failure},500);
    if(!reporters?.length)return reply({error:failure},401);
    for(const reporter of reporters){
      const {count,error}=await client.from("gn24_junior_login_attempts").select("id",{count:"exact",head:true}).gte("created_at",since).eq("reporter_id",reporter.reporter_id);
      if(error)return reply({error:failure},500);
      if((count??0)>=5)return reply({error:failure},429);
    }
    const checks=await Promise.all(reporters.map(async r=>typeof r.pin_hash==="string"&&await bcrypt.compare(pin,r.pin_hash)));
    const matches=reporters.filter((_,i)=>checks[i]);
    const valid=matches.length===1;
    const {error:attemptError}=await client.from("gn24_junior_login_attempts").insert(reporters.map(r=>({reporter_id:r.reporter_id,request_fingerprint_hash:fingerprintHash,succeeded:valid&&r.internal_id===matches[0].internal_id})));
    if(attemptError)return reply({error:failure},500);
    if(!valid)return reply({error:matches.length>1?"동명이인과 PIN이 같습니다. 관리자에게 문의해 주세요.":failure},matches.length>1?409:401);
    const raw=crypto.getRandomValues(new Uint8Array(32));
    const token=btoa(String.fromCharCode(...raw)).replaceAll("+","-").replaceAll("/","_").replaceAll("=","");
    const tokenHash=await sha256(token),expiresAt=new Date(Date.now()+86400000).toISOString();
    const {error}=await client.from("gn24_junior_sessions").insert({junior_reporter_internal_id:matches[0].internal_id,token_hash:tokenHash,expires_at:expiresAt});
    if(error)return reply({error:failure},500);
    return reply({ok:true,sessionToken:token,expiresAt});
  }catch{return reply({error:failure},401);}
});
