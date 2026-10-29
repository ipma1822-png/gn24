"""Negative tests run only in a temporary source copy; production is untouched."""
import contextlib
import importlib.util
import io
import shutil
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('guard', ROOT / 'scripts/check_regional_links.py')
guard = importlib.util.module_from_spec(spec)
spec.loader.exec_module(guard)
with tempfile.TemporaryDirectory() as tmp:
    root = Path(tmp) / 'repo'
    shutil.copytree(ROOT, root, ignore=shutil.ignore_patterns('.git', 'share', 'images', 'node_modules', '__pycache__'))
    def result(expected):
        with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
            actual = guard.check(root)
        assert actual is expected
    result(True)
    for name in guard.CORE:
        path = root / 'assets/js' / (name + '.js')
        original = path.read_text()
        path.write_text(original.replace('/pages/article/?id=', '/share/'))
        result(False)
        path.write_text(original)
        print('PASS rejected static article URL in', name)
    page = root / 'ulsan/index.html'
    original = page.read_text()
    future = root / 'assets/js/future-regional-cards.js'
    future.write_text('const card = `<a href="/share/new-article/">New card</a>`;')
    page.write_text(original + '<script src="/assets/js/future-regional-cards.js"></script>')
    result(False)
    print('PASS discovered and rejected a newly added regional renderer')
    page.write_text(original + '<a data-share="copy" href="/share/public-article/">SNS</a><link rel="canonical" href="/share/public-article/"><meta property="og:url" content="/share/public-article/">')
    result(True)
    print('PASS normal SNS, OG and canonical are excluded')
