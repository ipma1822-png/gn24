#!/usr/bin/env python3
from pathlib import Path
import json, re, html, urllib.request, urllib.parse, sys

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
    share_url = f"{SITE}/share/{s}/?v={urllib.parse.quote(version)}"
    article_url = f"{SITE}/pages/article/?id={urllib.parse.quote(aid)}"
    title = str(a.get("title") or "Global News24")
    description = desc(a)
    image = abs_url(a.get("image"))
    date = str(a.get("date") or "")
    category = str(a.get("category") or "뉴스")
    return f"""<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{esc(title)} | Global News24</title>
<meta name="description" content="{esc(description)}">
<link rel="canonical" href="{esc(article_url)}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Global News24">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(description)}">
<meta property="og:image" content="{esc(image)}">
<meta property="og:image:width" content="1600">
<meta property="og:image:height" content="900">
<meta property="og:url" content="{esc(share_url)}">
<meta property="article:section" content="{esc(category)}">
<meta property="article:published_time" content="{esc(date)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{esc(title)}">
<meta name="twitter:description" content="{esc(description)}">
<meta name="twitter:image" content="{esc(image)}">
<style>
body{{font-family:Arial,"Malgun Gothic",sans-serif;margin:0;background:#f5f7fa;color:#152033}}
main{{max-width:720px;margin:12vh auto;padding:32px;background:white;border:1px solid #e2e7ee}}
small{{color:#9a7b26;font-weight:700}} h1{{font-size:26px;line-height:1.35}} p{{line-height:1.7;color:#596574}}
a{{display:inline-block;margin-top:15px;padding:11px 16px;background:#102746;color:#fff;text-decoration:none}}
</style>
<script>
(function(){{
  var target={json.dumps(article_url, ensure_ascii=False)};
  setTimeout(function(){{ location.replace(target); }},120);
}})();
</script>
</head>
<body>
<main>
<small>{esc(category)} · Global News24</small>
<h1>{esc(title)}</h1>
<p>{esc(description)}</p>
<a href="{esc(article_url)}">기사 바로가기</a>
</main>
<noscript><p><a href="{esc(article_url)}">기사 바로가기</a></p></noscript>
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
        "select":"id,title,subtitle,summary,image,date,category,is_published,updated_at",
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
    print(f"generated {len(wanted)} share pages")

if __name__=="__main__":
    main()
