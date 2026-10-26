import json,unicodedata,collections
rows=json.load(open('unknown.json'))
def base(w): return ''.join(c for c in unicodedata.normalize('NFD',w.lower()) if not unicodedata.combining(c)).replace('ς','σ')
def lev(a,b):
    p=list(range(len(b)+1))
    for i,ca in enumerate(a,1):
        c=[i]
        for j,cb in enumerate(b,1): c.append(min(p[j]+1,c[j-1]+1,p[j-1]+(ca!=cb)))
        p=c
    return p[-1]
for r in rows:
    w=r['w']; s=r['sug']; r['cls']='other'; r['fix']=''
    if w.isupper(): r['cls']='caps'; continue
    for x in s:
        if base(x)==base(w) and x.lower()!=w.lower():
            r['cls']='accent'; r['fix']=x if w[0].islower() or x[0].isupper() else x[0].upper()+x[1:]; break
    if r['cls']=='other':
        for x in s:
            d=lev(base(x),base(w))
            if d==1: r['cls']='edit1'; r['fix']=x; break
            if d==2 and len(w)>7: r['cls']='edit2'; r['fix']=x; break
json.dump(rows,open('triaged.json','w'),ensure_ascii=False,indent=1)
c=collections.Counter(r['cls'] for r in rows); print(c)
print({k:sum(r['n'] for r in rows if r['cls']==k) for k in c})
