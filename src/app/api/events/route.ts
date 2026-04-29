import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.event.findMany({ orderBy: { startDate: "desc" } });
  return NextResponse.json({ count: items.length, items });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.name || !body?.startDate) return NextResponse.json({ error: "name and startDate required" }, { status: 400 });
  const e = await prisma.event.create({
    data: {
      name: body.name, type: body.type ?? "PROGRAM_EVENT", status: body.status ?? "PLANNING",
      startDate: new Date(body.startDate), location: body.location ?? null, country: body.country ?? null,
      programId: body.programId ?? null,
    },
  });
  return NextResponse.json(e, { status: 201 });
}
