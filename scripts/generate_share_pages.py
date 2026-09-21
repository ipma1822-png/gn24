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
<style>
*{{box-sizing:border-box}}
body{{font-family:Arial,"Malgun Gothic",sans-serif;margin:0;background:#f5f7fa;color:#152033}}
header{{background:#0d203b;color:#fff;border-bottom:3px solid #c8a44d}}
.header-inner{{max-width:860px;margin:auto;padding:18px 24px;display:flex;align-items:center;justify-content:space-between;gap:20px}}
.brand{{font-weight:800;letter-spacing:.04em;color:#fff;text-decoration:none}}
.brand span{{display:block;font-size:12px;font-weight:500;opacity:.8;margin-top:3px}}
.home-link{{color:#fff;text-decoration:none;font-size:14px}}
main{{max-width:860px;margin:34px auto;padding:42px 48px;background:white;border:1px solid #e2e7ee}}
.kicker{{color:#9a7b26;font-weight:700}}
h1{{font-size:34px;line-height:1.35;margin:14px 0 12px}}
.subtitle{{font-size:19px;line-height:1.6;color:#596574;margin:0 0 16px}}
.meta{{font-size:14px;color:#7b8491;border-bottom:1px solid #e5e9ef;padding-bottom:20px;margin-bottom:26px}}
.hero{{width:100%;height:auto;display:block;margin:0 0 8px}}
.caption{{font-size:13px;color:#7b8491;margin:0 0 28px}}
.article-body p{{font-size:17px;line-height:1.95;color:#283445;margin:0 0 22px;word-break:keep-all}}
.source{{margin-top:34px;padding-top:18px;border-top:1px solid #e5e9ef;color:#596574;font-size:14px}}
.source-link{{color:#234f83}}
.reader-link{{display:inline-block;margin-top:28px;padding:11px 16px;background:#102746;color:#fff;text-decoration:none}}
@media(max-width:700px){{.header-inner{{padding:15px 18px}}main{{margin:0;padding:28px 20px;border:0}}h1{{font-size:28px}}.subtitle{{font-size:17px}}.article-body p{{font-size:16px}}}}
</style>
</head>
<body>
<header><div class="header-inner"><a class="brand" href="/">GLOBAL NEWS24<span>글로벌뉴스24</span></a><a class="home-link" href="/">홈으로</a></div></header>
<main>
<div class="kicker">{esc(category)} · Global News24</div>
<h1>{esc(title)}</h1>
<div class="subtitle">{esc(str(a.get("subtitle") or a.get("summary") or ""))}</div>
<div class="meta">{esc(date)} · {esc(author_name)} · Global News24</div>
<img class="hero" src="{esc(image)}" alt="{esc(title)}">
{f'<div class="caption">{esc(caption)}</div>' if caption else ''}
<article class="article-body">
{body_html}
</article>
<div class="source"><strong>자료·출처</strong><br>{source_html}</div>
<a class="reader-link" href="{esc(article_url)}">기존 기사 화면에서 보기</a>
</main>
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
                   "/pages/policy/", "/pages/contact/", "/pages/manual/", "/region/", "/ulsan/"]
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
