// Test-only browser requests. No production article creation or updates.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const regions = 'seoul busan daegu incheon gwangju daejeon ulsan sejong gyeonggi gangwon chungbuk chungnam jeonbuk jeonnam gyeongbuk gyeongnam jeju'.split(' ');
const live = process.argv.includes('--live');
const base = live ? 'https://news24.ai.kr' : 'http://127.0.0.1:8765';
const fixture = regions.map((region, i) => ({id:`gn24-link-guard-${region}`, region_code:region,
  date:'2026-10-29',title:`Navigation fixture ${region}`,content:['Fresh public article without static share HTML.'],
  summary:'Regression fixture',category:'사회',author:'Test fixture',image:'/assets/images/news/gn24-default-news.svg',
  is_published:true,visibility_scope:'public',created_at:'2026-10-29T00:00:00Z'}));
(async () => {
  const browser = await chromium.launch();
  try {
    for (const viewport of [{width:1440,height:900},{width:390,height:844}]) {
      const context = await browser.newContext({viewport,isMobile:viewport.width<500,hasTouch:viewport.width<500});
      if (!live) await context.route('**/*', async route => {
        const req=route.request(), u=new URL(req.url());
        if (u.hostname.endsWith('.supabase.co')) {
          if (req.method()!=='GET') {
            assert.notEqual(u.pathname,'/rest/v1/gn24_articles','article writes are forbidden');
            return route.fulfill({json:0}); // absorb view counters/auth; never forward writes
          }
          let rows=[];
          if (u.pathname==='/rest/v1/gn24_articles') {
            rows=fixture.filter(a=>!u.searchParams.has('region_code') || u.searchParams.get('region_code')==='eq.'+a.region_code);
            if (u.searchParams.has('id')) rows=rows.filter(a=>u.searchParams.get('id')==='eq.'+a.id);
          }
          return route.fulfill({json:rows});
        }
        if (u.origin!==base) return route.abort();
        // Static shares are deliberately unavailable, even after readiness polling.
        if (u.pathname.startsWith('/share/')) return route.fulfill({status:404,body:'No static fixture'});
        return route.continue();
      });
      const page=await context.newPage();
      for (const region of live ? ['ulsan','daegu','daejeon'] : regions) {
        const response=await page.goto(`${base}/${region}/`);
        assert.equal(response.status(),200,`${region} homepage HTTP`);
        const card=page.locator('#regionalNews a').first();
        await card.waitFor({state:'visible',timeout:30000});
        const href=await card.getAttribute('href');
        assert.match(href,/^\/pages\/article\/\?id=[^&]+$/,`${region} card`);
        const bad=await page.locator('a[href*="/share/"]').evaluateAll(as=>as.filter(a=>!a.closest('[data-share],[data-share-external],.article-share-group,.article-share-panel,.share-buttons')).map(a=>a.outerHTML));
        assert.deepEqual(bad,[],`${region} card/ticker/banner/news navigation`);
        const title=await card.locator('h3,h2,b').first().innerText();
        const navigation=page.waitForResponse(r=>r.request().isNavigationRequest() && r.url().includes('/pages/article/?id='));
        await card.click();
        assert.equal((await navigation).status(),200,`${region} article HTTP`);
        await page.locator('#aTitle').filter({hasText:title}).waitFor({state:'visible',timeout:30000});
        await page.locator('#aBody').filter({hasText:/.{20}/}).waitFor({state:'visible',timeout:30000});
        if (!live) assert.match(await page.locator('#aBody').innerText(),/without static share HTML/);
        console.log(`PASS ${live?'live':'fixture'} ${region} ${viewport.width}px: click -> HTTP 200, title and body`);
      }
      await context.close();
    }
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
