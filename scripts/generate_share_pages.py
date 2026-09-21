#!/usr/bin/env python3
from pathlib import Path
import json, re, html, urllib.request, urllib.parse, sys
from datetime import datetime, timedelta, timezone

ROOT = Path(__file__).resolve().parents[1]
SHARE = ROOT / "share"
SITE = "https://news24.ai.kr"

def slug(value):
    return re.sub(r"[^A-Za-z0-9._-]+", "-", str(value or "")).strip("-") or "article"

def esc(v):
    return html.escape(str(v or ""), quote=True)

def abs_url(v):
    v = str(v or "").strip()
    if not v:
        return SITE + "/assets/images/logos/global-news24-header.jpg"
    if v.startswith("http://") or v.startswith("https://"):
        return v
    return SITE + (v if v.startswith("/") else "/" + v)

def desc(a):
    s = a.get("summary") or a.get("subtitle") or a.get("title") or "Global News24"
    return re.sub(r"\s+", " ", str(s)).strip()[:220]

def article_paragraphs(a):
    raw = a.get("content")
    if isinstance(raw, list):
        items = raw
    elif isinstance(raw, str):
        try:
            parsed = json.loads(raw)
            items = parsed if isinstance(parsed, list) else [raw]
        except Exception:
            items = re.split(r"\n\s*\n|\r?\n(?=\S)", raw)
    else:
        items = []
    cleaned = [re.sub(r"\s+", " ", str(x or "")).strip() for x in items]
    cleaned = [x for x in cleaned if x]
    if not cleaned:
        fallback = str(a.get("summary") or a.get("subtitle") or "").strip()
        if fallback:
            cleaned = [fallback]
    return cleaned

def share_version(a):
    raw = str(a.get("updated_at") or a.get("image") or "")
    value = 2166136261
    for ch in raw:
        value ^= ord(ch)
        value = (value * 16777619) & 0xffffffff
    chars = "0123456789abcdefghijklmnopqrstuvwxyz"
    if value == 0:
        return "0"
    out = ""
    while value:
        value, rem = divmod(value, 36)
        out = chars[rem] + out
    return out

