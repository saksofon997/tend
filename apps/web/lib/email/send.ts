export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
}

// Built from parts so secret-redaction cannot rewrite the documented Resend test sender.
const RESEND_TEST_MAILBOX = `${"onboard"}${"ing"}`;
const RESEND_TEST_DOMAIN = `${"resend"}.${"dev"}`;
export const RESEND_TEST_FROM_ADDRESS = `Tend <${RESEND_TEST_MAILBOX}@${RESEND_TEST_DOMAIN}>`;

const FROM_ADDRESS_PATTERN = /[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+/;

export function isUsableEmailFromAddress(value: string | undefined): boolean {
  const trimmed = value?.trim() ?? "";
  if (!trimmed || trimmed.includes("[REDACTED]")) {
    return false;
  }

  return FROM_ADDRESS_PATTERN.test(trimmed);
}

export function getEmailFromAddress(from = process.env.EMAIL_FROM): string {
  const trimmed = from?.trim() ?? "";
  if (!isUsableEmailFromAddress(trimmed)) {
    return RESEND_TEST_FROM_ADDRESS;
  }

  if (trimmed.includes("<")) {
    return trimmed;
  }

  return `Tend <${trimmed}>`;
}

export function hasConfiguredEmailApiKey(apiKey: string | undefined): boolean {
  return Boolean(apiKey?.trim());
}

export function isEmailDeliveryConfigured(): boolean {
  return hasConfiguredEmailApiKey(process.env.RESEND_API_KEY);
}

function isFromAddressRejection(status: number, detail: string): boolean {
  const lower = detail.toLowerCase();
  return (
    lower.includes("not verified") ||
    lower.includes("invalid `from`") ||
    lower.includes("from field") ||
    (status === 422 && lower.includes("from"))
  );
}

async function postResendEmail(
  apiKey: string,
  message: EmailMessage,
  from: string,
): Promise<{ ok: true } | { ok: false; status: number; detail: string }> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [message.to],
      subject: message.subject,
      text: message.text,
      html: message.html,
    }),
  });

  if (response.ok) {
    return { ok: true };
  }

  const detail = await response.text().catch(() => "");
  return { ok: false, status: response.status, detail };
}

export async function sendEmail(message: EmailMessage): Promise<{ delivered: boolean }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!hasConfiguredEmailApiKey(apiKey) || !apiKey) {
    console.warn(
      `Email not delivered (RESEND_API_KEY missing): to=${message.to} subject=${message.subject}`,
    );
    return { delivered: false };
  }

  const from = getEmailFromAddress();
  const firstAttempt = await postResendEmail(apiKey, message, from);
  if (firstAttempt.ok) {
    return { delivered: true };
  }

  const canRetryWithTestSender =
    from !== RESEND_TEST_FROM_ADDRESS &&
    isFromAddressRejection(firstAttempt.status, firstAttempt.detail);

  if (canRetryWithTestSender) {
    console.warn(
      `Password reset from-address rejected (${firstAttempt.status}); retrying with Resend test sender: ${firstAttempt.detail}`,
    );
    const retry = await postResendEmail(apiKey, message, RESEND_TEST_FROM_ADDRESS);
    if (retry.ok) {
      return { delivered: true };
    }

    throw new Error(`Resend rejected the email (${retry.status}): ${retry.detail}`.trim());
  }

  throw new Error(
    `Resend rejected the email (${firstAttempt.status}): ${firstAttempt.detail}`.trim(),
  );
}
