# Playbook: ygeiognosia.com, από το Wix σε δικό σας site

> Οδηγός για **νέο session** του Claude. Βασίζεται σε ό,τι κάναμε και μάθαμε στη μεταφορά του **aesthlos.com** (17–26/10/2026).
> Τα στοιχεία της ενότητας 1 ελέγχθηκαν στις **26/10/2026**.
> Γλώσσα: επικοινωνία στα ελληνικά, τεχνικοί όροι στα αγγλικά. Τα έτοιμα prompts είναι στα αγγλικά, όπως και του aesthlos.

---

## 0. Πώς να το χρησιμοποιήσεις

1. Ξεκίνα **νέο session**. Ένα καθαρό context για ένα μεγαλύτερο project είναι καλύτερο από τη συνέχεια αυτού εδώ.
2. Επισύναψε **αυτό το αρχείο**.
3. Φτιάξε κενό repo στο GitHub, π.χ. `Rayzold/ygeiognosia` (private), και έναν τοπικό φάκελο, π.χ. `C:\Users\marko\Desktop\Ygeiognosia`.
4. Αν θες, πρόσθεσε και το repo `Rayzold/aesthlos` ως **αναφορά**: τα scripts και τα patterns του επαναχρησιμοποιούνται (ενότητα 5).
5. Απάντησε πρώτα στις **αποφάσεις της ενότητας 2**. Το κατάστημα αλλάζει όλο το σχέδιο.
6. Επικόλλησε το **Prompt εκκίνησης** (ενότητα 9) και προχώρα phase-by-phase, με review μετά από κάθε phase.

---

## 1. Τι ξέρουμε ήδη για το ygeiognosia.com

| | Τιμή | Σημασία |
|---|---|---|
| Registrar | **Enartia / papaki.gr**, στον ίδιο λογαριασμό papaki με το aesthlos.com (MS1441-PK, markos.stefanou@gmail.com) | Δεν χρειάζεται transfer, μόνο αλλαγή nameservers. |
| Λήξη domain | **15/12/2026** | ⚠️ Σύντομα. Επιβεβαίωσε την ανανέωση στο papaki **πριν** ξεκινήσεις. |
| Κατάσταση registry | `active`, χωρίς locks | Στο aesthlos υπήρχε lock. Εδώ μάλλον δεν θα χρειαστεί ξεκλείδωμα, αλλά έλεγξέ το. |
| Nameservers | `ns8.wixdns.net`, `ns9.wixdns.net` | Το DNS το διαχειρίζεται το Wix. |
| Site (apex) | A → 185.230.63.171 / .107 / .186 (Wix) | Θα αντικατασταθεί. |
| Site (www) | CNAME → `cdn3.wixdns.net` (Wix) | Θα αντικατασταθεί. |
| **Email (MX)** | **Κανένα**. Δεν υπάρχουν MX, SPF, DKIM, DMARC, mail, webmail, autodiscover. | Η μεταφορά του DNS **δεν μπορεί να χαλάσει email**. Αν όμως υπάρχει επαγγελματικό email που περιμένουν να δουλεύει (π.χ. info@ygeiognosia.com), **δεν δουλεύει ήδη σήμερα**. Ρώτα τον ιδιοκτήτη. |
| Τύπος site | **Wix Stores** (ενεργό κατάστημα: καλάθι, τιμές, π.χ. Ashwagandha 7,20 €) + **Wix Blog** + σελίδες | Το μεγαλύτερο ζήτημα: βλ. ενότητα 2Α. |
| Μέγεθος (sitemap.xml) | **106** προϊόντα (`/product-page/<slug>`), **81** άρθρα (`/post/<slug>`), **38** σελίδες, `/blog` | Περίπου 226 URL, 8 φορές το aesthlos. |
| Μενού | αρχική · το κατάστημα · οι άνθρωποι · άρθρα · τα ελιξήρια μας · επικοινωνία | |
| Slugs | Πολλά είναι **ελληνικά** (π.χ. `/post/τα-φρούτα-που-σε-βάζουν-για-ύπνο`, `/product-page/ψευδάργυρος`) | Πρέπει να μείνουν **ίδια** για το SEO. Προσοχή στο URL-encoding. |
| Υπολείμματα template | Π.χ. `/product-page/i-m-a-product-2`, `/i-m-a-product-6`, `/blank-14` | Πιθανότατα κρυμμένα ή ξεχασμένα προϊόντα και σελίδες. Ρώτα πριν τα μεταφέρεις. |

