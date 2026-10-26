import fs from 'fs'; import nspell from 'nspell'; const el={aff:fs.readFileSync('node_modules/dictionary-el/index.aff'),dic:fs.readFileSync('node_modules/dictionary-el/index.dic')};
const sp = nspell(el);
const corpus = JSON.parse(fs.readFileSync('corpus.json','utf8'));
const bad = new Map();
const GR=/^[Ͱ-Ͽἀ-῿]+$/u;
for (const seg of corpus) {
  for (const m of seg.text.matchAll(/[\p{L}]+/gu)) {
    const w=m[0]; if (w.length<3 || !GR.test(w)) continue;
    if (sp.correct(w) || sp.correct(w.toLowerCase()) || (w===w.toUpperCase() && sp.correct(w[0]+w.slice(1).toLowerCase()))) continue;
    if (!bad.has(w)) bad.set(w,{n:0,src:new Set(),ctx:''});
    const b=bad.get(w); b.n++; b.src.add(seg.src);
    if(!b.ctx){const i=m.index; b.ctx=seg.text.slice(Math.max(0,i-50),i+w.length+50);}
  }
}
const rows=[...bad.entries()].map(([w,b])=>({w,n:b.n,pages:b.src.size,src:[...b.src].slice(0,3),ctx:b.ctx,sug:sp.suggest(w).slice(0,3)}));
fs.writeFileSync('unknown.json',JSON.stringify(rows,null,1));
console.log(rows.length,'unknown words', rows.reduce((a,r)=>a+r.n,0),'occurrences');
