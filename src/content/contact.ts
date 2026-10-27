import { EMAIL } from "./site";

/**
 * /contact form texts. Wix had English placeholders (Name, Email, Subject, Message, Submit); approved fix 2:
 * all UI in Greek. The success, error and validation texts are new (Wix used its own popup): owner approval
 * pending (OWNER-CHANGES.md).
 */
export const CONTACT_FORM = {
  title: "Φόρμα επικοινωνίας",
  fields: { name: "Όνομα", email: "Email", subject: "Θέμα", message: "Μήνυμα" },
  submit: "Αποστολή",
  sending: "Αποστολή…",
  success: "Ευχαριστούμε! Το μήνυμά σας στάλθηκε.",
  // The Jotform response is opaque (no-cors), so the email is offered as a fallback
  successFallback: "Αν δεν λάβετε απάντηση, γράψτε μας στο ",
  errors: {
    required: "Συμπληρώστε αυτό το πεδίο.",
    email: "Συμπληρώστε ένα έγκυρο email.",
    send: `Κάτι πήγε στραβά. Δοκιμάστε ξανά ή γράψτε μας στο ${EMAIL}.`,
  },
  email: EMAIL,
};
