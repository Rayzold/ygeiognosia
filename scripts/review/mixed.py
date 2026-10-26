import json,re,csv,io,collections
from pathlib import Path
A=Path('/home/claude/work/archive')
L2G={'A':'Α','B':'Β','E':'Ε','H':'Η','I':'Ι','K':'Κ','M':'Μ','N':'Ν','O':'Ο','P':'Ρ','T':'Τ','X':'Χ','Y':'Υ','Z':'Ζ','o':'ο','v':'ν','i':'ι','k':'κ','u':'υ','x':'χ','y':'γ','n':'η','h':'η','p':'ρ','a':'α','e':'ε','t':'τ','m':'μ','c':'ς','b':'β','r':'γ'}
G2L={'Α':'A','Β':'B','Ε':'E','Η':'H','Ι':'I','Κ':'K','Μ':'M','Ν':'N','Ο':'O','Ρ':'P','Τ':'T','Χ':'X','Υ':'Y','Ζ':'Z','ο':'o','ν':'v','ι':'i','κ':'k','υ':'u','χ':'x','α':'a','ε':'e','τ':'t','ρ':'p','η':'h','γ':'y','μ':'m','β':'b','Μ':'M'}
GH=set('ΑΒΕΗΙΚΜΝΟΡΤΧΥΖονικυχαετρηγ'); LH=set(L2G)
GR=re.compile('[Ͱ-Ͽἀ-῿]'); LA=re.compile('[A-Za-z]')
GREEK_WORDS={'το','τα','οι','να','μην','και','οταν','με','του','τον','την','τη','ο','η','ειναι','απο','για','σε'}
def decide(w):
    if re.search(r'[a-z\u03ac-\u03ce][A-Z\u0391-\u03a9]',w): return 'skip',w
    gform=''.join(L2G.get(ch,ch) for ch in w)
    import unicodedata
    plain=''.join(c for c in unicodedata.normalize('NFD',gform.lower()) if not unicodedata.combining(c))
    if plain in GREEK_WORDS: return 'el',gform
    g_strong=sum(1 for ch in w if GR.match(ch) and ch not in GH)
    l_strong=sum(1 for ch in w if LA.match(ch) and ch not in LH)
    if g_strong>l_strong: return 'el',''.join(L2G.get(ch,ch) for ch in w)
    if l_strong>g_strong: return 'en',''.join(G2L.get(ch,ch) for ch in w)
    OV={'Τhe':'The','τhe':'the','μoringa':'moringa','Αhwagandha':'Ashwagandha'}
    if w in OV: return 'en',OV[w]
    if w.lower() in ('βio','βaobab'): return 'en',''.join(G2L.get(ch,ch) for ch in w)
    return '?',w
seen=collections.defaultdict(lambda:[0,set()])
def scan(t,src):
    for w in re.findall(r'[\wͰ-Ͽἀ-῿]+',t):
        w=re.sub(r'Price\d+$','',w)
        if GR.search(w) and LA.search(w) and not re.match(r'^\d',w) and not re.search(r'\d',w): seen[w][0]+=1; seen[w][1].add(src)
for f in A.glob('pages/*/*/content.md'):
    if f.parent.name=='home-226': continue
    scan(re.sub(r'\(media/[^)]*\)|-> \S+','',f.read_text()),'/'+f.parent.name)
for f in A.glob('pages/*/*/meta.json'):
    m=json.loads(f.read_text()); scan((m['title'] or '')+' '+(m.get('og:description') or ''),'/'+f.parent.name)
for p in json.load(open(A/'products.json')):
    if not p['slug'].startswith('i-m-a'): scan(p['name']+' '+re.sub('<[^>]+>',' ',p['descriptionHtml']),'/product-page/'+p['slug'])
for f in A.glob('posts/*.json'):
    p=json.loads(f.read_text()); scan((p['title'] or '')+' '+' '.join(b.get('text','') for b in p['blocks'] if b.get('text')),'/post/'+p['slug'])
rows=[]
for w,(n,src) in sorted(seen.items(),key=lambda x:-x[1][0]):
    lang,fix=decide(w)
    if lang=='skip': continue
    rows.append([w,fix,{'el':'ελληνικά','en':'λατινικά','?':'ΕΛΕΓΧΟΣ'}[lang],n,len(src),' | '.join(sorted(src)[:3])])
buf=io.StringIO(); wr=csv.writer(buf,delimiter='^',lineterminator='\r\n')
wr.writerow(['Όπως είναι','Διόρθωση','Γίνεται','Εμφανίσεις','Σελίδες','Σελίδες (δείγμα)']); wr.writerows(rows)
open('/home/claude/ygeiognosia/archive/review/latinika-grammata.csv','w',encoding='utf-8-sig',newline='').write(buf.getvalue())
print(len(rows), collections.Counter(r[2] for r in rows))
for r in rows: 
    if r[2]!='ελληνικά': print(r[:4])