def page(a):
    aid = str(a.get("id") or "")
    s = slug(aid)
    version = share_version(a)
    share_url = f"{SITE}/share/{s}/"
    versioned_share_url = f"{share_url}?v={urllib.parse.quote(version)}"
    article_url = f"{SITE}/pages/article/?id={urllib.parse.quote(aid)}"
    title = str(a.get("title") or "Global News24")
    description = desc(a)
    image = abs_url(a.get("image"))
    date = str(a.get("date") or "")
    category = str(a.get("category") or "뉴스")
    author_name = str(a.get("author") or "Global News24 편집부").strip()
    author_type = "Organization" if author_name in ("Global News24", "Global News24 편집부", "글로벌뉴스24", "글로벌뉴스24 편집부") else "Person"
    modified = str(a.get("updated_at") or "").strip()
    structured = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": title,
        "description": description,
        "image": [image],
        "url": share_url,
        "mainEntityOfPage": {"@type": "WebPage", "@id": share_url},
        "datePublished": date,
        "author": {"@type": author_type, "name": author_name},
        "publisher": {
            "@type": "Organization",
            "name": "Global News24",
            "url": SITE + "/"
        },
        "articleSection": category,
        "isAccessibleForFree": True
    }
    if modified:
        structured["dateModified"] = modified
    structured_json = json.dumps(structured, ensure_ascii=False).replace("</", "<\\/")
    paragraphs = article_paragraphs(a)
    body_html = "\n".join(f"<p>{esc(p)}</p>" for p in paragraphs)
    caption = str(a.get("image_caption") or "").strip()
    source_name = str(a.get("source_name") or "Global News24").strip()
    source_url = str(a.get("source_url") or "").strip()
    source_html = esc(source_name)
    if source_url:
        source_html += f' · <a class="source-link" href="{esc(source_url)}" target="_blank" rel="noopener">원문/관련자료</a>'
    return f"""<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{esc(title)} | Global News24</title>
<meta name="description" content="{esc(description)}">
<link rel="canonical" href="{esc(share_url)}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Global News24">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(description)}">
<meta property="og:image" content="{esc(image)}">
<meta property="og:image:width" content="1600">
<meta property="og:image:height" content="900">
<meta property="og:url" content="{esc(versioned_share_url)}">
<meta property="article:section" content="{esc(category)}">
<meta property="article:published_time" content="{esc(date)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{esc(title)}">
<meta name="twitter:description" content="{esc(description)}">
<meta name="twitter:image" content="{esc(image)}">
<script type="application/ld+json">{structured_json}</script>
<link rel="icon" href="/assets/images/logos/gn24-icon.svg">
<link rel="stylesheet" href="/assets/css/style.css?v=3.4.10">
<style>
.share-static-header{{background:#fff;border-bottom:1px solid #dfe5ec}}
.share-static-header .mast{{width:min(1180px,calc(100% - 32px));margin:auto}}
.share-static-nav{{border-top:2px solid #10233f;border-bottom:1px solid #dfe5ec;background:#fff}}
.share-static-nav .nav-scroll{{width:min(1180px,calc(100% - 32px));margin:auto}}
.share-static-main{{width:min(1180px,calc(100% - 32px));margin:32px auto 48px}}
.share-static-main .article-card{{max-width:860px}}
.share-static-main h1{{font-size:40px;line-height:1.3;margin:14px 0 12px}}
.share-static-main .subtitle{{font-size:19px;line-height:1.65;color:#596574;margin:0 0 14px}}
.share-static-main .meta{{font-size:14px;color:#667085;border-bottom:1px solid #dfe5ec;padding-bottom:18px;margin-bottom:24px}}
.share-static-main .hero{{width:100%;height:auto;display:block}}
.share-static-main .caption{{font-size:13px;color:#667085;margin:8px 0 28px}}
.share-static-main .article-body{{max-width:780px;font-size:18px;line-height:1.95}}
.share-static-main .article-body p{{margin:0 0 24px;word-break:keep-all}}
.share-static-main .source{{max-width:780px;margin:32px 0;padding:18px;background:#f4f6f8;border-left:3px solid #c89d35;color:#596574;font-size:14px}}
.share-static-main .source-link{{color:#163d73}}
.share-static-main .reader-link{{display:inline-block;padding:11px 16px;background:#10233f;color:#fff;text-decoration:none}}
.share-static-footer{{background:#101828;color:#d0d5dd;margin-top:0}}
.share-static-footer .wrap{{padding:28px 0}}
.share-static-footer b{{color:#fff;font-size:18px}}
.share-static-footer p{{margin:7px 0 0;font-size:13px}}
@media(max-width:900px){{
 .share-static-header .mast{{height:68px}}
 .share-static-nav{{display:none}}
 .share-static-main{{margin:22px auto 36px}}
 .share-static-main h1{{font-size:29px}}
 .share-static-main .subtitle{{font-size:17px}}
 .share-static-main .article-body{{font-size:17px}}
}}
</style>
</head>
<body>
<header class="site-header share-static-header">
  <div class="mast">
    <a class="brand" href="/"><img src="/assets/images/logos/gn24-icon.svg" alt="GN24"><span><b>GLOBAL NEWS24</b><small>글로벌뉴스24</small></span></a>
    <div class="tools"><a class="iconbtn" href="/pages/newsroom/">전체기사</a></div>
  </div>
  <nav class="primary-nav share-static-nav"><div class="nav-scroll">
    <div class="nav-item"><a class="nav-link" href="/">홈</a></div>
    <div class="nav-item"><a class="nav-link" href="/pages/newsroom/?cat=국내소식">종합뉴스</a></div>
    <div class="nav-item"><a class="nav-link" href="/pages/newsroom/?cat=경제">경제</a></div>
    <div class="nav-item"><a class="nav-link" href="/pages/newsroom/?cat=무도·스포츠">무도·스포츠</a></div>
    <div class="nav-item"><a class="nav-link" href="/pages/newsroom/?cat=안전·드론">안전·드론</a></div>
    <div class="nav-item"><a class="nav-link" href="/pages/newsroom/?cat=공익">공익</a></div>
    <div class="nav-item"><a class="nav-link" href="/ulsan/">울산뉴스</a></div>
  </div></nav>
</header>
<div class="breaking"><div class="wrap breaking-inner"><strong>GLOBAL NEWS24</strong><span>지역에서 세계로 · FROM LOCAL TO GLOBAL</span></div></div>
<main class="share-static-main">
  <div class="article-card">
    <span class="badge">{esc(category)}</span>
    <h1>{esc(title)}</h1>
    <div class="subtitle">{esc(str(a.get("subtitle") or a.get("summary") or ""))}</div>
    <div class="meta">{esc(date)} · {esc(author_name)} · Global News24</div>
    <figure class="article-figure">
      <img class="hero" src="{esc(image)}" alt="{esc(title)}">
      {f'<figcaption class="caption">{esc(caption)}</figcaption>' if caption else ''}
    </figure>
    <article class="article-body">
{body_html}
    </article>
    <div class="source"><strong>자료·출처</strong><br>{source_html}</div>
    <a class="reader-link" href="{esc(article_url)}">기사 원문 화면 보기</a>
  </div>
</main>
<footer class="share-static-footer"><div class="wrap"><b>GLOBAL NEWS24 · 글로벌뉴스24</b><p>국내외 주요뉴스와 지역 현장을 연결하는 디지털 인터넷신문입니다.</p><p>Copyright © 2026 Global News24. All Rights Reserved.</p></div></footer>
</body>
</html>"""

