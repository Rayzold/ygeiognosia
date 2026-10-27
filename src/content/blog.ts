// Blog UI texts. Wix showed them in English («All Posts», «Recent Posts», «See All», «min read»):
// Greek per approved fix 2. The share, «Διαβάστε επίσης» and home/footer promotion texts are new
// (owner request 2026-10-27, OWNER-CHANGES.md).

export const BLOG = {
  title: "Άρθρα",
  /** /blog meta description (approved fix 5: from the content) */
  description: "Άρθρα της Υγειογνωσίας για τη φυσική υγεία, τη διατροφή, τα βότανα, το μέλι και τα ελιξίρια της φύσης.",
  author: "Υγειογνωσία",
  allPosts: "Όλα τα άρθρα",
  back: "Πίσω",
  search: "Αναζήτηση",
  readAlso: "Διαβάστε επίσης",
  recent: "Πρόσφατα άρθρα",
  fromBlog: "Από το blog μας",
  readArticle: "Διαβάστε το άρθρο",
  minutes: (n: number) => `${n} ${n === 1 ? "λεπτό" : "λεπτά"} ανάγνωσης`,
  page: (n: number) => `Σελίδα ${n}`,
  pagination: {
    label: "Σελίδες άρθρων",
    first: "Πρώτη σελίδα",
    previous: "Προηγούμενη σελίδα",
    next: "Επόμενη σελίδα",
    last: "Τελευταία σελίδα",
  },
  share: {
    title: "Σας άρεσε; Κοινοποιήστε το!",
    short: "Κοινοποίηση",
    native: "Κοινοποίηση…",
    facebook: "Κοινοποίηση στο Facebook",
    whatsapp: "Αποστολή με WhatsApp",
    viber: "Αποστολή με Viber",
    x: "Κοινοποίηση στο X",
    pinterest: "Αποθήκευση στο Pinterest",
    email: "Αποστολή με email",
    copy: "Αντιγραφή συνδέσμου",
    copied: "Ο σύνδεσμος αντιγράφηκε!",
    emailBody: (title: string, url: string) => `Σου προτείνω αυτό το άρθρο της Υγειογνωσίας:\n\n${title}\n${url}`,
  },
  video: {
    play: "Αναπαραγωγή βίντεο",
    note: "Το βίντεο φορτώνεται από το YouTube όταν το πατήσετε.",
    title: "Βίντεο YouTube",
  },
  rss: "RSS",
  rssTitle: "Υγειογνωσία — Άρθρα",
};
