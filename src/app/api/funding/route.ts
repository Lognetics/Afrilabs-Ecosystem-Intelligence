import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.fundingSource.findMany({ include: { partner: true, program: true } });
  return NextResponse.json({ count: items.length, items });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.name || !body?.amount) return NextResponse.json({ error: "name and amount required" }, { status: 400 });
  const f = await prisma.fundingSource.create({
    data: {
      name: body.name, type: body.type ?? "GRANT", amount: Number(body.amount),
      status: body.status ?? "PLEDGED", partnerId: body.partnerId ?? null, programId: body.programId ?? null,
    },
  });
  return NextResponse.json(f, { status: 201 });
}
