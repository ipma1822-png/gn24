# Domestic article navigation guard

Baseline: `3a97c1ffb5185aa17318f8031429b565aedcada0`.

- Domestic article cards, lead banners, breaking news and category lists use `/pages/article/?id=ID`.
- `/share/ID/` remains the external preview/canonical address. Do not route normal article navigation to it.
- Product scripts, article data, sharing automation and site settings are unchanged by this guard.

## Checks

`python3 scripts/check_regional_links.py` discovers all scripts referenced by the 17 domestic pages, including later additions, and reports file/line annotations for forbidden anchors and broken URL-builder contracts. Explicit SNS anchors (`data-share`, `data-share-external`, share classes), OG and canonical metadata are excluded.

`python3 tests/regional-links/mutations.py` proves three regressions and a newly introduced renderer fail, while SNS/metadata pass. All injection occurs in a disposable copy.

Browser tests run the actual source pages at 1440px and 390px, with fresh public fixtures and every static `/share/` request forced to 404. Every domestic edition must still open its article with HTTP 200 and matching title/body. All external writes are intercepted. After a successful Pages workflow, read-only live clicks check Ulsan, Daegu and Daejeon. Fixtures never enter the production database.

## Deployment enforcement (requires repository administrator)

The added workflow alone DOES NOT block the existing branch-based GitHub Pages deployment. A failed push check can race with Pages.

Required check name: `Domestic article navigation guard`.

To enforce before publication, configure required pull requests plus this required status check on `main`, with no applicable direct-push/admin bypass; preserve the existing share-page bot's operation when planning that policy. Alternatively, migrate the Pages deployment source to a custom Actions deployment whose deploy job explicitly needs this guard. Neither setting is silently applied by this change. Do not report permanent protection until one enforced path has been tested.

If a deployment fails its live smoke check, inspect its file/line output and revert the offending navigation change through a normal commit. The baseline above identifies the verified working navigation. Do not delete articles, share HTML or rewrite repository history.
