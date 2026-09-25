(()=>{
  'use strict';
  const $=(s,p=document)=>p.querySelector(s);
  const STORAGE_KEY='gn24-admin-draft-v3.1.11';
  const STORAGE_VERSION=1;
  const IMAGE_DB='gn24-admin-images';
  const IMAGE_STORE='draftImages';
  const DEFAULT_IMAGE='/assets/images/news/gn24-default-news.svg';
  const state={articles:[],selectedId:null,dirty:false,imageFile:null,imageObjectUrl:null,saveTimer:null,restored:false,duplicateContentIds:new Set(),duplicateContentGroups:new Map()};
  const els={
    list:$('#articleList'),count:$('#articleCount'),listCount:$('#listCount'),dirty:$('#dirtyState'),search:$('#searchInput'),regionFilter:$('#articleRegionFilter'),sortFilter:$('#articleSortFilter'),issueFilter:$('#articleIssueFilter'),form:$('#articleForm'),
    id:$('#fId'),date:$('#fDate'),title:$('#fTitle'),subtitle:$('#fSubtitle'),category:$('#fCategory'),reporter:$('#fReporterId'),author:$('#fAuthor'),summary:$('#fSummary'),image:$('#fImage'),caption:$('#fImageCaption'),content:$('#fContent'),sourceName:$('#fSourceName'),sourceUrl:$('#fSourceUrl'),tags:$('#fTags'),featured:$('#fFeatured'),searchPriority:$('#fSearchPriority'),pinned:$('#fPinned'),visibility:$('#fVisibility'),visualStyle:$('#fVisualStyle'),preview:$('#imagePreview'),imageInput:$('#imageInput'),imageFilename:$('#imageFilename'),downloadImage:$('#downloadImageBtn'),clearDraftImage:$('#clearDraftImageBtn'),saveMessage:$('#saveMessage'),draftInfo:$('#draftInfo')
  };
  const clean=s=>String(s??'').trim();
  const clone=x=>JSON.parse(JSON.stringify(x));
  const ymd=d=>String(d||'').replaceAll('-','');
  const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
  const makeId=(date=today())=>`gn24-${ymd(date)}-${String(Date.now()).slice(-6)}`;
  const REGION_LABELS=Object.freeze({seoul:'서울',busan:'부산',daegu:'대구',incheon:'인천',gwangju:'광주',daejeon:'대전',ulsan:'울산',sejong:'세종',gyeonggi:'경기',gangwon:'강원',chungbuk:'충북',chungnam:'충남',jeonbuk:'전북',jeonnam:'전남',gyeongbuk:'경북',gyeongnam:'경남',jeju:'제주',china:'중국',japan:'일본',philippines:'필리핀',indonesia:'인도네시아',malaysia:'말레이시아',thailand:'태국',vietnam:'베트남',nepal:'네팔',india:'인도',pakistan:'파키스탄',iran:'이란',uae:'UAE','saudi-arabia':'사우디아라비아',turkiye:'튀르키예',morocco:'모로코',egypt:'이집트','south-africa':'남아프리카공화국',spain:'스페인',uk:'영국',france:'프랑스',germany:'독일',italy:'이탈리아',canada:'캐나다',usa:'미국',mexico:'멕시코',brazil:'브라질',argentina:'아르헨티나',colombia:'콜롬비아',australia:'호주','new-zealand':'뉴질랜드',kenya:'케냐',nigeria:'나이지리아',mongolia:'몽골'});
  const regionLabel=a=>REGION_LABELS[a?.regionCode||a?.region_code||'']||((a?.regionCode||a?.region_code)?String(a.regionCode||a.region_code):'전국 공통');
  const createdKey=a=>String(a?.createdAt||a?.created_at||'')||String(a?.date||'')+'T'+String(a?.id||'');
  const updatedKey=a=>String(a?.updatedAt||a?.updated_at||'')||createdKey(a);
  const sortArticles=a=>[...a].sort((x,y)=>createdKey(y).localeCompare(createdKey(x))||String(y.id||'').localeCompare(String(x.id||'')));
  const timeText=ts=>{const d=new Date(ts);return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`};



  function openImageDB(){
    return new Promise((resolve,reject)=>{
      if(!('indexedDB' in window))return reject(new Error('IndexedDB를 지원하지 않는 브라우저입니다.'));
      const req=indexedDB.open(IMAGE_DB,1);
      req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(IMAGE_STORE))db.createObjectStore(IMAGE_STORE,{keyPath:'articleId'})};
      req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||new Error('이미지 임시저장소를 열지 못했습니다.'));
    });
  }
  async function putDraftImage(articleId,file,filename,path){
    if(!articleId||!file)return;
    const db=await openImageDB();
    await new Promise((resolve,reject)=>{const tx=db.transaction(IMAGE_STORE,'readwrite');tx.objectStore(IMAGE_STORE).put({articleId,file,filename,path,savedAt:Date.now()});tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});db.close();
  }
  async function getDraftImage(articleId){
    if(!articleId)return null;
    try{const db=await openImageDB();const rec=await new Promise((resolve,reject)=>{const tx=db.transaction(IMAGE_STORE,'readonly');const req=tx.objectStore(IMAGE_STORE).get(articleId);req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error)});db.close();return rec}catch(err){console.warn(err);return null}
  }
  async function deleteDraftImage(articleId){
    if(!articleId)return;
    try{const db=await openImageDB();await new Promise((resolve,reject)=>{const tx=db.transaction(IMAGE_STORE,'readwrite');tx.objectStore(IMAGE_STORE).delete(articleId);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});db.close()}catch(err){console.warn(err)}
  }
  async function clearAllDraftImages(){
    try{const db=await openImageDB();await new Promise((resolve,reject)=>{const tx=db.transaction(IMAGE_STORE,'readwrite');tx.objectStore(IMAGE_STORE).clear();tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});db.close()}catch(err){console.warn(err)}
  }
  async function restoreDraftImage(articleId){
    const rec=await getDraftImage(articleId);if(!rec||!rec.file)return false;
    if(state.imageObjectUrl)URL.revokeObjectURL(state.imageObjectUrl);
    state.imageFile=rec.file;state.imageObjectUrl=URL.createObjectURL(rec.file);imageBg(state.imageObjectUrl);
    if(rec.filename)els.imageFilename.value=rec.filename;if(rec.path)els.image.value=rec.path;
    els.downloadImage.disabled=false;els.clearDraftImage.disabled=false;
    const w=$('#imageRefreshWarning');if(w){w.classList.add('show');w.textContent='✓ 새 이미지가 브라우저에 임시저장되어 새로고침 후 복원되었습니다.'}
    els.saveMessage.textContent='새 이미지 임시편집본이 복원되었습니다. 온라인 저장 시 Supabase Storage에 자동 업로드됩니다.';
    return true;
  }

  function setStatus(text,type='normal'){
    els.dirty.textContent=text;
    els.dirty.className=`status ${type}`;
  }
  function setDirty(v=true){state.dirty=v;setStatus(v?'GitHub 반영 필요':'원본 상태',v?'dirty':'normal')}
  function current(){return state.articles.find(a=>a.id===state.selectedId)||null}
  function imageBg(src){els.preview.style.backgroundImage=`url("${src||DEFAULT_IMAGE}"),url("${DEFAULT_IMAGE}")`;els.preview.textContent=''}
  function resetImageFile(){if(state.imageObjectUrl)URL.revokeObjectURL(state.imageObjectUrl);state.imageObjectUrl=null;state.imageFile=null;els.imageInput.value='';els.downloadImage.disabled=true;els.clearDraftImage.disabled=true;const w=$('#imageRefreshWarning');if(w){w.classList.remove('show');w.textContent='새 이미지를 선택하면 브라우저에 임시저장되어 새로고침 후에도 복원됩니다.'}}

  const AUTO_CATEGORY='__auto__';
  const DOMESTIC_REGIONS=new Set(['seoul','busan','daegu','incheon','gwangju','daejeon','ulsan','sejong','gyeonggi','gangwon','chungbuk','chungnam','jeonbuk','jeonnam','gyeongbuk','gyeongnam','jeju']);
  function autoCategory(){
    const text=[els.title.value,els.subtitle.value,els.summary.value,els.content.value,els.tags.value].join(' ').toLowerCase();
    const rules=[
      ['무도·스포츠',['태권','무술','합기도','karate','taekwondo','martial art','championship','tournament','선수','스포츠','sports']],
      ['안전·드론',['드론','drone','uav','재난','소방','구조','rescue','안전','safety']],
      ['AI·혁신기술',['인공지능',' ai ','ai·','반도체','로봇','디지털','데이터센터','technology','artificial intelligence','semiconductor','robot','digital']],
      ['경제',['경제','투자','수출','수입','무역','통상','금융','시장','산업','기업','관세','investment','export','import','trade','finance','market','industry','business','tariff']],
      ['국제뉴스',['국제협력','국제 협력','외교','정상회담','양국','협약','파트너십','교류','mou','cooperation','partnership','bilateral','diplomatic','diplomacy','summit','international']],
      ['청소년·문화',['청소년','교육','문화','관광','축제','예술','학교','youth','education','culture','tourism','festival','art']],
      ['공익',['공익','봉사','기부','복지','취약계층','volunteer','donation','welfare','public interest']],
      ['사회',['사회','지역사회','주거','고용','노동','보건','community','housing','employment','labor','health']]
    ];
    let best='',score=0;
    for(const [cat,words] of rules){const n=words.reduce((sum,w)=>sum+(text.includes(w)?1:0),0);if(n>score){best=cat;score=n}}
    if(best)return best;
    const region=(document.querySelector('#fRegionCode')?.value||'').toLowerCase();
    return region&&!DOMESTIC_REGIONS.has(region)?'국제뉴스':'국내소식';
  }
  function formData(){
    const paragraphs=els.content.value.split(/\n\s*\n/).map(clean).filter(Boolean);
    return {id:clean(els.id.value)||makeId(els.date.value),title:clean(els.title.value),subtitle:clean(els.subtitle.value),date:els.date.value||today(),category:els.category.value===AUTO_CATEGORY?autoCategory():(els.category.value||'국내소식'),summary:clean(els.summary.value),image:clean(els.image.value)||DEFAULT_IMAGE,galleryImages:window.GN24GalleryAdmin?.value?.()||[],reporterId:clean(els.reporter?.value),author:clean(els.author.value)||'Global News24 편집부',sourceName:clean(els.sourceName.value)||'Global News24',sourceUrl:clean(els.sourceUrl.value),tags:els.tags.value.split(',').map(clean).filter(Boolean),content:paragraphs,featured:els.featured.checked,searchPriority:!!els.searchPriority?.checked,visualStyle:els.visualStyle.value||'normal',pinned:els.pinned.checked,visibilityScope:els.visibility?.value||'public',isPublished:els.visibility?els.visibility.value==='public':true,relatedOrgs:current()?.relatedOrgs||[],...(clean(els.caption.value)?{imageCaption:clean(els.caption.value)}:{})};
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

  async function clearDraft(){localStorage.removeItem(STORAGE_KEY);await clearAllDraftImages();if(els.draftInfo)els.draftInfo.textContent='임시편집본 없음'}

  function applyPending(p){
    if(!p)return;
    els.id.value=p.id||els.id.value;els.date.value=p.date||els.date.value;els.title.value=p.title||'';els.subtitle.value=p.subtitle||'';
    if(p.category){if(![...els.category.options].some(o=>o.value===p.category)){const o=document.createElement('option');o.value=o.textContent=p.category;els.category.append(o)}els.category.value=p.category}
    window.GN24GalleryAdmin?.load?.(p.galleryImages||[]);
    if(els.reporter)els.reporter.value=p.reporterId||'';els.author.value=p.author||'Global News24 편집부';els.summary.value=p.summary||'';els.image.value=p.image||DEFAULT_IMAGE;els.caption.value=p.imageCaption||'';els.content.value=(p.content||[]).join('\n\n');els.sourceName.value=p.sourceName||'';els.sourceUrl.value=p.sourceUrl||'';els.tags.value=(p.tags||[]).join(', ');els.featured.checked=!!p.featured;if(els.searchPriority)els.searchPriority.checked=!!p.searchPriority;els.pinned.checked=!!p.pinned;if(els.visibility)els.visibility.value=p.visibilityScope||(p.isPublished===false?'admin':'public');els.visualStyle.value=p.visualStyle||'normal';els.imageFilename.value=p._imageFilename||(p.image||'').split('/').pop()||'';imageBg(p.image||DEFAULT_IMAGE);
  }

  function select(id,opts={}){
    state.selectedId=id;resetImageFile();const a=current();if(!a)return;
    els.id.value=a.id||'';els.date.value=a.date||today();els.title.value=a.title||'';els.subtitle.value=a.subtitle||'';els.category.value=a.category||'국내소식';
    if(![...els.category.options].some(o=>o.value===(a.category||''))){const o=document.createElement('option');o.value=o.textContent=a.category||'뉴스';els.category.append(o);els.category.value=o.value}
    window.GN24GalleryAdmin?.load?.(a.galleryImages||[]);
    if(els.reporter)els.reporter.value=a.reporterId||'';els.author.value=a.author||'Global News24 편집부';els.summary.value=a.summary||'';els.image.value=a.image||'';els.caption.value=a.imageCaption||'';els.content.value=(Array.isArray(a.content)?a.content:(Array.isArray(a.body)?a.body:[])).join('\n\n');els.sourceName.value=a.sourceName||'';els.sourceUrl.value=a.sourceUrl||'';els.tags.value=(a.tags||[]).join(', ');els.featured.checked=!!a.featured;if(els.searchPriority)els.searchPriority.checked=!!a.searchPriority;els.pinned.checked=!!a.pinned;if(els.visibility)els.visibility.value=a.visibilityScope||(a.isPublished===false?'admin':'public');els.visualStyle.value=a.visualStyle||'normal';els.imageFilename.value=(a.image||'').split('/').pop()||`${ymd(a.date)}-news.jpg`;imageBg(a.image);$('#editorTitle').textContent=`기사 편집 · ${a.category||'뉴스'}`;if(!opts.keepMessage)els.saveMessage.textContent='편집 후 저장을 눌러주세요.';renderList();restoreDraftImage(id);
  }

  function renderList(){
    const q=clean(els.search.value).toLowerCase();
    const region=els.regionFilter?.value||'';
    const issue=els.issueFilter?.value||'';
    const imageCounts=new Map();
    state.articles.forEach(a=>{const img=clean(a.image);if(img&&img!==DEFAULT_IMAGE)imageCounts.set(img,(imageCounts.get(img)||0)+1)});
    if(els.regionFilter){
      const old=els.regionFilter.value;
      const codes=[...new Set(state.articles.map(a=>a.regionCode||'').filter(Boolean))].sort((a,b)=>regionLabel({regionCode:a}).localeCompare(regionLabel({regionCode:b}),'ko'));
      els.regionFilter.innerHTML='<option value="">전체 국가·지역판</option>'+codes.map(c=>`<option value="${c}">${regionLabel({regionCode:c})}</option>`).join('');
      if(codes.includes(old))els.regionFilter.value=old;
    }
    let data=[...state.articles];
    if(region)data=data.filter(a=>(a.regionCode||'')===region);
    if(q)data=data.filter(a=>(JSON.stringify(a)+' '+regionLabel(a)).toLowerCase().includes(q));
    if(issue==='duplicate_image')data=data.filter(a=>imageCounts.get(clean(a.image))>1);
    if(issue==='duplicate_content')data=data.filter(a=>state.duplicateContentIds.has(String(a.id)));
    if(issue==='no_tags')data=data.filter(a=>!Array.isArray(a.tags)||!a.tags.length);
    if(issue==='no_image')data=data.filter(a=>!clean(a.image)||a.image===DEFAULT_IMAGE);
    const sort=els.sortFilter?.value||'created_desc';
    data.sort((x,y)=>sort==='created_asc'?createdKey(x).localeCompare(createdKey(y)):sort==='updated_desc'?updatedKey(y).localeCompare(updatedKey(x)):createdKey(y).localeCompare(createdKey(x)));
    els.count.textContent=state.articles.length;els.listCount.textContent=`표시 ${data.length}건`;els.list.innerHTML='';
    if(!data.length){els.list.innerHTML='<div class="empty">조건에 맞는 기사가 없습니다.</div>';return}
    for(const a of data){
      const dup=imageCounts.get(clean(a.image))>1;
      const noTags=!Array.isArray(a.tags)||!a.tags.length;
      const b=document.createElement('button');b.type='button';b.className='article-item'+(a.id===state.selectedId?' active':'');
      b.innerHTML='<span class="article-edition"></span><b></b><small><span></span><span></span></small><span class="article-warnings"></span>';
      b.querySelector('.article-edition').textContent='🌐 '+regionLabel(a);
      b.querySelector('b').textContent=a.title||'(제목 없음)';
      b.querySelectorAll('small span')[0].textContent=a.date||'';
      b.querySelectorAll('small span')[1].textContent=a.category||'뉴스';
      const exactDup=state.duplicateContentIds.has(String(a.id));
      const warnings=[];if(dup)warnings.push('⚠ 같은 경로');if(exactDup)warnings.push('⚠ 실제 사진 중복');if(noTags)warnings.push('⚠ 태그 없음');
      b.querySelector('.article-warnings').textContent=warnings.join(' · ');
      b.onclick=()=>{select(a.id);scheduleDraft()};els.list.append(b);
    }
  }

  async function scanDuplicateImageContent(){
    const btn=$('#scanDuplicateImagesBtn'), status=$('#duplicateImageScanStatus');
    const candidates=state.articles.filter(a=>clean(a.image)&&a.image!==DEFAULT_IMAGE);
    if(!candidates.length){if(status)status.textContent='검사할 대표이미지가 없습니다.';return;}
    if(btn)btn.disabled=true;
    if(status)status.textContent=`대표이미지 ${candidates.length}건 검사 중…`;
    state.duplicateContentIds=new Set();state.duplicateContentGroups=new Map();
    const groups=new Map();
    let done=0;
    const signature=async a=>{
      const url=clean(a.image);
      try{
        const r=await fetch(url,{method:'HEAD',cache:'no-store'});
        const etag=(r.headers.get('etag')||'').replace(/"/g,'').trim();
        const len=r.headers.get('content-length')||'';
        const type=r.headers.get('content-type')||'';
        if(etag)return 'etag:'+etag;
        if(len)return 'len:'+len+'|'+type;
      }catch(e){}
      return 'url:'+url;
    };
    const queue=[...candidates];
    const workers=Array.from({length:6},async()=>{
      while(queue.length){
        const a=queue.shift();const sig=await signature(a);
        if(!groups.has(sig))groups.set(sig,[]);
        groups.get(sig).push(a);
        done++;if(status)status.textContent=`대표이미지 검사 중… ${done}/${candidates.length}`;
      }
    });
    await Promise.all(workers);
    const dupGroups=[...groups.entries()].filter(([sig,arr])=>arr.length>1&&!sig.startsWith('url:'));
    dupGroups.forEach(([sig,arr])=>{state.duplicateContentGroups.set(sig,arr.map(a=>a.id));arr.forEach(a=>state.duplicateContentIds.add(String(a.id)))});
    renderList();
    if(els.issueFilter && state.duplicateContentIds.size){els.issueFilter.value='duplicate_content';renderList();}
    if(status)status.textContent=state.duplicateContentIds.size
      ? `✓ 실제 같은 사진 ${state.duplicateContentIds.size}건 · ${dupGroups.length}그룹 발견 — 목록에 표시했습니다.`
      : '✓ 실제 중복 사진을 찾지 못했습니다.';
    if(btn)btn.disabled=false;
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

  function newArticle(){const d=today(),id=makeId(d);state.articles.unshift({id,title:'',subtitle:'',date:d,category:AUTO_CATEGORY,summary:'',image:DEFAULT_IMAGE,reporterId:'',author:'Global News24 편집부',sourceName:'Global News24',sourceUrl:'',tags:[],content:[],featured:false,searchPriority:false,pinned:false,visualStyle:'normal',visibilityScope:'public',isPublished:true,relatedOrgs:[]});state.selectedId=id;setDirty(true);select(id);els.title.focus();els.saveMessage.textContent='새 기사를 작성하세요. 입력 내용은 자동 임시저장됩니다.';saveDraft('manual')}

  function saveCurrent(e){e?.preventDefault();const a=formData();if(!a.title){alert('기사 제목을 입력해 주세요.');els.title.focus();return false}const oldId=state.selectedId;const idx=state.articles.findIndex(x=>x.id===oldId);if(idx<0)state.articles.push(a);else state.articles[idx]=a;state.selectedId=a.id;setDirty(true);renderList();saveDraft('manual');els.saveMessage.textContent='현재 기사가 편집본에 저장되었습니다. 새로고침해도 유지됩니다.';setStatus('편집본 저장됨 · GitHub 반영 필요','dirty');return true}

  function deleteCurrent(){const a=current();if(!a)return;if(!confirm(`이 기사를 편집본에서 삭제할까요?\n\n${a.title||a.id}`))return;deleteDraftImage(a.id);state.articles=state.articles.filter(x=>x.id!==a.id);state.selectedId=sortArticles(state.articles)[0]?.id||null;setDirty(true);renderList();if(state.selectedId)select(state.selectedId);else newArticle();saveDraft('manual');setStatus('삭제 편집본 저장됨 · GitHub 반영 필요','dirty')}
  function duplicate(){const a=current();if(!a)return;const c=clone(a);c.id=makeId(c.date||today());c.title=`${c.title} (복사본)`;c.pinned=false;state.articles.unshift(c);state.selectedId=c.id;setDirty(true);select(c.id);saveDraft('manual');setStatus('복제 편집본 저장됨 · GitHub 반영 필요','dirty')}
  function downloadBlob(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000)}
  function exportJSON(){if(state.selectedId&&!saveCurrent())return;const out=sortArticles(state.articles);downloadBlob(new Blob([JSON.stringify(out,null,2)+'\n'],{type:'application/json;charset=utf-8'}),'news.json');els.saveMessage.textContent='news.json을 내려받았습니다. GitHub data/news.json에 교체 업로드하세요.';setStatus('news.json 다운로드 완료 · GitHub 업로드 필요','dirty')}
  async function importJSON(file){const txt=await file.text();const data=JSON.parse(txt);if(!Array.isArray(data))throw new Error('기사 배열 형식이 아닙니다.');state.articles=data;state.selectedId=sortArticles(data)[0]?.id||null;setDirty(true);renderList();if(state.selectedId)select(state.selectedId);saveDraft('manual');setStatus('불러온 편집본 임시저장됨','saved')}

  async function chooseImage(file){resetImageFile();if(!file)return;state.imageFile=file;state.imageObjectUrl=URL.createObjectURL(file);imageBg(state.imageObjectUrl);const ext=(file.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'')||'jpg';const base=`${ymd(els.date.value||today())}-news-${String(Date.now()).slice(-4)}.${ext}`;const path=`/assets/images/news/${base}`;els.imageFilename.value=base;els.image.value=path;els.downloadImage.disabled=false;els.clearDraftImage.disabled=false;els.caption.focus();const w=$('#imageRefreshWarning');if(w){w.classList.add('show');w.textContent='✓ 새 이미지가 브라우저에 임시저장되었습니다. 새로고침해도 복원됩니다.'}try{await putDraftImage(state.selectedId,file,base,path)}catch(err){console.warn(err);if(w)w.textContent='⚠ 이미지 임시저장에 실패했습니다. 새로고침 전에 이미지 파일을 내려받아 주세요.'}els.saveMessage.textContent='새 이미지가 선택되고 임시저장되었습니다. 온라인 저장 시 Supabase Storage에 자동 업로드됩니다.';setDirty(true);scheduleDraft()}
  function downloadImage(){if(!state.imageFile)return;const name=clean(els.imageFilename.value)||state.imageFile.name;downloadBlob(state.imageFile,name);els.saveMessage.textContent='이미지 파일을 내려받았습니다. GitHub assets/images/news/에 업로드하세요.'}

  async function clearDraftImage(){
    const id=state.selectedId;if(!id)return;
    await deleteDraftImage(id);resetImageFile();const a=current();const src=(a&&a.image)||clean(els.image.value)||DEFAULT_IMAGE;els.image.value=src;els.imageFilename.value=(src||'').split('/').pop()||'';imageBg(src);els.saveMessage.textContent='새 임시 이미지를 취소하고 기사에 저장된 기존 이미지로 돌아왔습니다.';scheduleDraft();
  }

  async function resetToSite(){
    if(!confirm('브라우저의 임시편집본을 모두 삭제하고 사이트의 현재 news.json 원본으로 돌아갈까요?'))return;
    await clearDraft();state.dirty=false;state.restored=false;resetImageFile();await loadSite({ignoreDraft:true});els.saveMessage.textContent='임시편집본을 초기화하고 사이트 원본을 다시 불러왔습니다.';
  }

  $('#scanDuplicateImagesBtn')?.addEventListener('click',()=>scanDuplicateImageContent().catch(e=>{const s=$('#duplicateImageScanStatus');if(s)s.textContent='검사 실패: '+e.message;const b=$('#scanDuplicateImagesBtn');if(b)b.disabled=false;}));$('#newBtn').onclick=newArticle;$('#exportBtn').onclick=exportJSON;$('#deleteBtn').onclick=deleteCurrent;$('#duplicateBtn').onclick=duplicate;$('#restoreBtn').onclick=()=>resetToSite().catch(e=>alert(e.message));els.search.oninput=renderList;[els.regionFilter,els.sortFilter,els.issueFilter].forEach(x=>x&&x.addEventListener('change',renderList));els.form.onsubmit=saveCurrent;els.importInput=$('#importInput');els.importInput.onchange=async e=>{try{if(e.target.files[0])await importJSON(e.target.files[0])}catch(err){alert('불러오기 실패: '+err.message)}finally{e.target.value=''}};els.imageInput.onchange=e=>chooseImage(e.target.files[0]);els.downloadImage.onclick=downloadImage;els.clearDraftImage.onclick=()=>clearDraftImage();
  els.form.addEventListener('input',e=>{if(e.target.id==='imageInput')return;setDirty(true);els.saveMessage.textContent='입력 내용이 자동 임시저장됩니다.';if(!state.imageFile&&e.target.id==='fImage')imageBg(clean(els.image.value));scheduleDraft()});
  els.form.addEventListener('change',e=>{if(e.target.id==='imageInput')return;setDirty(true);scheduleDraft()});
  window.addEventListener('beforeunload',e=>{if(state.imageFile){e.preventDefault();e.returnValue=''}});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&state.dirty)saveDraft('auto')});


  function normalizeDbArticle(x){
    const content = Array.isArray(x.content)
      ? x.content
      : String(x.content||'').split(/\n\s*\n/).map(clean).filter(Boolean);
    return {
      id:x.id||'', title:x.title||'', subtitle:x.subtitle||'', date:x.date||today(),
      category:x.category||'국내소식', summary:x.summary||'', image:x.image||DEFAULT_IMAGE,
      reporterId:x.reporter_id||x.reporterId||'',
      author:x.author||'Global News24 편집부',
      sourceName:x.source_name||x.sourceName||'',
      sourceUrl:x.source_url||x.sourceUrl||'',
      tags:Array.isArray(x.tags)?x.tags:[],
      content,
      featured:!!x.featured,
      searchPriority:!!(x.search_priority??x.searchPriority),
      pinned:!!x.pinned,
      visualStyle:x.visual_style||x.visualStyle||'normal',
      visibilityScope:x.visibility_scope||x.visibilityScope||(x.is_published===false?'admin':'public'),
      isPublished:x.is_published!==false,
      relatedOrgs:Array.isArray(x.related_orgs)?x.related_orgs:(Array.isArray(x.relatedOrgs)?x.relatedOrgs:[]),
      galleryImages:Array.isArray(x.gallery_images)?x.gallery_images:(Array.isArray(x.galleryImages)?x.galleryImages:[]),
      ...(x.image_caption?{imageCaption:x.image_caption}:{}),
      ...(x.link_label?{linkLabel:x.link_label}:{}),
      ...(x.link_url?{linkUrl:x.link_url}:{}),
      regionCode:x.region_code||x.regionCode||'',
      createdAt:x.created_at||x.createdAt||'',
      updatedAt:x.updated_at||x.updatedAt||''
    };
  }

  async function replaceWithDbArticles(rows){
    if(!Array.isArray(rows))throw new Error('DB 기사 형식이 올바르지 않습니다.');
    localStorage.removeItem(STORAGE_KEY);
    state.articles=rows.map(normalizeDbArticle);
    state.selectedId=sortArticles(state.articles)[0]?.id||null;
    state.dirty=false;
    state.restored=false;
    renderList();
    if(state.selectedId)select(state.selectedId);
    setStatus(`Supabase DB 원본 · ${state.articles.length}건`,'normal');
    if(els.draftInfo)els.draftInfo.textContent='Supabase DB에서 불러옴';
    els.saveMessage.textContent=`Supabase에서 기사 ${state.articles.length}건을 불러왔습니다.`;
  }

  async function getPendingImage(){
    if(state.imageFile){
      return {articleId:state.selectedId,file:state.imageFile,filename:clean(els.imageFilename.value)||state.imageFile.name||'news-image.jpg'};
    }
    const rec=await getDraftImage(state.selectedId);
    if(rec?.file){
      return {articleId:state.selectedId,file:rec.file,filename:rec.filename||rec.file.name||'news-image.jpg'};
    }
    return null;
  }

  async function markImageUploaded(publicUrl){
    if(!publicUrl)return;
    const id=state.selectedId;
    els.image.value=publicUrl;
    imageBg(publicUrl);
    const a=current();
    if(a)a.image=publicUrl;
    await deleteDraftImage(id);
    resetImageFile();
    if(els.imageFilename)els.imageFilename.value=(publicUrl.split('/').pop()||'').split('?')[0];
    saveDraft('manual');
    els.saveMessage.textContent='대표이미지가 Supabase Storage에 업로드되고 기사에 연결되었습니다.';
  }

  function syncSavedArticle(row){
    if(!row)return;
    const a=normalizeDbArticle(row);
    const oldId=state.selectedId;
    let idx=state.articles.findIndex(x=>x.id===a.id);
    if(idx<0 && oldId) idx=state.articles.findIndex(x=>x.id===oldId);
    if(idx<0) state.articles.unshift(a);
    else state.articles[idx]=a;
    state.selectedId=a.id;
    state.dirty=false;
    state.restored=false;
    renderList();
    select(a.id,{keepMessage:true});
    saveDraft('manual');
    setStatus('온라인 저장 완료 · 목록 자동갱신','saved');
    if(els.draftInfo)els.draftInfo.textContent='Supabase 저장 내용 반영됨';
    els.saveMessage.textContent='온라인 저장 내용이 왼쪽 기사 목록에도 즉시 반영되었습니다.';
  }

  window.GN24Admin = {
    loadDbArticles: replaceWithDbArticles,
    getSelectedId: ()=>state.selectedId,
    getPendingImage,
    markImageUploaded,
    syncSavedArticle,
    autoCategory
  };

  loadSite().catch(err=>{els.list.innerHTML=`<div class="empty">${err.message}<br>상단의 news.json 불러오기를 이용해 주세요.</div>`;newArticle()});
})();
