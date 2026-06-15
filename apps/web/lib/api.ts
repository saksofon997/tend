import { NextResponse } from "next/server";

export function jsonError(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export function jsonData<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}
