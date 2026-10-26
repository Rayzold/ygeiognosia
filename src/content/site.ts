// Site chrome: menu, header and footer texts, business details.
// Texts come from content/site.json (Wix capture + approved fixes); keep them verbatim.

export const SITE_URL = "https://www.ygeiognosia.com";
export const SITE_NAME = "Υγειογνωσία";

/** Wix site verification for Google Search Console (kept so the property stays verified after the move). */
export const GOOGLE_SITE_VERIFICATION = "3B9BcE3QxVrks-C_Id2EnbpkpmQbN-Bi2ee1oSp_QjY";

export type MenuItem = { label: string; href: string; children?: MenuItem[] };

/** Main menu, same order as Wix. Wix's «More» overflow item is dropped (approved fix 2). */
export const MENU: MenuItem[] = [
  { label: "αρχική", href: "/" },
  { label: "το κατάστημα", href: "/about-us" },
  { label: "οι άνθρωποι", href: "/people" },
  { label: "άρθρα", href: "/blog" },
  {
    label: "τα ελιξίρια μας",
    href: "/exclusive-elixirs",
    children: [{ label: "Αγριέλαιο Υγειογνωσίας", href: "/wildolive" }],
  },
  { label: "επικοινωνία", href: "/contact" },
];

/** Relative widths of the desktop menu buttons, measured on Wix (980px bar). */
export const MENU_WIDTHS = [137, 180, 170, 134, 191, 168];

export const SOCIAL = {
  facebook: "https://www.facebook.com/Ygeiognosia",
  instagram: "https://www.instagram.com/ygeiognosia",
};

export const PHONE = { display: "+30 213 014 4422", tel: "+302130144422" }; // approved fix 10
export const EMAIL = "ygeiognosia@hotmail.com";

export const ADDRESS = {
  street: "Βυζαντίου 23",
  locality: "Νέα Σμύρνη",
  postalCode: "17121",
  region: "Αθήνα",
  country: "GR",
  footer: "Βυζαντίου 23, Νέα Σμύρνη, 17121 Αθήνα",
};

/** Opening hours from /contact (Δευτέρα–Σάββατο). */
export const OPENING_HOURS = [
  { day: "Monday", opens: "09:00", closes: "17:00" },
  { day: "Tuesday", opens: "09:00", closes: "21:00" },
  { day: "Wednesday", opens: "09:00", closes: "17:00" },
  { day: "Thursday", opens: "09:00", closes: "21:00" },
  { day: "Friday", opens: "09:00", closes: "21:00" },
  { day: "Saturday", opens: "09:00", closes: "17:00" },
];

export const HEADER = {
  cart: "Καλάθι αγορών",
  tagline: "Υγεία και Τέχνη",
  follow: "Ακολουθήστε μας:",
  searchPlaceholder: "Τι ψάχνετε...;",
};

export const FOOTER = {
  follow: "Ακολουθήστε μας:",
  phoneOrders: "Τηλεφωνικές Παραγγελίες:",
  pickup: "Δυνατότητα παραλαβής της παραγγελίας σας από το κατάστημα μας:",
  delivery: "Home Delivery για τηλεφωνικές παραγγελίες άνω των 20€",
  deliveryAreas: "(Νέα Σμύρνη, Νέος Κόσμος, Καλλιθέα, Άγιος Ιωάννης, Δάφνη, Παλαιό Φάληρο)",
  copyright: "© 2026 by Ygeiognosia  |  Health food store",
};

/** Wix media file names (see src/lib/media.ts). */
export const MEDIA = {
  logo: "21375d_7b3e0310be8a4a3993e745816cf2d65a_mv2.png",
  background: "nsplsh_7a4a796f63667335627955_mv2.jpg",
};
