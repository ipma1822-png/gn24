(()=>{
  'use strict';
  const MAX=10;
  const input=document.querySelector('#galleryInput');
  const hidden=document.querySelector('#fGalleryImages');
  const list=document.querySelector('#galleryAdminList');
  const count=document.querySelector('#galleryCount');
  const clearBtn=document.querySelector('#galleryClearBtn');
  if(!input||!hidden||!list)return;

  let items=[];
  const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const notify=()=>hidden.dispatchEvent(new Event('input',{bubbles:true}));
  const serializable=()=>items.map(({url,caption})=>({url:url||'',caption:caption||''})).filter(x=>x.url);
  const sync=()=>{hidden.value=JSON.stringify(serializable());if(count)count.textContent=`${items.length} / ${MAX}장`;};
  const cleanup=item=>{if(item?.objectUrl)URL.revokeObjectURL(item.objectUrl);};

  function render(){
    list.innerHTML=items.map((item,i)=>`<div class="gallery-admin-item" data-index="${i}">
      <img src="${esc(item.objectUrl||item.url)}" alt="추가 사진 ${i+1}">
      <div><b>사진 ${i+1}</b><input class="gallery-caption-input" maxlength="160" value="${esc(item.caption||'')}" placeholder="사진 설명(선택)"></div>
      <button class="gallery-remove-btn" type="button" title="사진 삭제">삭제</button>
    </div>`).join('');
    sync();
  }

  function load(value){
    items.forEach(cleanup);items=[];
    let rows=value;
    if(typeof rows==='string'){try{rows=JSON.parse(rows||'[]')}catch{rows=[]}}
    if(!Array.isArray(rows))rows=[];
    items=rows.slice(0,MAX).map(x=>typeof x==='string'?{url:x,caption:''}:{url:x?.url||x?.image||'',caption:x?.caption||''}).filter(x=>x.url);
    render();
  }

  input.addEventListener('change',()=>{
    const files=[...input.files];
    if(!files.length)return;
    const room=MAX-items.length;
    if(room<=0){alert('추가 사진은 최대 10장까지 등록할 수 있습니다.');input.value='';return;}
    if(files.length>room)alert(`최대 10장까지 가능합니다. 앞의 ${room}장만 추가합니다.`);
    files.slice(0,room).forEach(file=>items.push({file,objectUrl:URL.createObjectURL(file),url:'',caption:''}));
    input.value='';render();notify();
  });
  list.addEventListener('input',e=>{
    const card=e.target.closest('[data-index]');if(!card)return;
    const idx=Number(card.dataset.index);if(e.target.classList.contains('gallery-caption-input'))items[idx].caption=e.target.value;
    sync();notify();
  });
  list.addEventListener('click',e=>{
    const btn=e.target.closest('.gallery-remove-btn');if(!btn)return;
    const idx=Number(btn.closest('[data-index]').dataset.index);cleanup(items[idx]);items.splice(idx,1);render();notify();
  });
  clearBtn?.addEventListener('click',()=>{if(!items.length)return;if(!confirm('추가 사진을 모두 지울까요?'))return;items.forEach(cleanup);items=[];render();notify();});

  async function uploadPending(sb,bucket,article,onProgress){
    const uploaded=[];
    for(let i=0;i<items.length;i++){
      const item=items[i];
      if(item.url){uploaded.push({url:item.url,caption:item.caption||''});continue;}
      if(!item.file)continue;
      onProgress?.(i+1,items.length);
      const ext=(item.file.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'')||'jpg';
      const folder=String(article.date||new Date().toISOString().slice(0,10)).replace(/[^0-9-]/g,'');
      const articleFolder=String(article.id||'article').replace(/[^a-zA-Z0-9._-]+/g,'-');
      const path=`${folder}/${articleFolder}/gallery-${Date.now()}-${i+1}.${ext}`;
      const {error}=await sb.storage.from(bucket).upload(path,item.file,{upsert:false,contentType:item.file.type||'image/jpeg',cacheControl:'3600'});
      if(error)throw new Error(`추가 사진 ${i+1} 업로드 실패: ${error.message}`);
      const {data}=sb.storage.from(bucket).getPublicUrl(path);
      if(!data?.publicUrl)throw new Error(`추가 사진 ${i+1}의 공개 URL 생성에 실패했습니다.`);
      uploaded.push({url:data.publicUrl,caption:item.caption||''});
    }
    load(uploaded);return uploaded;
  }

  window.GN24GalleryAdmin={load,value:()=>serializable(),uploadPending,hasPending:()=>items.some(x=>x.file)};
  render();
})();
