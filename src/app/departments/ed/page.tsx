import { Shell } from "@/components/layout/Shell";
import { Card, CardBody, CardHeader, StatCard } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/Empty";
import { prisma } from "@/lib/prisma";
import { REGIONS, formatCurrency, formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EDPage() {
  const [hubs, programs, fundingSum, partners, startups] = await Promise.all([
    prisma.hub.findMany(),
    prisma.program.count({ where: { status: "ACTIVE" } }),
    prisma.fundingSource.aggregate({ _sum: { amount: true } }),
    prisma.partner.count(),
    prisma.startup.count(),
  ]);

  const byRegion = REGIONS.map((r) => ({ region: r, count: hubs.filter(h=>h.region===r).length }));
  const total = hubs.length;

  return (
    <Shell>
      <PageHeader title="Office of the ED" subtitle="Strategic insights and ecosystem growth analytics." />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Hubs across Africa" value={formatNumber(total)} accent="green" />
        <StatCard label="Active programs" value={programs} accent="orange" />
        <StatCard label="Funding mobilized" value={formatCurrency(fundingSum._sum.amount ?? 0)} accent="blue" />
        <StatCard label="Partners + startups" value={formatNumber(partners + startups)} accent="green" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Regional footprint" />
          <CardBody className="space-y-3">
            {byRegion.map((r) => {
              const pct = total ? (r.count / total) * 100 : 0;
              return (
                <div key={r.region}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium text-gray-800">{r.region}</span>
                    <span className="text-gray-500">{r.count} hubs ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100"><div className="h-2 rounded-full bg-brand-500" style={{width:`${pct}%`}}/></div>
                </div>
              );
            })}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Strategic narrative" />
          <CardBody className="space-y-3 text-sm text-gray-700">
            <p>The ecosystem now spans <strong>{total}</strong> hubs across {REGIONS.length} African regions, supported by <strong>{partners}</strong> partner organizations and <strong>{programs}</strong> active programs.</p>
            <p>Total funding mobilized stands at <strong>{formatCurrency(fundingSum._sum.amount ?? 0)}</strong> — see <a href="/funding" className="text-brand-700 underline">funding ledger</a> for the breakdown.</p>
            <p>Use <a href="/intelligence" className="text-brand-700 underline">Decision Intelligence</a> to surface high-priority hubs and partner-program matches.</p>
          </CardBody>
        </Card>
      </div>
    </Shell>
  );
}
