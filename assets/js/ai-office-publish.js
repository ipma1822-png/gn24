(()=>{
'use strict';
const PACKAGE_KEY='gn24-ai-office-publish-package-v1';
const RECEIPTS_KEY='gn24-ai-office-publish-receipts-v1';
const DEFAULT_IMAGE='/assets/images/news/gn24-default-news.svg';
const OFFICIAL_LOGO='/assets/images/logos/gn24-showroom-logo.jpg';
const LOGO_SOURCE='assets/images/logos/gn24-showroom-logo.jpg';
const BRAND_SPEC_VERSION='GN24-IMAGE-BRAND-v1';
const LOGO_SCALE=.18;
const LOGO_MARGIN=.03;
const WIDTH=1600;
const HEIGHT=900;
const STATUS={PENDING:'IMAGE_PENDING',READY:'IMAGE_READY',REVIEW:'IMAGE_REVIEW',ERROR:'IMAGE_ERROR',PUBLISHED:'IMAGE_PUBLISHED'};
const STATUS_LABEL={[STATUS.PENDING]:'대표이미지 준비 중',[STATUS.READY]:'대표이미지 정상',[STATUS.REVIEW]:'대표이미지 확인 필요',[STATUS.ERROR]:'대표이미지 처리 실패',[STATUS.PUBLISHED]:'발행 이미지 확정'};
const AI_OFFICE='https://ipma1822-png.github.io/ai-office/';
const cfg=window.GN24_SUPABASE||{};
const auth=window.GN24_REPORTER_AUTH;
const $=id=>document.getElementById(id);
let pkg=null,sb=null,session=null,adminOK=false;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
function decodeB64url(v){let s=String(v||'').replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';const bin=atob(s),bytes=Uint8Array.from(bin,c=>c.charCodeAt(0));return JSON.parse(new TextDecoder().decode(bytes))}
function b64url(obj){const bytes=new TextEncoder().encode(JSON.stringify(obj));let bin='';bytes.forEach(b=>bin+=String.fromCharCode(b));return btoa(bin).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function savePackage(){if(pkg)localStorage.setItem(PACKAGE_KEY,JSON.stringify(pkg))}
function readPackage(){const p=new URLSearchParams(location.hash.slice(1)),raw=p.get('package');if(raw){try{const x=decodeB64url(raw);localStorage.setItem(PACKAGE_KEY,JSON.stringify(x));history.replaceState(null,'',location.pathname+location.search);return x}catch(e){console.error(e)}}try{return JSON.parse(localStorage.getItem(PACKAGE_KEY)||'null')}catch(_){return null}}
function valid(x){return !!(x&&x.origin==='AI OFFICE'&&x.bridgeVersion==='3.5.0'&&x.articleId&&x.title&&x.summary&&['ready','handoff'].includes(String(x.status||'ready')))}
function brandContractValid(){return !!(pkg&&pkg.brandLogoLocked===true&&pkg.brandSpecVersion===BRAND_SPEC_VERSION&&pkg.imageWorkflow==='generate-clean-image-then-compose-official-logo'&&pkg.imageTextPolicy==='no-text'&&pkg.brandLogoPosition==='top-left')}
function metadataReady(x=pkg){return !!(x&&/^https:\/\//i.test(String(x.finalImageUrl||''))&&x.imageStatus===STATUS.READY&&x.logoApplied===true&&x.logoSource===LOGO_SOURCE&&Number(x.imageWidth)===WIDTH&&Number(x.imageHeight)===HEIGHT)}
function seoulYmd(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}
function category(v){const s=String(v||'').trim();if(/국제|세계/.test(s))return'국제뉴스';if(/안전|구조|재난/.test(s))return'안전·구조';if(/무도|스포츠|태권/.test(s))return'무도·스포츠';return'국내소식'}
function tags(v){return Array.isArray(v)?v:String(v||'').split(',').map(x=>x.trim()).filter(Boolean)}
function ensureId(){if(pkg.gn24ArticleId)return pkg.gn24ArticleId;const d=seoulYmd().replace(/-/g,''),suffix=String(pkg.articleId).replace(/^article-/,'').replace(/[^a-zA-Z0-9]/g,'').slice(-10)||String(Date.now()).slice(-6);pkg.gn24ArticleId=`gn24-${d}-ai-${suffix}`;savePackage();return pkg.gn24ArticleId}
function sourceCandidate(){const v=String(pkg?.sourceImageUrl||'').trim();return /^https:\/\//i.test(v)?v:DEFAULT_IMAGE}
function setMsg(t,ok=false){const m=$('msg');m.textContent=t;m.className='msg'+(ok?' ok':'')}
function setImageState(status,error=''){pkg.imageStatus=status;pkg.imageError=error;savePackage()}
function imageReceipt(){return {origin:'GN24',status:'image_ready',aiArticleId:pkg.articleId,sourceImageUrl:pkg.sourceImageUrl||'',finalImageUrl:pkg.finalImageUrl||'',logoApplied:pkg.logoApplied===true,logoSource:pkg.logoSource||'',imageWidth:pkg.imageWidth||null,imageHeight:pkg.imageHeight||null,imageCheckedAt:pkg.imageCheckedAt||null,brandSpecVersion:BRAND_SPEC_VERSION}}
function aiOfficeImageReturn(){return AI_OFFICE+'#gn24ImageReceipt='+b64url(imageReceipt())}
function ensureImageBoard(){
  let b=$('smartImageGate');
  if(b)return b;
  b=document.createElement('section');
  b.id='smartImageGate';
  b.style.cssText='margin-top:16px;padding:16px;border:1px solid rgba(231,191,99,.34);border-radius:15px;background:rgba(231,191,99,.055)';
  b.innerHTML='<b style="display:block;color:#f1d68f">SMART IMAGE SAFETY GATE v1.1</b><div id="smartImageStatus" style="margin-top:7px;color:#c8d5e6"></div><label style="display:block;margin-top:12px;color:#9db0c6;font-size:12px">순수 대표이미지 URL · sourceImageUrl<input id="sourceImageInput" type="url" inputmode="url" style="display:block;width:100%;margin-top:6px;padding:11px;border:1px solid rgba(148,163,184,.3);border-radius:10px;background:#071525;color:#fff"></label><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:11px"><button id="prepareImage" type="button">대표이미지 만들기</button><button id="verifyImage" type="button">이미지 확인</button><button id="useManualImage" type="button">수동 이미지 사용</button><a id="returnImageResult" class="hidden" href="#">AI OFFICE에서 최종이미지 확인</a></div><div id="imageGateNotice" style="margin-top:11px;color:#ffd27a;white-space:pre-wrap"></div>';
  b.querySelectorAll('button,a').forEach(x=>x.style.cssText='border:1px solid rgba(148,163,184,.3);border-radius:10px;padding:10px 12px;background:rgba(255,255,255,.06);color:#fff;font-weight:850;text-decoration:none;cursor:pointer');
  $('article')?.insertAdjacentElement('afterend',b);
  $('prepareImage').addEventListener('click',()=>prepareImage(metadataReady()));
  $('verifyImage').addEventListener('click',verifyFromButton);
  $('useManualImage').addEventListener('click',useManualImage);
  return b;
}
function renderImageBoard(){
  ensureImageBoard();
  const status=STATUS_LABEL[pkg.imageStatus]||STATUS_LABEL[STATUS.REVIEW],ready=metadataReady();
  $('smartImageStatus').textContent=`${status} · sourceImage와 finalImage를 분리 보존합니다.`;
  $('smartImageStatus').style.color=ready?'#8ce6ae':pkg.imageStatus===STATUS.ERROR?'#ff9c9c':'#ffd27a';
  $('sourceImageInput').value=pkg.sourceImageUrl||'';
  $('prepareImage').textContent=ready?'대표이미지 다시 만들기':'대표이미지 만들기';
  $('imageGateNotice').textContent=ready?'최종 발행 이미지 준비 완료 · 공식 원본 로고 적용 · 1600 × 900':pkg.imageError||'대표이미지 확인이 필요합니다.\n기사와 승인 내용은 안전하게 저장되어 있습니다.\n대표이미지를 준비한 후 공개발행해 주세요.';
  const link=$('returnImageResult');
  link.classList.toggle('hidden',!ready);
  if(ready)link.href=aiOfficeImageReturn();
}
function render(){
  const box=$('article');
  if(!valid(pkg)){box.innerHTML='<p>유효한 AI OFFICE 발행 패키지가 없습니다. AI OFFICE 기사 제작실에서 다시 발행 연결을 시작해 주세요.</p>';return}
  const imageUrl=metadataReady()?pkg.finalImageUrl:sourceCandidate(),delivered=!!String(pkg.sourceImageUrl||'').trim();
  box.innerHTML=`<h2>${esc(pkg.title)}</h2>${pkg.subtitle?`<h3>${esc(pkg.subtitle)}</h3>`:''}<div class="meta"><span>${esc(category(pkg.category))}</span>${tags(pkg.tags).map(t=>`<span>#${esc(t)}</span>`).join('')}</div><div class="summary">${esc(pkg.summary)}</div><div class="image"><img id="reviewImage" src="${esc(imageUrl)}" alt="기사 대표 이미지"></div><div id="imageState" class="image-note">${metadataReady()?'최종 발행 이미지 · 공식 로고 적용 완료':delivered?'순수 원본 이미지 · 아직 공개발행용 이미지가 아닙니다.':'순수 원본 이미지가 없어 기본 이미지를 준비 대상으로 사용합니다.'}</div><div class="caption">사진 설명 · ${esc(pkg.photoCaption||'등록된 사진 설명 없음')}</div><div class="body">${esc(pkg.body||pkg.summary)}</div><div class="sources">출처·사실확인 근거\n${esc(pkg.sources||'AI OFFICE 최종 승인 자료')}</div>`;
  const img=$('reviewImage');
  img?.addEventListener('error',()=>{if(!metadataReady()){setImageState(STATUS.ERROR,'순수 대표이미지를 불러오지 못했습니다.');renderImageBoard()}else{setImageState(STATUS.REVIEW,'최종 대표이미지를 표시할 수 없습니다.');renderImageBoard()}},{once:true});
  renderImageBoard();
}
async function loadBitmap(url){
  const r=await fetch(url,{mode:'cors',credentials:'omit',cache:'no-store'});
  if(!r.ok)throw new Error('이미지 응답 오류 '+r.status);
  const type=String(r.headers.get('content-type')||'').toLowerCase(),blob=await r.blob();
  if(!type.startsWith('image/')&&!blob.type.startsWith('image/'))throw new Error('이미지 형식이 아닙니다.');
  if(!blob.size)throw new Error('빈 이미지 파일입니다.');
  return {bitmap:await createImageBitmap(blob),size:blob.size,type:type||blob.type};
}
function drawCover(ctx,img,w,h){const scale=Math.max(w/img.width,h/img.height),sw=w/scale,sh=h/scale,sx=(img.width-sw)/2,sy=(img.height-sh)/2;ctx.drawImage(img,sx,sy,sw,sh,0,0,w,h)}
async function verifyFinalUrl(url){
  if(!/^https:\/\//i.test(String(url||'')))throw new Error('finalImageUrl이 없습니다.');
  const out=await loadBitmap(url);
  const width=out.bitmap.width,height=out.bitmap.height;
  out.bitmap.close?.();
  if(width!==WIDTH||height!==HEIGHT)throw new Error(`이미지 크기가 ${WIDTH} × ${HEIGHT}이 아닙니다.`);
  return {width,height,size:out.size,type:out.type};
}
async function composeBlob(source){
  const [photoData,logoData]=await Promise.all([loadBitmap(source),loadBitmap(OFFICIAL_LOGO)]);
  const photo=photoData.bitmap,logo=logoData.bitmap,canvas=document.createElement('canvas');
  canvas.width=WIDTH;canvas.height=HEIGHT;
  const ctx=canvas.getContext('2d',{alpha:false});
  ctx.fillStyle='#07101c';ctx.fillRect(0,0,WIDTH,HEIGHT);drawCover(ctx,photo,WIDTH,HEIGHT);
  const logoWidth=Math.round(WIDTH*LOGO_SCALE),logoHeight=Math.round(logoWidth*(logo.height/logo.width)),margin=Math.round(WIDTH*LOGO_MARGIN);
  ctx.drawImage(logo,margin,margin,logoWidth,logoHeight);
  photo.close?.();logo.close?.();
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.9));
  if(!blob||!blob.size)throw new Error('로고 합성 이미지 생성에 실패했습니다.');
  return blob;
}
async function prepareImage(force){
  if(!adminOK)return setMsg('대표이미지 저장을 위해 GN24 관리자 인증이 필요합니다.');
  if(metadataReady()&&!force&&pkg.preparedForSource===pkg.sourceImageUrl){renderImageBoard();return setMsg('기존 정상 대표이미지를 그대로 사용합니다.',true)}
  const old={finalImageUrl:pkg.finalImageUrl,imageStatus:pkg.imageStatus,logoApplied:pkg.logoApplied,logoSource:pkg.logoSource,imageWidth:pkg.imageWidth,imageHeight:pkg.imageHeight,imageCheckedAt:pkg.imageCheckedAt,preparedForSource:pkg.preparedForSource};
  const source=String($('sourceImageInput')?.value||pkg.sourceImageUrl||'').trim();
  if(source&&!/^https:\/\//i.test(source))return setMsg('HTTPS 순수 이미지 URL을 확인해 주세요.');
  pkg.sourceImageUrl=source;setImageState(STATUS.PENDING,'');renderImageBoard();setMsg('순수 이미지에 공식 GN24 로고를 합성하고 있습니다…');
  try{
    const actualSource=source||DEFAULT_IMAGE,blob=await composeBlob(actualSource),d=seoulYmd().split('-'),safe=ensureId().replace(/[^a-zA-Z0-9_-]/g,'-'),stamp=Date.now(),path=`ai-office/${d[0]}/${d[1]}/${safe}-${stamp}-gn24.jpg`;
    const {error}=await sb.storage.from(cfg.bucket||'news-images').upload(path,blob,{upsert:false,contentType:'image/jpeg',cacheControl:'31536000'});
    if(error)throw error;
    const {data}=sb.storage.from(cfg.bucket||'news-images').getPublicUrl(path),url=data?.publicUrl||'';
    const checked=await verifyFinalUrl(url);
    Object.assign(pkg,{sourceImageUrl:source,preparedForSource:source,finalImageUrl:url,imageUrl:url,imageStatus:STATUS.READY,imageReady:true,logoApplied:true,logoSource:LOGO_SOURCE,imageWidth:checked.width,imageHeight:checked.height,imageBytes:checked.size,imageContentType:checked.type,imageCheckedAt:new Date().toISOString(),imageError:'',brandSpecVersion:BRAND_SPEC_VERSION});
    savePackage();render();setMsg('대표이미지 준비 완료 · 공식 로고와 공개 URL 검증을 통과했습니다.',true);
  }catch(e){
    console.error(e);
    Object.assign(pkg,old);
    if(!metadataReady())Object.assign(pkg,{imageStatus:STATUS.ERROR,imageReady:false,imageError:String(e?.message||e)});
    savePackage();render();setMsg('대표이미지 처리 실패 · 기사와 승인 내용은 그대로 보존되었습니다. 실제 공개발행만 차단됩니다.');
  }
}
async function verifyFromButton(){try{const checked=await verifyFinalUrl(pkg.finalImageUrl);if(!metadataReady())throw new Error('공식 로고 적용 기록 또는 이미지 상태가 준비되지 않았습니다.');pkg.imageCheckedAt=new Date().toISOString();pkg.imageBytes=checked.size;pkg.imageContentType=checked.type;savePackage();renderImageBoard();setMsg('최종 대표이미지 접근·형식·크기·로고 기록 확인 완료',true)}catch(e){setImageState(STATUS.REVIEW,String(e?.message||e));renderImageBoard();setMsg('대표이미지 확인이 필요합니다. 기사와 승인 내용은 안전하게 저장되어 있습니다.')}}
function useManualImage(){const value=String($('sourceImageInput')?.value||'').trim();if(!/^https:\/\//i.test(value))return setMsg('HTTPS 수동 이미지 URL을 입력해 주세요.');pkg.sourceImageUrl=value;if(!metadataReady())setImageState(STATUS.REVIEW,'수동 원본 이미지에 공식 로고 합성이 필요합니다.');savePackage();render();setMsg('수동 원본 이미지를 보존했습니다. “대표이미지 만들기”를 눌러 공식 로고를 적용해 주세요.',true)}
async function finalImageGate(){
  if(!metadataReady())throw new Error('최종 대표이미지 또는 공식 로고 적용 기록이 준비되지 않았습니다.');
  const checked=await verifyFinalUrl(pkg.finalImageUrl);
  if(!String(checked.type||'').startsWith('image/'))throw new Error('최종 URL이 이미지 형식이 아닙니다.');
  if(!checked.size)throw new Error('최종 이미지가 비어 있습니다.');
  return checked;
}
function ensureSafetyBoard(){let b=$('safetyBoard');if(b)return b;b=document.createElement('section');b.id='safetyBoard';b.style.cssText='display:none;margin-top:18px;padding:16px;border:1px solid rgba(88,166,255,.35);border-radius:15px;background:rgba(88,166,255,.06)';const a=$('actions');(a?.parentElement||document.querySelector('.card'))?.insertBefore(b,a||$('msg'));return b}
function showSafetyBoard(items){const b=ensureSafetyBoard(),pass=items.filter(x=>x.state==='pass').length,warn=items.filter(x=>x.state==='warn').length,fail=items.filter(x=>x.state==='fail').length;b.style.display='block';b.innerHTML=`<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:12px"><div><b style="font-size:16px">GN24 발행 전 안전점검</b><div style="margin-top:4px;color:#9db0c6;font-size:12px">실제 기사 DB 변경 없음 · 점검 결과만 표시</div></div><div style="font-size:12px;color:#c7d8ec">정상 ${pass} · 확인 ${warn} · 실패 ${fail}</div></div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:8px">${items.map(x=>{const c=x.state==='pass'?'#8ce6ae':x.state==='warn'?'#ffd27a':'#ff9c9c',icon=x.state==='pass'?'✓':x.state==='warn'?'△':'✕';return`<div style="padding:10px 11px;border:1px solid rgba(148,163,184,.18);border-radius:11px;background:rgba(255,255,255,.025)"><b style="color:${c}">${icon} ${esc(x.label)}</b><div style="margin-top:4px;color:#aebed1;font-size:12px;line-height:1.45">${esc(x.detail||'')}</div></div>`}).join('')}</div>`}
async function setupAuth(){if(!(cfg.url&&cfg.anonKey&&window.supabase&&auth)){setMsg('Global News24 인증 설정을 불러오지 못했습니다.');return}sb=window.supabase.createClient(cfg.url,cfg.anonKey,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});session=await auth.ensureSession();if(!session){$('login').classList.remove('hidden');setMsg('Global News24 관리자 인증이 필요합니다.');return}const {error}=await sb.auth.setSession({access_token:session.access_token,refresh_token:session.refresh_token||''});if(error){setMsg('관리자 세션 연결 실패: '+error.message);return}const {data,error:rpcError}=await sb.rpc('is_gn24_admin');adminOK=!rpcError&&data===true;if(!adminOK){setMsg('현재 로그인 계정은 Global News24 관리자 권한이 없습니다.');return}$('login').classList.add('hidden');$('actions').classList.remove('hidden');setMsg('Global News24 관리자 인증 완료',true);renderImageBoard()}
async function kakao(){if(!sb)sb=window.supabase.createClient(cfg.url,cfg.anonKey);savePackage();const redirectTo='https://news24.ai.kr/pages/ai-office-publish/';const {data,error}=await sb.auth.signInWithOAuth({provider:'kakao',options:{redirectTo,skipBrowserRedirect:true}});if(error||!data?.url)return setMsg('카카오 인증 시작 실패: '+(error?.message||'인증 주소 없음'));location.assign(data.url)}
async function dryRun(){
  if(!adminOK||!valid(pkg))return setMsg('관리자 인증과 유효한 발행 패키지가 필요합니다.');
  const b=$('dryRun');if(b)b.disabled=true;setMsg('안전 테스트 중… 실제 기사 DB는 변경하지 않습니다.');
  try{
    const {error,count}=await sb.from('gn24_articles').select('id',{count:'exact',head:true});if(error)throw error;
    let imageOK=false,imageDetail='최종 대표이미지 확인 필요';try{await finalImageGate();imageOK=true;imageDetail='접근·형식·1600 × 900·공식 로고 기록 정상'}catch(e){imageDetail=String(e?.message||e)}
    const checks=[['AI OFFICE 승인 패키지',valid(pkg)],['기사 제목',!!String(pkg.title||'').trim()],['기사 요약',!!String(pkg.summary||'').trim()],['기사 본문',!!String(pkg.body||pkg.summary||'').trim()],['GN24 FINAL IMAGE GATE',imageOK],['관리자 권한',adminOK],['GN24 DB 연결',Number.isFinite(count)||count===null]];
    const items=checks.map(x=>({label:x[0],state:x[1]?'pass':'fail',detail:x[0]==='GN24 FINAL IMAGE GATE'?imageDetail:(x[1]?'확인 완료':'확인 필요')}));
    items.push({label:'출처·사실확인',state:String(pkg.sources||'').trim()?'pass':'warn',detail:String(pkg.sources||'').trim()?'근거 자료 전달 확인':'출처 필드 비어 있음'});
    showSafetyBoard(items);
    if(checks.some(x=>!x[1]))throw new Error('필수 항목 확인 필요');
    setMsg('안전 테스트 통과 · 실제 발행 0건',true);
  }catch(e){setMsg('안전 테스트 실패: '+(e?.message||e))}finally{if(b)b.disabled=false}
}
async function publish(){
  if(!adminOK||!valid(pkg))return;
  const button=$('publish');button.disabled=true;setMsg('GN24 FINAL IMAGE GATE 확인 중…');
  try{await finalImageGate()}catch(e){button.disabled=false;setImageState(STATUS.REVIEW,String(e?.message||e));renderImageBoard();return setMsg('대표이미지 확인이 필요합니다. 기사와 승인 내용은 안전하게 저장되어 있습니다. 대표이미지를 다시 만들거나 확인한 후 발행해 주세요.')}
  const id=ensureId(),now=new Date().toISOString(),image=pkg.finalImageUrl;
  const article={id,date:seoulYmd(),title:String(pkg.title||''),subtitle:String(pkg.subtitle||''),category:category(pkg.category),reporter_id:null,author:'Global News24 편집부',summary:String(pkg.summary||''),image,image_caption:String(pkg.photoCaption||''),gallery_images:[],content:String(pkg.body||pkg.summary||''),source_name:'AI OFFICE · GEN',source_url:'',tags:tags(pkg.tags),featured:false,pinned:false,visual_style:'normal',is_published:true,updated_at:now};
  setMsg('최종 이미지 확인 완료 · Global News24 기사 DB에 발행 중입니다…');
  const {error}=await sb.from('gn24_articles').upsert(article,{onConflict:'id'}).select('*').single();button.disabled=false;
  if(error)return setMsg('발행 실패: '+error.message);
  pkg.imageStatus=STATUS.PUBLISHED;savePackage();
  const articleUrl=`https://news24.ai.kr/pages/article/?id=${encodeURIComponent(id)}`,receipt={origin:'GN24',status:'published',aiArticleId:pkg.articleId,gn24ArticleId:id,title:pkg.title,publishedAt:now,articleUrl,image,finalImageUrl:image,logoApplied:true,logoSource:LOGO_SOURCE,imageWidth:WIDTH,imageHeight:HEIGHT,brandSpecVersion:BRAND_SPEC_VERSION};
  const receipts=(()=>{try{const v=JSON.parse(localStorage.getItem(RECEIPTS_KEY)||'[]');return Array.isArray(v)?v:[]}catch(_){return[]}})();receipts.unshift(receipt);localStorage.setItem(RECEIPTS_KEY,JSON.stringify(receipts.slice(0,100)));localStorage.removeItem(PACKAGE_KEY);
  const returnUrl=AI_OFFICE+'#gn24Receipt='+b64url(receipt);
  $('actions').innerHTML=`<a href="${articleUrl}" target="_blank" rel="noopener">발행 기사 확인</a><a href="${returnUrl}">AI OFFICE로 발행 결과 보내기</a><a href="/" target="_blank" rel="noopener">Global News24 홈</a>`;
  setMsg('Global News24 최종 발행 완료 · AI OFFICE 회신 준비됨',true);
}
async function boot(){pkg=readPackage();if(pkg&&!pkg.imageStatus)pkg.imageStatus=metadataReady()?STATUS.READY:(pkg.sourceImageUrl?STATUS.REVIEW:STATUS.PENDING);render();ensureSafetyBoard();if(!valid(pkg))return;$('kakaoLogin').addEventListener('click',kakao);$('dryRun')?.addEventListener('click',dryRun);$('publish').addEventListener('click',publish);await setupAuth()}
window.GN24SmartImageGate={STATUS,metadataReady,brandContractValid};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
