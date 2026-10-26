import json,re,sys
from pathlib import Path
A=Path('/home/claude/work/archive')
H={'A':'Α','B':'Β','E':'Ε','H':'Η','I':'Ι','K':'Κ','M':'Μ','N':'Ν','O':'Ο','P':'Ρ','T':'Τ','X':'Χ','Y':'Υ','Z':'Ζ','o':'ο','v':'ν','a':'α','e':'ε','i':'ι','k':'κ','p':'ρ','u':'υ','x':'χ','y':'γ','h':'η','n':'η','t':'τ','m':'μ','c':'ς'}
GR=re.compile('[Ͱ-Ͽἀ-῿]')
def fixmix(t):
    def f(m):
        w=m.group(0)
        if GR.search(w) and re.search('[A-Za-z]',w): return ''.join(H.get(c,c) for c in w)
        return w
    return re.sub(r'[\wͰ-Ͽἀ-῿]+',f,t)
out=[]
for f in sorted(A.glob('pages/pages/*/content.md'))+[A/'pages/blog/blog/content.md']:
    src='/'+f.parent.name if f.parent.name!='home' else '/'
    if f.parent.name=='home-226': continue
    for ln in f.read_text().splitlines():
        if ln.startswith(('![','[LINK]','[IFRAME]','[VIDEO]','title:','# /','## [')) or not ln.strip(): continue
        out.append({'src':src,'text':fixmix(re.sub(r'^(<\w+> |#+ )','',ln))})
for p in json.load(open(A/'products.json')):
    if p['slug'].startswith('i-m-a'): continue
    src='/product-page/'+p['slug']
    out.append({'src':src,'text':fixmix(p['name'])})
    for para in re.split(r'</p>|<br\s*/?>',p['descriptionHtml']):
        t=re.sub('<[^>]+>','',para).replace('&nbsp;',' ').strip()
        if t: out.append({'src':src,'text':fixmix(t)})
    for a in p['additionalInfo']:
        t=re.sub('<[^>]+>',' ',a.get('description','')).replace('&nbsp;',' ')
        if GR.search(t): out.append({'src':src,'text':fixmix(t)})
for f in sorted(A.glob('posts/*.json')):
    p=json.loads(f.read_text()); src='/post/'+p['slug']
    out.append({'src':src,'text':fixmix(p['title'] or '')})
    for b in p['blocks']:
        for t in ([b.get('text')] if b.get('text') else [])+([b.get('caption')] if b.get('caption') else [])+([b['text']] if b['type']=='button' else []):
            out.append({'src':src,'text':fixmix(t)})
json.dump(out,open('corpus.json','w'),ensure_ascii=False)
print(len(out),'segments')
