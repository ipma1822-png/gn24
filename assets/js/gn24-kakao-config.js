// Global News24 v3.4.1 · Kakao Talk Share
// Kakao Developers > App > Platform key > JavaScript key 값을 입력하세요.
// JavaScript SDK domain에는 https://news24.ai.kr 을 등록하세요.
window.GN24_KAKAO = {
  javascriptKey: "8622bbffea31804f3bd4f03c89f5d0c1"
};

// GN24 SHARE URL FINAL · all article share actions use the generated OG share page.
// This listener is registered before app.js's DOMContentLoaded handler, so the
// shared app functions are replaced before loadArticle() binds article tools.
document.addEventListener('DOMContentLoaded', () => {
  if (typeof shareArticleURL !== 'function') return;

  gn24ShareKakao = async function(article) {
    const title = String(article?.title || 'Global News24');
    const desc = gn24ArticleDescription(article);
    const image = gn24AbsoluteUrl(article?.image);
    const url = shareArticleURL(article?.id, article);
    try {
      await gn24InitKakao();
      Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title,
          description: desc,
          imageUrl: image,
          link: { mobileWebUrl: url, webUrl: url }
        },
        buttons: [{ title: '기사 보기', link: { mobileWebUrl: url, webUrl: url } }]
      });
    } catch (e) {
      console.error('GN24 Kakao share error:', e);
      alert('카카오톡 공유 연결에 실패했습니다. 페이지를 새로고침한 뒤 다시 눌러주세요.');
    }
  };

  setupArticleTools = function(article) {
    const canonicalShareUrl = shareArticleURL(article?.id, article);
    const title = article?.title || document.title || 'Global News24';

    const shareUrl = (kind) => {
      const url = canonicalShareUrl;
      if (kind === 'kakao') {
        gn24ShareKakao(article);
        return;
      }
      const u = encodeURIComponent(url);
      const t = encodeURIComponent(title);
      const urls = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
        x: `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
        band: `https://band.us/plugin/share?body=${t}%0A${u}`,
        telegram: `https://t.me/share/url?url=${u}&text=${t}`
      };
      if (kind === 'native') {
        if (navigator.share) navigator.share({ title, text: title, url }).catch(() => {});
        else navigator.clipboard?.writeText(url).then(() => alert('기사 링크를 복사했습니다.'));
        return;
      }
      if (urls[kind]) window.open(urls[kind], 'gn24share', 'width=720,height=620,noopener,noreferrer');
    };

    document.querySelectorAll('[data-share]').forEach(btn => {
      btn.onclick = () => shareUrl(btn.dataset.share);
    });

    const shareHubTitle = document.getElementById('shareHubTitle');
    if (shareHubTitle) shareHubTitle.textContent = article?.title || 'Global News24 기사';
    const shareHubThumb = document.getElementById('shareHubThumb');
    if (shareHubThumb && article?.image) {
      shareHubThumb.style.backgroundImage = `url("${gn24AbsoluteUrl(article.image).replace(/"/g, '%22')}")`;
    }
    const shareHubMessage = document.getElementById('shareHubMessage');

    async function copyCurrentArticle() {
      const url = canonicalShareUrl;
      try {
        await navigator.clipboard.writeText(url);
        if (shareHubMessage) {
          shareHubMessage.textContent = '기사 링크를 복사했습니다. 카카오톡이나 문자에 바로 붙여넣을 수 있습니다.';
          setTimeout(() => { shareHubMessage.textContent = ''; }, 3200);
        } else alert('카카오·SNS용 기사 링크를 복사했습니다.');
      } catch (e) {
        prompt('아래 주소를 복사하세요.', url);
      }
    }

    document.querySelectorAll('[data-copy-article]').forEach(btn => {
      btn.onclick = copyCurrentArticle;
    });
    const copyBtn = document.getElementById('copyArticleLink');
    if (copyBtn) copyBtn.onclick = copyCurrentArticle;
    const printBtn = document.getElementById('printArticle');
    if (printBtn) printBtn.onclick = () => window.print();

    let articleFont = 16;
    const body = document.getElementById('aBody');
    const applyFont = () => {
      articleFont = Math.max(14, Math.min(22, articleFont));
      if (body) body.style.setProperty('--reader-font-size', articleFont + 'px');
    };
    const plus = document.getElementById('fontPlus');
    const minus = document.getElementById('fontMinus');
    if (plus) plus.onclick = () => { articleFont += 1; applyFont(); };
    if (minus) minus.onclick = () => { articleFont -= 1; applyFont(); };
    applyFont();
  };
});
