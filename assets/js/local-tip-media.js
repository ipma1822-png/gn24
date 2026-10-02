(()=>{
'use strict';
const BUCKET='local-tip-media',PREFIX='storage://'+BUCKET+'/',MAX=10,MAX_SIDE=1920,MAX_BYTES=2*1024*1024;
function path(value){
 const raw=String(value||'');
 if(!raw.startsWith(PREFIX))return null;
 const p=raw.slice(PREFIX.length);
 return /^[0-9a-f-]{36}\/(0[1-9]|10)\.webp$/.test(p)?p:null;
}
async function optimize(file){
 if(!file||!/^image\/(jpeg|png|webp)$/i.test(file.type))throw Error('JPEG·PNG·WebP 사진을 선택해 주세요.');
 if(file.size>30*1024*1024)throw Error('원본 사진은 장당 30MB 이하로 선택해 주세요.');
 const bitmap=await createImageBitmap(file);
 try{
  const scale=Math.min(1,MAX_SIDE/Math.max(bitmap.width,bitmap.height));
  const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
  const ctx=canvas.getContext('2d');if(!ctx)throw Error('사진 변환을 지원하지 않는 브라우저입니다.');
  ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
  let blob;
  for(const quality of [.82,.72,.62,.52]){
   blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('사진 변환 실패')),'image/webp',quality));
   if(blob.type!=='image/webp')throw Error('WebP 변환을 지원하지 않는 브라우저입니다.');
   if(blob.size<=MAX_BYTES)break;
  }
  if(blob.size>MAX_BYTES)throw Error('사진 압축 후 용량이 너무 큽니다. 다른 사진을 선택해 주세요.');
  return new File([blob],file.name.replace(/\.[^.]+$/,'')+'.webp',{type:'image/webp'});
 }finally{bitmap.close?.();}
}
async function signedUrl(sb,value){
 const p=path(value);if(!p)throw Error('제보사진 경로가 올바르지 않습니다.');
 const {data,error}=await sb.storage.from(BUCKET).createSignedUrl(p,600);
 if(error||!data?.signedUrl)throw error||Error('사진 열람 실패');
 return data.signedUrl;
}
async function files(sb,values){
 const refs=(values||[]).filter(value=>path(value));
 if(refs.length>MAX)throw Error('제보사진은 최대 10장입니다.');
 const out=[];
 for(const ref of refs){
  const {data,error}=await sb.storage.from(BUCKET).download(path(ref));
  if(error||!data)throw error||Error('제보사진 불러오기 실패');
  out.push(new File([data],path(ref).split('/').pop(),{type:'image/webp'}));
 }
 return out;
}
window.GN24LocalTipMedia={BUCKET,PREFIX,MAX,path,optimize,signedUrl,files};
})();
