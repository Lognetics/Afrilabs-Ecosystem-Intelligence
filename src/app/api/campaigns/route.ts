import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.campaign.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ count: items.length, items });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.name || !body?.body) return NextResponse.json({ error: "name and body required" }, { status: 400 });
  const c = await prisma.campaign.create({
    data: {
      name: body.name, body: body.body, channel: body.channel ?? "EMAIL",
      audience: body.audience ?? "ALL_HUBS", status: body.status ?? "DRAFT",
      subject: body.subject ?? null, recipients: body.recipients ?? 0,
    },
  });
  return NextResponse.json(c, { status: 201 });
}
