(()=>{'use strict';
const cfg=window.GN24_SUPABASE||{},base=String(cfg.url||'').replace(/\/$/,''),key=String(cfg.anonKey||''),$=id=>document.getElementById(id);
let optimized=null;
function session(){for(const k of ['gn24-reader-session','gn24-editorial-session','gn24-reporter-session']){try{const s=JSON.parse(localStorage.getItem(k)||'{}');if(s.access_token)return s}catch{}}return null}
function msg(t){$('guard').textContent=t;$('guard').hidden=false}
async function user(token){const r=await fetch(base+'/auth/v1/user',{headers:{apikey:key,Authorization:'Bearer '+token}});if(!r.ok)return null;return r.json()}
function uuid(){return crypto.randomUUID?crypto.randomUUID():('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0,v=c==='x'?r:(r&3|8);return v.toString(16)}))}
async function optimize(file){
 if(!file||!String(file.type||'').startsWith('image/'))throw new Error('IMAGE_ONLY');
 const bitmap=await createImageBitmap(file,{imageOrientation:'from-image'});
 const max=1600,scale=Math.min(1,max/Math.max(bitmap.width,bitmap.height)),w=Math.max(1,Math.round(bitmap.width*scale)),h=Math.max(1,Math.round(bitmap.height*scale));
 const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
 const ctx=canvas.getContext('2d',{alpha:false});ctx.drawImage(bitmap,0,0,w,h);bitmap.close?.();
 const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('WEBP_CONVERT_FAILED')),'image/webp',0.82));
 if(blob.size>2*1024*1024)throw new Error('OPTIMIZED_TOO_LARGE');
 return {blob,width:w,height:h,original:file.size};
}
async function upload(token,uid,item){
 const d=new Date(),day=[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('');
 const path=uid+'/'+day+'/'+uuid()+'.webp';
 const r=await fetch(base+'/storage/v1/object/today-images/'+path,{method:'POST',headers:{apikey:key,Authorization:'Bearer '+token,'Content-Type':'image/webp','x-upsert':'false'},body:item.blob});
 if(!r.ok)throw new Error(await r.text());
 return base+'/storage/v1/object/public/today-images/'+path;
}
document.addEventListener('DOMContentLoaded',async()=>{
 const s=session();if(!s){location.href='/pages/account/?next=%2Fpages%2Ftoday%2Fwrite%2F';return}
 const u=await user(s.access_token);if(!u?.id){msg('로그인 세션이 만료되었습니다. 다시 로그인해 주세요.');return}
 $('guard').hidden=true;$('form').hidden=false;
 $('image').addEventListener('change',async()=>{optimized=null;$('preview').hidden=true;const f=$('image').files?.[0];if(!f)return;$('imageInfo').textContent='사진을 자동 최적화하고 있습니다…';try{optimized=await optimize(f);$('imageInfo').textContent=`${(f.size/1048576).toFixed(1)}MB 원본 → ${optimized.width}×${optimized.height} · ${Math.round(optimized.blob.size/1024)}KB WebP`;const url=URL.createObjectURL(optimized.blob);$('preview').src=url;$('preview').hidden=false}catch(e){console.error(e);$('image').value='';$('imageInfo').textContent=e.message==='OPTIMIZED_TOO_LARGE'?'최적화 후에도 2MB를 초과합니다. 다른 사진을 선택해 주세요.':'이 사진은 브라우저에서 처리할 수 없습니다. 다른 사진을 선택해 주세요.'}});
 $('form').addEventListener('submit',async e=>{e.preventDefault();const b=$('submit');b.disabled=true;b.textContent='등록 중…';let imageUrl=null;try{if($('image').files?.length&&!optimized)throw new Error('IMAGE_NOT_READY');if(optimized){b.textContent='사진 업로드 중…';imageUrl=await upload(s.access_token,u.id,optimized)}const payload={author_user_id:u.id,author_display_name:$('name').value.trim(),region_code:$('region').value,category:$('category').value,body:$('body').value.trim(),image_url:imageUrl,status:'pending'};const r=await fetch(base+'/rest/v1/gn24_today_posts',{method:'POST',headers:{apikey:key,Authorization:'Bearer '+s.access_token,'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify(payload)});if(!r.ok)throw new Error(await r.text());$('form').reset();optimized=null;$('preview').hidden=true;msg('등록되었습니다. 사진은 자동 최적화되어 저장됐으며 현재는 본사 검토 후 공개됩니다.');$('form').hidden=true}catch(err){console.error(err);alert('등록하지 못했습니다. 로그인 상태와 사진·입력 내용을 확인해 주세요.')}finally{b.disabled=false;b.textContent='본사 검토 요청하기'}});
});})();