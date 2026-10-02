/* Read-only local reuse of explicitly mapped Junior reporters. */
(function(){
'use strict';
const source=document.getElementById('gn24LocalConfig');if(!source)return;
const config=JSON.parse(source.textContent);
window.GN24_LOCAL_JUNIOR=async function(districtCode){
 const ids=[...new Set((config.districts||[]).filter(d=>!districtCode||d.code===districtCode).flatMap(d=>d.juniorReporterIds||[]))];
 if(!ids.length)return [];
 try{
 const c=window.GN24_SUPABASE;if(!c||!c.url||!c.anonKey)throw Error('Missing connection');
 const query=new URLSearchParams({select:'id,date,title,category,author,summary,image,region_code,reporter_id',region_code:'eq.junior',is_published:'eq.true',reporter_id:'in.('+ids.join(',')+')',order:'date.desc,created_at.desc'});
 const rows=[];for(let offset=0;;offset+=1000){query.set('limit','1000');query.set('offset',String(offset));const response=await fetch(c.url.replace(/\/$/,'')+'/rest/v1/gn24_articles?'+query,{cache:'no-store',headers:{apikey:c.anonKey}});if(!response.ok)throw Error('Local Junior request failed');const batch=await response.json();rows.push(...batch.filter(a=>a.region_code==='junior'&&a.reporter_id&&ids.includes(a.reporter_id)));if(batch.length<1000)break}
 return rows;
 }catch(e){console.warn('GN24 Local Junior',e);return []}
};
}());
