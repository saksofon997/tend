import { jsonData, jsonError } from "@/lib/api";
import { lucia, toAuthUser } from "@/lib/auth/lucia";
import { applySessionCookie } from "@/lib/auth/session";
import { createUser, findUserByEmailAddress } from "@/lib/auth/users";
import { formatZodError, registerSchema } from "@/lib/auth/validation";

export async function POST(request: Request) {
  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return jsonError("Invalid JSON body", 400);
    }

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(formatZodError(parsed.error), 400);
    }

    const existing = await findUserByEmailAddress(parsed.data.email);
    if (existing) {
      return jsonError("An account with this email already exists", 409);
    }

    const user = await createUser(parsed.data);
    const session = await lucia.createSession(user.id, {});
    const response = jsonData({ user: toAuthUser(user) }, 201);
    return applySessionCookie(response, session.id);
  } catch (error) {
    console.error("Register failed:", error);
    return jsonError("Unable to create account", 500);
  }
}
