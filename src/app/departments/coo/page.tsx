import { Shell } from "@/components/layout/Shell";
import { Card, CardBody, CardHeader, StatCard } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/Empty";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function COOPage() {
  const [hubs, partnerships, programs, funding, events, paid, activeProg, sponsorPartners] = await Promise.all([
    prisma.hub.count(),
    prisma.partnership.count(),
    prisma.program.count(),
    prisma.fundingSource.aggregate({ _sum: { amount: true } }),
    prisma.event.count(),
    prisma.hub.count({ where: { payments: { some: { status: "PAID" } } } }),
    prisma.program.count({ where: { status: "ACTIVE" } }),
    prisma.partnership.count({ where: { stage: "ACTIVE" } }),
  ]);

  return (
    <Shell>
      <PageHeader title="Office of COO" subtitle="A live, system-wide view of operations." />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Hubs" value={formatNumber(hubs)} hint={`${paid} paying`} accent="green" />
        <StatCard label="Partnerships" value={partnerships} hint={`${sponsorPartners} active`} accent="orange" />
        <StatCard label="Programs" value={programs} hint={`${activeProg} active`} accent="blue" />
        <StatCard label="Funding" value={formatCurrency(funding._sum.amount ?? 0)} accent="green" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Operational health" />
          <CardBody className="space-y-3 text-sm">
            <Row label="Member retention (paid / total)" value={`${hubs ? Math.round(paid/hubs*100) : 0}%`} />
            <Row label="Active program ratio" value={`${programs ? Math.round(activeProg/programs*100) : 0}%`} />
            <Row label="Active partnerships" value={`${sponsorPartners}`} />
            <Row label="Events tracked" value={`${events}`} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="What needs attention" />
          <CardBody className="space-y-3 text-sm">
            <Note tone="amber">Hubs without recent payment may be expiring — see <a href="/intelligence" className="text-brand-700 underline">Intelligence → Churn risk</a>.</Note>
            <Note tone="green">Partnerships in NEGOTIATION should be reviewed weekly — open <a href="/partnerships?stage=NEGOTIATION" className="text-brand-700 underline">pipeline</a>.</Note>
            <Note tone="blue">Programs with low partner count are candidates for sourcing — see <a href="/intelligence" className="text-brand-700 underline">Intelligence → Suggested matches</a>.</Note>
          </CardBody>
        </Card>
      </div>
    </Shell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-b-0 last:pb-0">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}
function Note({ tone, children }: { tone: "amber"|"green"|"blue"; children: React.ReactNode }) {
  const cls = tone === "amber" ? "border-amber-100 bg-amber-50 text-amber-800"
    : tone === "green" ? "border-emerald-100 bg-emerald-50 text-emerald-800"
    : "border-blue-100 bg-blue-50 text-blue-800";
  return <div className={`rounded-md border p-3 text-sm ${cls}`}>{children}</div>;
}
