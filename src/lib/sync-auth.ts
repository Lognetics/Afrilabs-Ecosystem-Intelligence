import { NextRequest, NextResponse } from "next/server";

export function requireSyncAuth(req: NextRequest) {
  const expected = process.env.AFRICONNECT_API_KEY;
  if (!expected) return NextResponse.json({ error: "Sync key not configured" }, { status: 500 });
  const header = req.headers.get("authorization") || "";
  const token = header.replace(/^Bearer\s+/i, "");
  if (token !== expected) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}