---

## 2. Αποφάσεις πριν το Phase 1 (ρώτα τον ιδιοκτήτη)

### 2Α. Το κατάστημα (η πιο σημαντική απόφαση)
Ένα στατικό site, όπως του aesthlos, **δεν** έχει μόνο του καλάθι, πληρωμές, παραγγελίες ή απόθεμα. Επιλογές, από την πιο απλή στην πιο πλήρη:

| Επιλογή | Τι σημαίνει | Υπέρ | Κατά |
|---|---|---|---|
| **1. Κατάλογος χωρίς online πληρωμή** | Κάθε προϊόν με τιμή και κουμπί «Παραγγελία», που ανοίγει φόρμα (Jotform), email ή τηλέφωνο | Δωρεάν, απλό, ίδιο stack με το aesthlos | Χειροκίνητη διαχείριση παραγγελιών και πληρωμής |
| **2. Στατικό site + εξωτερικό καλάθι** | Π.χ. Snipcart, Shopify Buy Button, Ecwid, ή payment links (Stripe, Viva Smart Checkout) ανά προϊόν | Κρατά το στατικό site, γρήγορο και φθηνό στη φιλοξενία | Συνδρομή ή προμήθεια. Τιμές και όροι πρέπει να ελεγχθούν στο σήμερα. Προσοχή σε ΦΠΑ, μεταφορικά, παραστατικά (myDATA). |
| **3. Πλατφόρμα e-shop** | Shopify, WooCommerce κ.λπ. | Όλα έτοιμα: απόθεμα, κουπόνια, παραγγελίες | Δεν είναι πια «static site οπουδήποτε». Μηνιαίο κόστος. Μεγαλύτερη αλλαγή. |
| **4. Το κατάστημα μένει στο Wix** | Π.χ. το store σε subdomain (`shop.ygeiognosia.com`), το υπόλοιπο site νέο | Μηδέν ρίσκο στις πωλήσεις | Το Wix δεν φεύγει, οπότε το κόστος του μένει |

Ερωτήσεις για τον ιδιοκτήτη:
- Πόσες παραγγελίες έρχονται online τον μήνα;
- Ποιοι τρόποι πληρωμής χρησιμοποιούνται;
- Υπάρχει διαχείριση αποθέματος;
- Πώς βγαίνουν τα παραστατικά (ERP, myDATA);
- Χρειάζονται λογαριασμοί πελατών;
- Τα «i-m-a-product-N» είναι πραγματικά προϊόντα;

> Αν η απάντηση είναι «λίγες παραγγελίες, συνήθως τηλεφωνικά», η **Επιλογή 1** είναι η πιο κοντά στο aesthlos.

### 2Β. Υπόλοιπες αποφάσεις
- [ ] **Blog:** 81 άρθρα. Μεταφορά ως αρχεία Markdown/MDX (ένα αρχείο ανά άρθρο, `src/content/posts/`) με τα **ίδια** URL `/post/<slug>`.
- [ ] **Γλώσσες:** Μόνο ελληνικά; Έλεγξε για `?lang=` όπως στο aesthlos.
- [ ] **Γραμματοσειρές:** Εμπορικές του Wix → δωρεάν αντικατάσταση με ελληνικά (όπως η Roboto Condensed στο aesthlos). Δείξε σύγκριση στον ιδιοκτήτη.
- [ ] **Πιστή αντιγραφή** του design (όπως στο aesthlos) **ή** ευκαιρία για redesign;
- [ ] **Members / login πελατών:** Αν υπάρχουν στο Wix, δεν μεταφέρονται σε στατικό site.
- [ ] **Φόρμα επικοινωνίας:** Jotform, όπως στο aesthlos (λειτουργεί, EU servers, η ειδοποίηση πάει στο email του ιδιοκτήτη).
- [ ] **Email:** Θέλουν επαγγελματικό email @ygeiognosia.com; Σήμερα δεν υπάρχει.

