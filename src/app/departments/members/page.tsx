import { Shell } from "@/components/layout/Shell";
import { PageHeader } from "@/components/ui/Empty";
import { Card, CardHeader, StatCard } from "@/components/ui/Card";
import { StageBadge } from "@/components/ui/Badge";
import { prisma } from "@/lib/prisma";
import { getHubSegments } from "@/lib/segmentation";
import { formatCurrency, REGIONS } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function MembersDeptPage() {
  const seg = await getHubSegments();
  const overdue = await prisma.hubPayment.count({ where: { status: "OVERDUE" } });
  const renewSoon = await prisma.hub.findMany({
    where: { payments: { some: { status: "PAID", periodEnd: { lt: new Date(Date.now()+1000*60*60*24*60) } } } },
    take: 8,
  });
  const byRegion = REGIONS.map(r => ({ r, n: seg.all.filter(h=>h.region===r).length }));

  return (
    <Shell>
      <PageHeader title="Member Services" subtitle="Hub onboarding, payments, segmentation and outreach." />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total hubs" value={seg.all.length} accent="green" />
        <StatCard label="Paid" value={seg.paid.length} accent="green" />
        <StatCard label="Pending" value={seg.pending.length} accent="orange" />
        <StatCard label="Overdue" value={overdue} accent={overdue ? "red" : "gray"} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Renewals coming up (60 days)" />
          <table className="table-base">
            <thead><tr><th>Hub</th><th>Region</th><th>Tier</th></tr></thead>
            <tbody>
              {renewSoon.map(h => (
                <tr key={h.id}>
                  <td><Link href={`/members/${h.id}`} className="font-medium text-brand-700 hover:underline">{h.name}</Link></td>
                  <td>{h.region}</td>
                  <td><StageBadge stage={h.membershipTier} /></td>
                </tr>
              ))}
              {renewSoon.length === 0 && <tr><td colSpan={3} className="py-6 text-center text-gray-500">Nothing renewing in 60 days.</td></tr>}
            </tbody>
          </table>
        </Card>
        <Card>
          <CardHeader title="Coverage by region" />
          <div className="p-5 space-y-3">
            {byRegion.map(({r,n}) => {
              const pct = seg.all.length ? (n/seg.all.length)*100 : 0;
              return (
                <div key={r}>
                  <div className="mb-1 flex justify-between text-sm"><span>{r}</span><span className="text-gray-500">{n}</span></div>
                  <div className="h-2 rounded-full bg-gray-100"><div className="h-2 rounded-full bg-accent-500" style={{width:`${pct}%`}}/></div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </Shell>
  );
}
