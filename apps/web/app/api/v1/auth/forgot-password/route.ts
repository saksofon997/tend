import { jsonData, jsonError } from "@/lib/api";
import { requestPasswordReset } from "@/lib/auth/password-reset";
import { forgotPasswordSchema, formatZodError } from "@/lib/auth/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return jsonError("Invalid JSON body", 400);
    }

    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(formatZodError(parsed.error), 400);
    }

    await requestPasswordReset({
      email: parsed.data.email,
      locale: parsed.data.locale,
    });

    return jsonData({ ok: true });
  } catch (error) {
    console.error("Forgot password failed:", error);
    return jsonError("Unable to send a reset link", 500);
  }
}
