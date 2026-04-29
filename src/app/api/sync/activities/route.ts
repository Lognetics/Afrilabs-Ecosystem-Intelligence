import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSyncAuth } from "@/lib/sync-auth";

export async function GET(req: NextRequest) {
  const denied = requireSyncAuth(req);
  if (denied) return denied;
  const url = new URL(req.url);
  const since = url.searchParams.get("since");
  const limit = Math.min(500, Number(url.searchParams.get("limit") ?? 100));
  const where = since ? { createdAt: { gt: new Date(since) } } : {};
  const activities = await prisma.activity.findMany({
    where, orderBy: { createdAt: "desc" }, take: limit,
    select: { id: true, type: true, title: true, body: true, createdAt: true,
      partnershipId: true, programId: true, eventId: true, hubId: true },
  });
  await prisma.africonnectSyncLog.create({ data: { endpoint: "/sync/activities", direction: "OUT", status: "OK", recordCount: activities.length } });
  return NextResponse.json({ count: activities.length, activities });
}
