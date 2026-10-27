/* eslint-disable */
// QA (Phase 7): Tab through pages; reports focused elements that are invisible or have no focus ring.
// Usage: node scripts/dev/qa/kbd.cjs / /contact …  (out/ served on :3123)
const {chromium}=require('playwright');
const pages=process.argv.slice(2);
(async()=>{const b=await chromium.launch();
for(const [w,h] of [[1440,900],[390,844]]) for(const u of pages){const p=await b.newPage({viewport:{width:w,height:h}});
await p.route(/maps\.google|youtube|cloudflareinsights|jotform/,r=>r.abort());
await p.goto('http://localhost:3123'+encodeURI(u),{waitUntil:'load'});
const seen=[];let bad=[];
for(let i=0;i<60;i++){await p.keyboard.press('Tab');
 const f=await p.evaluate(()=>{const e=document.activeElement;if(!e||e===document.body)return null;const r=e.getBoundingClientRect();const cs=getComputedStyle(e);
 const vis=r.width>0&&r.height>0&&cs.visibility!=='hidden'&&cs.opacity!=='0';
 const ring=cs.outlineStyle!=='none'&&cs.outlineWidth!=='0px'||cs.boxShadow!=='none';
 return {d:(e.tagName+' '+(e.getAttribute('aria-label')||e.innerText||e.getAttribute('placeholder')||e.name||'').trim().replace(/\s+/g,' ').slice(0,30)),vis,ring,inView:r.bottom>0&&r.top<innerHeight}});
 if(!f)break; if(seen.includes(f.d)&&seen.length>5&&f.d===seen[0])break; seen.push(f.d);
 if(!f.vis||!f.ring)bad.push(f.d+(f.vis?'':' [INVISIBLE]')+(f.ring?'':' [NO RING]'));}
console.log(w,u,'tabs:',seen.length,'| first:',seen.slice(0,8).join(' > '));if(bad.length)console.log('   PROBLEMS:',bad.join(' ; '));await p.close();}
await b.close();})();
