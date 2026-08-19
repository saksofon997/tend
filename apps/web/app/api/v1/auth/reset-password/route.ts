import { jsonData, jsonError } from "@/lib/api";
import { resetPasswordWithToken } from "@/lib/auth/password-reset";
import { formatZodError, resetPasswordSchema } from "@/lib/auth/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return jsonError("Invalid JSON body", 400);
    }

    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(formatZodError(parsed.error), 400);
    }

    const result = await resetPasswordWithToken({
      token: parsed.data.token,
      password: parsed.data.password,
    });

    if ("error" in result) {
      return jsonError("This reset link is invalid or has expired", 400);
    }

    return jsonData({ ok: true });
  } catch (error) {
    console.error("Reset password failed:", error);
    return jsonError("Unable to update password", 500);
  }
}