def load_config():
    text = (ROOT / "assets/js/gn24-supabase-config.js").read_text(encoding="utf-8")
    url = re.search(r'url:\s*"([^"]+)"', text)
    key = re.search(r'anonKey:\s*"([^"]+)"', text)
    if not url or not key:
        raise RuntimeError("Supabase config not found")
    return url.group(1).rstrip("/"), key.group(1)

def load_remote():
    url, key = load_config()
    q = urllib.parse.urlencode({
        "select":"id,title,subtitle,summary,image,image_caption,date,category,author,content,source_name,source_url,is_published,updated_at",
        "is_published":"eq.true",
        "order":"date.desc,id.desc"
    })
    req = urllib.request.Request(
        url + "/rest/v1/gn24_articles?" + q,
        headers={"apikey":key, "Authorization":"Bearer " + key}
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode("utf-8"))

def load_local():
    p = ROOT / "data/news.json"
    rows = json.loads(p.read_text(encoding="utf-8"))
    return rows if isinstance(rows, list) else rows.get("articles", [])

def main():
    rows = load_local() if "--local" in sys.argv else load_remote()
    SHARE.mkdir(exist_ok=True)

    wanted=set()
    for a in rows:
        if a.get("is_published") is False or a.get("isPublished") is False:
            continue
        s=slug(a.get("id"))
        wanted.add(s)
        d=SHARE/s
        d.mkdir(parents=True,exist_ok=True)
        (d/"index.html").write_text(page(a),encoding="utf-8")

    # remove stale generated article dirs
    for d in SHARE.iterdir():
        if d.is_dir() and d.name not in wanted:
            import shutil
            shutil.rmtree(d)

    index = """<!doctype html><html lang="ko"><head><meta charset="utf-8">
<title>Global News24 공유</title><meta name="robots" content="noindex">
<script>location.replace('/');</script></head><body><a href="/">Global News24</a></body></html>"""
    (SHARE/"index.html").write_text(index,encoding="utf-8")
    # Search-engine sitemap: stable canonical pages plus one unique article URL.
    static_urls = ["/", "/pages/newsroom/", "/pages/press/", "/pages/archive/",
                   "/pages/policy/", "/pages/contact/", "/pages/manual/", "/region/", "/ulsan/", "/chungbuk/"]
    urls = [SITE + path for path in static_urls]
    urls.extend(f"{SITE}/share/{name}/" for name in sorted(wanted))
    sitemap = ['<?xml version="1.0" encoding="UTF-8"?>',
               '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    sitemap.extend(f"  <url><loc>{esc(url)}</loc></url>" for url in urls)
    sitemap.append("</urlset>")
    (ROOT/"sitemap.xml").write_text("\n".join(sitemap)+"\n", encoding="utf-8")

    # Google News sitemap: only fresh articles from today and yesterday in Korea.
    # Keep the regular sitemap unchanged; this is an additional discovery feed.
    kst = timezone(timedelta(hours=9))
    cutoff_date = datetime.now(kst).date() - timedelta(days=1)
    news_rows = []
    for a in rows:
        if a.get("is_published") is False or a.get("isPublished") is False:
            continue
        raw_date = str(a.get("date") or "").strip()
        match = re.match(r"^(\d{4}-\d{2}-\d{2})", raw_date)
        if not match:
            continue
        try:
            published_date = datetime.strptime(match.group(1), "%Y-%m-%d").date()
        except ValueError:
            continue
        if published_date >= cutoff_date:
            news_rows.append(a)

    news_sitemap = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
        '        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">'
    ]
    for a in news_rows[:1000]:
        s = slug(a.get("id"))
        title = str(a.get("title") or "Global News24")
        publication_date = str(a.get("date") or "").strip()
        news_sitemap.extend([
            "  <url>",
            f"    <loc>{esc(SITE + '/share/' + s + '/')}</loc>",
            "    <news:news>",
            "      <news:publication>",
            "        <news:name>Global News24</news:name>",
            "        <news:language>ko</news:language>",
            "      </news:publication>",
            f"      <news:publication_date>{esc(publication_date)}</news:publication_date>",
            f"      <news:title>{esc(title)}</news:title>",
            "    </news:news>",
            "  </url>"
        ])
    news_sitemap.append("</urlset>")
    (ROOT/"news-sitemap.xml").write_text("\n".join(news_sitemap)+"\n", encoding="utf-8")

    print(f"generated {len(wanted)} share pages, sitemap, and {len(news_rows[:1000])} news sitemap entries")

if __name__=="__main__":
    main()
