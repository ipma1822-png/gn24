const $=(s,p=document)=>p.querySelector(s), $$=(s,p=document)=>[...p.querySelectorAll(s)];
function esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))} function fmt(d){return d?d.replaceAll('-','.') : ''}
async function getJSON(path){const r=await fetch(path,{cache:'no-store'});if(!r.ok)throw Error(path);return r.json()}
let __gn24NewsPromise=null;
function parseMaybeJSON(v,fallback=[]){if(Array.isArray(v))return v;if(v==null||v==='')return fallback;if(typeof v==='string'){try{const x=JSON.parse(v);return Array.isArray(x)?x:fallback}catch(e){return fallback}}return fallback}
function normalizeDbArticle(r){return {
  id:r.id||'',date:r.date||'',title:r.title||'',subtitle:r.subtitle||'',category:r.category||'뉴스',author:r.author||'Global News24 편집부',summary:r.summary||'',image:r.image||'',
  imageCaption:r.image_caption||'',content:parseMaybeJSON(r.content,r.content?String(r.content).split(/\n\s*\n|\r?\n(?=\S)/).map(s=>s.trim()).filter(Boolean):[]),sourceName:r.source_name||'Global News24',sourceUrl:r.source_url||'',tags:parseMaybeJSON(r.tags,[]),
  relatedOrgs:parseMaybeJSON(r.related_orgs,[]),linkLabel:r.link_label||'',linkUrl:r.link_url||'',featured:!!r.featured,pinned:!!r.pinned,visualStyle:r.visual_style||'normal',isPublished:r.is_published!==false,
  createdAt:r.created_at||'',updatedAt:r.updated_at||'',regionCode:r.region_code||r.regionCode||''
}}
function loadSupabaseConfig(){return new Promise(resolve=>{if(window.GN24_SUPABASE)return resolve(window.GN24_SUPABASE);const sc=document.createElement('script');sc.src='/assets/js/gn24-supabase-config.js?v=3.2.17';sc.onload=()=>resolve(window.GN24_SUPABASE||{});sc.onerror=()=>resolve({});document.head.appendChild(sc)})}
async function loadNewsData(){if(__gn24NewsPromise)return __gn24NewsPromise;__gn24NewsPromise=(async()=>{
  try{
    const cfg=await loadSupabaseConfig();
    if(cfg&&cfg.url&&cfg.anonKey){
      const endpoint=cfg.url.replace(/\/$/,'')+'/rest/v1/gn24_articles?select=*&is_published=eq.true&order=date.desc,created_at.desc';
      const r=await fetch(endpoint,{cache:'no-store',headers:{apikey:cfg.anonKey}});
      if(r.ok){
        const rows=await r.json();
        if(Array.isArray(rows)){
          const published=rows.map(normalizeDbArticle).filter(a=>a.isPublished!==false);
          if(published.length)return published;
          if(rows.length===0)return [];
        }
      }
    }
  }catch(e){console.warn('GN24 Supabase read fallback:',e)}
  return getJSON('/data/news.json');
})();return __gn24NewsPromise}
function articleURL(id){return `/pages/article/?id=${encodeURIComponent(id)}`}
function seoArticleURL(article){
  if(!article?.id) return '/pages/newsroom/';
  // v3.4.11: Internal navigation must always use the live dynamic reader.
  // /share/<id>/ is generated asynchronously for social/OG previews and may
  // not exist yet, so using it for Latest/Top/Related links can cause 404s.
  return articleURL(article.id);
}
function shareArticleSlug(id){return String(id||'article').replace(/[^A-Za-z0-9._-]+/g,'-').replace(/^-+|-+$/g,'')||'article'}
function shareArticleVersion(article){
  const raw=article?.updatedAt||article?.updated_at||article?.image||'';
  let hash=2166136261;
  for(const ch of String(raw)){
    hash^=ch.charCodeAt(0);
    hash=Math.imul(hash,16777619);
  }
  return (hash>>>0).toString(36);
}
function shareArticleURL(id,article=null){
  const base=`${location.origin}/share/${shareArticleSlug(id)}/`;
  const version=article?shareArticleVersion(article):'';
  return version?`${base}?v=${encodeURIComponent(version)}`:base;
}
const DEFAULT_NEWS_IMAGE='/assets/images/news/gn24-default-news.svg';
function bgStyle(src){const safe=esc(src||DEFAULT_NEWS_IMAGE);return `style=\"background-image:url('${safe}'),url('${DEFAULT_NEWS_IMAGE}')\"`}
function applyBg(el,src){if(!el)return;el.style.backgroundImage=`url('${src||DEFAULT_NEWS_IMAGE}'),url('${DEFAULT_NEWS_IMAGE}')`}
function publicOnly(data){return (Array.isArray(data)?data:[]).filter(a=>a && a.isPublished!==false && a.is_published!==false)}
function sortNews(data){return publicOnly(data).sort((a,b)=>
  String(b.date||'').localeCompare(String(a.date||'')) ||
  String(b.createdAt||b.created_at||'').localeCompare(String(a.createdAt||a.created_at||'')) ||
  String(b.updatedAt||b.updated_at||'').localeCompare(String(a.updatedAt||a.updated_at||'')) ||
  String(b.id||'').localeCompare(String(a.id||''))
)}
function setToday(){const el=$('#todayLabel');if(!el)return;const d=new Date(),days=['일','월','화','수','목','금','토'];el.textContent=`${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} ${days[d.getDay()]}요일`}
function closeMegas(except=null){$$('.nav-item.open').filter(x=>x!==except).forEach(x=>x.classList.remove('open'))}
function setupNav(){const util=$('#utilityBtn'),panel=$('#utilityPanel');if(util&&panel)util.onclick=e=>{e.stopPropagation();closeMegas();panel.classList.toggle('open');util.setAttribute('aria-expanded',panel.classList.contains('open'))};$$('.nav-btn').forEach(btn=>btn.onclick=e=>{if(innerWidth<=900){e.preventDefault();e.stopPropagation();panel?.classList.remove('open');const item=btn.closest('.nav-item'),open=!item.classList.contains('open');closeMegas(item);item.classList.toggle('open',open)}});document.addEventListener('click',e=>{if(innerWidth<=900&&!e.target.closest('.mega'))closeMegas();if(!e.target.closest('#utilityPanel')&&!e.target.closest('#utilityBtn'))panel?.classList.remove('open')});addEventListener('resize',()=>{if(innerWidth>900){closeMegas();panel?.classList.remove('open')}})}
function visualClass(a,i=0){const s=a.visualStyle||((i===0)?'spotlight':'normal');return s==='breaking'?'breaking-card':(s==='top'?'glow':(s==='spotlight'?'spotlight':''))}
function card(a,i=0,displayCategory=a.category||'뉴스'){return `<a class="news-card ${visualClass(a,i)}" href="${seoArticleURL(a)}"><div class="thumb" ${bgStyle(a.image)}></div><div class="body"><span class="badge">${esc(displayCategory)}</span><h3>${esc(a.title)}</h3><div class="news-date">${esc(fmt(a.date))}</div></div></a>`}
function latestRow(a){return `<a class="latest-row" href="${seoArticleURL(a)}"><div class="thumb" ${bgStyle(a.image)}></div><div><span class="badge">${esc(a.category||'뉴스')}</span><h3>${esc(a.title)}</h3><div class="news-date">${esc(fmt(a.date))}</div></div></a>`}
function mini(a){return `<a class="mini-story" href="${seoArticleURL(a)}"><div class="thumb" ${bgStyle(a.image)}></div><div><b>${esc(a.title)}</b><small>${esc(fmt(a.date))}</small></div></a>`}
async function loadHome(){
  const target=$('#homeNews');if(!target)return;
  const raw=await loadNewsData(), data=sortNews(raw);
  const lead=data.find(x=>x.pinned)||data.find(x=>x.featured)||data[0];
  const featured=data.filter(x=>x.featured&&(!lead||x.id!==lead.id));
  const editorPicks=[...featured,...data.filter(x=>(!lead||x.id!==lead.id)&&!x.featured)].slice(0,8);
  target.innerHTML=editorPicks.map((a,i)=>card(a,i)).join('');
  if(lead){$('#leadTitle').textContent=lead.title;$('#leadSummary').textContent=lead.summary||'';$('#leadMeta').textContent=`TOP NEWS · ${lead.category||'뉴스'} · ${fmt(lead.date)}`;$('#leadLink').href=seoArticleURL(lead);applyBg($('#leadMedia'),lead.image)}
  const breaking=data.find(x=>x.visualStyle==='breaking')||data[0];if(breaking)$('#breakingText').textContent=breaking.title;
  $('#latestNews')&&($('#latestNews').innerHTML=data.slice(0,10).map(latestRow).join(''));
  const attention=[...featured,...data.filter(x=>(!lead||x.id!==lead.id)&&!x.featured)].slice(0,6);
  $('#attentionList')&&($('#attentionList').innerHTML=attention.map(a=>`<li><a href="${seoArticleURL(a)}">${esc(a.title)}</a></li>`).join(''));
  const by=(test)=>data.filter(test).slice(0,4).map(mini).join('');
  $('#beatMartial')&&($('#beatMartial').innerHTML=by(a=>(a.category||'').includes('무도')||JSON.stringify(a).includes('태권')));
  $('#beatSafety')&&($('#beatSafety').innerHTML=by(a=>JSON.stringify(a).includes('드론')||JSON.stringify(a).includes('안전')));
  $('#beatActs')&&($('#beatActs').innerHTML=by(a=>(a.category||'')==='공익'||JSON.stringify(a).includes('공익')||JSON.stringify(a).includes('봉사')||JSON.stringify(a).includes('지역사회'))||data.slice(0,3).map(mini).join(''));
  await renderHomePopular(data);
}
async function renderHomePopular(data){
  const box=$('#topLatest');if(!box)return;
  try{
    const rows=await gn24DbFetch('gn24_article_views?select=article_id,view_count&order=view_count.desc&limit=10')||[];
    const map=new Map(data.map(a=>[String(a.id),a]));
    const ranked=rows.map(r=>({a:map.get(String(r.article_id)),views:Number(r.view_count||0)})).filter(x=>x.a).slice(0,10);
    if(ranked.length){box.innerHTML=ranked.map(x=>`<li><a href="${seoArticleURL(x.a)}">${esc(x.a.title)}</a><small class="home-view-count">${x.views.toLocaleString('ko-KR')}회</small></li>`).join('');return;}
  }catch(e){console.warn('GN24 home popular fallback',e)}
  box.innerHTML=data.slice(0,10).map(a=>`<li><a href="${seoArticleURL(a)}">${esc(a.title)}</a></li>`).join('');
}
async function loadNewsroom(){const list=$('#articleList');if(!list)return;let data=sortNews(await loadNewsData());const q=new URLSearchParams(location.search),cat=q.get('cat'),term=(q.get('q')||'').trim().toLowerCase();if(cat)data=data.filter(x=>x.category===cat);if(term)data=data.filter(x=>JSON.stringify(x).toLowerCase().includes(term));list.innerHTML=data.map(a=>`<a class="article-row" href="${seoArticleURL(a)}"><div class="thumb" ${bgStyle(a.image)}></div><div class="body"><span class="badge">${esc(a.category||'뉴스')}</span><h3>${esc(a.title)}</h3><div class="muted">${esc(fmt(a.date))} · ${esc(a.author||'편집부')}</div><p>${esc(a.summary||'')}</p></div></a>`).join('')||'<p>해당 조건의 기사가 없습니다.</p>'}
const GN24_DOMESTIC_EDITIONS=Object.freeze({seoul:'서울',busan:'부산',daegu:'대구',incheon:'인천',gwangju:'광주',daejeon:'대전',ulsan:'울산',sejong:'세종',gyeonggi:'경기',gangwon:'강원',chungbuk:'충북',chungnam:'충남',jeonbuk:'전북',jeonnam:'전남',gyeongbuk:'경북',gyeongnam:'경남',jeju:'제주'});
const GN24_GLOBAL_EDITIONS=Object.freeze({china:['🇨🇳','CHINA EDITION','中国'],japan:['🇯🇵','JAPAN EDITION','日本'],philippines:['🇵🇭','PHILIPPINES EDITION','Philippines'],indonesia:['🇮🇩','INDONESIA EDITION','Indonesia'],malaysia:['🇲🇾','MALAYSIA EDITION','Malaysia'],thailand:['🇹🇭','THAILAND EDITION','ประเทศไทย'],vietnam:['🇻🇳','VIETNAM EDITION','Việt Nam'],nepal:['🇳🇵','NEPAL EDITION','नेपाल'],india:['🇮🇳','INDIA EDITION','India'],pakistan:['🇵🇰','PAKISTAN EDITION','Pakistan'],iran:['🇮🇷','IRAN EDITION','ایران'],uae:['🇦🇪','UAE EDITION','UAE'],'saudi-arabia':['🇸🇦','SAUDI ARABIA EDITION','Saudi Arabia'],turkiye:['🇹🇷','TÜRKİYE EDITION','Türkiye'],morocco:['🇲🇦','MOROCCO EDITION','Morocco'],egypt:['🇪🇬','EGYPT EDITION','Egypt'],'south-africa':['🇿🇦','SOUTH AFRICA EDITION','South Africa'],spain:['🇪🇸','SPAIN EDITION','España'],uk:['🇬🇧','UK EDITION','United Kingdom'],france:['🇫🇷','FRANCE EDITION','France'],germany:['🇩🇪','GERMANY EDITION','Deutschland'],italy:['🇮🇹','ITALY EDITION','Italia'],canada:['🇨🇦','CANADA EDITION','Canada'],usa:['🇺🇸','USA EDITION','United States'],mexico:['🇲🇽','MEXICO EDITION','México'],brazil:['🇧🇷','BRAZIL EDITION','Brasil'],argentina:['🇦🇷','ARGENTINA EDITION','Argentina'],colombia:['🇨🇴','COLOMBIA EDITION','Colombia'],australia:['🇦🇺','AUSTRALIA EDITION','Australia'],'new-zealand':['🇳🇿','NEW ZEALAND EDITION','New Zealand'],kenya:['🇰🇪','KENYA EDITION','Kenya'],nigeria:['🇳🇬','NIGERIA EDITION','Nigeria'],mongolia:['🇲🇳','MONGOLIA EDITION','Монгол']});
const GN24_EDITION_I18N=Object.freeze({
  china:{back:'返回中国版',home:'中国版首页'},japan:{back:'日本版に戻る',home:'日本版ホーム'},philippines:{back:'Back to Philippines',home:'Philippines Home'},indonesia:{back:'Kembali ke Indonesia',home:'Beranda Indonesia'},malaysia:{back:'Kembali ke Malaysia',home:'Laman Malaysia'},thailand:{back:'กลับไปหน้าประเทศไทย',home:'หน้าหลักประเทศไทย'},vietnam:{back:'Quay lại Việt Nam',home:'Trang Việt Nam'},nepal:{back:'नेपाल संस्करणमा फर्कनुहोस्',home:'नेपाल गृहपृष्ठ'},india:{back:'Back to India',home:'India Home'},pakistan:{back:'Back to Pakistan',home:'Pakistan Home'},iran:{back:'بازگشت به ایران',home:'صفحه ایران'},uae:{back:'Back to UAE',home:'UAE Home'},'saudi-arabia':{back:'العودة إلى السعودية',home:'الصفحة السعودية'},turkiye:{back:"Türkiye'ye dön",home:'Türkiye Ana Sayfa'},morocco:{back:'العودة إلى المغرب',home:'صفحة المغرب'},egypt:{back:'العودة إلى مصر',home:'صفحة مصر'},'south-africa':{back:'Back to South Africa',home:'South Africa Home'},spain:{back:'Volver a España',home:'Inicio España'},uk:{back:'Back to United Kingdom',home:'UK Home'},france:{back:'Retour à la France',home:'Accueil France'},germany:{back:'Zurück zu Deutschland',home:'Deutschland Startseite'},italy:{back:"Torna all'Italia",home:'Home Italia'},canada:{back:'Back to Canada',home:'Canada Home'},usa:{back:'Back to United States',home:'USA Home'},mexico:{back:'Volver a México',home:'Inicio México'},brazil:{back:'Voltar ao Brasil',home:'Início Brasil'},argentina:{back:'Volver a Argentina',home:'Inicio Argentina'},colombia:{back:'Volver a Colombia',home:'Inicio Colombia'},australia:{back:'Back to Australia',home:'Australia Home'},'new-zealand':{back:'Back to New Zealand',home:'New Zealand Home'},kenya:{back:'Back to Kenya',home:'Kenya Home'},nigeria:{back:'Back to Nigeria',home:'Nigeria Home'},mongolia:{back:'Монгол руу буцах',home:'Монгол нүүр'}
});
function gn24FlagImg(code,label){return `<img class="article-edition-flag-img" src="https://flagcdn.com/w80/${String(code||'').toLowerCase()}.png" alt="${esc(label)} flag" loading="eager" referrerpolicy="no-referrer">`}
function articleEditionInfo(a){
  const code=String(a?.regionCode||a?.region_code||'').trim();
  if(!code)return null;
  if(GN24_DOMESTIC_EDITIONS[code])return {code,type:'local',flagHTML:'<span class="article-edition-pin">●</span>',title:GN24_DOMESTIC_EDITIONS[code]+' · LOCAL EDITION',label:GN24_DOMESTIC_EDITIONS[code]+' 지역판',href:'/'+code+'/',back:GN24_DOMESTIC_EDITIONS[code]+' 지역판으로 돌아가기',home:GN24_DOMESTIC_EDITIONS[code]+' 지역판 홈'};
  const g=GN24_GLOBAL_EDITIONS[code];if(g){const cc={uk:'gb',usa:'us'}[code]||({china:'cn',japan:'jp',philippines:'ph',indonesia:'id',malaysia:'my',thailand:'th',vietnam:'vn',nepal:'np',india:'in',pakistan:'pk',iran:'ir',uae:'ae','saudi-arabia':'sa',turkiye:'tr',morocco:'ma',egypt:'eg','south-africa':'za',spain:'es',france:'fr',germany:'de',italy:'it',canada:'ca',mexico:'mx',brazil:'br',argentina:'ar',colombia:'co',australia:'au','new-zealand':'nz',kenya:'ke',nigeria:'ng',mongolia:'mn'}[code]||'');const tr=GN24_EDITION_I18N[code]||{};return {code,type:'global',flagHTML:gn24FlagImg(cc,g[2]),title:g[1]+' · GLOBAL NEWS24',label:g[2],href:'/'+code+'/',back:tr.back||('Back to '+g[2]),home:tr.home||(g[2]+' Home')};}
  return null;
}
const GN24_ARTICLE_UI=Object.freeze({
  es:{latest:'Últimas noticias',more:'Ver más',popular:'Más leídas',related:'Noticias relacionadas',recommended:'Recomendado',headline:'Titulares',latestArticles:'Últimos artículos',relatedArticles:'Artículos relacionados',source:'Fuente',reaction:'¿Qué te pareció este artículo?',like:'Me gusta',heart:'Me encanta',support:'Apoyar',useful:'Útil',comments:'Comentarios',commentGuide:'Deja tu opinión. Los comentarios se publican tras la revisión del administrador.',nickname:'Nombre',approved:'Publicación tras aprobación',commentPlaceholder:'Escribe un comentario. (máx. 1.000 caracteres)',submit:'Enviar comentario',empty:'No hay comentarios publicados.',share:'Compartir',copy:'Copiar enlace',print:'Imprimir',bigger:'Aumentar texto',smaller:'Reducir texto'},
  en:{latest:'Latest News',more:'More',popular:'Most Read',related:'Related News',recommended:'Recommended',headline:'Headlines',latestArticles:'Latest Articles',relatedArticles:'Related Articles',source:'Source',reaction:'What did you think of this article?',like:'Like',heart:'Love',support:'Support',useful:'Useful',comments:'Comments',commentGuide:'Share your view. Comments are published after administrator review.',nickname:'Nickname',approved:'Published after approval',commentPlaceholder:'Write a comment. (max. 1,000 characters)',submit:'Post comment',empty:'No public comments yet.',share:'Share',copy:'Copy link',print:'Print',bigger:'Larger text',smaller:'Smaller text'},
  zh:{latest:'最新新闻',more:'更多',popular:'热门新闻',related:'相关新闻',recommended:'推荐',headline:'头条新闻',latestArticles:'最新文章',relatedArticles:'相关文章',source:'资料·来源',reaction:'您对这篇文章有何看法？',like:'喜欢',heart:'共鸣',support:'支持',useful:'有用',comments:'评论',commentGuide:'欢迎留言。评论经管理员审核后公开。',nickname:'昵称',approved:'审核后公开',commentPlaceholder:'请输入评论（最多1,000字）',submit:'发表评论',empty:'暂无公开评论。',share:'分享',copy:'复制链接',print:'打印',bigger:'放大文字',smaller:'缩小文字'},
  ja:{latest:'最新ニュース',more:'もっと見る',popular:'よく読まれた記事',related:'関連記事',recommended:'おすすめ',headline:'ヘッドライン',latestArticles:'最新記事',relatedArticles:'関連記事',source:'資料・出典',reaction:'この記事はいかがでしたか？',like:'いいね',heart:'共感',support:'応援',useful:'役立つ',comments:'コメント',commentGuide:'ご意見をお寄せください。コメントは管理者確認後に公開されます。',nickname:'ニックネーム',approved:'承認後に公開',commentPlaceholder:'コメントを入力してください（最大1,000文字）',submit:'コメント投稿',empty:'公開コメントはまだありません。',share:'共有',copy:'リンクをコピー',print:'印刷',bigger:'文字を大きく',smaller:'文字を小さく'},
  fr:{latest:'Dernières nouvelles',more:'Voir plus',popular:'Les plus lues',related:'Actualités liées',recommended:'Recommandé',headline:'À la une',latestArticles:'Derniers articles',relatedArticles:'Articles liés',source:'Source',reaction:'Que pensez-vous de cet article ?',like:"J’aime",heart:'Coup de cœur',support:'Soutenir',useful:'Utile',comments:'Commentaires',commentGuide:'Laissez votre avis. Les commentaires sont publiés après validation.',nickname:'Nom',approved:'Publié après validation',commentPlaceholder:'Écrivez un commentaire (1 000 caractères max.)',submit:'Publier',empty:'Aucun commentaire publié.',share:'Partager',copy:'Copier le lien',print:'Imprimer',bigger:'Agrandir le texte',smaller:'Réduire le texte'},
  de:{latest:'Neueste Nachrichten',more:'Mehr',popular:'Meistgelesen',related:'Verwandte Nachrichten',recommended:'Empfohlen',headline:'Schlagzeilen',latestArticles:'Neueste Artikel',relatedArticles:'Verwandte Artikel',source:'Quelle',reaction:'Wie fanden Sie diesen Artikel?',like:'Gefällt mir',heart:'Zustimmung',support:'Unterstützen',useful:'Hilfreich',comments:'Kommentare',commentGuide:'Teilen Sie Ihre Meinung. Kommentare werden nach Prüfung veröffentlicht.',nickname:'Name',approved:'Nach Freigabe sichtbar',commentPlaceholder:'Kommentar schreiben (max. 1.000 Zeichen)',submit:'Kommentar senden',empty:'Noch keine veröffentlichten Kommentare.',share:'Teilen',copy:'Link kopieren',print:'Drucken',bigger:'Text vergrößern',smaller:'Text verkleinern'},
  it:{latest:'Ultime notizie',more:'Altro',popular:'Più lette',related:'Notizie correlate',recommended:'Consigliato',headline:'Titoli principali',latestArticles:'Ultimi articoli',relatedArticles:'Articoli correlati',source:'Fonte',reaction:'Cosa ne pensi di questo articolo?',like:'Mi piace',heart:'Apprezzo',support:'Sostieni',useful:'Utile',comments:'Commenti',commentGuide:'Lascia la tua opinione. I commenti vengono pubblicati dopo la revisione.',nickname:'Nome',approved:'Pubblicato dopo approvazione',commentPlaceholder:'Scrivi un commento (max 1.000 caratteri)',submit:'Pubblica',empty:'Nessun commento pubblicato.',share:'Condividi',copy:'Copia link',print:'Stampa',bigger:'Ingrandisci testo',smaller:'Riduci testo'},
  pt:{latest:'Últimas notícias',more:'Ver mais',popular:'Mais lidas',related:'Notícias relacionadas',recommended:'Recomendado',headline:'Destaques',latestArticles:'Últimos artigos',relatedArticles:'Artigos relacionados',source:'Fonte',reaction:'O que achou deste artigo?',like:'Gostei',heart:'Amei',support:'Apoiar',useful:'Útil',comments:'Comentários',commentGuide:'Deixe sua opinião. Os comentários são publicados após revisão.',nickname:'Nome',approved:'Publicado após aprovação',commentPlaceholder:'Escreva um comentário (máx. 1.000 caracteres)',submit:'Publicar',empty:'Ainda não há comentários publicados.',share:'Compartilhar',copy:'Copiar link',print:'Imprimir',bigger:'Aumentar texto',smaller:'Diminuir texto'},
  ar:{latest:'أحدث الأخبار',more:'المزيد',popular:'الأكثر قراءة',related:'أخبار ذات صلة',recommended:'موصى به',headline:'العناوين الرئيسية',latestArticles:'أحدث المقالات',relatedArticles:'مقالات ذات صلة',source:'المصدر',reaction:'ما رأيك في هذا المقال؟',like:'إعجاب',heart:'تفاعل',support:'دعم',useful:'مفيد',comments:'التعليقات',commentGuide:'شارك رأيك. تُنشر التعليقات بعد مراجعة الإدارة.',nickname:'الاسم',approved:'ينشر بعد الموافقة',commentPlaceholder:'اكتب تعليقاً (بحد أقصى 1,000 حرف)',submit:'نشر التعليق',empty:'لا توجد تعليقات منشورة بعد.',share:'مشاركة',copy:'نسخ الرابط',print:'طباعة',bigger:'تكبير النص',smaller:'تصغير النص'},
  tr:{latest:'Son Haberler',more:'Daha fazla',popular:'En Çok Okunanlar',related:'İlgili Haberler',recommended:'Önerilen',headline:'Manşetler',latestArticles:'Son Yazılar',relatedArticles:'İlgili Yazılar',source:'Kaynak',reaction:'Bu yazı hakkında ne düşünüyorsunuz?',like:'Beğen',heart:'Katılıyorum',support:'Destekle',useful:'Faydalı',comments:'Yorumlar',commentGuide:'Görüşünüzü paylaşın. Yorumlar yönetici incelemesinden sonra yayımlanır.',nickname:'Ad',approved:'Onaydan sonra yayımlanır',commentPlaceholder:'Yorum yazın (en fazla 1.000 karakter)',submit:'Yorum gönder',empty:'Henüz yayımlanmış yorum yok.',share:'Paylaş',copy:'Bağlantıyı kopyala',print:'Yazdır',bigger:'Metni büyüt',smaller:'Metni küçült'},
  vi:{latest:'Tin mới nhất',more:'Xem thêm',popular:'Đọc nhiều nhất',related:'Tin liên quan',recommended:'Đề xuất',headline:'Tiêu điểm',latestArticles:'Bài mới nhất',relatedArticles:'Bài liên quan',source:'Nguồn',reaction:'Bạn nghĩ gì về bài viết này?',like:'Thích',heart:'Đồng cảm',support:'Ủng hộ',useful:'Hữu ích',comments:'Bình luận',commentGuide:'Hãy để lại ý kiến. Bình luận được đăng sau khi quản trị viên duyệt.',nickname:'Tên',approved:'Đăng sau khi duyệt',commentPlaceholder:'Nhập bình luận (tối đa 1.000 ký tự)',submit:'Gửi bình luận',empty:'Chưa có bình luận công khai.',share:'Chia sẻ',copy:'Sao chép liên kết',print:'In',bigger:'Tăng cỡ chữ',smaller:'Giảm cỡ chữ'},
  th:{latest:'ข่าวล่าสุด',more:'ดูเพิ่มเติม',popular:'ข่าวยอดนิยม',related:'ข่าวที่เกี่ยวข้อง',recommended:'แนะนำ',headline:'พาดหัวข่าว',latestArticles:'บทความล่าสุด',relatedArticles:'บทความที่เกี่ยวข้อง',source:'แหล่งที่มา',reaction:'คุณคิดอย่างไรกับบทความนี้?',like:'ถูกใจ',heart:'เห็นด้วย',support:'สนับสนุน',useful:'มีประโยชน์',comments:'ความคิดเห็น',commentGuide:'แสดงความคิดเห็นได้ ความคิดเห็นจะเผยแพร่หลังการตรวจสอบของผู้ดูแล',nickname:'ชื่อ',approved:'เผยแพร่หลังอนุมัติ',commentPlaceholder:'เขียนความคิดเห็น (สูงสุด 1,000 ตัวอักษร)',submit:'ส่งความคิดเห็น',empty:'ยังไม่มีความคิดเห็นที่เผยแพร่',share:'แชร์',copy:'คัดลอกลิงก์',print:'พิมพ์',bigger:'ขยายข้อความ',smaller:'ย่อข้อความ'},
  id:{latest:'Berita Terbaru',more:'Lihat lainnya',popular:'Terpopuler',related:'Berita Terkait',recommended:'Rekomendasi',headline:'Berita Utama',latestArticles:'Artikel Terbaru',relatedArticles:'Artikel Terkait',source:'Sumber',reaction:'Bagaimana pendapat Anda tentang artikel ini?',like:'Suka',heart:'Setuju',support:'Dukung',useful:'Bermanfaat',comments:'Komentar',commentGuide:'Bagikan pendapat Anda. Komentar diterbitkan setelah ditinjau admin.',nickname:'Nama',approved:'Terbit setelah disetujui',commentPlaceholder:'Tulis komentar (maks. 1.000 karakter)',submit:'Kirim komentar',empty:'Belum ada komentar publik.',share:'Bagikan',copy:'Salin tautan',print:'Cetak',bigger:'Perbesar teks',smaller:'Perkecil teks'},
  ms:{latest:'Berita Terkini',more:'Lihat lagi',popular:'Paling Dibaca',related:'Berita Berkaitan',recommended:'Disyorkan',headline:'Tajuk Utama',latestArticles:'Artikel Terkini',relatedArticles:'Artikel Berkaitan',source:'Sumber',reaction:'Apa pendapat anda tentang artikel ini?',like:'Suka',heart:'Setuju',support:'Sokong',useful:'Berguna',comments:'Komen',commentGuide:'Kongsikan pandangan anda. Komen diterbitkan selepas semakan pentadbir.',nickname:'Nama',approved:'Diterbitkan selepas kelulusan',commentPlaceholder:'Tulis komen (maks. 1,000 aksara)',submit:'Hantar komen',empty:'Belum ada komen awam.',share:'Kongsi',copy:'Salin pautan',print:'Cetak',bigger:'Besarkan teks',smaller:'Kecilkan teks'},
  fa:{latest:'آخرین اخبار',more:'بیشتر',popular:'پربازدیدترین',related:'اخبار مرتبط',recommended:'پیشنهادی',headline:'تیترها',latestArticles:'آخرین مطالب',relatedArticles:'مطالب مرتبط',source:'منبع',reaction:'نظر شما درباره این مطلب چیست؟',like:'پسندیدم',heart:'همدلی',support:'حمایت',useful:'مفید',comments:'دیدگاه‌ها',commentGuide:'نظر خود را بنویسید. دیدگاه‌ها پس از بررسی مدیر منتشر می‌شوند.',nickname:'نام',approved:'پس از تأیید منتشر می‌شود',commentPlaceholder:'دیدگاه خود را بنویسید (حداکثر ۱۰۰۰ نویسه)',submit:'ارسال دیدگاه',empty:'هنوز دیدگاه عمومی ثبت نشده است.',share:'اشتراک‌گذاری',copy:'کپی پیوند',print:'چاپ',bigger:'بزرگ کردن متن',smaller:'کوچک کردن متن'},
  mn:{latest:'Сүүлийн мэдээ',more:'Дэлгэрэнгүй',popular:'Их уншсан',related:'Холбоотой мэдээ',recommended:'Санал болгох',headline:'Онцлох мэдээ',latestArticles:'Сүүлийн нийтлэл',relatedArticles:'Холбоотой нийтлэл',source:'Эх сурвалж',reaction:'Энэ нийтлэлийн талаар та юу гэж бодож байна?',like:'Таалагдлаа',heart:'Санал нэг',support:'Дэмжих',useful:'Хэрэгтэй',comments:'Сэтгэгдэл',commentGuide:'Санал бодлоо үлдээнэ үү. Сэтгэгдлийг админ хянасны дараа нийтэлнэ.',nickname:'Нэр',approved:'Зөвшөөрсний дараа нийтэлнэ',commentPlaceholder:'Сэтгэгдэл бичнэ үү (ихдээ 1,000 тэмдэгт)',submit:'Илгээх',empty:'Нийтлэгдсэн сэтгэгдэл алга.',share:'Хуваалцах',copy:'Холбоос хуулах',print:'Хэвлэх',bigger:'Текст томруулах',smaller:'Текст багасгах'}
});
function articleUiLang(code){
  const map={china:'zh',japan:'ja',philippines:'en',indonesia:'id',malaysia:'ms',thailand:'th',vietnam:'vi',nepal:'en',india:'en',pakistan:'en',iran:'fa',uae:'ar','saudi-arabia':'ar',turkiye:'tr',morocco:'ar',egypt:'ar','south-africa':'en',spain:'es',uk:'en',france:'fr',germany:'de',italy:'it',canada:'en',usa:'en',mexico:'es',brazil:'pt',argentina:'es',colombia:'es',australia:'en','new-zealand':'en',kenya:'en',nigeria:'en',mongolia:'mn'};
  return map[code]||null;
}
const GN24_DYNAMIC_KEYS=['copied','copiedShort','copyPrompt','reactionLoadError','reactionAlready','reactionSaving','reactionSaved','reactionError','commentsLoadError','reader','nicknameError','commentError','commentSaving','commentSaved','commentSaveError','popularEmpty','reporterBio','kakaoError'];
const GN24_DYNAMIC_UI=Object.freeze({
 en:['Article link copied. Paste it into KakaoTalk or a message.','Article link copied for sharing.','Copy the address below.','Could not load reactions.','You already reacted.','Saving your reaction…','Thank you for your reaction.','Could not save your reaction. Please try again.','Could not load comments.','Reader','Enter a nickname of 1–30 characters.','Enter a comment of 2–1,000 characters.','Posting your comment…','Comment submitted. It will appear after review.','Could not post your comment. Please try again.','View data is being collected.','Read more articles by {name} on Global News24.','KakaoTalk sharing failed. Refresh the page and try again.'],
 zh:['文章链接已复制，可粘贴到 KakaoTalk 或消息中。','分享链接已复制。','请复制下方地址。','无法加载互动数据。','您已留下此互动。','正在保存互动…','感谢您的互动。','互动保存失败，请稍后重试。','无法加载评论。','读者','请输入 1–30 个字符的昵称。','请输入 2–1,000 个字符的评论。','正在提交评论…','评论已提交，审核后公开。','评论提交失败，请稍后重试。','浏览数据正在积累中。','在 Global News24 阅读{name}的更多文章。','KakaoTalk 分享失败，请刷新页面后重试。'],
 ja:['記事のリンクをコピーしました。KakaoTalkやメッセージに貼り付けられます。','共有用リンクをコピーしました。','以下のアドレスをコピーしてください。','リアクションを読み込めませんでした。','すでにリアクション済みです。','リアクションを保存しています…','リアクションを受け付けました。','リアクションを保存できませんでした。後でもう一度お試しください。','コメントを読み込めませんでした。','読者','ニックネームは1～30文字で入力してください。','コメントは2～1,000文字で入力してください。','コメントを投稿しています…','コメントを受け付けました。確認後に公開されます。','コメントを投稿できませんでした。後でもう一度お試しください。','閲覧データを集計中です。','Global News24で{name}の記事をもっと読む。','KakaoTalkで共有できませんでした。ページを更新して再度お試しください。'],
 mn:['Нийтлэлийн холбоосыг хууллаа. KakaoTalk эсвэл зурваст буулгана уу.','Хуваалцах холбоосыг хууллаа.','Доорх хаягийг хуулна уу.','Хариу үйлдлийг ачаалж чадсангүй.','Та аль хэдийн хариу үйлдэл үлдээсэн байна.','Хариу үйлдлийг хадгалж байна…','Хариу үйлдэл бүртгэгдлээ.','Хариу үйлдлийг хадгалж чадсангүй. Дараа дахин оролдоно уу.','Сэтгэгдлийг ачаалж чадсангүй.','Уншигч','Нэрээ 1–30 тэмдэгтээр оруулна уу.','Сэтгэгдлээ 2–1,000 тэмдэгтээр оруулна уу.','Сэтгэгдлийг илгээж байна…','Сэтгэгдэл илгээгдлээ. Хянасны дараа нийтлэгдэнэ.','Сэтгэгдлийг илгээж чадсангүй. Дараа дахин оролдоно уу.','Үзэлтийн мэдээлэл цугларч байна.','Global News24 дээр {name}-ийн бусад нийтлэлийг уншина уу.','KakaoTalk-оор хуваалцаж чадсангүй. Хуудсыг шинэчлээд дахин оролдоно уу.'],
 it:['Link copiato. Incollalo su KakaoTalk o in un messaggio.','Link di condivisione copiato.','Copia l’indirizzo qui sotto.','Impossibile caricare le reazioni.','Hai già lasciato questa reazione.','Salvataggio della reazione…','Grazie per la tua reazione.','Impossibile salvare la reazione. Riprova più tardi.','Impossibile caricare i commenti.','Lettore','Inserisci un nome di 1–30 caratteri.','Inserisci un commento di 2–1.000 caratteri.','Invio del commento…','Commento inviato. Sarà pubblicato dopo la revisione.','Impossibile inviare il commento. Riprova più tardi.','I dati sulle visualizzazioni sono in raccolta.','Leggi altri articoli di {name} su Global News24.','Condivisione KakaoTalk non riuscita. Aggiorna la pagina e riprova.'],
 ar:['تم نسخ رابط المقال. الصقه في KakaoTalk أو في رسالة.','تم نسخ رابط المشاركة.','انسخ العنوان أدناه.','تعذر تحميل التفاعلات.','لقد سجلت هذا التفاعل من قبل.','جارٍ حفظ التفاعل…','شكرًا على تفاعلك.','تعذر حفظ التفاعل. حاول مرة أخرى لاحقًا.','تعذر تحميل التعليقات.','قارئ','أدخل اسمًا من 1 إلى 30 حرفًا.','أدخل تعليقًا من 2 إلى 1000 حرف.','جارٍ إرسال التعليق…','تم إرسال التعليق وسيُنشر بعد المراجعة.','تعذر إرسال التعليق. حاول مرة أخرى لاحقًا.','يجري جمع بيانات المشاهدات.','اقرأ المزيد من مقالات {name} على Global News24.','تعذرت المشاركة عبر KakaoTalk. حدّث الصفحة وحاول مرة أخرى.'],
 es:['Enlace copiado. Pégalo en KakaoTalk o en un mensaje.','Enlace para compartir copiado.','Copia la dirección de abajo.','No se pudieron cargar las reacciones.','Ya has dejado esta reacción.','Guardando tu reacción…','Gracias por tu reacción.','No se pudo guardar la reacción. Inténtalo de nuevo.','No se pudieron cargar los comentarios.','Lector','Escribe un nombre de 1 a 30 caracteres.','Escribe un comentario de 2 a 1.000 caracteres.','Enviando comentario…','Comentario enviado. Se publicará tras su revisión.','No se pudo enviar el comentario. Inténtalo de nuevo.','Se están recopilando datos de visitas.','Lee más artículos de {name} en Global News24.','No se pudo compartir por KakaoTalk. Actualiza la página e inténtalo de nuevo.'],
 fr:['Lien copié. Collez-le dans KakaoTalk ou dans un message.','Lien de partage copié.','Copiez l’adresse ci-dessous.','Impossible de charger les réactions.','Vous avez déjà réagi.','Enregistrement de votre réaction…','Merci pour votre réaction.','Impossible d’enregistrer la réaction. Réessayez plus tard.','Impossible de charger les commentaires.','Lecteur','Saisissez un nom de 1 à 30 caractères.','Saisissez un commentaire de 2 à 1 000 caractères.','Envoi du commentaire…','Commentaire envoyé. Il sera publié après vérification.','Impossible d’envoyer le commentaire. Réessayez plus tard.','Les données de consultation sont en cours de collecte.','Lisez d’autres articles de {name} sur Global News24.','Échec du partage KakaoTalk. Actualisez la page et réessayez.'],
 de:['Artikellink kopiert. In KakaoTalk oder eine Nachricht einfügen.','Link zum Teilen kopiert.','Kopieren Sie die Adresse unten.','Reaktionen konnten nicht geladen werden.','Sie haben bereits reagiert.','Reaktion wird gespeichert…','Vielen Dank für Ihre Reaktion.','Reaktion konnte nicht gespeichert werden. Bitte erneut versuchen.','Kommentare konnten nicht geladen werden.','Leser','Geben Sie einen Namen mit 1–30 Zeichen ein.','Geben Sie einen Kommentar mit 2–1.000 Zeichen ein.','Kommentar wird gesendet…','Kommentar eingereicht. Er erscheint nach Prüfung.','Kommentar konnte nicht gesendet werden. Bitte erneut versuchen.','Aufrufdaten werden gesammelt.','Weitere Artikel von {name} auf Global News24 lesen.','KakaoTalk-Teilen fehlgeschlagen. Seite neu laden und erneut versuchen.'],
 pt:['Link copiado. Cole no KakaoTalk ou em uma mensagem.','Link de compartilhamento copiado.','Copie o endereço abaixo.','Não foi possível carregar as reações.','Você já registrou esta reação.','Salvando reação…','Obrigado pela reação.','Não foi possível salvar a reação. Tente novamente.','Não foi possível carregar os comentários.','Leitor','Digite um nome com 1 a 30 caracteres.','Digite um comentário com 2 a 1.000 caracteres.','Enviando comentário…','Comentário enviado. Será publicado após revisão.','Não foi possível enviar o comentário. Tente novamente.','Os dados de visualização estão sendo coletados.','Leia mais artigos de {name} no Global News24.','Falha ao compartilhar no KakaoTalk. Atualize a página e tente novamente.'],
 tr:['Makale bağlantısı kopyalandı. KakaoTalk veya bir mesaja yapıştırın.','Paylaşım bağlantısı kopyalandı.','Aşağıdaki adresi kopyalayın.','Tepkiler yüklenemedi.','Bu tepkiyi zaten verdiniz.','Tepkiniz kaydediliyor…','Tepkiniz için teşekkürler.','Tepki kaydedilemedi. Tekrar deneyin.','Yorumlar yüklenemedi.','Okur','1–30 karakterlik bir ad girin.','2–1.000 karakterlik bir yorum girin.','Yorum gönderiliyor…','Yorum gönderildi. İncelemeden sonra yayımlanacak.','Yorum gönderilemedi. Tekrar deneyin.','Görüntülenme verileri toplanıyor.','Global News24 üzerinde {name} adlı yazarın diğer yazılarını okuyun.','KakaoTalk paylaşımı başarısız oldu. Sayfayı yenileyip tekrar deneyin.'],
 vi:['Đã sao chép liên kết. Dán vào KakaoTalk hoặc tin nhắn.','Đã sao chép liên kết chia sẻ.','Sao chép địa chỉ bên dưới.','Không thể tải lượt tương tác.','Bạn đã tương tác rồi.','Đang lưu tương tác…','Cảm ơn bạn đã tương tác.','Không thể lưu tương tác. Vui lòng thử lại.','Không thể tải bình luận.','Độc giả','Nhập tên dài 1–30 ký tự.','Nhập bình luận dài 2–1.000 ký tự.','Đang gửi bình luận…','Đã gửi bình luận. Bình luận sẽ hiển thị sau khi duyệt.','Không thể gửi bình luận. Vui lòng thử lại.','Dữ liệu lượt xem đang được thu thập.','Đọc thêm bài của {name} trên Global News24.','Không thể chia sẻ qua KakaoTalk. Hãy tải lại trang và thử lại.'],
 th:['คัดลอกลิงก์บทความแล้ว วางใน KakaoTalk หรือข้อความได้เลย','คัดลอกลิงก์สำหรับแชร์แล้ว','คัดลอกที่อยู่ด้านล่าง','โหลดข้อมูลปฏิกิริยาไม่ได้','คุณแสดงปฏิกิริยานี้แล้ว','กำลังบันทึกปฏิกิริยา…','ขอบคุณสำหรับปฏิกิริยาของคุณ','บันทึกปฏิกิริยาไม่ได้ โปรดลองอีกครั้ง','โหลดความคิดเห็นไม่ได้','ผู้อ่าน','กรอกชื่อ 1–30 อักขระ','กรอกความคิดเห็น 2–1,000 อักขระ','กำลังส่งความคิดเห็น…','ส่งความคิดเห็นแล้ว จะแสดงหลังตรวจสอบ','ส่งความคิดเห็นไม่ได้ โปรดลองอีกครั้ง','กำลังรวบรวมข้อมูลยอดเข้าชม','อ่านบทความอื่นของ {name} บน Global News24','แชร์ผ่าน KakaoTalk ไม่สำเร็จ รีเฟรชหน้าแล้วลองอีกครั้ง'],
 id:['Tautan artikel disalin. Tempel di KakaoTalk atau pesan.','Tautan berbagi disalin.','Salin alamat di bawah ini.','Gagal memuat reaksi.','Anda sudah memberikan reaksi ini.','Menyimpan reaksi…','Terima kasih atas reaksi Anda.','Gagal menyimpan reaksi. Coba lagi.','Gagal memuat komentar.','Pembaca','Masukkan nama sepanjang 1–30 karakter.','Masukkan komentar sepanjang 2–1.000 karakter.','Mengirim komentar…','Komentar terkirim dan akan tampil setelah ditinjau.','Gagal mengirim komentar. Coba lagi.','Data tayangan sedang dikumpulkan.','Baca artikel lain oleh {name} di Global News24.','Gagal berbagi lewat KakaoTalk. Muat ulang halaman dan coba lagi.'],
 ms:['Pautan artikel disalin. Tampal dalam KakaoTalk atau mesej.','Pautan perkongsian disalin.','Salin alamat di bawah.','Gagal memuatkan reaksi.','Anda sudah memberikan reaksi ini.','Menyimpan reaksi…','Terima kasih atas reaksi anda.','Gagal menyimpan reaksi. Cuba lagi.','Gagal memuatkan komen.','Pembaca','Masukkan nama sepanjang 1–30 aksara.','Masukkan komen sepanjang 2–1,000 aksara.','Menghantar komen…','Komen dihantar dan akan dipaparkan selepas semakan.','Gagal menghantar komen. Cuba lagi.','Data tontonan sedang dikumpulkan.','Baca lagi artikel oleh {name} di Global News24.','Gagal berkongsi melalui KakaoTalk. Muat semula halaman dan cuba lagi.'],
 fa:['پیوند مقاله کپی شد. آن را در KakaoTalk یا پیام بچسبانید.','پیوند اشتراک‌گذاری کپی شد.','نشانی زیر را کپی کنید.','بارگذاری واکنش‌ها ممکن نشد.','شما قبلاً این واکنش را ثبت کرده‌اید.','در حال ذخیره واکنش…','از واکنش شما سپاسگزاریم.','ذخیره واکنش ممکن نشد. دوباره تلاش کنید.','بارگذاری دیدگاه‌ها ممکن نشد.','خواننده','نامی با ۱ تا ۳۰ نویسه وارد کنید.','دیدگاهی با ۲ تا ۱۰۰۰ نویسه وارد کنید.','در حال ارسال دیدگاه…','دیدگاه ارسال شد و پس از بررسی منتشر می‌شود.','ارسال دیدگاه ممکن نشد. دوباره تلاش کنید.','داده‌های بازدید در حال جمع‌آوری است.','مقاله‌های بیشتر {name} را در Global News24 بخوانید.','اشتراک‌گذاری از طریق KakaoTalk ممکن نشد. صفحه را تازه کنید و دوباره تلاش کنید.']
});
function articleDynamicText(article,key){
 const info=articleEditionInfo(article),lang=info?.type==='global'?articleUiLang(info.code):'ko';
 if(lang==='ko')return null;
 if(key==='editorDesk')return (GN24_ARTICLE_TAIL[lang]||GN24_ARTICLE_TAIL.en).desk;
 const index=GN24_DYNAMIC_KEYS.indexOf(key);
 return (GN24_DYNAMIC_UI[lang]||GN24_DYNAMIC_UI.en)[index]||GN24_DYNAMIC_UI.en[index];
}
function setText(sel,value){const el=document.querySelector(sel);if(el&&value)el.textContent=value}
const GN24_ARTICLE_CHROME=Object.freeze({
 en:{nav:['Home','Breaking','General News','Martial Arts · Sports','Safety · Drone','Public Interest','Opinion','Press Releases'],search:'Search articles',breaking:'Global News24 Breaking News',views:'Views',editor:'Global News24 Editorial Desk',reporter:'Global News24 Reporter',profile:'Reporter profile · More articles ›',shareTitle:'Share this article',shareDesc:'Share Global News24 articles via KakaoTalk and social media.',comments:'Comments',headline:'Headlines',latest:'Latest Articles',related:'Related Articles',all:'All Articles'},
 es:{nav:['Inicio','Última hora','Noticias','Artes marciales · Deportes','Seguridad · Drones','Interés público','Opinión','Comunicados'],search:'Buscar artículos',breaking:'Noticias de última hora de Global News24',views:'Vistas',editor:'Redacción Global News24',reporter:'Periodista de Global News24',profile:'Perfil del periodista · Más artículos ›',shareTitle:'Comparte este artículo',shareDesc:'Comparte artículos de Global News24 en redes sociales.',comments:'Comentarios',headline:'Titulares',latest:'Últimos artículos',related:'Artículos relacionados',all:'Todos los artículos'},
 ar:{nav:['الرئيسية','عاجل','الأخبار','الفنون القتالية · الرياضة','السلامة · الدرون','المصلحة العامة','الرأي','بيانات صحفية'],search:'البحث في الأخبار',breaking:'آخر أخبار Global News24',views:'المشاهدات',editor:'هيئة تحرير Global News24',reporter:'صحفي Global News24',profile:'ملف الصحفي · مقالات أخرى ›',shareTitle:'شارك هذا الخبر',shareDesc:'شارك أخبار Global News24 عبر وسائل التواصل الاجتماعي.',comments:'التعليقات',headline:'العناوين الرئيسية',latest:'أحدث المقالات',related:'مقالات ذات صلة',all:'كل المقالات'},
 mn:{nav:['Нүүр','Шуурхай','Мэдээ','Тулааны урлаг · Спорт','Аюулгүй байдал · Дрон','Нийтийн эрх ашиг','Үзэл бодол','Хэвлэлийн мэдээ'],search:'Нийтлэл хайх',breaking:'Global News24 шуурхай мэдээ',views:'Үзсэн',editor:'Global News24 редакц',reporter:'Global News24 сэтгүүлч',profile:'Сэтгүүлчийн танилцуулга · Бусад нийтлэл ›',shareTitle:'Энэ мэдээг хуваалцаарай',shareDesc:'Global News24 мэдээг сошиал сувгаар хуваалцаарай.',comments:'Сэтгэгдэл',headline:'Онцлох мэдээ',latest:'Сүүлийн нийтлэл',related:'Холбоотой нийтлэл',all:'Бүх нийтлэл'},
 zh:{nav:['首页','快讯','综合新闻','武道·体育','安全·无人机','公益','观点','新闻稿'],search:'搜索新闻',breaking:'Global News24 实时要闻',views:'浏览',editor:'Global News24 编辑部',reporter:'Global News24 记者',profile:'记者资料·更多文章 ›',shareTitle:'分享这篇新闻',shareDesc:'将 Global News24 新闻分享到社交媒体。',comments:'评论',headline:'头条新闻',latest:'最新文章',related:'相关文章',all:'全部文章'},
 ja:{nav:['ホーム','速報','総合ニュース','武道・スポーツ','安全・ドローン','公益','オピニオン','プレスリリース'],search:'記事検索',breaking:'Global News24 最新速報',views:'閲覧',editor:'Global News24 編集部',reporter:'Global News24 記者',profile:'記者プロフィール・他の記事 ›',shareTitle:'この記事をシェア',shareDesc:'Global News24の記事をSNSで共有できます。',comments:'コメント',headline:'ヘッドライン',latest:'最新記事',related:'関連記事',all:'全記事'},
 fr:{nav:['Accueil','Dernière minute','Actualités','Arts martiaux · Sports','Sécurité · Drones','Intérêt public','Opinion','Communiqués'],search:'Rechercher',breaking:'Dernières nouvelles Global News24',views:'Vues',editor:'Rédaction Global News24',reporter:'Journaliste Global News24',profile:'Profil · Autres articles ›',shareTitle:'Partagez cet article',shareDesc:'Partagez les articles Global News24 sur les réseaux sociaux.',comments:'Commentaires',headline:'À la une',latest:'Derniers articles',related:'Articles liés',all:'Tous les articles'},
 de:{nav:['Start','Eilmeldung','Nachrichten','Kampfsport · Sport','Sicherheit · Drohnen','Gemeinwohl','Meinung','Presse'],search:'Artikel suchen',breaking:'Global News24 Eilmeldungen',views:'Aufrufe',editor:'Global News24 Redaktion',reporter:'Global News24 Reporter',profile:'Reporterprofil · Weitere Artikel ›',shareTitle:'Diesen Artikel teilen',shareDesc:'Global News24 Artikel in sozialen Medien teilen.',comments:'Kommentare',headline:'Schlagzeilen',latest:'Neueste Artikel',related:'Verwandte Artikel',all:'Alle Artikel'},
 it:{nav:['Home','Ultim’ora','Notizie','Arti marziali · Sport','Sicurezza · Droni','Interesse pubblico','Opinioni','Comunicati'],search:'Cerca articoli',breaking:'Ultime notizie Global News24',views:'Visualizzazioni',editor:'Redazione Global News24',reporter:'Giornalista Global News24',profile:'Profilo · Altri articoli ›',shareTitle:'Condividi questo articolo',shareDesc:'Condividi gli articoli Global News24 sui social.',comments:'Commenti',headline:'Titoli principali',latest:'Ultimi articoli',related:'Articoli correlati',all:'Tutti gli articoli'},
 ko:{nav:['홈','속보','종합뉴스','무도·스포츠','안전·드론','공익','오피니언','보도자료'],search:'기사 검색',breaking:'Global News24 실시간 주요뉴스',views:'조회수',editor:'Global News24 편집부',reporter:'Global News24 기자',profile:'기자 프로필·다른 기사 보기 ›',shareTitle:'이 기사를 함께 나눠주세요',shareDesc:'Global News24 기사를 카카오톡과 SNS로 공유하세요.',comments:'댓글',headline:'헤드라인',latest:'최신기사',related:'관련 기사',all:'전체기사'},
 pt:{nav:['Início','Últimas','Notícias','Artes marciais · Esportes','Segurança · Drones','Interesse público','Opinião','Comunicados'],search:'Buscar artigos',breaking:'Últimas notícias Global News24',views:'Visualizações',editor:'Redação Global News24',reporter:'Jornalista Global News24',profile:'Perfil · Mais artigos ›',shareTitle:'Compartilhe este artigo',shareDesc:'Compartilhe artigos Global News24 nas redes sociais.',comments:'Comentários',headline:'Destaques',latest:'Últimos artigos',related:'Artigos relacionados',all:'Todos os artigos'}
});
const GN24_CATEGORY_I18N=Object.freeze({
 en:{'국내소식':'Domestic','국제뉴스':'International News','경제':'Economy','사회':'Society','청소년·문화':'Youth · Culture','문화·교육':'Culture · Education','무도·스포츠':'Martial Arts · Sports','안전·구조':'Safety · Rescue','AI·혁신기술':'AI · Innovation','공익':'Public Interest','오피니언':'Opinion','뉴스':'News'},
 zh:{'국내소식':'国内新闻','국제뉴스':'国际新闻','경제':'经济','사회':'社会','청소년·문화':'青少年·文化','문화·교육':'文化·教育','무도·스포츠':'武道·体育','안전·구조':'安全·救援','AI·혁신기술':'AI·创新技术','공익':'公益','오피니언':'观点','뉴스':'新闻'},
 ja:{'국내소식':'国内ニュース','국제뉴스':'国際ニュース','경제':'経済','사회':'社会','청소년·문화':'青少年・文化','문화·교육':'文化・教育','무도·스포츠':'武道・スポーツ','안전·구조':'安全・救助','AI·혁신기술':'AI・革新技術','공익':'公益','오피니언':'オピニオン','뉴스':'ニュース'},
 es:{'국내소식':'Nacional','국제뉴스':'Noticias internacionales','경제':'Economía','사회':'Sociedad','청소년·문화':'Juventud · Cultura','문화·교육':'Cultura · Educación','무도·스포츠':'Artes marciales · Deportes','안전·구조':'Seguridad · Rescate','AI·혁신기술':'IA · Innovación','공익':'Interés público','오피니언':'Opinión','뉴스':'Noticias'},
 fr:{'국내소식':'National','국제뉴스':'Actualités internationales','경제':'Économie','사회':'Société','청소년·문화':'Jeunesse · Culture','문화·교육':'Culture · Éducation','무도·스포츠':'Arts martiaux · Sports','안전·구조':'Sécurité · Secours','AI·혁신기술':'IA · Innovation','공익':'Intérêt public','오피니언':'Opinion','뉴스':'Actualités'},
 de:{'국내소식':'Inland','국제뉴스':'Internationale Nachrichten','경제':'Wirtschaft','사회':'Gesellschaft','청소년·문화':'Jugend · Kultur','문화·교육':'Kultur · Bildung','무도·스포츠':'Kampfsport · Sport','안전·구조':'Sicherheit · Rettung','AI·혁신기술':'KI · Innovation','공익':'Gemeinwohl','오피니언':'Meinung','뉴스':'Nachrichten'},
 it:{'국내소식':'Notizie nazionali','국제뉴스':'Notizie internazionali','경제':'Economia','사회':'Società','청소년·문화':'Giovani · Cultura','문화·교육':'Cultura · Istruzione','무도·스포츠':'Arti marziali · Sport','안전·구조':'Sicurezza · Soccorso','AI·혁신기술':'IA · Innovazione','공익':'Interesse pubblico','오피니언':'Opinioni','뉴스':'Notizie'},
 pt:{'국내소식':'Nacional','국제뉴스':'Notícias internacionais','경제':'Economia','사회':'Sociedade','청소년·문화':'Juventude · Cultura','문화·교육':'Cultura · Educação','무도·스포츠':'Artes marciais · Esportes','안전·구조':'Segurança · Resgate','AI·혁신기술':'IA · Inovação','공익':'Interesse público','오피니언':'Opinião','뉴스':'Notícias'},
 ar:{'국내소식':'أخبار محلية','국제뉴스':'أخبار دولية','경제':'اقتصاد','사회':'مجتمع','청소년·문화':'الشباب · الثقافة','문화·교육':'الثقافة · التعليم','무도·스포츠':'الفنون القتالية · الرياضة','안전·구조':'السلامة · الإنقاذ','AI·혁신기술':'الذكاء الاصطناعي · الابتكار','공익':'المصلحة العامة','오피니언':'الرأي','뉴스':'أخبار'},
 mn:{'국내소식':'Дотоод мэдээ','국제뉴스':'Олон улсын мэдээ','경제':'Эдийн засаг','사회':'Нийгэм','청소년·문화':'Залуучууд · Соёл','문화·교육':'Соёл · Боловсрол','무도·스포츠':'Тулааны урлаг · Спорт','안전·구조':'Аюулгүй байдал · Аврах','AI·혁신기술':'AI · Инноваци','공익':'Нийтийн эрх ашиг','오피니언':'Үзэл бодол','뉴스':'Мэдээ'}
});
const GN24_ARTICLE_TAIL=Object.freeze({
 en:{desk:'Global News24 Editorial Desk',reporter:'Global News24 Reporter',bio:'Covering people and stories across public interest, safety, martial arts, sports, AI and international affairs.',profile:'Reporter profile · More articles ›',share:'Share this article',kakao:'Send via KakaoTalk',copy:'Copy link',band:'Band',facebook:'Facebook',telegram:'Telegram',more:'More',noComments:'No public comments yet. Be the first to share your view.',footerDesc:'A digital news publication covering people and stories across public interest, safety, martial arts, sports, AI and international affairs.',reg:'Online Newspaper Registration',regNo:'Registration No.',regDate:'Registration date',publisher:'Publisher / Editor',phone:'Telephone',address:'Address',all:'All Articles',reporters:'Reporters',tip:'News Tips',ads:'Advertising',privacy:'Privacy Policy',terms:'Terms of Use'},
 zh:{desk:'Global News24 编辑部',reporter:'Global News24 记者',bio:'记录公益、安全、武道、体育、AI及国际领域的现场与人物。',profile:'记者资料 · 更多文章 ›',share:'分享这篇新闻',kakao:'通过 KakaoTalk 发送',copy:'复制链接',band:'Band',facebook:'Facebook',telegram:'Telegram',more:'更多',noComments:'暂无公开评论，欢迎留下您的意见。',footerDesc:'报道公益、安全、武道、体育、AI及国际领域现场与人物的数字网络新闻媒体。',reg:'网络新闻登记信息',regNo:'登记编号',regDate:'登记日期',publisher:'发行人 / 编辑人',phone:'联系电话',address:'地址',all:'全部文章',reporters:'记者介绍',tip:'新闻投稿',ads:'广告咨询',privacy:'隐私政策',terms:'使用条款'},
 ja:{desk:'Global News24 編集部',reporter:'Global News24 記者',bio:'公益・安全・武道・スポーツ・AI・国際分野の現場と人々を伝えます。',profile:'記者プロフィール・他の記事 ›',share:'この記事をシェア',kakao:'KakaoTalkで送る',copy:'リンクをコピー',band:'Band',facebook:'Facebook',telegram:'Telegram',more:'もっと見る',noComments:'公開コメントはまだありません。最初のご意見をお寄せください。',footerDesc:'公益・安全・武道・スポーツ・AI・国際分野の現場と人々を伝えるデジタルニュースメディアです。',reg:'インターネット新聞登録情報',regNo:'登録番号',regDate:'登録日',publisher:'発行人 / 編集人',phone:'代表電話',address:'住所',all:'全記事',reporters:'記者紹介',tip:'情報提供',ads:'広告お問い合わせ',privacy:'プライバシーポリシー',terms:'利用規約'},
 es:{desk:'Redacción Global News24',reporter:'Periodista de Global News24',bio:'Historias y protagonistas de interés público, seguridad, artes marciales, deportes, IA y asuntos internacionales.',profile:'Perfil · Más artículos ›',share:'Comparte este artículo',kakao:'Enviar por KakaoTalk',copy:'Copiar enlace',band:'Band',facebook:'Facebook',telegram:'Telegram',more:'Más',noComments:'Aún no hay comentarios públicos. Comparte la primera opinión.',footerDesc:'Medio digital que informa sobre interés público, seguridad, artes marciales, deportes, IA y asuntos internacionales.',reg:'Registro del periódico digital',regNo:'N.º de registro',regDate:'Fecha de registro',publisher:'Editor / Director',phone:'Teléfono',address:'Dirección',all:'Todos los artículos',reporters:'Periodistas',tip:'Enviar noticia',ads:'Publicidad',privacy:'Política de privacidad',terms:'Términos de uso'},
 it:{desk:'Redazione Global News24',reporter:'Giornalista Global News24',bio:'Raccontiamo persone e storie di interesse pubblico, sicurezza, arti marziali, sport, IA e attualità internazionale.',profile:'Profilo · Altri articoli ›',share:'Condividi questo articolo',kakao:'Invia con KakaoTalk',copy:'Copia link',band:'Band',facebook:'Facebook',telegram:'Telegram',more:'Altro',noComments:'Non ci sono ancora commenti pubblici. Lascia la prima opinione.',footerDesc:'Testata digitale dedicata a interesse pubblico, sicurezza, arti marziali, sport, IA e attualità internazionale.',reg:'Registrazione del giornale online',regNo:'N. registrazione',regDate:'Data registrazione',publisher:'Editore / Direttore',phone:'Telefono',address:'Indirizzo',all:'Tutti gli articoli',reporters:'Giornalisti',tip:'Segnala una notizia',ads:'Pubblicità',privacy:'Privacy',terms:'Termini di utilizzo'},
 ar:{desk:'هيئة تحرير Global News24',reporter:'صحفي Global News24',bio:'نغطي الميدان والناس في مجالات المصلحة العامة والسلامة والفنون القتالية والرياضة والذكاء الاصطناعي والشؤون الدولية.',profile:'ملف الصحفي · مقالات أخرى ›',share:'شارك هذا الخبر',kakao:'إرسال عبر KakaoTalk',copy:'نسخ الرابط',band:'Band',facebook:'Facebook',telegram:'Telegram',more:'المزيد',noComments:'لا توجد تعليقات عامة بعد. شارك برأيك الأول.',footerDesc:'صحيفة رقمية تغطي المصلحة العامة والسلامة والفنون القتالية والرياضة والذكاء الاصطناعي والشؤون الدولية.',reg:'بيانات تسجيل الصحيفة الإلكترونية',regNo:'رقم التسجيل',regDate:'تاريخ التسجيل',publisher:'الناشر / المحرر',phone:'الهاتف',address:'العنوان',all:'كل المقالات',reporters:'الصحفيون',tip:'إرسال خبر',ads:'الإعلانات',privacy:'سياسة الخصوصية',terms:'شروط الاستخدام'},
 mn:{desk:'Global News24 редакц',reporter:'Global News24 сэтгүүлч',bio:'Нийтийн эрх ашиг, аюулгүй байдал, тулааны урлаг, спорт, AI болон олон улсын салбарын үйл явдал, хүмүүсийг сурвалжилна.',profile:'Сэтгүүлчийн танилцуулга · Бусад нийтлэл ›',share:'Энэ мэдээг хуваалцаарай',kakao:'KakaoTalk-аар илгээх',copy:'Линк хуулах',band:'Band',facebook:'Facebook',telegram:'Telegram',more:'Дэлгэрэнгүй',noComments:'Нийтэд нээлттэй сэтгэгдэл алга. Анхны саналаа үлдээнэ үү.',footerDesc:'Нийтийн эрх ашиг, аюулгүй байдал, тулааны урлаг, спорт, AI, олон улсын мэдээг хүргэдэг дижитал мэдээллийн хэрэгсэл.',reg:'Цахим сонины бүртгэлийн мэдээлэл',regNo:'Бүртгэлийн дугаар',regDate:'Бүртгэсэн огноо',publisher:'Эрхлэгч / Редактор',phone:'Утас',address:'Хаяг',all:'Бүх нийтлэл',reporters:'Сэтгүүлчид',tip:'Мэдээ өгөх',ads:'Сурталчилгаа',privacy:'Нууцлалын бодлого',terms:'Үйлчилгээний нөхцөл'}
});
function localizeArticleTail(lang){
 const t=GN24_ARTICLE_TAIL[lang]||GN24_ARTICLE_TAIL.en;
 setText('.author-info span',t.reporter);setText('.author-info p',t.bio);setText('.author-more',t.profile);
 setText('.share-hub-copy h2',t.share);const kb=document.querySelector('.share-main-kakao b');if(kb)kb.textContent=t.kakao;
 setText('.share-main-kakao small',t.shareDesc||GN24_ARTICLE_CHROME[lang]?.shareDesc||GN24_ARTICLE_CHROME.en.shareDesc);
 setText('.share-hub-copy > span',t.share);
 const acts=document.querySelectorAll('.share-action-btn b');[t.copy,t.band,t.facebook,'X',t.telegram,t.more].forEach((v,i)=>{if(acts[i])acts[i].textContent=v});
 const mobile=document.querySelectorAll('.mobile-share-dock button');[t.kakao,t.copy,(GN24_ARTICLE_CHROME[lang]||GN24_ARTICLE_CHROME.en).shareTitle].forEach((v,i)=>{if(mobile[i]?.lastChild?.nodeType===3)mobile[i].lastChild.textContent=v});
 const empty=document.querySelector('.comment-empty');if(empty)empty.textContent=t.noComments;
 setText('.gn24-footer-brand p',t.footerDesc);setText('.gn24-footer-info h2',t.reg);
 const dts=document.querySelectorAll('.gn24-footer-register dt');[t.regNo,t.regDate,t.publisher,t.phone,t.address].forEach((v,i)=>{if(dts[i])dts[i].textContent=v});
 const links=document.querySelectorAll('.gn24-footer-links nav a');[t.all,t.reporters,t.tip,t.ads,t.privacy,t.terms].forEach((v,i)=>{if(links[i])links[i].textContent=v});
}
function articleDisplayCategory(article,category){const info=articleEditionInfo(article);if(info?.type!=='global')return category||'뉴스';const map=GN24_CATEGORY_I18N[articleUiLang(info.code)]||GN24_CATEGORY_I18N.en;return map[category||'뉴스']||category||'뉴스'}
function localizeArticleCategory(lang){
 const el=document.querySelector('#aCat');if(!el)return;
 const map=GN24_CATEGORY_I18N[lang]||GN24_CATEGORY_I18N.en;
 const raw=(el.dataset.gn24Category||el.textContent||'').trim();if(!el.dataset.gn24Category)el.dataset.gn24Category=raw;
 el.textContent=map[raw]||raw;
}
function localizeArticleChrome(lang){
 const t=GN24_ARTICLE_CHROME[lang]||GN24_ARTICLE_CHROME.en;localizeArticleCategory(lang);localizeArticleTail(lang);
 const words={en:{country:'GLOBAL NEWS24 COUNTRY EDITION',share:'Share',kakao:'KakaoTalk',copy:'Copy link',print:'Print',nickname:'Nickname',comment:'Write a comment (max 1,000 characters)',submit:'Post comment',source:'Source'},es:{country:'EDICIÓN NACIONAL GLOBAL NEWS24',share:'Compartir',kakao:'KakaoTalk',copy:'Copiar enlace',print:'Imprimir',nickname:'Nombre',comment:'Escribe un comentario (máx. 1.000 caracteres)',submit:'Publicar',source:'Fuente'},ar:{country:'نسخة GLOBAL NEWS24 الوطنية',share:'مشاركة',kakao:'كاكاوتوك',copy:'نسخ الرابط',print:'طباعة',nickname:'الاسم',comment:'اكتب تعليقًا (بحد أقصى 1000 حرف)',submit:'إرسال التعليق',source:'المصدر'},mn:{country:'GLOBAL NEWS24 УЛСЫН ХУВИЛБАР',share:'Хуваалцах',kakao:'KakaoTalk',copy:'Линк хуулах',print:'Хэвлэх',nickname:'Нэр',comment:'Сэтгэгдэл бичнэ үү (1000 тэмдэгт)',submit:'Сэтгэгдэл илгээх',source:'Эх сурвалж'},zh:{country:'GLOBAL NEWS24 国家版',share:'分享',kakao:'KakaoTalk',copy:'复制链接',print:'打印',nickname:'昵称',comment:'请输入评论（最多1000字）',submit:'发表评论',source:'资料来源'},ja:{country:'GLOBAL NEWS24 国別版',share:'共有',kakao:'カカオトーク',copy:'リンクをコピー',print:'印刷',nickname:'ニックネーム',comment:'コメントを入力（最大1,000文字）',submit:'コメント投稿',source:'資料・出典'},fr:{country:'ÉDITION NATIONALE GLOBAL NEWS24',share:'Partager',kakao:'KakaoTalk',copy:'Copier le lien',print:'Imprimer',nickname:'Nom',comment:'Écrire un commentaire (1 000 caractères max.)',submit:'Publier',source:'Source'},de:{country:'GLOBAL NEWS24 LÄNDERAUSGABE',share:'Teilen',kakao:'KakaoTalk',copy:'Link kopieren',print:'Drucken',nickname:'Name',comment:'Kommentar schreiben (max. 1.000 Zeichen)',submit:'Kommentar senden',source:'Quelle'},it:{country:'EDIZIONE NAZIONALE GLOBAL NEWS24',share:'Condividi',kakao:'KakaoTalk',copy:'Copia link',print:'Stampa',nickname:'Nome',comment:'Scrivi un commento (max 1.000 caratteri)',submit:'Pubblica',source:'Fonte'},pt:{country:'EDIÇÃO NACIONAL GLOBAL NEWS24',share:'Compartilhar',kakao:'KakaoTalk',copy:'Copiar link',print:'Imprimir',nickname:'Nome',comment:'Escreva um comentário (máx. 1.000 caracteres)',submit:'Publicar',source:'Fonte'},ko:{country:'GLOBAL NEWS24 국가판',share:'공유',kakao:'카카오톡',copy:'링크 복사',print:'인쇄',nickname:'닉네임',comment:'댓글을 입력하세요. (최대 1,000자)',submit:'댓글 등록',source:'자료·출처'}}[lang]||{country:'GLOBAL NEWS24 COUNTRY EDITION',share:t.shareTitle,kakao:'KakaoTalk',copy:'Copy link',print:'Print',nickname:'Nickname',comment:'Write a comment',submit:'Post comment',source:'Source'};
 const nav=document.querySelectorAll('.primary-nav .nav-scroll > .nav-item');t.nav.forEach((v,i)=>{const e=nav[i]?.querySelector(':scope > a,:scope > button');if(e)e.textContent=v});
 const q=document.querySelector('.searchbox input');if(q)q.placeholder=t.search;setText('#breakingText',t.breaking);
 const vl=document.querySelector('.article-viewline');if(vl){const b=vl.querySelector('b');vl.childNodes[0].nodeValue=t.views+' ';if(b&&!b.id)b.id='articleViewCount'}
 setText('.author-info span',t.reporter);setText('.author-more',t.profile);
 setText('.share-hub-copy h2',t.shareTitle);setText('.share-hub-copy p',t.shareDesc);
 setText('.article-bottom-news .bottom-news-column:nth-child(1) h2',t.headline);setText('.article-bottom-news .bottom-news-column:nth-child(2) h2',t.latest);
 setText('.article-related .section-head h2',t.related);const al=document.querySelector('.article-related .section-head a');if(al)al.textContent=t.all+' →';
 document.querySelectorAll('.article-edition-banner small').forEach(e=>e.textContent=words.country);
 const wide=document.querySelector('.article-tool-wide'); if(wide&&wide.textContent.trim()==='공유')wide.textContent=words.share;
 const kak=document.querySelector('[data-kakao-share]');if(kak)kak.textContent=words.kakao;
 const cp=document.querySelector('#copyArticleLink');if(cp)cp.textContent=words.copy;
 const pr=document.querySelector('#printArticle');if(pr)pr.textContent=words.print;
 const nick=document.querySelector('#commentNickname');if(nick)nick.placeholder=words.nickname;
 const cc=document.querySelector('#commentContent');if(cc)cc.placeholder=words.comment;
 const cs=document.querySelector('#commentForm button[type="submit"]');if(cs)cs.textContent=words.submit;
 const src=document.querySelector('#aSource strong');if(src)src.textContent=words.source;
 if(lang==='ar'||lang==='fa'){document.documentElement.dir='rtl';document.body.classList.add('article-rtl')}else{document.documentElement.dir='ltr';document.body.classList.remove('article-rtl')}
}

