#!/usr/bin/env python3
"""Read-only domestic navigation guard; SNS/OG/canonical are separate contracts."""
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote

ROOT = Path(__file__).resolve().parents[1]
REGIONS = 'seoul busan daegu incheon gwangju daejeon ulsan sejong gyeonggi gangwon chungbuk chungnam jeonbuk jeonnam gyeongbuk gyeongnam jeju'.split()
CORE = ['regional-newsroom', 'local-grid-master', 'local-district-master']


class Links(HTMLParser):
    def __init__(self, path, errors):
        super().__init__()
        self.path, self.errors, self.scripts = path, errors, []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'script' and attrs.get('src'):
            self.scripts.append(attrs['src'])
        if tag != 'a' or 'href' not in attrs:
            return  # <link rel=canonical>, OG and Twitter metadata are not navigation.
        shared = ('data-share' in attrs or 'data-share-external' in attrs
                  or any('share' in c for c in attrs.get('class', '').split()))
        if '/share/' in attrs['href'] and not shared:
            self.errors.append((self.path, self.getpos()[0], 'article anchor uses static /share/'))


def check(root=ROOT):
    errors, pending, seen = [], [root / r / 'index.html' for r in REGIONS], set()
    while pending:
        path = pending.pop()
        if path in seen:
            continue
        seen.add(path)
        if not path.is_file():
            errors.append((path, 1, 'missing domestic page or referenced script'))
            continue
        text = path.read_text(encoding='utf-8')
        parser = Links(path, errors)
        parser.feed(text)
        # Follow every local script referenced by every domestic edition, including
        # scripts introduced later. Follow static imports and script.src loaders too.
        refs = parser.scripts + re.findall(r'(?:\bsrc\s*=\s*|\bfrom\s+|\bimport\s*)[\'\"]([^\'\"]+\.js(?:\?[^\'\"]*)?)[\'\"]', text)
        for ref in refs:
            url = urlsplit(ref)
            if url.scheme or url.netloc:
                if url.netloc not in ('news24.ai.kr', ''):
                    continue
            target = (root / unquote(url.path).lstrip('/') if url.path.startswith('/')
                      else path.parent / unquote(url.path)).resolve()
            if target.is_relative_to(root.resolve()) and target.suffix == '.js':
                pending.append(target)
    contracts = {
        'regional-newsroom': r'function\s+articleURL\s*\(id\)\s*\{([^}]+)\}',
        'local-grid-master': r'<a\s+class="regional-card"\s+href="([^"]+)"',
        'local-district-master': r'const\s+url\s*=\s*a\s*=>\s*(.*?),image=',
    }
    for name, pattern in contracts.items():
        path = root / 'assets/js' / (name + '.js')
        text = path.read_text(encoding='utf-8')
        match = re.search(pattern, text)
        if not match or '/pages/article/?id=' not in match[1] or '/share/' in match[1]:
            line = text.count('\n', 0, match.start() if match else 0) + 1
            errors.append((path, line, 'domestic article URL must use /pages/article/?id='))
    for path, line, message in errors:
        relative = path.relative_to(root)
        print(f'::error file={relative},line={line}::{message}')
        print(f'{relative}:{line}: {message}', file=sys.stderr)
    if not errors:
        print(f'PASS: 17 domestic editions, {len(seen)} reachable files; navigation and SNS remain separate')
    return not errors


if __name__ == '__main__':
    sys.exit(0 if check() else 1)
