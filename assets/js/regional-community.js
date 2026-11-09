(function(){
 const host=document.getElementById('gn24CommunityEntries');
 const region=String(document.body.dataset.region||'').toLowerCase();
 const obituary=region==='daegu'&&document.querySelector('#gn24CommunityNotices a[aria-label="故 박춘원님 부고장 보기"]');
 if(!host)return;
 let obituaryMarkup='';
 if(obituary){
 const originalWrapper=obituary.parentElement;
 obituary.querySelector('.gn24-community-meta').innerHTML='<b>부고</b><time datetime="2026-11-09">2026.11.09</time>';
 obituaryMarkup=obituary.outerHTML;
 originalWrapper.remove();
 }
 const records=new Map();
 renderCommunityNotices=function(data){
  for(const article of Array.isArray(data)?data:[])if(article.id&&isCommunityNotice(article)&&String(article.region_code||article.regionCode||'').toLowerCase()===region)records.set(String(article.id),article);
  const seen=new Set();
  const items=[...records.values()].filter(article=>{
   if(!article.id||seen.has(String(article.id))||!isCommunityNotice(article))return false;
   seen.add(String(article.id));
   return !obituaryMarkup||!/박\s*춘\s*원/.test(String(article.title||''));
  }).map(article=>({article,meta:communityMetadata(article)}));
  if(obituaryMarkup)items.push({original:true,meta:{condolence:true,date:'2026-11-09'},article:{id:'daegu-park-chunwon',date:'2026-11-09'}});
  const dateKey=item=>String(item.meta.date||item.article.date||'').replace(/[^0-9]/g,'').slice(0,8);
  const card=item=>{
   if(item.original)return obituaryMarkup;
   const a=item.article,m=item.meta,date=m.date||a.date||'';
   return '<a class="gn24-community-card'+(m.condolence?' is-condolence':'')+'" href="'+esc(seoArticleURL(a))+'"><span class="gn24-community-meta"><b>'+esc(m.type||(m.condolence?'조사':'경사'))+'</b><time datetime="'+esc(date)+'">'+esc(fmt(date))+'</time></span><strong>'+esc(a.title)+'</strong></a>';
  };
  host.innerHTML=[false,true].map(condolence=>{
   const sorted=items.filter(item=>item.meta.condolence===condolence).sort((a,b)=>dateKey(b).localeCompare(dateKey(a))||String(b.article.id).localeCompare(String(a.article.id)));
   const rows=sorted.slice(0,5);
   return '<section class="gn24-community-column'+(condolence?' is-condolence':'')+'" aria-label="'+(condolence?'조사':'경사')+' 목록"><h3>'+(condolence?'조사':'경사')+'</h3>'+ (rows.length?rows.map(card).join(''):'<p class="gn24-community-empty">등록된 소식이 없습니다.</p>')+'</section>';
  }).join('');
 };
 renderCommunityNotices([]);
 function place(){
  const board=document.getElementById('gn24CommunityNotices'),main=document.querySelector('main.regional-main'),footer=document.querySelector('footer.gn24-footer');
  if(!board||!main||!footer)return;
  for(const junior of main.querySelectorAll('[id$="JuniorNews"],[id$="JuniorFallback"]')){
   const section=junior.closest('.regional-feed-section');if(section)main.append(section);
  }
  let wrapper=board.parentElement;
  if(wrapper===main){wrapper=document.createElement('div');wrapper.className='wrap';wrapper.append(board);}
  footer.before(wrapper);
  const ads=document.querySelector('.gn24-sharing-ads');if(ads)wrapper.before(ads);
 }
 async function loadRegionalNotices(){
  const connection=window.GN24_SUPABASE;if(!connection?.url||!connection.anonKey)return;
  try{
   const query=new URLSearchParams({select:'id,date,title,category,tags,region_code',region_code:'eq.'+region,is_published:'eq.true',category:'in.("경조사","경사","조사","부고","경조사 · 사람과 소식")',order:'date.desc,created_at.desc',limit:'1000'});
   const response=await fetch(connection.url.replace(/\/$/,'')+'/rest/v1/gn24_articles?'+query,{cache:'no-store',headers:{apikey:connection.anonKey}});
   if(!response.ok)throw Error('Regional notices unavailable');
   renderCommunityNotices(await response.json());
  }catch(error){console.warn('GN24 regional community',error);}
 }
 function init(){place();loadRegionalNotices();}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
}());