function localizeArticleUi(info){
  if(!info||info.type!=='global')return;
  const lang=articleUiLang(info.code);const t=GN24_ARTICLE_UI[lang];if(!t)return;
  document.documentElement.lang=lang;localizeArticleChrome(lang);
  setText('.article-sidebar .side-news-block:nth-of-type(1) .side-news-head h2',t.latest);
  setText('.article-sidebar .side-news-block:nth-of-type(1) .side-news-head a',t.more);
  setText('.article-sidebar .side-popular-block .side-news-head h2',t.popular);
  setText('.article-sidebar .side-news-block:nth-of-type(3) .side-news-head h2',t.related);
  setText('.article-sidebar .side-news-block:nth-of-type(3) .side-news-head span',t.recommended);
  setText('.article-engagement .reaction-title',t.reaction);
  const rb=document.querySelectorAll('.reaction-btn');[t.like,t.heart,t.support,t.useful].forEach((v,i)=>{const s=rb[i]?.querySelector('span:nth-child(2)');if(s)s.textContent=v});
  setText('.article-bottom-news .bottom-news-column:nth-child(1) h2',t.headline);
  setText('.article-bottom-news .bottom-news-column:nth-child(2) h2',t.latestArticles);
  setText('.article-related .section-head h2',t.relatedArticles);
  const source=document.querySelector('#aSource strong');if(source)source.textContent=t.source;
  setText('.comments-title',t.comments+' ');
  const count=document.querySelector('#approvedCommentCount');if(count)document.querySelector('.comments-title')?.appendChild(count);
  setText('.comments-guide',t.commentGuide);setText('.comment-form-top label span',t.nickname);setText('.comment-status-note',t.approved);
  const nick=document.querySelector('#commentNickname');if(nick)nick.placeholder=t.nickname;
  const area=document.querySelector('#commentContent');if(area)area.placeholder=t.commentPlaceholder;
  setText('#commentSubmitBtn',t.submit);setText('.comment-empty',t.empty);
  const native=document.querySelector('.article-native-share');if(native)native.textContent=t.share;
  const list=document.querySelector('.article-action-group .article-tool-wide');if(list)list.title=info.home;
  const copy=document.querySelector('#copyArticleLink');if(copy)copy.title=t.copy;const pr=document.querySelector('#printArticle');if(pr)pr.title=t.print;
  const plus=document.querySelector('#fontPlus');if(plus)plus.title=t.bigger;const minus=document.querySelector('#fontMinus');if(minus)minus.title=t.smaller;
}
function applyArticleEditionContext(a,data){
  const info=articleEditionInfo(a);if(!info)return data.filter(x=>x.id!==a.id);
  const peers=data.filter(x=>x.id!==a.id&&String(x.regionCode||x.region_code||'')===info.code);
  const banner=document.createElement('div');banner.className='article-edition-banner '+info.type;
  banner.innerHTML=`<a href="${info.href}" class="article-edition-home"><span class="article-edition-flag">${info.flagHTML}</span><span><small>${info.type==='global'?'GLOBAL NEWS24 COUNTRY EDITION':'GLOBAL NEWS24 LOCAL EDITION'}</small><b>${esc(info.title)}</b></span></a><a href="${info.href}" class="article-edition-back">← ${esc(info.back)}</a>`;
  const cat=$('#aCat');cat?.parentNode?.insertBefore(banner,cat);
  const quick=document.querySelector('.side-quick-block');if(quick){quick.innerHTML=`<b><span class="article-edition-mini-flag">${info.flagHTML}</span> ${esc(info.title)}</b><p>${info.type==='global'?'GLOBAL NEWS24 '+esc(info.label)+' Edition':'이 기사는 '+esc(info.label)+'에 배포된 GLOBAL NEWS24 기사입니다.'}</p><a href="${info.href}">${esc(info.home)}</a><a href="/">GLOBAL NEWS24</a>`;}
  const listLink=document.querySelector('.article-action-group .article-tool-wide');if(listLink){listLink.href=info.href;listLink.textContent='☰ '+info.home;}
  const relatedLink=document.querySelector('.article-related .section-head a');if(relatedLink){relatedLink.href=info.href;relatedLink.textContent=info.home+' →';}
  return peers.length?peers:data.filter(x=>x.id!==a.id);
}
async function loadArticle(){const shell=$('#articleShell');if(!shell)return;const id=new URLSearchParams(location.search).get('id'),data=sortNews(await loadNewsData()),a=data.find(x=>x.id===id)||data[0];if(!a)return;document.title=`${a.title} | Global News24`;$('#aCat').textContent=a.category||'뉴스';$('#aTitle').textContent=a.title;$('#aSub').textContent=a.subtitle||a.summary||'';const edition=articleEditionInfo(a),articleLang=edition?.type==='global'?articleUiLang(edition.code):'ko';const metaAuthor=a.author&&a.author!=='Global News24 편집부'?a.author:articleLang==='ko'?'Global News24 편집부':(GN24_ARTICLE_TAIL[articleLang]||GN24_ARTICLE_TAIL.en).desk;$('#aMeta').innerHTML=`<span>${esc(fmt(a.date))}</span><span>${esc(metaAuthor)}</span><span>Global News24</span>`;applyBg($('#aHero'),a.image);const caption=$('#aCaption');if(caption)caption.textContent=a.imageCaption||`▲ ${a.title} 관련 이미지`;const body=Array.isArray(a.content)?a.content:(Array.isArray(a.body)?a.body:[a.summary||'']);const rawBody=body.flatMap(p=>String(p||'').split(/\n\s*\n|\r?\n(?=\S)/)).map(p=>p.trim()).filter(Boolean);const isSubheadText=p=>p.length<=48&&!/[.!?。！？]$/.test(p)&&!/(다|요)[.!?]?$/.test(p);const sentenceSplit=p=>{if(isSubheadText(p))return [p];const parts=(p.match(/[^.!?。！？]+[.!?。！？]+(?:[\"'”’)]*)|[^.!?。！？]+$/g)||[p]).map(x=>x.trim()).filter(Boolean);if(parts.length<=1)return [p];const groups=[];let buf='';let count=0;for(const sent of parts){const next=(buf?buf+' ':'')+sent;if(buf&&(count>=2||next.length>190)){groups.push(buf);buf=sent;count=1}else{buf=next;count++}}if(buf)groups.push(buf);return groups};const cleanBody=rawBody.flatMap(sentenceSplit);let paraIndex=0;$('#aBody').innerHTML=cleanBody.map((p)=>{if(isSubheadText(p))return `<h2 class="article-subhead">${esc(p)}</h2>`;const cls=paraIndex++===0?' class="article-lead"':'';return `<p${cls}>${esc(p)}</p>`}).join('');$('#aSource')&&($('#aSource').innerHTML=`<strong>자료·출처</strong><br>${esc(a.sourceName||'Global News24')}${a.sourceUrl?` · <a href="${esc(a.sourceUrl)}" target="_blank" rel="noopener">원문/관련자료</a>`:''}`);const tags=a.tags||[];
const oldViewline=document.querySelector('.article-shell>.article-viewline');
if(oldViewline)oldViewline.remove();
$('#aMeta').insertAdjacentHTML('beforeend','<span class="article-viewline">조회수 <b id="articleViewCount">0</b></span>');
const editionData=applyArticleEditionContext(a,data);const rel=editionData.map(x=>({x,score:(x.category===a.category?3:0)+(x.tags||[]).filter(t=>tags.includes(t)).length})).sort((m,n)=>n.score-m.score||String(n.x.date||'').localeCompare(String(m.x.date||''))).filter(m=>m.score>0).slice(0,4).map(m=>m.x);
const related=$('#aRelated');
if(related){related.innerHTML=(rel.length?rel:data.filter(x=>x.id!==a.id).slice(0,4)).map((x,i)=>card(x,i,articleDisplayCategory(a,x.category))).join('')}
const sideLatest=$('#sideLatest');
if(sideLatest){
  sideLatest.innerHTML=editionData.slice(0,8).map((x,i)=>`<li><span class="side-rank">${String(i+1).padStart(2,'0')}</span><a href="${seoArticleURL(x)}">${esc(x.title)}</a></li>`).join('');
}
const sideRelated=$('#sideRelated');
if(sideRelated){
  const sideRel=(rel.length?rel:editionData.slice(0,4)).slice(0,4);
  sideRelated.innerHTML=sideRel.map(x=>`<a class="side-related-item" href="${seoArticleURL(x)}"><div class="side-related-thumb" ${bgStyle(x.image)}></div><div><span>${esc(articleDisplayCategory(a,x.category))}</span><b>${esc(x.title)}</b></div></a>`).join('');
}

const authorName=$('#articleAuthorName');
if(authorName) authorName.textContent=a.author||'Global News24 편집부';

const bottomHeadline=$('#bottomHeadline');
if(bottomHeadline){
  const featured=editionData.filter(x=>x.featured||x.pinned).slice(0,4);
  const rows=(featured.length?featured:editionData.slice(0,4));
  bottomHeadline.innerHTML=rows.map(x=>`<a class="bottom-news-item" href="${seoArticleURL(x)}"><div class="bottom-news-thumb" ${bgStyle(x.image)}></div><div><span>${esc(articleDisplayCategory(a,x.category))}</span><b>${esc(x.title)}</b></div></a>`).join('');
}
const bottomLatest=$('#bottomLatest');
if(bottomLatest){
  bottomLatest.innerHTML=editionData.slice(0,6).map(x=>`<a class="bottom-latest-item" href="${seoArticleURL(x)}">${esc(x.title)}</a>`).join('');
}

setArticleSocialMeta(a);
gn24PromoteStaticShareUrl(a);
setupArticleTools(a);
setupArticleCommunity(a);
setupArticleViewsAndPopular(a,data);
setupArticleReporter(a);
const articleEdition=articleEditionInfo(a);
if(articleEdition?.type==='global')localizeArticleUi(articleEdition);
}
document.addEventListener('DOMContentLoaded',()=>{setToday();setupNav();loadHome().catch(console.error);loadNewsroom().catch(console.error);loadArticle().catch(console.error)})

// v3.1.4: mobile hamburger contains real accordion mega menus.
document.addEventListener('DOMContentLoaded',()=>{
  const panel=document.querySelector('#utilityPanel .utility-grid');
  if(!panel) return;

  // Remove the simple v3.1.1 mobile links if they exist.
  panel.querySelectorAll('.mobile-menu-title,.mobile-menu-links,.mobile-mega-wrap').forEach(el=>el.remove());

  const wrap=document.createElement('div');
  wrap.className='mobile-mega-wrap';
  wrap.innerHTML=`
    <div class="mobile-mega-title">뉴스 전체메뉴</div>
    <div class="mobile-quick-links">
      <a href="/">홈</a>
      <a class="urgent" href="/pages/newsroom/?q=속보">속보</a>
    </div>
    <div class="mobile-accordion"></div>`;

  const acc=wrap.querySelector('.mobile-accordion');
  document.querySelectorAll('.primary-nav .nav-item.has-mega').forEach((item,i)=>{
    const btn=item.querySelector('.nav-btn');
    const head=item.querySelector('.mega-head');
    const links=item.querySelector('.mega-links');
    if(!btn||!links) return;
    const section=document.createElement('section');
    section.className='mobile-mega-section';
    section.innerHTML=`
      <button class="mobile-mega-trigger" type="button" aria-expanded="false">
        <span><b>${esc(btn.textContent.trim())}</b>${head?.querySelector('span')?`<small>${esc(head.querySelector('span').textContent.trim())}</small>`:''}</span>
        <i>＋</i>
      </button>
      <div class="mobile-mega-panel"></div>`;
    const mp=section.querySelector('.mobile-mega-panel');
    links.querySelectorAll('a').forEach(a=>{
      const clone=a.cloneNode(true);
      mp.appendChild(clone);
    });
    section.querySelector('.mobile-mega-trigger').addEventListener('click',e=>{
      e.stopPropagation();
      const open=section.classList.toggle('open');
      section.querySelector('.mobile-mega-trigger').setAttribute('aria-expanded',String(open));
      section.querySelector('.mobile-mega-trigger i').textContent=open?'−':'＋';
      acc.querySelectorAll('.mobile-mega-section.open').forEach(other=>{
        if(other!==section){
          other.classList.remove('open');
          const ob=other.querySelector('.mobile-mega-trigger');
          ob.setAttribute('aria-expanded','false');
          ob.querySelector('i').textContent='＋';
        }
      });
    });
    acc.appendChild(section);
  });

  panel.prepend(wrap);
  document.querySelectorAll('.brand small').forEach(el=>el.textContent='글로벌뉴스24');
});

// v3.1.5: hint that the horizontal mobile menu continues to the right.
document.addEventListener('DOMContentLoaded',()=>{
  const nav=document.querySelector('.primary-nav');
  const scroller=nav?.querySelector('.nav-scroll');
  if(!nav||!scroller) return;
  const updateHint=()=>{
    const atEnd=scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth - 8;
    nav.classList.toggle('nav-at-end',atEnd);
  };
  scroller.addEventListener('scroll',updateHint,{passive:true});
  window.addEventListener('resize',updateHint);
  updateHint();
});


function setupArticleTools(article){
  const ui=(key,korean)=>articleDynamicText(article,key)||korean;
  const realArticleUrl=new URL(articleURL(article?.id),location.origin).href;
  const verifiedShareUrl=()=>location.pathname.startsWith('/share/')
    ? new URL(location.pathname,location.origin).href
    : realArticleUrl;
  let url=verifiedShareUrl();
  document.addEventListener('gn24:share-ready',e=>{
    if(e?.detail?.articleId===article?.id) url=e.detail.url;
  });
  const title=article?.title||document.title||'Global News24';
  const shareUrl=(kind)=>{
    url=verifiedShareUrl();
    if(kind==='kakao'){
      // 카카오 버튼은 대표이미지 카드 기능을 유지합니다.
      gn24ShareKakao(article);
      return;
    }
    const u=encodeURIComponent(url), t=encodeURIComponent(title);
    const urls={
      facebook:`https://www.facebook.com/sharer/sharer.php?u=${u}`,
      x:`https://twitter.com/intent/tweet?url=${u}&text=${t}`,
      band:`https://band.us/plugin/share?body=${t}%0A${u}`,
      telegram:`https://t.me/share/url?url=${u}&text=${t}`
    };
    if(kind==='native'){
      if(navigator.share) navigator.share({title,text:title,url}).catch(()=>{});
      else navigator.clipboard?.writeText(url).then(()=>alert(ui('copiedShort','기사 링크를 복사했습니다.')));
      return;
    }
    if(urls[kind]) window.open(urls[kind],'gn24share','width=720,height=620,noopener,noreferrer');
  };
  document.querySelectorAll('[data-share]').forEach(btn=>{
    btn.onclick=()=>shareUrl(btn.dataset.share);
  });

  const shareHubTitle=document.getElementById('shareHubTitle');
  if(shareHubTitle) shareHubTitle.textContent=article?.title||'Global News24 기사';
  const shareHubThumb=document.getElementById('shareHubThumb');
  if(shareHubThumb && article?.image){
    shareHubThumb.style.backgroundImage=`url("${gn24AbsoluteUrl(article.image).replace(/"/g,'%22')}")`;
  }
  const shareHubMessage=document.getElementById('shareHubMessage');

  async function copyCurrentArticle(){
    url=verifiedShareUrl();
    try{
      await navigator.clipboard.writeText(url);
      if(shareHubMessage){
        shareHubMessage.textContent=ui('copied','기사 링크를 복사했습니다. 카카오톡이나 문자에 바로 붙여넣을 수 있습니다.');
        setTimeout(()=>{shareHubMessage.textContent='';},3200);
      }else alert(ui('copiedShort','카카오·SNS용 기사 링크를 복사했습니다.'));
    }catch(e){
      prompt(ui('copyPrompt','아래 주소를 복사하세요.'),url);
    }
  }

  document.querySelectorAll('[data-copy-article]').forEach(btn=>{
    btn.onclick=copyCurrentArticle;
  });

  const copyBtn=document.getElementById('copyArticleLink');
  if(copyBtn) copyBtn.onclick=copyCurrentArticle;
  const printBtn=document.getElementById('printArticle');
  if(printBtn) printBtn.onclick=()=>window.print();

  let articleFont=16;
  const body=document.getElementById('aBody');
  const applyFont=()=>{
    articleFont=Math.max(14,Math.min(22,articleFont));
    if(body) body.style.setProperty('--reader-font-size',articleFont+'px');
  };
  const plus=document.getElementById('fontPlus');
  const minus=document.getElementById('fontMinus');
  if(plus) plus.onclick=()=>{articleFont+=1;applyFont();};
  if(minus) minus.onclick=()=>{articleFont-=1;applyFont();};
  applyFont();

}


/* ===== Global News24 v3.2.16 · Supabase reactions & comments ===== */
function gn24GetVisitorId(){
  const key='gn24-visitor-id';
  let id=localStorage.getItem(key);
  if(!id){
    id=(crypto?.randomUUID?.() || ('v-'+Date.now()+'-'+Math.random().toString(36).slice(2)));
    localStorage.setItem(key,id);
  }
  return id;
}

function gn24SupabaseInfo(){
  const cfg=window.GN24_SUPABASE||{};
  return {
    url:String(cfg.url||'').replace(/\/$/,''),
    key:String(cfg.anonKey||'')
  };
}

async function gn24DbFetch(path, options={}){
  const {url,key}=gn24SupabaseInfo();
  if(!url||!key) throw new Error('Supabase 연결 설정이 없습니다.');
  const headers={
    apikey:key,
    Authorization:`Bearer ${key}`,
    'Content-Type':'application/json',
    ...(options.headers||{})
  };
  const res=await fetch(url+'/rest/v1/'+path,{...options,headers});
  if(!res.ok){
    let msg='요청 처리 중 오류가 발생했습니다.';
    try{
      const body=await res.json();
      msg=body?.message||body?.details||body?.hint||msg;
    }catch(e){}
    const err=new Error(msg);
    err.status=res.status;
    throw err;
  }
  if(res.status===204) return null;
  const text=await res.text();
  return text ? JSON.parse(text) : null;
}

async function setupArticleCommunity(article){
  if(!article?.id) return;
  const ui=(key,korean)=>articleDynamicText(article,key)||korean;

  const articleId=String(article.id);
  const visitorId=gn24GetVisitorId();
  const bar=document.getElementById('articleReactionBar');
  const reactionMessage=document.getElementById('reactionMessage');

  async function loadReactions(){
    if(!bar) return;
    try{
      const rows=await gn24DbFetch(
        `gn24_article_reactions?article_id=eq.${encodeURIComponent(articleId)}&select=reaction_type`
      ) || [];

      const counts={like:0,heart:0,support:0,useful:0};
      rows.forEach(r=>{
        if(Object.prototype.hasOwnProperty.call(counts,r.reaction_type)) counts[r.reaction_type]++;
      });

      Object.entries(counts).forEach(([type,count])=>{
        const el=bar.querySelector(`[data-count="${type}"]`);
        if(el) el.textContent=String(count);
      });

      // Browser's own reaction state is private and is not inferred from public rows.
      ['like','heart','support','useful'].forEach(type=>{
        const pressed=localStorage.getItem(`gn24-reacted:${articleId}:${type}`)==='1';
        const btn=bar.querySelector(`[data-reaction="${type}"]`);
        if(btn){
          btn.classList.toggle('active',pressed);
          btn.setAttribute('aria-pressed',pressed?'true':'false');
        }
      });
    }catch(e){
      console.warn('GN24 reaction load failed:',e);
      if(reactionMessage) reactionMessage.textContent=ui('reactionLoadError','반응 수를 불러오지 못했습니다.');
    }
  }

  if(bar){
    bar.querySelectorAll('[data-reaction]').forEach(btn=>{
      btn.addEventListener('click',async()=>{
        const type=btn.dataset.reaction;
        const localKey=`gn24-reacted:${articleId}:${type}`;
        if(localStorage.getItem(localKey)==='1'){
          if(reactionMessage) reactionMessage.textContent=ui('reactionAlready','이미 이 반응을 남기셨습니다.');
          return;
        }
        btn.disabled=true;
        if(reactionMessage) reactionMessage.textContent=ui('reactionSaving','반응을 저장하는 중입니다…');
        try{
          await gn24DbFetch('gn24_article_reactions',{
            method:'POST',
            headers:{Prefer:'return=minimal'},
            body:JSON.stringify({
              article_id:articleId,
              reaction_type:type,
              visitor_id:visitorId
            })
          });
          localStorage.setItem(localKey,'1');
          btn.classList.add('active');
          btn.setAttribute('aria-pressed','true');
          if(reactionMessage) reactionMessage.textContent=ui('reactionSaved','소중한 반응이 반영되었습니다.');
          await loadReactions();
        }catch(e){
          if(e.status===409){
            localStorage.setItem(localKey,'1');
            if(reactionMessage) reactionMessage.textContent=ui('reactionAlready','이미 이 반응을 남기셨습니다.');
            await loadReactions();
          }else{
            console.error(e);
            if(reactionMessage) reactionMessage.textContent=ui('reactionError','반응 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.');
          }
        }finally{
          btn.disabled=false;
        }
      });
    });
    loadReactions();
  }

  const form=document.getElementById('articleCommentForm');
  const list=document.getElementById('articleCommentList');
  const countEl=document.getElementById('approvedCommentCount');
  const message=document.getElementById('commentMessage');
  const nickname=document.getElementById('commentNickname');
  const content=document.getElementById('commentContent');
  const charCount=document.getElementById('commentCharCount');
  const submitBtn=document.getElementById('commentSubmitBtn');

  const savedNickname=localStorage.getItem('gn24-comment-nickname');
  if(nickname && savedNickname) nickname.value=savedNickname;

  if(content && charCount){
    const updateCount=()=>{charCount.textContent=`${content.value.length} / 1000`;};
    content.addEventListener('input',updateCount);
    updateCount();
  }

  async function loadComments(){
    if(!list) return;
    try{
      const rows=await gn24DbFetch(
        `gn24_article_comments?article_id=eq.${encodeURIComponent(articleId)}&status=eq.approved&select=id,nickname,content,created_at&order=created_at.desc`
      ) || [];
      if(countEl) countEl.textContent=String(rows.length);
      if(!rows.length){
        const info=articleEditionInfo(article);const empty=info?.type==='global'?(GN24_ARTICLE_TAIL[articleUiLang(info.code)]||GN24_ARTICLE_TAIL.en).noComments:null;
        list.innerHTML='<div class="comment-empty">'+esc(empty||'등록된 공개 댓글이 없습니다. 첫 의견을 남겨보세요.')+'</div>';
        return;
      }
      list.innerHTML=rows.map(row=>{
        const date=row.created_at ? new Date(row.created_at).toLocaleString('ko-KR',{
          year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'
        }) : '';
        return `<article class="comment-item">
          <div class="comment-item-head"><b>${esc(row.nickname||ui('reader','독자'))}</b><span>${esc(date)}</span></div>
          <p>${esc(row.content||'').replace(/\n/g,'<br>')}</p>
        </article>`;
      }).join('');
    }catch(e){
      console.warn('GN24 comments load failed:',e);
      list.innerHTML='<div class="comment-empty">'+esc(ui('commentsLoadError','댓글을 불러오지 못했습니다.'))+'</div>';
    }
  }

  if(form){
    form.addEventListener('submit',async(ev)=>{
      ev.preventDefault();
      const nick=(nickname?.value||'').trim();
      const text=(content?.value||'').trim();
      if(nick.length<1||nick.length>30){
        if(message) message.textContent=ui('nicknameError','닉네임은 1~30자로 입력해 주세요.');
        return;
      }
      if(text.length<2||text.length>1000){
        if(message) message.textContent=ui('commentError','댓글은 2~1,000자로 입력해 주세요.');
        return;
      }
      if(submitBtn) submitBtn.disabled=true;
      if(message) message.textContent=ui('commentSaving','댓글을 등록하는 중입니다…');
      try{
        await gn24DbFetch('gn24_article_comments',{
          method:'POST',
          headers:{Prefer:'return=minimal'},
          body:JSON.stringify({
            article_id:articleId,
            nickname:nick,
            content:text,
            visitor_id:visitorId,
            status:'pending'
          })
        });
        localStorage.setItem('gn24-comment-nickname',nick);
        if(content) content.value='';
        if(charCount) charCount.textContent='0 / 1000';
        if(message) message.textContent=ui('commentSaved','댓글이 등록되었습니다. 관리자 확인 후 공개됩니다.');
      }catch(e){
        console.error(e);
        if(message) message.textContent=ui('commentSaveError','댓글 등록에 실패했습니다. 잠시 후 다시 시도해 주세요.');
      }finally{
        if(submitBtn) submitBtn.disabled=false;
      }
    });
  }

  loadComments();
}


/* ===== GN24 v3.2.19 · real views + popular news ===== */
async function setupArticleViewsAndPopular(article, allArticles){
  if(!article?.id) return;
  const articleId=String(article.id);
  const viewEl=document.getElementById('articleViewCount');

  try{
    // RPC increments once per page load. SQL function is SECURITY DEFINER.
    const {url,key}=gn24SupabaseInfo();
    if(url&&key){
      const res=await fetch(url+'/rest/v1/rpc/gn24_increment_article_view',{
        method:'POST',
        headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json'},
        body:JSON.stringify({p_article_id:articleId})
      });
      if(res.ok){
        const payload=await res.json();
        const count=Array.isArray(payload)?payload[0]:payload;
        if(viewEl) viewEl.textContent=Number(count||0).toLocaleString('ko-KR');
      }
    }
  }catch(e){ console.warn('GN24 view increment failed',e); }

  try{
    const rows=await gn24DbFetch('gn24_article_views?select=article_id,view_count&order=view_count.desc&limit=10')||[];
    const titleMap={};
    (allArticles||[]).forEach(a=>titleMap[String(a.id)]=a);
    const popular=document.getElementById('sidePopular');
    if(popular){
      popular.innerHTML=rows.map((r,i)=>{
        const a=titleMap[String(r.article_id)];
        if(!a) return '';
        return `<li><span class="side-rank">${String(i+1).padStart(2,'0')}</span><a href="${seoArticleURL(a)}">${esc(a.title)}</a><small class="popular-views">${Number(r.view_count||0).toLocaleString('ko-KR')}</small></li>`;
      }).join('') || '<li class="popular-empty">'+esc(articleDynamicText(article,'popularEmpty')||'조회 데이터가 쌓이는 중입니다.')+'</li>';
    }
  }catch(e){ console.warn('GN24 popular load failed',e); }
}


/* ===== GN24 v3.2.20 · SNS / Kakao share ===== */
function gn24AbsoluteUrl(value){
  const raw=String(value||'').trim();
  if(!raw) return 'https://news24.ai.kr/assets/images/logos/gn24-og-default.jpg';
  try{return new URL(raw,location.origin).href;}catch(e){return raw;}
}
function gn24ArticleDescription(article){
  const raw=article?.summary || article?.subtitle ||
    (Array.isArray(article?.content)?article.content.join(' '):String(article?.content||''));
  return String(raw||'Global News24 디지털 뉴스룸').replace(/\s+/g,' ').trim().slice(0,180);
}
function gn24SetMeta(selector,attr,value){
  let el=document.head.querySelector(selector);
  if(!el){
    el=document.createElement('meta');
    const m=selector.match(/\[(property|name)="([^"]+)"\]/);
    if(m) el.setAttribute(m[1],m[2]);
    document.head.appendChild(el);
  }
  el.setAttribute(attr,value);
}
function setArticleSocialMeta(article){
  if(!article) return;
  const title=String(article.title||'Global News24');
  const desc=gn24ArticleDescription(article);
  const image=gn24AbsoluteUrl(article.image);
  const url=shareArticleURL(article.id,article);
  // SEO canonical must stay on the stable, unversioned /share/<article-id>/ URL.
  // The versioned URL remains available for OG/social cache refresh only.
  const canonicalUrl=new URL(`/share/${shareArticleSlug(article.id)}/`,location.origin).href;

  document.title=title+' | Global News24';
  const description=document.head.querySelector('meta[name="description"]');
  if(description) description.setAttribute('content',desc);

  gn24SetMeta('meta[property="og:type"]','content','article');
  gn24SetMeta('meta[property="og:site_name"]','content','Global News24');
  gn24SetMeta('meta[property="og:title"]','content',title);
  gn24SetMeta('meta[property="og:description"]','content',desc);
  gn24SetMeta('meta[property="og:image"]','content',image);
  gn24SetMeta('meta[property="og:url"]','content',url);
  gn24SetMeta('meta[name="twitter:card"]','content','summary_large_image');
  gn24SetMeta('meta[name="twitter:title"]','content',title);
  gn24SetMeta('meta[name="twitter:description"]','content',desc);
  gn24SetMeta('meta[name="twitter:image"]','content',image);

  let canonicalEl=document.head.querySelector('link[rel="canonical"]');
  if(!canonicalEl){canonicalEl=document.createElement('link');canonicalEl.rel='canonical';document.head.appendChild(canonicalEl);}
  canonicalEl.href=canonicalUrl;
}
// ===== GN24 v3.4.2 · robust Kakao SDK loader =====
const GN24_KAKAO_JS_KEY_FALLBACK='8622bbffea31804f3bd4f03c89f5d0c1';
function gn24KakaoKey(){
  return String(window.GN24_KAKAO?.javascriptKey||GN24_KAKAO_JS_KEY_FALLBACK||'').trim();
}
function gn24LoadKakaoSdk(){
  if(window.Kakao) return Promise.resolve(window.Kakao);
  if(window.__gn24KakaoSdkPromise) return window.__gn24KakaoSdkPromise;
  window.__gn24KakaoSdkPromise=new Promise((resolve,reject)=>{
    const existing=document.querySelector('script[data-gn24-kakao-sdk]');
    if(existing){
      existing.addEventListener('load',()=>resolve(window.Kakao),{once:true});
      existing.addEventListener('error',()=>reject(new Error('Kakao SDK load failed')),{once:true});
      return;
    }
    const script=document.createElement('script');
    script.src='https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js';
    script.async=true;
    script.dataset.gn24KakaoSdk='1';
    script.onload=()=>window.Kakao?resolve(window.Kakao):reject(new Error('Kakao SDK unavailable after load'));
    script.onerror=()=>reject(new Error('Kakao SDK load failed'));
    document.head.appendChild(script);
  });
  return window.__gn24KakaoSdkPromise;
}
async function gn24InitKakao(){
  const key=gn24KakaoKey();
  if(!key) throw new Error('Kakao JavaScript key missing');
  await gn24LoadKakaoSdk();
  if(!window.Kakao) throw new Error('Kakao SDK unavailable');
  if(!Kakao.isInitialized()) Kakao.init(key);
  if(!Kakao.isInitialized()) throw new Error('Kakao initialization failed');
  return true;
}
async function gn24ShareKakao(article){
  const title=String(article?.title||'Global News24');
  const desc=gn24ArticleDescription(article);
  const image=gn24AbsoluteUrl(article?.image);
  // v3.4.4: 미리보기는 기사 대표이미지, 클릭은 실제 기사 페이지로 연결
  const url=articleURL(article?.id);
  try{
    await gn24InitKakao();
    Kakao.Share.sendDefault({
      objectType:'feed',
      content:{
        title,
        description:desc,
        imageUrl:image,
        link:{mobileWebUrl:url,webUrl:url}
      },
      buttons:[{title:'기사 보기',link:{mobileWebUrl:url,webUrl:url}}]
    });
  }catch(e){
    console.error('GN24 Kakao share error:',e);
    alert(articleDynamicText(article,'kakaoError')||'카카오톡 공유 연결에 실패했습니다. 페이지를 새로고침한 뒤 다시 눌러주세요.');
  }
}

// ===== GN24 v3.4.6 · verified Kakao OG URL auto promotion =====
// 새 기사는 Supabase에 즉시 발행되지만 /share/<기사ID>/ 정적 OG 페이지는
// GitHub Actions가 생성한 뒤에야 존재합니다.
// 실제 OG 페이지가 200으로 확인된 경우에만 주소창을 /share/... 로 바꿉니다.
// 따라서 주소창을 그대로 복사해 카카오톡에 붙여넣으면 기사 대표이미지/제목/요약이 표시됩니다.
async function gn24PromoteStaticShareUrl(article){
  if(!article?.id || !location.pathname.startsWith('/pages/article')) return;

  const share=shareArticleURL(article.id,article);
  const shareLocation=new URL(share);
  const sharePath=shareLocation.pathname+shareLocation.search;
  const expectedImage=gn24AbsoluteUrl(article.image);
  const expectedVersion=shareLocation.searchParams.get('v')||'';
  const started=Date.now();
  const maxWait=10*60*1000;
  const retryMs=12000;
  let stopped=false;

  async function sharePageReady(){
    try{
      const r=await fetch(share+'?ogcheck='+Date.now(),{
        method:'GET',
        cache:'no-store',
        redirect:'follow'
      });
      if(!r.ok) return false;
      const html=await r.text();
      return /property=["']og:title["']/i.test(html)
        && /property=["']og:image["']/i.test(html)
        && html.includes(String(article.id))
        && html.includes(expectedImage)
        && (!expectedVersion || html.includes(`?v=${expectedVersion}`));
    }catch(e){
      return false;
    }
  }

  async function promote(){
    if(stopped) return;
    if(await sharePageReady()){
      stopped=true;
      history.replaceState({gn24ArticleId:article.id,gn24ShareReady:true},'',sharePath);
      document.dispatchEvent(new CustomEvent('gn24:share-ready',{detail:{url:share,articleId:article.id}}));
      return;
    }
    if(Date.now()-started < maxWait) setTimeout(promote,retryMs);
  }

  promote();

  // 백그라운드 탭이었다가 다시 돌아오면 즉시 한 번 더 확인합니다.
  document.addEventListener('visibilitychange',()=>{
    if(!stopped && document.visibilityState==='visible') promote();
  });
}


async function setupArticleReporter(article){
  const authorName=document.getElementById('articleAuthorName');
  const avatar=document.querySelector('.article-author-card .author-avatar');
  const info=document.querySelector('.article-author-card .author-info');
  const more=document.querySelector('.article-author-card .author-more');
  if(!authorName)return;

  const edition=articleEditionInfo(article);
  const lang=edition?.type==='global'?articleUiLang(edition.code):'ko';
  const tail=GN24_ARTICLE_TAIL[lang]||GN24_ARTICLE_TAIL.en;
  authorName.textContent=article?.author&&article.author!=='Global News24 편집부'?article.author:lang==='ko'?'Global News24 편집부':tail.desk;
  if(!article?.reporterId){
    if(more) more.href='/pages/reporters/';
    return;
  }
  try{
    const rows=await gn24DbFetch(`gn24_reporters?id=eq.${encodeURIComponent(article.reporterId)}&status=eq.active&select=id,name,role,affiliation,photo_url,bio,specialties,region,public_email&limit=1`)||[];
    const r=rows[0]; if(!r)return;
    authorName.textContent=r.name||article.author|| (lang==='ko'?'Global News24 편집부':tail.desk);
    if(avatar){
      if(r.photo_url){
        avatar.textContent='';
        avatar.style.backgroundImage=`url("${String(r.photo_url).replace(/"/g,'%22')}")`;
        avatar.classList.add('reporter-photo');
      }else avatar.textContent=(r.name||'GN').slice(0,1);
    }
    const span=info?.querySelector('span');
    const p=info?.querySelector('p');
    if(span)span.textContent=[r.role,r.affiliation,r.region].filter(Boolean).join(' · ');
    if(p)p.textContent=r.bio||(articleDynamicText(article,'reporterBio')||'{name} 기자의 Global News24 기사입니다.').replace('{name}',r.name||'');
    if(more){more.href=`/pages/reporters/?id=${encodeURIComponent(r.id)}`;more.textContent=lang==='ko'?'기자 프로필·다른 기사 보기 ›':tail.profile;}
  }catch(e){console.warn('GN24 reporter profile load failed',e)}
}
