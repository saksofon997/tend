import { type Locale, dictionaries } from "@/lib/i18n/dictionaries";
import { escapeHtml } from "./html";
import type { EmailMessage } from "./send";
import { EMAIL_TOKENS } from "./tokens";

function passwordResetCopy(locale: Locale) {
  const dictionary = dictionaries[locale];

  return {
    action: dictionary["email.passwordReset.action"],
    expiry: dictionary["email.passwordReset.expiry"],
    ignore: dictionary["email.passwordReset.ignore"],
    intro: dictionary["email.passwordReset.intro"],
    pasteLink: dictionary["email.passwordReset.pasteLink"],
    preheader: dictionary["email.passwordReset.preheader"],
    subject: dictionary["email.passwordReset.subject"],
  };
}

export function buildPasswordResetEmail(input: {
  to: string;
  resetUrl: string;
  locale?: Locale;
}): EmailMessage {
  const copy = passwordResetCopy(input.locale === "sr" ? "sr" : "en");
  const safeUrl = escapeHtml(input.resetUrl);
  const text = `${copy.intro} ${copy.expiry}\n\n${input.resetUrl}\n\n${copy.ignore}`;
  const html = `<!doctype html>
<html lang="${input.locale === "sr" ? "sr" : "en"}">
  <body style="margin:0;padding:0;background:${EMAIL_TOKENS.bg};">
    <div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(copy.preheader)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${EMAIL_TOKENS.bg};">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${EMAIL_TOKENS.card};border:1px solid ${EMAIL_TOKENS.border};border-radius:12px;">
            <tr>
              <td style="padding:32px 28px 28px;">
                <p style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:1.25;color:${EMAIL_TOKENS.primary};">Tend</p>
                <h1 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1.3;font-weight:500;color:${EMAIL_TOKENS.text};">${escapeHtml(copy.subject)}</h1>
                <p style="margin:0 0 8px;font-family:'DM Sans',system-ui,-apple-system,sans-serif;font-size:16px;line-height:1.65;color:${EMAIL_TOKENS.text};">${escapeHtml(copy.intro)}</p>
                <p style="margin:0 0 24px;font-family:'DM Sans',system-ui,-apple-system,sans-serif;font-size:16px;line-height:1.65;color:${EMAIL_TOKENS.muted};">${escapeHtml(copy.expiry)}</p>
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="border-radius:8px;background:${EMAIL_TOKENS.primary};">
                      <a href="${safeUrl}" style="display:inline-block;padding:14px 22px;font-family:'DM Sans',system-ui,-apple-system,sans-serif;font-size:16px;line-height:1.2;font-weight:600;color:${EMAIL_TOKENS.inverse};text-decoration:none;">${escapeHtml(copy.action)}</a>
                    </td>
                  </tr>
                </table>
                <p style="margin:24px 0 8px;font-family:'DM Sans',system-ui,-apple-system,sans-serif;font-size:13px;line-height:1.6;color:${EMAIL_TOKENS.muted};">${escapeHtml(copy.pasteLink)}</p>
                <p style="margin:0 0 24px;font-family:'DM Sans',system-ui,-apple-system,sans-serif;font-size:13px;line-height:1.6;word-break:break-all;"><a href="${safeUrl}" style="color:${EMAIL_TOKENS.primary};">${safeUrl}</a></p>
                <p style="margin:0;font-family:'DM Sans',system-ui,-apple-system,sans-serif;font-size:14px;line-height:1.65;color:${EMAIL_TOKENS.muted};">${escapeHtml(copy.ignore)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return {
    to: input.to,
    subject: copy.subject,
    text,
    html,
  };
}
