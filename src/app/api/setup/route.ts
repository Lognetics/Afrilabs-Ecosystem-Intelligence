import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runSeed } from "@/lib/seed";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// One-time post-deploy setup. Call once after first Vercel deploy:
//   curl -X POST -H "Authorization: Bearer $AFRICONNECT_API_KEY" \
//     https://<your-app>.vercel.app/api/setup
//
// Idempotent — re-running wipes seed data and re-creates it.
export async function POST(req: NextRequest) {
  const expected = process.env.AFRICONNECT_API_KEY;
  if (!expected) return NextResponse.json({ error: "AFRICONNECT_API_KEY not configured" }, { status: 500 });

  const header = req.headers.get("authorization") || "";
  const token = header.replace(/^Bearer\s+/i, "");
  if (token !== expected) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const stats = await runSeed(prisma);
    return NextResponse.json({
      ok: true,
      stats,
      login: { email: "admin@afrilabs.test", password: "admin1234" },
      next: "Sign in at /login with the credentials above.",
    });
  } catch (e: any) {
    return NextResponse.json({ error: "Seed failed", message: e?.message ?? String(e) }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    info: "POST to this endpoint with Authorization: Bearer <AFRICONNECT_API_KEY> to seed the database.",
  });
}
