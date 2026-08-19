export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export function getEmailFromAddress(): string {
  return process.env.EMAIL_FROM?.trim() || "Tend <noreply@app.tend.qzz.io>";
}

export function hasConfiguredEmailApiKey(apiKey: string | undefined): boolean {
  return Boolean(apiKey?.trim());
}

export function isEmailDeliveryConfigured(): boolean {
  return hasConfiguredEmailApiKey(process.env.RESEND_API_KEY);
}

export async function sendEmail(message: EmailMessage): Promise<{ delivered: boolean }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!hasConfiguredEmailApiKey(apiKey)) {
    console.warn(
      `Email not delivered (RESEND_API_KEY missing): to=${message.to} subject=${message.subject}`,
    );
    return { delivered: false };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getEmailFromAddress(),
      to: [message.to],
      subject: message.subject,
      text: message.text,
      html: message.html,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Resend rejected the email (${response.status}): ${detail}`.trim());
  }

  return { delivered: true };
}
