import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const region = url.searchParams.get("region");
  const tier = url.searchParams.get("tier");
  const where: any = {};
  if (region) where.region = region;
  if (tier) where.membershipTier = tier;
  const items = await prisma.hub.findMany({ where, orderBy: { name: "asc" } });
  return NextResponse.json({ count: items.length, items });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.name || !body?.country || !body?.region) return NextResponse.json({ error: "name, country and region required" }, { status: 400 });
  const h = await prisma.hub.create({
    data: {
      name: body.name, country: body.country, region: body.region,
      sector: body.sector ?? null, membershipTier: body.membershipTier ?? "STANDARD",
    },
  });
  return NextResponse.json(h, { status: 201 });
}
