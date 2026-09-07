(()=>{
  'use strict';

  const TARGET_WIDTH=1280;
  const TARGET_HEIGHT=720;
  const TARGET_RATIO=TARGET_WIDTH/TARGET_HEIGHT;
  const WEBP_QUALITY=0.80;
  const MAX_SOURCE_BYTES=30*1024*1024;
  let redispatching=false;

  function safeStem(name){
    const raw=String(name||'news-image').replace(/\.[^.]+$/,'');
    return raw.replace(/[^a-zA-Z0-9._-]+/g,'-').replace(/^-+|-+$/g,'')||'news-image';
  }

  function canvasToBlob(canvas){
    return new Promise((resolve,reject)=>{
      canvas.toBlob(
        blob=>blob?resolve(blob):reject(new Error('WebP 변환에 실패했습니다.')),
        'image/webp',
        WEBP_QUALITY
      );
    });
  }

  async function optimizeLeadImage(file){
    if(!file)throw new Error('이미지 파일이 없습니다.');
    if(!String(file.type||'').startsWith('image/'))throw new Error('이미지 파일만 선택할 수 있습니다.');
    if(file.size>MAX_SOURCE_BYTES)throw new Error('대표이미지 원본은 30MB 이하만 선택해 주세요.');

    const bitmap=await createImageBitmap(file);
    try{
      const sourceRatio=bitmap.width/bitmap.height;
      let sx=0,sy=0,sw=bitmap.width,sh=bitmap.height;

      if(sourceRatio>TARGET_RATIO){
        sw=bitmap.height*TARGET_RATIO;
        sx=(bitmap.width-sw)/2;
      }else if(sourceRatio<TARGET_RATIO){
        sh=bitmap.width/TARGET_RATIO;
        sy=(bitmap.height-sh)/2;
      }

      const canvas=document.createElement('canvas');
      canvas.width=TARGET_WIDTH;
      canvas.height=TARGET_HEIGHT;
      const ctx=canvas.getContext('2d',{alpha:false});
      if(!ctx)throw new Error('이미지 변환용 Canvas를 만들 수 없습니다.');
      ctx.drawImage(bitmap,sx,sy,sw,sh,0,0,TARGET_WIDTH,TARGET_HEIGHT);

      const blob=await canvasToBlob(canvas);
      return new File([blob],`${safeStem(file.name)}.webp`,{
        type:'image/webp',
        lastModified:Date.now()
      });
    }finally{
      bitmap.close?.();
    }
  }

  function formatKB(bytes){return `${Math.max(1,Math.round(bytes/1024)).toLocaleString('ko-KR')}KB`}

  const input=document.querySelector('#imageInput');
  if(!input)return;

  input.addEventListener('change',async e=>{
    if(redispatching)return;
    const source=input.files?.[0];
    if(!source)return;

    e.stopImmediatePropagation();
    const warning=document.querySelector('#imageRefreshWarning');
    const message=document.querySelector('#saveMessage');
    if(warning){
      warning.classList.add('show');
      warning.textContent='대표이미지를 16:9 · 1280×720 · WebP로 자동 최적화하는 중입니다…';
    }
    if(message)message.textContent='대표이미지 자동 경량화 중…';

    try{
      const optimized=await optimizeLeadImage(source);
      const dt=new DataTransfer();
      dt.items.add(optimized);
      input.files=dt.files;

      const ratio=source.size?optimized.size/source.size:0;
      const saved=ratio>0?Math.max(0,Math.round((1-ratio)*100)):0;
      if(warning){
        warning.textContent=`✓ 대표이미지 자동 최적화 완료 · 1280×720 WebP · ${formatKB(source.size)} → ${formatKB(optimized.size)}${saved?` · 약 ${saved}% 절감`:''}`;
      }
      if(message)message.textContent='대표이미지가 1280×720 WebP로 최적화되었습니다. 온라인 저장 시 이 경량 파일만 업로드됩니다.';

      redispatching=true;
      input.dispatchEvent(new Event('change',{bubbles:true}));
    }catch(err){
      input.value='';
      if(warning)warning.textContent='⚠ 대표이미지 최적화 실패: '+(err?.message||err);
      if(message)message.textContent='대표이미지 최적화에 실패했습니다.';
      alert('대표이미지 최적화 실패: '+(err?.message||err));
    }finally{
      redispatching=false;
    }
  },true);
})();
