/* eslint-disable */
// QA (Phase 7): axe-core WCAG 2.1 A/AA + best practices over every page of out/, at 390px and 1440px.
// Needs: npm i --no-save axe-core@4 (and playwright). Serve out/ first: npx serve out -l 3123. Usage: node scripts/dev/qa/axe.cjs out
// axe-core (WCAG 2 A/AA) over every page of out/, mobile and desktop. Usage: node axe.cjs <outdir> [limit]
const fs=require('fs'),path=require('path');const {chromium}=require('playwright');
const axe=fs.readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');
const OUT=process.argv[2];const pages=[];
(function walk(d){for(const f of fs.readdirSync(d)){const p=path.join(d,f);if(fs.statSync(p).isDirectory()){if(!/_next|images|fonts|og|video|audio/.test(f))walk(p);}else if(f.endsWith('.html')&&!/^(404|_not-found)\.html$/.test(f))pages.push('/'+path.relative(OUT,p).replace(/\.html$/,'').replace(/^index$/,''));}})(OUT);
const lim=+process.argv[3]||pages.length;
(async()=>{const b=await chromium.launch();const agg={};
for(const vp of [[390,844],[1440,900]]){const ctx=await b.newContext({viewport:{width:vp[0],height:vp[1]}});const p=await ctx.newPage();
await p.route(/maps\.google|youtube|cloudflareinsights|jotform/,r=>r.abort());
for(const u of pages.slice(0,lim)){
 await p.goto('http://localhost:3123'+encodeURI(u),{waitUntil:'load'}).catch(()=>{});
 await p.evaluate(()=>{document.querySelectorAll('*').forEach(e=>{e.style.transition='none'})});
 await p.addScriptTag({content:axe});
 const r=await p.evaluate(async()=>{const res=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','best-practice']},resultTypes:['violations']});return res.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>(n.target.join(' ')+' :: '+(n.any[0]?.message||n.failureSummary||'')).slice(0,220))}))});
 for(const v of r){const k=v.id;agg[k]??={impact:v.impact,pages:new Set(),ex:new Map()};agg[k].pages.add(vp[0]+u);for(const n of v.nodes.slice(0,3)){const key=n.replace(/#[\w-]+/g,'#').slice(0,160);if(!agg[k].ex.has(key))agg[k].ex.set(key,vp[0]+u);}}
}
await ctx.close();}
for(const [k,v] of Object.entries(agg)){console.log(`\n## ${k} (${v.impact}) on ${v.pages.size} page-views`);[...v.ex].slice(0,8).forEach(([n,u])=>console.log('  ',decodeURI(u),'|',n));}
console.log('\npages',pages.length);await b.close();})();
