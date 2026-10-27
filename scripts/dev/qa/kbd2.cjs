/* eslint-disable */
// QA (Phase 7): mobile menu focus trap + Escape, desktop submenu by keyboard, YouTube facade, reduced motion.
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
const p=await b.newPage({viewport:{width:390,height:844}});
await p.goto('http://localhost:3123/',{waitUntil:'load'});
await p.focus('button[aria-label="Άνοιγμα μενού"]');await p.keyboard.press('Enter');await p.waitForTimeout(200);
const a=await p.evaluate(()=>document.activeElement.getAttribute('aria-label'));
for(let i=0;i<40;i++)await p.keyboard.press('Tab');
const inside=await p.evaluate(()=>!!document.activeElement.closest('#mobile-menu'));
await p.keyboard.press('Escape');await p.waitForTimeout(200);
console.log('menu: focus on open =',a,'| still inside after 40 tabs =',inside,'| after Esc focus =',await p.evaluate(()=>document.activeElement.getAttribute('aria-label')));
const d=await b.newPage({viewport:{width:1440,height:900}});
await d.goto('http://localhost:3123/',{waitUntil:'load'});
const sub=await d.$$eval('nav[aria-label="Κύριο μενού"] ul ul a',as=>as.length);
await d.evaluate(()=>document.querySelector('nav[aria-label="Κύριο μενού"] ul ul').closest('li').querySelector('a').focus());
await d.keyboard.press('Tab');await d.waitForTimeout(250);
console.log('desktop submenu links',sub,'| Tab from parent lands in submenu =',await d.evaluate(()=>!!document.activeElement.closest('ul ul')));
await d.route(/youtube/,r=>r.abort());
await d.goto('http://localhost:3123'+encodeURI('/post/το-εσωτερικο-μηνυμα-της-αναστασεως'),{waitUntil:'load'});
const yt=await d.$('button:has-text("Αναπαραγωγή βίντεο")');
if(yt){await yt.focus();await d.keyboard.press('Enter');await d.waitForTimeout(300);console.log('video iframe after Enter =',await d.$$eval('iframe[src*="youtube-nocookie"]',x=>x.length));}else console.log('no video on this post');
// reduced motion: Reveal must not hide anything
const r=await b.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});const rp=await r.newPage();
await rp.goto('http://localhost:3123/',{waitUntil:'load'});await rp.waitForTimeout(500);
console.log('reduced motion hidden reveals =',await rp.evaluate(()=>[...document.querySelectorAll('div')].filter(e=>e.style.opacity==='0'||e.style.transform.includes('translate')).length));
await rp.goto('http://localhost:3123/people',{waitUntil:'load'});await rp.waitForTimeout(500);
console.log('reduced motion /people video autoplaying =',await rp.evaluate(()=>[...document.querySelectorAll('video')].some(v=>!v.paused)));
await b.close();})();
