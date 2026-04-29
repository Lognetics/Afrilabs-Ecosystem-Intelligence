import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSyncAuth } from "@/lib/sync-auth";

export async function GET(req: NextRequest) {
  const denied = requireSyncAuth(req);
  if (denied) return denied;
  const programs = await prisma.program.findMany({
    where: { status: { in: ["ACTIVE", "DRAFT"] } },
    select: {
      id: true, code: true, name: true, type: true, status: true, region: true,
      startDate: true, endDate: true,
      hubs: { select: { hub: { select: { id: true, name: true, africonnectId: true } } } },
    },
  });
  await prisma.africonnectSyncLog.create({ data: { endpoint: "/sync/programs", direction: "OUT", status: "OK", recordCount: programs.length } });
  return NextResponse.json({ count: programs.length, programs });
}
