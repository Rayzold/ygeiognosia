// Content pages rendered from their Wix layout (content/pages/pages/<slug>/layout.json) by src/app/[page].
// Titles: Greek, unique, from each page's own Wix og:title / heading (approved fixes 3 and 4).
// description: only where the Wix og:description cannot be used; otherwise it is taken from Wix or
// generated from the page text (approved fix 5).

export type ContentPage = {
  title: string;
  absoluteTitle?: boolean;
  description?: string;
  useWixDescription?: boolean;
  /** track of the Wix music player; the player is shown only when the file exists in public/ */
  audio?: string;
  /** Wix video page background (fixed, over the photo) */
  video?: { src: string; poster: string };
};

const OLIVE = "Αγριέλαιο Υγειογνωσίας";

export const CONTENT_PAGES: Record<string, ContentPage> = {
  "about-us": { title: "Το κατάστημα", useWixDescription: true },
  // Wix track 21375d_f2a90e8fb6364e2a8c0385ae218c5007.mp3 (music.wixstatic.com, 6:11, 11.9 MB)
  people: { title: "Οι άνθρωποι", audio: "/audio/people.mp3", video: { src: "/video/people.mp4", poster: "/images/people-video-poster.webp" } },
  aesthlos: { title: "Exclusive Προϊόντα Aesthlos", useWixDescription: true },
  // Wix og:description still has the old address «Ομήρου 14»: generated from the page instead (open question)
  contact: { title: "Επικοινωνία" },
  "exclusive-elixirs": { title: "Τα ελιξίρια μας", useWixDescription: true },
  wildolive: { title: OLIVE },
  "agrielia-stin-arxaiotita": { title: `Θεραπευτικές ιδιότητες στην αρχαιότητα | ${OLIVE}`, absoluteTitle: true },
  "gnorimia-me-to-dentro": { title: `Η γνωριμία με το δέντρο | ${OLIVE}`, absoluteTitle: true },
  "gnorimia-me-ton-karpo": { title: `Η γνωριμία με τον καρπό | ${OLIVE}`, absoluteTitle: true },
  "o-kipos-tis-gesthimanis": { title: `Ο κήπος της Γεθσημανής | ${OLIVE}`, absoluteTitle: true },
  "ofeli-posis": { title: `Τα οφέλη | ${OLIVE}`, absoluteTitle: true },
  orders: { title: "Κάνε την παραγγελία σου τώρα!" },
  // the store categories (Phase 5) have the same names: "Παραγγελίες" keeps the titles unique
  "orders-elixirs": { title: "Ελιξίρια | Παραγγελίες" },
  "orders-superfoods": { title: "Υπερτροφές | Παραγγελίες" },
  "orders-cosmetics": { title: "Καλλυντικά | Παραγγελίες" },
  "orders-food-supplements": { title: "Συμπληρώματα Διατροφής | Παραγγελίες" },
  "orders-immune-protection": { title: "Ενίσχυση / Προστασία Ανοσοποιητικού | Παραγγελίες" },
};
