"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { CONTACT_FORM as T } from "@/content/contact";

/**
 * /contact form: the Wix form (Name, Email, Subject, Message, all required, Submit) in its Wix look and
 * geometry (664px box, 631×33 fields at x4 on white 73%, 111px message, 155×33 #6B8841 button on the right).
 * The site is static, so the data is posted straight to the Jotform form «Υγειογνωσία – Επικοινωνία» (EU
 * servers), which stores every message and emails a notification to ygeiognosia@hotmail.com.
 * Field names (qN_…) come from the Jotform form; if its questions are re-created there, update JOTFORM.
 *
 * TECH DEBT (README "Known limitations"): the POST is cross-origin no-cors, so a rejection by Jotform
 * (spam filter, monthly quota, renamed fields) still shows "sent"; the success text therefore also offers the email.
 */
const JOTFORM = {
  id: "262993612964066",
  action: "https://eu-submit.jotform.com/submit/262993612964066",
  fields: { name: "q7_input", email: "q3_q3_email1", subject: "q4_q4_textbox2", message: "q5_q5_textarea3" },
  honeypot: "website", // Jotform's own spam trap: must stay empty
};

type Key = keyof typeof T.fields;
const KEYS: Key[] = ["name", "email", "subject", "message"];
type Status = "idle" | "sending" | "sent" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Partial<Record<Key | "form", string>>>({});
  const mountedAt = useRef(Date.now());

  function validate(data: FormData) {
    const e: Partial<Record<Key, string>> = {};
    for (const k of KEYS) if (!String(data.get(k) ?? "").trim()) e[k] = T.errors.required;
    const email = String(data.get("email") ?? "").trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = T.errors.email;
    return e;
  }

  async function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const form = ev.currentTarget;
    const data = new FormData(form);
    const e = validate(data);
    setErrors(e);
    const first = KEYS.find((k) => e[k]);
    if (first) {
      (form.elements.namedItem(first) as HTMLElement | null)?.focus();
      return;
    }
    setStatus("sending");
    const body = new URLSearchParams({
      formID: JOTFORM.id,
      simple_spc: `${JOTFORM.id}-${JOTFORM.id}`,
      timeToSubmit: String(Math.round((Date.now() - mountedAt.current) / 1000)),
      [JOTFORM.honeypot]: String(data.get("website") ?? ""),
    });
    for (const k of KEYS) body.set(JOTFORM.fields[k], String(data.get(k) ?? "").trim());
    try {
      // Cross-origin "simple" POST: the response is opaque, so a network error is the only failure we can see.
      await fetch(JOTFORM.action, { method: "POST", mode: "no-cors", body });
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
      setErrors({ form: T.errors.send });
    }
  }

  const field =
    "block w-full rounded-none border-0 bg-white/[0.73] px-3 text-[16px] leading-[22.4px] text-black outline-none placeholder:text-grey-4 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-green-3 aria-[invalid=true]:shadow-[inset_0_0_0_2px_#d93025]";
  const props = (k: Key) => ({
    id: `cf-${k}`,
    name: k,
    required: true,
    placeholder: T.fields[k],
    "aria-invalid": !!errors[k],
    "aria-describedby": errors[k] ? `cf-${k}-err` : undefined,
  });

  return (
    <form onSubmit={onSubmit} noValidate aria-label={T.title} aria-describedby="cf-status" className="flex flex-col gap-[6px] pt-1 desk:pl-[4px] desk:pr-[29px] desk:pt-[12px]">
      {/* honeypot: hidden from people; bots fill it and Jotform treats the submission as spam */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <Field k="name" error={errors.name}>
        <input {...props("name")} type="text" autoComplete="name" className={`${field} h-[44px] desk:h-[33px]`} />
      </Field>
      <Field k="email" error={errors.email}>
        <input {...props("email")} type="email" autoComplete="email" className={`${field} h-[44px] desk:h-[33px]`} />
      </Field>
      <Field k="subject" error={errors.subject}>
        <input {...props("subject")} type="text" className={`${field} h-[44px] desk:h-[33px]`} />
      </Field>
      <Field k="message" error={errors.message}>
        <textarea {...props("message")} rows={5} className={`${field} h-[140px] resize-y px-4 py-[10px] desk:h-[111px]`} />
      </Field>
      <div className="mt-4 flex justify-end desk:mt-[32px]">
        <button
          type="submit"
          disabled={status === "sending"}
          className="h-[44px] w-[155px] bg-green-4 font-light text-[19px] text-white transition-colors duration-[400ms] hover:bg-green-3 hover:text-green-5 disabled:bg-grey-2 desk:h-[33px]"
        >
          {status === "sending" ? T.sending : T.submit}
        </button>
      </div>
      <p id="cf-status" role="status" aria-live="polite" className="min-h-[1.5em] text-right text-[15px] leading-[1.4]">
        {status === "sent" && (
          <span className="text-white">
            {T.success}
            <span className="block text-[14px] text-white/80">
              {T.successFallback}
              <a href={`mailto:${T.email}`} className="underline underline-offset-4 hover:text-green-3">
                {T.email}
              </a>
              .
            </span>
          </span>
        )}
        {status === "error" && errors.form && <span className="text-[#ffb4a9]">{errors.form}</span>}
      </p>
    </form>
  );
}

function Field({ k, error, children }: { k: Key; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={`cf-${k}`} className="sr-only">
        {T.fields[k]}
      </label>
      {children}
      {error && (
        <p id={`cf-${k}-err`} className="mt-1 text-[13px] text-[#ffb4a9]">
          {error}
        </p>
      )}
    </div>
  );
}
