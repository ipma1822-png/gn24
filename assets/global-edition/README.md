# Global Edition Master · Phase 2

This is an isolated development fixture at `/global-edition-master/` with `noindex`. It is not a live country edition. No existing edition imports these files.

- `country-config.js` defines the country identity, language, locale, direction, status and UI strings. The two entries are generic LTR/RTL development profiles (`ZZ`); no real country is configured here.
- `data/sample-content.js` defines sample articles with `country-local` or `global-feed` scope. It is not published reporting and does not read or change Supabase.
- `global-edition.js` renders the home, newsroom and article views through the same shell. All copy is assigned with `textContent`; images are constrained by the media container and fall back to a local SVG.
- `global-edition.css` is scoped under `.global-edition` and is loaded only by the development page.

Preview routes after deployment:

- `/global-edition-master/?profile=ltr`
- `/global-edition-master/?profile=rtl`
- `/global-edition-master/?profile=ltr&view=newsroom`
- `/global-edition-master/?profile=rtl&view=article&id=sample-03`

Future country integration must supply approved country configuration and stored translated content, decide the article URL contract, and test local/global feed selection. It must not assume that the fixture content is news. Canada remains a separate reference edition.
