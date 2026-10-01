(()=>{
'use strict';
const cfg=window.GN24_SUPABASE,$=id=>document.getElementById(id);
if(!cfg||!window.supabase){$('authStatus').textContent='연결 설정을 불러오지 못했습니다.';return}
const sb=window.supabase.createClient(cfg.url,cfg.anonKey),bucket='gn24-local-ads';
let existing=null,rows=[],busy=false,previewURLs=[];
const fail=e=>{if(e)throw e};
const kst=d=>d?new Date(new Date(d).getTime()+9*3600000).toISOString().slice(0,16):'';
const time=v=>v?new Date(v+':00+09:00').toISOString():null;
async function admin(){const {data,error}=await sb.rpc('is_gn24_admin');fail(error);if(data!==true)throw Error('기존 기사 편집실에서 관리자 로그인이 필요합니다.')}
function preview(){previewURLs.forEach(URL.revokeObjectURL);previewURLs=[];$('photoPreview').replaceChildren();const files=[...$('cover').files,...$('photos').files];const urls=files.length?files.map(f=>{const u=URL.createObjectURL(f);previewURLs.push(u);return u}):[existing?.image_url,...(existing?.gallery_urls||[])].filter(Boolean);urls.forEach(url=>{const img=document.createElement('img');img.src=url;img.alt='광고 사진 미리보기';$('photoPreview').append(img)})}
function reset(){existing=null;$('localForm').reset();$('adId').value='';$('starts').value=kst(new Date());$('saveStatus').textContent='';preview()}
function edit(a){existing=a;$('adId').value=a.id;[['region','region_code'],['business','business_name'],['mode','mode'],['intro','introduction'],['phone','phone'],['address','address'],['target','target_url']].forEach(([id,key])=>$(id).value=a[key]);$('published').value=String(a.is_published);$('starts').value=kst(a.starts_at);$('ends').value=kst(a.ends_at);$('cover').value='';$('photos').value='';preview();$('localForm').scrollIntoView({behavior:'smooth'})}
async function list(){const {data,error}=await sb.from('gn24_local_ads').select('*').order('created_at',{ascending:false});fail(error);rows=data||[];$('adList').replaceChildren();rows.forEach(a=>{const div=document.createElement('div');div.className='local-item';const b=document.createElement('span');b.textContent=a.business_name+' · '+a.region_code+' · '+a.mode+' · '+(a.is_published?'게시':'비공개');const btn=document.createElement('button');btn.type='button';btn.className='btn';btn.textContent='편집';btn.onclick=()=>{if(!busy)edit(a)};div.append(b,btn);$('adList').append(div)})}
function validate(files){for(const f of files){if(!['image/jpeg','image/png','image/webp','image/gif'].includes(f.type)||f.size>10485760)throw Error('JPG·PNG·WebP·GIF, 파일당 최대 10MB만 가능합니다.')} }
async function upload(file,paths){const ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/gif':'gif'}[file.type];const path=crypto.randomUUID()+'.'+ext;const {error}=await sb.storage.from(bucket).upload(path,file,{contentType:file.type,upsert:false});fail(error);paths.push(path);return sb.storage.from(bucket).getPublicUrl(path).data.publicUrl}
$('cover').onchange=preview;$('photos').onchange=preview;$('newAd').onclick=()=>{if(!busy)reset()};
$('localForm').onsubmit=async e=>{e.preventDefault();if(busy)return;busy=true;$('save').disabled=true;const paths=[];let saved=false;try{
 await admin();const cover=$('cover').files[0],photos=[...$('photos').files];if(photos.length>12)throw Error('상세사진은 최대 12장입니다.');validate([cover,...photos].filter(Boolean));if(!cover&&!existing?.image_url)throw Error('대표이미지를 선택해 주세요.');
 const start=time($('starts').value),end=time($('ends').value);if(end&&end<=start)throw Error('종료일시는 시작 이후여야 합니다.');
 const target=$('target').value.trim();if(target&&!/^https?:\/\//i.test(target))throw Error('http 또는 https 링크만 가능합니다.');if($('mode').value==='LINK'&&!target)throw Error('LINK 방식은 링크가 필요합니다.');
 $('saveStatus').textContent='원본 사진 업로드·저장 중…';
 const image=cover?await upload(cover,paths):existing.image_url,gallery=[];if(photos.length){for(const file of photos)gallery.push(await upload(file,paths))}else gallery.push(...(existing?.gallery_urls||[]));
 const record={region_code:$('region').value,business_name:$('business').value.trim(),mode:$('mode').value,image_url:image,gallery_urls:gallery,introduction:$('intro').value,phone:$('phone').value,address:$('address').value,target_url:target,starts_at:start,ends_at:end,is_published:$('published').value==='true'};
 const query=existing?sb.from('gn24_local_ads').update(record).eq('id',existing.id):sb.from('gn24_local_ads').insert(record);const {error}=await query;fail(error);saved=true;await list();reset();$('saveStatus').textContent='저장 완료';
 }catch(err){if(!saved&&paths.length)await sb.storage.from(bucket).remove(paths);$('saveStatus').textContent='저장 실패: '+err.message;}finally{busy=false;$('save').disabled=false}};
async function refresh(){try{await admin();$('authStatus').textContent='기존 관리자 인증 완료';$('localAdmin').hidden=false;await list()}catch(e){$('localAdmin').hidden=true;$('authStatus').textContent=e.message}}
sb.auth.onAuthStateChange(()=>setTimeout(refresh,0));reset();refresh();
})();