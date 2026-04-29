import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.program.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ count: items.length, items });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.name || !body?.code) return NextResponse.json({ error: "name and code required" }, { status: 400 });
  const p = await prisma.program.create({
    data: {
      name: body.name, code: String(body.code).toUpperCase(),
      type: body.type ?? "INITIATIVE", status: body.status ?? "DRAFT",
      region: body.region ?? null, budget: body.budget ?? null, description: body.description ?? null,
    },
  });
  return NextResponse.json(p, { status: 201 });
}
