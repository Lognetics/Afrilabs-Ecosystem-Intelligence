import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.partnership.findMany({ include: { partner: true }, orderBy: { updatedAt: "desc" } });
  return NextResponse.json({ count: items.length, items });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.partnerId || !body?.title) return NextResponse.json({ error: "partnerId and title required" }, { status: 400 });
  const p = await prisma.partnership.create({
    data: {
      partnerId: body.partnerId, title: body.title,
      stage: body.stage ?? "PROSPECT", value: body.value ?? null, source: body.source ?? null,
    },
  });
  return NextResponse.json(p, { status: 201 });
}
