// The e-shop is a catalogue until the online shop opens (owner decision, 2026-10-27): no cart, no checkout.
// New texts (not on Wix) are marked «NEW» and listed in OWNER-CHANGES.md for the owner's approval.
import { PHONE } from "./site";

export const SHOP = {
  /** false = catalogue only (phone orders); Phase 5γ switches this on with the cart and Viva checkout */
  open: false,

  /**
   * false = no prices anywhere (owner 2026-10-27: the Wix prices are old; customers ask by phone, the owner
   * updates the prices later). Then: placeholder text, no price sorting, no price in search or JSON-LD.
   */
  showPrices: false,
  // NEW: shown where the price was
  pricePlaceholder: "Τιμή κατόπιν επικοινωνίας",

  // NEW: where Wix had «Add to Cart» on the product page
  soon: {
    title: "Το online shop μας ανοίγει σύντομα!",
    text: "Μέχρι τότε, παραγγείλτε τηλεφωνικά και παραλάβετε την παραγγελία σας από το κατάστημά μας ή με Home Delivery για παραγγελίες άνω των 20€.",
    // NEW: under the price placeholder on the product page
    priceText: "Για την τρέχουσα τιμή και τη διαθεσιμότητα, καλέστε μας.",
    call: `Καλέστε μας: ${PHONE.display}`,
  },

  // NEW: header, in place of «Καλάθι αγορών» + cart badge
  header: {
    products: "Τα προϊόντα μας",
    note: "Online shop σύντομα!",
    phone: "Τηλεφωνικές παραγγελίες:",
  },

  // Greek UI (approved fix 2); «Δείτε το προϊόν» is NEW, in place of «Add to Cart» on the product cards
  viewProduct: "Δείτε το προϊόν",
  loadMore: "Περισσότερα προϊόντα",
  sort: {
    label: "Ταξινόμηση",
    options: [
      { value: "", label: "Ταξινόμηση" },
      { value: "price-asc", label: "Τιμή: από χαμηλή σε υψηλή", price: true },
      { value: "price-desc", label: "Τιμή: από υψηλή σε χαμηλή", price: true },
      { value: "name-asc", label: "Όνομα: Α-Ω" },
      { value: "name-desc", label: "Όνομα: Ω-Α" },
    ],
  },
  price: "Τιμή",
  share: { facebook: "Κοινοποίηση στο Facebook", pinterest: "Κοινοποίηση στο Pinterest", whatsapp: "Αποστολή με WhatsApp", x: "Κοινοποίηση στο X" },
};