---

## 3. Μαθήματα από το aesthlos (για να μην τα ξαναμάθουμε)

### Τι δούλεψε καλά
- **Stack:** Next.js (App Router) + TypeScript + Tailwind, `output: "export"`, φιλοξενία στο **Cloudflare Pages** (δωρεάν) με auto-deploy σε κάθε `git push`.
- **Archive πρώτα:** Κατέβασμα όλου του Wix (HTML, εικόνες σε πλήρη ανάλυση, PDF, video, fonts, screenshots) στο `archive/`, που μένει η «πηγή αλήθειας» για κείμενα και layout.
- **Κείμενα verbatim:** Πρώτα εξαγωγή σε JSON, μετά «πάγωμα» σε typed `src/content/*.ts`. Κάθε σελίδα έχει το δικό της αρχείο κειμένων.
- **Εικόνες:** WebP + έτοιμα πλάτη (`-w640.webp` κ.λπ.) + custom `next/image` loader. Ο φάκελος των εικόνων έπεσε από 171 MB σε ~4 MB.
- **Ποιότητα:** Ίδια URL, hreflang, canonical, sitemap, robots, og:image ανά σελίδα, JSON-LD, 404, reduced-motion, Lighthouse mobile ≥ 90/95/100.
- **`npm run build` = image variants + next build + link check.** Το deploy αποτυγχάνει αν υπάρχει σπασμένος σύνδεσμος, οπότε δεν ανεβαίνει ποτέ σπασμένο site.
- **Κάθε designed σελίδα σε δικό της route folder,** ώστε να φορτώνει μόνο τη δική της JavaScript. Αυτό έφερε την ταχύτητα πάνω από 90.
- **`OWNER-CHANGES.md` (ελληνικά):** Κάθε αλλαγή σε σχέση με το Wix, για τον ιδιοκτήτη. Πολύτιμο στις συναντήσεις.
- **Προσωρινό link για έγκριση:** `https://<project>.pages.dev` πριν το domain.
- **Code review πριν το release** (`/engineering:code-review`): βρήκε πραγματικά bugs.

### Παγίδες
| Παγίδα | Τι έγινε | Τι κάνεις |
|---|---|---|
| Cloudflare «Bot Preference Sync» | Είναι ON by default στην προσθήκη domain και αλλάζει το robots.txt | Κλείσ' το στο Add domain |
| Cloudflare quick-scan | Έβαλε **όλες** τις εγγραφές σε «Proxied», ακόμα και mail/webmail | Γύρισε σε **DNS only** ό,τι δεν είναι web (και το Wix μέχρι το cutover) |
| papaki: τα domains δεν φαίνονται στο νέο panel | Βρίσκονται στον **Προηγούμενο Πίνακα Ελέγχου** | Είσοδος από `controlpanel.papaki.com` → «Προηγούμενος Πίνακας Ελέγχου» → κωδικός μίας χρήσης με email (Aegis) |
| papaki: η φόρμα nameservers | Είναι iframe | Άνοιξε απευθείας `https://www2.papaki.com/cp2/frm_manage_nameservers.aspx?domain=<domain>` |
| papaki: «Θα πρέπει οι nameservers να είναι ενημερωμένοι…» | Το domain ήταν **κλειδωμένο** | Κλείδωμα **OFF** → αλλαγή NS → κλείδωμα **ON** |
| Ο έλεγχος ασφαλείας του Claude | Μπλοκάρει **μερικές** αλλαγές DNS/domain (π.χ. nameservers στο papaki) | Ο χρήστης κάνει το κλικ με ακριβείς οδηγίες. Μην επιμένεις. |
| Το papaki άλλαξε server (linux50 → linux261) στις 09/2026 | Με εξωτερικό DNS οι IP δεν ενημερώνονται αυτόματα | Αν προστεθεί email/hosting στο papaki: οι IP από το email του papaki ή το panel (Πακέτα Email → Plesk) |
| Το Chrome μεταφράζει αυτόματα | Οι γερμανικές σελίδες φαίνονταν ελληνικές | Όχι bug. Έλεγξε το HTML (`lang`, `<title>`) |
| Τοπική cache DNS | Μετά την αλλαγή ο υπολογιστής «έβλεπε» την παλιά IP για ~1 ώρα | `ipconfig /flushdns` + `chrome://net-internals/#dns` → Clear host cache |
| Screenshots της επέκτασης Chrome | Συχνά timeout σε Wix, Jotform, papaki | Διάβασε τη σελίδα με JavaScript. Για οπτικό έλεγχο: Playwright στο container. |
| Lighthouse στο container | Θόρυβος ±10 μονάδες | Median 3 μετρήσεων (script `lh3.sh`) |
| PageSpeed API | Το ανώνυμο ημερήσιο όριο εξαντλείται | Lighthouse τοπικά ή https://pagespeed.web.dev από τον χρήστη |
| Jotform POST (`no-cors`) | Η σελίδα δεν μαθαίνει αν το Jotform απέρριψε το μήνυμα | Στο μήνυμα επιτυχίας μπαίνει και email ως fallback. Γράφεται στο README «Known limitations». |
| Προωθημένα email στο Gmail | Κατέληγαν στο spam | Φίλτρο στο Gmail «Να μην πηγαίνει ποτέ στα Ανεπιθύμητα» |

