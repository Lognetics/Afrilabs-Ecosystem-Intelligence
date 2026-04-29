import { Shell } from "@/components/layout/Shell";
import { PageHeader } from "@/components/ui/Empty";
import { Card, CardHeader, StatCard } from "@/components/ui/Card";
import { StageBadge } from "@/components/ui/Badge";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STAGES = ["PROSPECT","ENGAGED","NEGOTIATION","ACTIVE","DORMANT"] as const;

export default async function PartnershipsDeptPage() {
  const grouped = await Promise.all(
    STAGES.map(async (s) => ({
      stage: s,
      items: await prisma.partnership.findMany({ where: { stage: s }, include: { partner: true }, take: 6, orderBy: { updatedAt: "desc" } }),
      count: await prisma.partnership.count({ where: { stage: s } }),
      value: (await prisma.partnership.aggregate({ _sum: { value: true }, where: { stage: s } }))._sum.value ?? 0,
    }))
  );
  const totalActive = grouped.find(g=>g.stage==="ACTIVE")?.count ?? 0;
  const totalNeg = grouped.find(g=>g.stage==="NEGOTIATION")?.value ?? 0;

  return (
    <Shell>
      <PageHeader
        title="Partnerships Department"
        subtitle="Source and activate investor, donor, corporate and government relationships."
        action={<Link href="/partnerships/new" className="btn-primary">+ New partnership</Link>}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Active partnerships" value={totalActive} accent="green" />
        <StatCard label="In negotiation (value)" value={formatCurrency(totalNeg)} accent="orange" />
        <StatCard label="Total partnerships" value={grouped.reduce((a,b)=>a+b.count,0)} accent="blue" />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        {grouped.map((g) => (
          <Card key={g.stage}>
            <div className="border-b border-gray-100 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{g.stage.replace(/_/g," ")}</p>
              <p className="text-2xl font-bold text-gray-900">{g.count}</p>
              <p className="text-xs text-gray-500">{formatCurrency(g.value)}</p>
            </div>
            <ul className="divide-y divide-gray-100">
              {g.items.map((it) => (
                <li key={it.id} className="px-4 py-2.5 text-sm hover:bg-gray-50">
                  <Link href={`/partnerships/${it.id}`} className="block">
                    <p className="line-clamp-1 font-medium text-gray-800">{it.partner.name}</p>
                    <p className="line-clamp-1 text-xs text-gray-500">{it.title}</p>
                  </Link>
                </li>
              ))}
              {g.items.length === 0 && <li className="px-4 py-3 text-xs text-gray-400">—</li>}
            </ul>
          </Card>
        ))}
      </div>
    </Shell>
  );
}
