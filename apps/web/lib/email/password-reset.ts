import type { Locale } from "@/lib/i18n/dictionaries";
import type { EmailMessage } from "./send";

const COPY: Record<
  Locale,
  {
    subject: string;
    intro: string;
    expiry: string;
    ignore: string;
    action: string;
  }
> = {
  en: {
    subject: "Reset your Tend password",
    intro: "Use this link to choose a new password for Tend.",
    expiry: "It expires in one hour.",
    ignore: "If you did not ask for this, you can ignore the email.",
    action: "Choose a new password",
  },
  sr: {
    subject: "Resetuj Tend lozinku",
    intro: "Koristi ovaj link da izabereš novu lozinku za Tend.",
    expiry: "Važi jedan sat.",
    ignore: "Ako nisi tražio/la ovo, možeš da ignorišeš email.",
    action: "Izaberi novu lozinku",
  },
};

export function buildPasswordResetEmail(input: {
  to: string;
  resetUrl: string;
  locale?: Locale;
}): EmailMessage {
  const copy = COPY[input.locale === "sr" ? "sr" : "en"];
  const text = `${copy.intro} ${copy.expiry}\n\n${input.resetUrl}\n\n${copy.ignore}`;
  const html = `<p>${copy.intro} ${copy.expiry}</p><p><a href="${input.resetUrl}">${copy.action}</a></p><p>${copy.ignore}</p>`;

  return {
    to: input.to,
    subject: copy.subject,
    text,
    html,
  };
}