---

## 4. Phases (ίδια λογική με το aesthlos, προσαρμοσμένη)

| Phase | Τι | Ιδιαίτερα για το ygeiognosia |
|---|---|---|
| 0 | `CLAUDE.md`: κανόνες, non-negotiables, stack, motion rules | Πρόσθεσε τις αποφάσεις της ενότητας 2 |
| 1 | Crawl/archive: sitemap, HTML ανά σελίδα, εικόνες σε πλήρη ανάλυση, PDF, fonts, design tokens, screenshots | **Προϊόντα:** καλύτερα το **CSV export του Wix Stores** (Dashboard → Store Products → Export) αντί για scraping. **Blog:** δοκίμασε `/blog-feed.xml` (RSS) + HTML ανά άρθρο. 226 URL: PowerShell script με παύσεις, όπως στο aesthlos. |
| 2 | Scaffold (Next.js static export), tokens, header/footer/layout, fonts | Μενού: αρχική · το κατάστημα · οι άνθρωποι · άρθρα · τα ελιξήρια μας · επικοινωνία |
| 3 | Αρχική | |
| 4 | Σελίδες περιεχομένου (38) | Templates ανά τύπο σελίδας, όχι 38 χειροποίητες |
| 5 | **Κατάστημα**: λίστα, κατηγορίες, σελίδα προϊόντος (1 template, 106 προϊόντα από CSV/JSON) | Ανάλογα με την 2Α: κουμπί παραγγελίας, εξωτερικό καλάθι κ.λπ. JSON-LD `Product` + `Offer` (τιμή, διαθεσιμότητα). |
| 5β | **Blog**: λίστα, σελίδα άρθρου (MDX), κατηγορίες | Ίδια URL `/post/<slug>`, ημερομηνίες, εικόνα εξωφύλλου, JSON-LD `BlogPosting` |
| 6 | Φόρμα επικοινωνίας (Jotform) | Ειδοποίηση στο email του ιδιοκτήτη |
| 7 | Quality pass: Lighthouse, reduced motion, keyboard, link check, code review | Πολλές εικόνες: lazy-loading και σωστά `sizes` |
| 8 | Deploy στο Cloudflare Pages → `*.pages.dev` → έγκριση → domain cutover | Χωρίς email, απλούστερο από το aesthlos (ενότητα 6) |

---

## 5. Επαναχρήση από το repo του aesthlos

