import { jsonData, jsonError } from "@/lib/api";
import { isEmailAllowed } from "@/lib/auth/allowed-emails";
import { lucia, toAuthUser } from "@/lib/auth/lucia";
import { verifyPassword } from "@/lib/auth/password";
import { applySessionCookie } from "@/lib/auth/session";
import { findUserByEmailAddress } from "@/lib/auth/users";
import { formatZodError, loginSchema } from "@/lib/auth/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return jsonError("Invalid JSON body", 400);
    }

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(formatZodError(parsed.error), 400);
    }

    if (!isEmailAllowed(parsed.data.email)) {
      return jsonError("Invalid email or password", 401);
    }

    const user = await findUserByEmailAddress(parsed.data.email);
    if (!user) {
      return jsonError("Invalid email or password", 401);
    }

    const validPassword = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!validPassword) {
      return jsonError("Invalid email or password", 401);
    }

    const session = await lucia.createSession(user.id, {});
    const response = jsonData({
      user: toAuthUser({
        id: user.id,
        displayName: user.displayName,
        email: user.email,
      }),
    });
    return applySessionCookie(response, session.id);
  } catch (error) {
    console.error("Login failed:", error);
    return jsonError("Unable to sign in", 500);
  }
}
