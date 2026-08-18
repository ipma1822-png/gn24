(()=>{
  'use strict';
  const $=(s,p=document)=>p.querySelector(s);
  const STORAGE_KEY='gn24-admin-draft-v3.1.11';
  const STORAGE_VERSION=1;
  const DEFAULT_IMAGE='/assets/images/news/gn24-default-news.svg';
  const state={articles:[],selectedId:null,dirty:false,imageFile:null,imageObjectUrl:null,saveTimer:null,restored:false};
  const els={
    list:$('#articleList'),count:$('#articleCount'),listCount:$('#listCount'),dirty:$('#dirtyState'),search:$('#searchInput'),form:$('#articleForm'),
    id:$('#fId'),date:$('#fDate'),title:$('#fTitle'),subtitle:$('#fSubtitle'),category:$('#fCategory'),author:$('#fAuthor'),summary:$('#fSummary'),image:$('#fImage'),caption:$('#fImageCaption'),content:$('#fContent'),sourceName:$('#fSourceName'),sourceUrl:$('#fSourceUrl'),tags:$('#fTags'),featured:$('#fFeatured'),pinned:$('#fPinned'),visualStyle:$('#fVisualStyle'),preview:$('#imagePreview'),imageInput:$('#imageInput'),imageFilename:$('#imageFilename'),downloadImage:$('#downloadImageBtn'),saveMessage:$('#saveMessage'),draftInfo:$('#draftInfo')
  };
  const clean=s=>String(s??'').trim();
  const clone=x=>JSON.parse(JSON.stringify(x));
  const ymd=d=>String(d||'').replaceAll('-','');
  const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
  const makeId=(date=today())=>`gn24-${ymd(date)}-${String(Date.now()).slice(-6)}`;
  const sortArticles=a=>[...a].sort((x,y)=>String(y.date||'').localeCompare(String(x.date||''))||String(y.id||'').localeCompare(String(x.id||'')));
  const timeText=ts=>{const d=new Date(ts);return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`};

  function setStatus(text,type='normal'){
    els.dirty.textContent=text;
    els.dirty.className=`status ${type}`;
  }
  function setDirty(v=true){state.dirty=v;setStatus(v?'GitHub 반영 필요':'원본 상태',v?'dirty':'normal')}
  function current(){return state.articles.find(a=>a.id===state.selectedId)||null}
  function imageBg(src){els.preview.style.backgroundImage=`url("${src||DEFAULT_IMAGE}"),url("${DEFAULT_IMAGE}")`;els.preview.textContent=''}
  function resetImageFile(){if(state.imageObjectUrl)URL.revokeObjectURL(state.imageObjectUrl);state.imageObjectUrl=null;state.imageFile=null;els.imageInput.value='';els.downloadImage.disabled=true;$('#imageRefreshWarning')?.classList.remove('show')}

  function formData(){
    const paragraphs=els.content.value.split(/\n\s*\n/).map(clean).filter(Boolean);
    return {id:clean(els.id.value)||makeId(els.date.value),title:clean(els.title.value),subtitle:clean(els.subtitle.value),date:els.date.value||today(),category:els.category.value||'뉴스',summary:clean(els.summary.value),image:clean(els.image.value)||DEFAULT_IMAGE,author:clean(els.author.value)||'Global News24 편집부',sourceName:clean(els.sourceName.value)||'Global News24',sourceUrl:clean(els.sourceUrl.value),tags:els.tags.value.split(',').map(clean).filter(Boolean),content:paragraphs,featured:els.featured.checked,visualStyle:els.visualStyle.value||'normal',pinned:els.pinned.checked,relatedOrgs:current()?.relatedOrgs||[],...(clean(els.caption.value)?{imageCaption:clean(els.caption.value)}:{})};
  }

  function pendingForm(){
    if(!state.selectedId)return null;
    return {...formData(),_imageFilename:clean(els.imageFilename.value)};
  }

  function saveDraft(reason='auto'){
    try{
      const payload={version:STORAGE_VERSION,savedAt:Date.now(),articles:state.articles,selectedId:state.selectedId,pending:pendingForm(),dirty:state.dirty};
      localStorage.setItem(STORAGE_KEY,JSON.stringify(payload));
      const t=timeText(payload.savedAt);
      if(els.draftInfo)els.draftInfo.textContent=`자동 임시저장 ${t}`;
      if(reason==='auto')setStatus(`임시저장됨 ${t}`,'saved');
      return true;
    }catch(err){
      if(els.draftInfo)els.draftInfo.textContent='임시저장 실패';
      setStatus('임시저장 실패','error');
      console.warn(err);
      return false;
    }
  }

  function scheduleDraft(){
    clearTimeout(state.saveTimer);
    state.saveTimer=setTimeout(()=>saveDraft('auto'),450);
  }

  function readDraft(){
    try{
      const raw=localStorage.getItem(STORAGE_KEY);if(!raw)return null;
      const d=JSON.parse(raw);if(!d||d.version!==STORAGE_VERSION||!Array.isArray(d.articles))return null;
      return d;
    }catch{return null}
  }

  function clearDraft(){localStorage.removeItem(STORAGE_KEY);if(els.draftInfo)els.draftInfo.textContent='임시편집본 없음'}

  function applyPending(p){
    if(!p)return;
    els.id.value=p.id||els.id.value;els.date.value=p.date||els.date.value;els.title.value=p.title||'';els.subtitle.value=p.subtitle||'';
    if(p.category){if(![...els.category.options].some(o=>o.value===p.category)){const o=document.createElement('option');o.value=o.textContent=p.category;els.category.append(o)}els.category.value=p.category}
    els.author.value=p.author||'Global News24 편집부';els.summary.value=p.summary||'';els.image.value=p.image||DEFAULT_IMAGE;els.caption.value=p.imageCaption||'';els.content.value=(p.content||[]).join('\n\n');els.sourceName.value=p.sourceName||'';els.sourceUrl.value=p.sourceUrl||'';els.tags.value=(p.tags||[]).join(', ');els.featured.checked=!!p.featured;els.pinned.checked=!!p.pinned;els.visualStyle.value=p.visualStyle||'normal';els.imageFilename.value=p._imageFilename||(p.image||'').split('/').pop()||'';imageBg(p.image||DEFAULT_IMAGE);
  }

  function select(id,opts={}){
    state.selectedId=id;resetImageFile();const a=current();if(!a)return;
    els.id.value=a.id||'';els.date.value=a.date||today();els.title.value=a.title||'';els.subtitle.value=a.subtitle||'';els.category.value=a.category||'국내소식';
    if(![...els.category.options].some(o=>o.value===(a.category||''))){const o=document.createElement('option');o.value=o.textContent=a.category||'뉴스';els.category.append(o);els.category.value=o.value}
    els.author.value=a.author||'Global News24 편집부';els.summary.value=a.summary||'';els.image.value=a.image||'';els.caption.value=a.imageCaption||'';els.content.value=(Array.isArray(a.content)?a.content:(Array.isArray(a.body)?a.body:[])).join('\n\n');els.sourceName.value=a.sourceName||'';els.sourceUrl.value=a.sourceUrl||'';els.tags.value=(a.tags||[]).join(', ');els.featured.checked=!!a.featured;els.pinned.checked=!!a.pinned;els.visualStyle.value=a.visualStyle||'normal';els.imageFilename.value=(a.image||'').split('/').pop()||`${ymd(a.date)}-news.jpg`;imageBg(a.image);$('#editorTitle').textContent=`기사 편집 · ${a.category||'뉴스'}`;if(!opts.keepMessage)els.saveMessage.textContent='편집 후 저장을 눌러주세요.';renderList();
  }

  function renderList(){
    const q=clean(els.search.value).toLowerCase();let data=sortArticles(state.articles);if(q)data=data.filter(a=>JSON.stringify(a).toLowerCase().includes(q));els.count.textContent=state.articles.length;els.listCount.textContent=`표시 ${data.length}건`;els.list.innerHTML='';if(!data.length){els.list.innerHTML='<div class="empty">검색 결과가 없습니다.</div>';return}
    for(const a of data){const b=document.createElement('button');b.type='button';b.className='article-item'+(a.id===state.selectedId?' active':'');b.innerHTML=`<b></b><small><span></span><span></span></small>`;b.querySelector('b').textContent=a.title||'(제목 없음)';b.querySelectorAll('small span')[0].textContent=a.date||'';b.querySelectorAll('small span')[1].textContent=a.category||'뉴스';b.onclick=()=>{select(a.id);scheduleDraft()};els.list.append(b)}
  }

  async function loadSite({ignoreDraft=false}={}){
    const r=await fetch('/data/news.json?admin='+Date.now(),{cache:'no-store'});if(!r.ok)throw new Error('news.json을 불러오지 못했습니다.');const data=await r.json();if(!Array.isArray(data))throw new Error('news.json 형식이 올바르지 않습니다.');
    const draft=ignoreDraft?null:readDraft();
    if(draft){
      state.articles=draft.articles;state.selectedId=draft.selectedId||sortArticles(draft.articles)[0]?.id||null;state.dirty=!!draft.dirty;state.restored=true;renderList();if(state.selectedId){select(state.selectedId,{keepMessage:true});if(draft.pending&&draft.pending.id===state.selectedId)applyPending(draft.pending)}
      const t=timeText(draft.savedAt);setStatus(`임시편집본 복원됨 ${t}`,'restored');if(els.draftInfo)els.draftInfo.textContent=`마지막 임시저장 ${t}`;els.saveMessage.textContent='새로고침 전 편집 내용이 자동 복원되었습니다.';
    }else{
      state.articles=data;state.selectedId=sortArticles(data)[0]?.id||null;state.dirty=false;renderList();if(state.selectedId)select(state.selectedId);setStatus('원본 상태','normal');if(els.draftInfo)els.draftInfo.textContent='임시편집본 없음';
    }
  }

  function newArticle(){const d=today(),id=makeId(d);state.articles.unshift({id,title:'',subtitle:'',date:d,category:'국내소식',summary:'',image:DEFAULT_IMAGE,author:'Global News24 편집부',sourceName:'Global News24',sourceUrl:'',tags:[],content:[],featured:false,pinned:false,visualStyle:'normal',relatedOrgs:[]});state.selectedId=id;setDirty(true);select(id);els.title.focus();els.saveMessage.textContent='새 기사를 작성하세요. 입력 내용은 자동 임시저장됩니다.';saveDraft('manual')}

  function saveCurrent(e){e?.preventDefault();const a=formData();if(!a.title){alert('기사 제목을 입력해 주세요.');els.title.focus();return false}const oldId=state.selectedId;const idx=state.articles.findIndex(x=>x.id===oldId);if(idx<0)state.articles.push(a);else state.articles[idx]=a;state.selectedId=a.id;setDirty(true);renderList();saveDraft('manual');els.saveMessage.textContent='현재 기사가 편집본에 저장되었습니다. 새로고침해도 유지됩니다.';setStatus('편집본 저장됨 · GitHub 반영 필요','dirty');return true}

  function deleteCurrent(){const a=current();if(!a)return;if(!confirm(`이 기사를 편집본에서 삭제할까요?\n\n${a.title||a.id}`))return;state.articles=state.articles.filter(x=>x.id!==a.id);state.selectedId=sortArticles(state.articles)[0]?.id||null;setDirty(true);renderList();if(state.selectedId)select(state.selectedId);else newArticle();saveDraft('manual');setStatus('삭제 편집본 저장됨 · GitHub 반영 필요','dirty')}
  function duplicate(){const a=current();if(!a)return;const c=clone(a);c.id=makeId(c.date||today());c.title=`${c.title} (복사본)`;c.pinned=false;state.articles.unshift(c);state.selectedId=c.id;setDirty(true);select(c.id);saveDraft('manual');setStatus('복제 편집본 저장됨 · GitHub 반영 필요','dirty')}
  function downloadBlob(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000)}
  function exportJSON(){if(state.selectedId&&!saveCurrent())return;const out=sortArticles(state.articles);downloadBlob(new Blob([JSON.stringify(out,null,2)+'\n'],{type:'application/json;charset=utf-8'}),'news.json');els.saveMessage.textContent='news.json을 내려받았습니다. GitHub data/news.json에 교체 업로드하세요.';setStatus('news.json 다운로드 완료 · GitHub 업로드 필요','dirty')}
  async function importJSON(file){const txt=await file.text();const data=JSON.parse(txt);if(!Array.isArray(data))throw new Error('기사 배열 형식이 아닙니다.');state.articles=data;state.selectedId=sortArticles(data)[0]?.id||null;setDirty(true);renderList();if(state.selectedId)select(state.selectedId);saveDraft('manual');setStatus('불러온 편집본 임시저장됨','saved')}

  function chooseImage(file){resetImageFile();if(!file)return;state.imageFile=file;state.imageObjectUrl=URL.createObjectURL(file);imageBg(state.imageObjectUrl);const ext=(file.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'')||'jpg';const base=`${ymd(els.date.value||today())}-news-${String(Date.now()).slice(-4)}.${ext}`;els.imageFilename.value=base;els.image.value=`/assets/images/news/${base}`;els.downloadImage.disabled=false;els.caption.focus();$('#imageRefreshWarning')?.classList.add('show');els.saveMessage.textContent='새 이미지가 선택되었습니다. 경로·파일명은 자동 임시저장되지만 이미지 파일 자체는 새로고침 전에 내려받아 주세요.';setDirty(true);scheduleDraft()}
  function downloadImage(){if(!state.imageFile)return;const name=clean(els.imageFilename.value)||state.imageFile.name;downloadBlob(state.imageFile,name);els.saveMessage.textContent='이미지 파일을 내려받았습니다. GitHub assets/images/news/에 업로드하세요.'}

  async function resetToSite(){
    if(!confirm('브라우저의 임시편집본을 모두 삭제하고 사이트의 현재 news.json 원본으로 돌아갈까요?'))return;
    clearDraft();state.dirty=false;state.restored=false;resetImageFile();await loadSite({ignoreDraft:true});els.saveMessage.textContent='임시편집본을 초기화하고 사이트 원본을 다시 불러왔습니다.';
  }

  $('#newBtn').onclick=newArticle;$('#exportBtn').onclick=exportJSON;$('#deleteBtn').onclick=deleteCurrent;$('#duplicateBtn').onclick=duplicate;$('#restoreBtn').onclick=()=>resetToSite().catch(e=>alert(e.message));els.search.oninput=renderList;els.form.onsubmit=saveCurrent;els.importInput=$('#importInput');els.importInput.onchange=async e=>{try{if(e.target.files[0])await importJSON(e.target.files[0])}catch(err){alert('불러오기 실패: '+err.message)}finally{e.target.value=''}};els.imageInput.onchange=e=>chooseImage(e.target.files[0]);els.downloadImage.onclick=downloadImage;
  els.form.addEventListener('input',e=>{if(e.target.id==='imageInput')return;setDirty(true);els.saveMessage.textContent='입력 내용이 자동 임시저장됩니다.';if(!state.imageFile&&e.target.id==='fImage')imageBg(clean(els.image.value));scheduleDraft()});
  els.form.addEventListener('change',e=>{if(e.target.id==='imageInput')return;setDirty(true);scheduleDraft()});
  window.addEventListener('beforeunload',e=>{if(state.imageFile){e.preventDefault();e.returnValue=''}});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&state.dirty)saveDraft('auto')});

  loadSite().catch(err=>{els.list.innerHTML=`<div class="empty">${err.message}<br>상단의 news.json 불러오기를 이용해 주세요.</div>`;newArticle()});
})();