| Αρχείο (`Rayzold/aesthlos`) | Χρήση |
|---|---|
| `scripts/download-wix.ps1` | Κατέβασμα σελίδων, εικόνων, αρχείων από Wix (Windows) |
| `scripts/parse_archive.py`, `scripts/extract_content.py` | Wix HTML → JSON (κείμενα με χρώματα, links, εικόνες) |
| `scripts/media-map.mjs`, `scripts/optimize-media.mjs` | Wix media id → τοπικά WebP |
| `scripts/image-variants.mjs` + `src/lib/image-loader.ts` | Responsive εικόνες σε static export |
| `scripts/og-images.mjs` | og:image 1200×630 ανά σελίδα |
| `scripts/check-links.mjs` | Έλεγχος συνδέσμων στο build (σπάει το deploy) |
| `src/lib/content.ts` (`pageMetadata`) | Title, description, canonical, hreflang, OG |
| `src/components/sections/contact/ContactForm.tsx` | Φόρμα σε Jotform (αλλάζουν το form id και τα ονόματα πεδίων `qN_…`) |
| `src/components/motion/Reveal.tsx`, `PageFade.tsx`, `media/BackgroundVideo.tsx` | Διακριτική κίνηση που σέβεται το reduced motion |
| `public/_headers` | Cache, CSP, HSTS (το CSP προσαρμόζεται αν μπει εξωτερικό καλάθι ή πληρωμές) |
| `OWNER-CHANGES.md`, `MIGRATION.md`, README «How to edit content» | Πρότυπα εγγράφων |

---

## 6. Μεταφορά domain (runbook, χωρίς email)

> Ισχύει μόνο αν το ygeiognosia.com **δεν** έχει email. Αν μέχρι τότε προστεθεί email, ακολούθησε τα βήματα email του `MIGRATION.md` του aesthlos.

1. **Πριν:**
   - Wix → Domains → ygeiognosia.com → **Manage DNS Records** → screenshot όλων των εγγραφών.
   - Το DNS απ' έξω δείχνει μόνο A/CNAME. Ψάξε και για εγγραφές επαλήθευσης, π.χ. Google Search Console, Facebook domain verification, Merchant Center.
2. **Cloudflare** (λογαριασμός `markos.stefanou@gmail.com`):
   - Add a domain → `ygeiognosia.com` → Free.
   - **Bot Preference Sync: OFF.**
   - Έλεγξε τις εγγραφές του scan: Wix apex/www σε **DNS only** μέχρι το βήμα 4.
   - Σημείωσε τους 2 nameservers που θα δώσει.
3. **papaki** (Προηγούμενος Πίνακας Ελέγχου → Domains → ygeiognosia.com):
   - Αν υπάρχει κλείδωμα: **OFF**.
   - Άνοιξε `frm_manage_nameservers.aspx?domain=ygeiognosia.com`, βάλε τους 2 nameservers του Cloudflare, πάτα **Συνέχεια**.
   - Κλείδωμα **ON**.
   - Επιβεβαίωση: η σελίδα του domain δείχνει τους νέους NS, και το `dns.google` (NS) τους βλέπει. Μετά, στο Cloudflare, «Check nameservers».
4. **Cutover** (αφού η ζώνη γίνει **Active**):
   - Pages → Custom domains: `www.ygeiognosia.com` και `ygeiognosia.com`.
   - DNS: `www` CNAME → `<project>.pages.dev` (proxied). Apex: σβήσε τα 3 A του Wix και βάλε CNAME → `<project>.pages.dev` (proxied).
   - **Redirect Rules:** apex → `https://www.ygeiognosia.com` (301, κρατά το query). Επιβεβαίωσε ότι το **www είναι το canonical**, όπως στο Wix.
   - **Always Use HTTPS: On.**
