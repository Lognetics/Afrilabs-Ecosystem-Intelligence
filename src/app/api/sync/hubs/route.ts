import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSyncAuth } from "@/lib/sync-auth";

export async function GET(req: NextRequest) {
  const denied = requireSyncAuth(req);
  if (denied) return denied;
  const hubs = await prisma.hub.findMany({ select: {
    id: true, name: true, country: true, region: true, city: true, sector: true,
    membershipTier: true, status: true, africonnectId: true, joinedAt: true, updatedAt: true,
  }});
  await prisma.africonnectSyncLog.create({ data: { endpoint: "/sync/hubs", direction: "OUT", status: "OK", recordCount: hubs.length } });
  return NextResponse.json({ count: hubs.length, hubs });
}

interface UpsertHub {
  africonnectId: string;
  name: string; country: string; region: string;
  city?: string; sector?: string; membershipTier?: string; status?: string;
}

export async function POST(req: NextRequest) {
  const denied = requireSyncAuth(req);
  if (denied) return denied;
  let body: { hubs: UpsertHub[] };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (!Array.isArray(body?.hubs)) return NextResponse.json({ error: "Expected { hubs: [...] }" }, { status: 400 });

  let upserted = 0;
  try {
    for (const h of body.hubs) {
      if (!h.africonnectId || !h.name || !h.country || !h.region) continue;
      await prisma.hub.upsert({
        where: { africonnectId: h.africonnectId },
        create: {
          africonnectId: h.africonnectId,
          name: h.name, country: h.country, region: h.region,
          city: h.city ?? null, sector: h.sector ?? null,
          membershipTier: h.membershipTier ?? "STANDARD",
          status: h.status ?? "ACTIVE",
        },
        update: {
          name: h.name, country: h.country, region: h.region,
          city: h.city ?? null, sector: h.sector ?? null,
          membershipTier: h.membershipTier ?? undefined,
          status: h.status ?? undefined,
        },
      });
      upserted++;
    }
    await prisma.africonnectSyncLog.create({ data: { endpoint: "/sync/hubs", direction: "IN", status: "OK", recordCount: upserted } });
    return NextResponse.json({ upserted });
  } catch (e: any) {
    await prisma.africonnectSyncLog.create({ data: { endpoint: "/sync/hubs", direction: "IN", status: "ERROR", recordCount: upserted, errorMsg: e?.message ?? "unknown" } });
    return NextResponse.json({ error: "Sync failed", details: e?.message }, { status: 500 });
  }
}
