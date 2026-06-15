import { jsonData, jsonError } from "@/lib/api";
import { validateSession } from "@/lib/auth/session";

export async function GET() {
  const { user } = await validateSession();

  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  return jsonData({ user });
}