5. **Έλεγχοι στο live domain:** Όλα τα URL του sitemap με status 200, ιδιαίτερα τα ελληνικά slugs. Ακόμα: σελίδα 404, `http`→`https`, apex→www, CSP χωρίς errors στο console, φόρμα και καλάθι/παραγγελία από άκρη σε άκρη.
6. **Search Console:** Υπέβαλε το νέο `sitemap.xml` και ζήτα indexing για αρχική, κατάστημα και 2–3 άρθρα. Έλεγξε το Indexing μετά από 1–2 εβδομάδες.
7. **Wix:** Ακύρωση μετά από 1–2 εβδομάδες σωστής λειτουργίας. Πριν από αυτό, **export**:
   - παραγγελίες και πελάτες (Wix Stores)
   - προϊόντα (CSV)
   - συνδρομητές blog/newsletter
   - μηνύματα φορμών
   - τιμολόγια

**Επαναφορά:** Στο papaki ξαναμπαίνουν οι `ns8.wixdns.net` / `ns9.wixdns.net`.

---

## 7. Checklists

**Πριν το deploy στο pages.dev**
- [ ] Κάθε URL του Wix sitemap υπάρχει (script που συγκρίνει το Wix `sitemap.xml` με το `out/`)
- [ ] Κείμενα verbatim (δειγματοληπτικός έλεγχος 10 προϊόντων και 10 άρθρων με το archive)
- [ ] Τιμές προϊόντων ίδιες με το CSV
- [ ] Καμία αναφορά σε `wixstatic` στο build (`check-links.mjs`)
- [ ] Lighthouse mobile ≥ 90 / 95 / 95 / 100 (median 3 μετρήσεων)
- [ ] `OWNER-CHANGES.md` ενημερωμένο

**Μετά το cutover**
- [ ] DNS: apex/www → Pages, όλα proxied, HTTPS ενεργό
- [ ] Redirects (apex→www, παλιά URL αν άλλαξε κάτι)
- [ ] Φόρμα → Jotform → email ειδοποίησης
- [ ] Ροή παραγγελίας (ανάλογα με την 2Α)
- [ ] Search Console: sitemap και indexing
- [ ] Ο ιδιοκτήτης ενημερωμένος, Wix ακόμα ενεργό

---

## 8. Λογαριασμοί και πρόσβαση (χωρίς κωδικούς)

| Υπηρεσία | Λογαριασμός | Σημείωση |
|---|---|---|
| GitHub | `Rayzold` | Η εφαρμογή «Cloudflare Workers and Pages» έχει πρόσβαση μόνο σε **επιλεγμένα** repos: πρόσθεσε το νέο repo (ζητά επιβεβαίωση ταυτότητας στο GitHub) |
| Cloudflare | `markos.stefanou@gmail.com` (Account ID `fc14befddb905878457eaa99a08db40c`) | Ήδη εκεί: Pages project `aesthlos` και ζώνη `aesthlos.com` |
| papaki | MS1441-PK | Domains στον **Προηγούμενο Πίνακα Ελέγχου** (κωδικός μίας χρήσης με email) |
| Jotform | EU (`eu.jotform.com`) | Δωρεάν πλάνο: 1 παραλήπτης ειδοποίησης, ~100 υποβολές/μήνα |
| Wix | του ιδιοκτήτη | Για export και DNS records |

---

## 9. Prompt εκκίνησης (επικόλλησε στο νέο session)

```
I'm rebuilding https://www.ygeiognosia.com (Wix: Wix Stores + Wix Blog, ~38 pages, 106 products,
81 blog posts, Greek, Greek URL slugs) as a self-owned site, the same way we rebuilt aesthlos.com.
Read the attached playbook (ygeiognosia-playbook.md) first; it has the facts, decisions, lessons
and runbook. Reference repo for reusable scripts/patterns: Rayzold/aesthlos.

Rules:
- Communicate in Greek, keep technical terms/code in English.
- Ask me the open decisions in section 2 (especially 2A: the store) before Phase 1.
- Work phase by phase (section 4) and stop after each phase for review.
- Keep every existing URL path identical (including Greek slugs), keep all Greek copy verbatim,
  keep layout/images/colours faithful unless I decide otherwise.
- Keep OWNER-CHANGES.md (Greek) with every difference vs. Wix.
- CSV files: UTF-8 with BOM, delimiter ^, proper quoting.

Start with Phase 0: create CLAUDE.md for this project from the playbook and my answers.
```
