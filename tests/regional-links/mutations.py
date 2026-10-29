"""Negative tests run only in a temporary source copy; production is untouched."""
import importlib.util
import shutil
import subprocess
import sys
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
        proc = subprocess.run([sys.executable, str(root / 'scripts/check_regional_links.py')], cwd=root, text=True, capture_output=True)
        assert proc.returncode == (0 if expected else 1), proc.stdout + proc.stderr
        if not expected:
            print('Expected exit 1:', proc.stderr.splitlines()[0])
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
