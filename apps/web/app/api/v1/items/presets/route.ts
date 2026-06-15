import { jsonData } from "@/lib/api";
import { isErrorResponse, requireUser } from "@/lib/auth/require-user";
import { ALL_PRESETS } from "@tend/domain";

export async function GET(request: Request) {
  const userOrError = await requireUser(request);
  if (isErrorResponse(userOrError)) {
    return userOrError;
  }

  return jsonData({ presets: ALL_PRESETS });
}
