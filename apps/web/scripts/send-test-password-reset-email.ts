import { buildPasswordResetEmail } from "../lib/email/password-reset";
import { DEFAULT_EMAIL_FROM_ADDRESS, sendEmail } from "../lib/email/send";

const TEST_TO = process.env.TEST_EMAIL_TO?.trim() || "saksofon997@gmail.com";
const SAMPLE_RESET_URL = "https://app.tend.qzz.io/reset-password?token=preview-not-a-real-token";

if (!process.env.EMAIL_FROM?.trim()) {
  process.env.EMAIL_FROM = DEFAULT_EMAIL_FROM_ADDRESS;
}

async function sendPreview(locale: "en" | "sr") {
  const message = buildPasswordResetEmail({
    to: TEST_TO,
    resetUrl: SAMPLE_RESET_URL,
    locale,
  });
  const result = await sendEmail(message);
  return { locale, subject: message.subject, ...result };
}

const results = [await sendPreview("en"), await sendPreview("sr")];

for (const result of results) {
  console.log(`${result.locale}: delivered=${result.delivered} subject=${result.subject}`);
}

if (results.some((result) => !result.delivered)) {
  process.exit(1);
}
