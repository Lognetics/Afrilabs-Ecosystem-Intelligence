import { NextRequest, NextResponse } from "next/server";
import { execSync } from "node:child_process";
import { prisma } from "@/lib/prisma";
import { runSeed } from "@/lib/seed";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

// One-time post-deploy setup. Call once after first deploy:
//   curl -X POST -H "Authorization: Bearer $AFRICONNECT_API_KEY" \
//     https://<your-app>.onrender.com/api/setup
//
// Tries to push the schema first (in case build-time db push failed),
// then seeds. Idempotent — re-running wipes seed data and re-creates it.
export async function POST(req: NextRequest) {
  const expected = process.env.AFRICONNECT_API_KEY;
  if (!expected) return NextResponse.json({ error: "AFRICONNECT_API_KEY not configured" }, { status: 500 });

  const header = req.headers.get("authorization") || "";
  const token = header.replace(/^Bearer\s+/i, "");
  if (token !== expected) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const log: string[] = [];

  // Try to push schema in case the build-time push didn't run / didn't succeed.
  // This is a no-op if tables already exist.
  try {
    log.push("Attempting prisma db push...");
    execSync("npx prisma db push --accept-data-loss --skip-generate", {
      env: { ...process.env },
      stdio: "pipe",
    });
    log.push("✓ Schema pushed");
  } catch (e: any) {
    log.push(`⚠️  db push skipped: ${e?.message?.slice(0, 200) ?? "unknown"}`);
  }

  try {
    const stats = await runSeed(prisma);
    log.push(`✓ Seeded: ${JSON.stringify(stats)}`);
    return NextResponse.json({
      ok: true,
      stats,
      login: { email: "admin@afrilabs.test", password: "admin1234" },
      next: "Sign in at /login with the credentials above.",
      log,
    });
  } catch (e: any) {
    log.push(`❌ Seed failed: ${e?.message ?? String(e)}`);
    return NextResponse.json({ error: "Seed failed", log }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    info: "POST to this endpoint with Authorization: Bearer <AFRICONNECT_API_KEY> to seed the database.",
  });
}
