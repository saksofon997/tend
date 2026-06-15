import { checkHealth } from "@/lib/health";
import { NextResponse } from "next/server";

export async function GET() {
  const result = await checkHealth(process.env.DATABASE_URL);
  return NextResponse.json(result.body, { status: result.status });
}
