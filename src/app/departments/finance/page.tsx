import { Shell } from "@/components/layout/Shell";
import { PageHeader } from "@/components/ui/Empty";
import { Card, CardBody, CardHeader, StatCard } from "@/components/ui/Card";
import { StageBadge } from "@/components/ui/Badge";
import { prisma } from "@/lib/prisma";
import { formatCurrency, relativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function FinancePage() {
  const [funding, payments, bookings] = await Promise.all([
    prisma.fundingSource.findMany({ include: { partner: true, program: true }, orderBy: { createdAt: "desc" } }),
    prisma.hubPayment.findMany({ include: { hub: true }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.booking.aggregate({ _sum: { cost: true } }),
  ]);
  const totals = {
    inflows:    funding.filter(f=>f.status==="DISBURSED" || f.status==="COMPLETED").reduce((a,b)=>a+b.amount,0),
    pledged:    funding.filter(f=>f.status==="PLEDGED" || f.status==="APPROVED").reduce((a,b)=>a+b.amount,0),
    membership: payments.filter(p=>p.status==="PAID").reduce((a,b)=>a+b.amount,0),
    spend:      bookings._sum.cost ?? 0,
  };
  return (
    <Shell>
      <PageHeader title="Finance" subtitle="Inflows, membership revenue and procurement spend." />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Cash inflows" value={formatCurrency(totals.inflows)} accent="green" />
        <StatCard label="Pledged / approved" value={formatCurrency(totals.pledged)} accent="orange" />
        <StatCard label="Membership revenue" value={formatCurrency(totals.membership)} accent="blue" />
        <StatCard label="Procurement spend" value={formatCurrency(totals.spend)} accent="red" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Funding sources" />
          <table className="table-base">
            <thead><tr><th>Source</th><th>Type</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              {funding.map(f => (
                <tr key={f.id}>
                  <td className="font-medium">{f.name}</td>
                  <td>{f.type}</td>
                  <td className="font-mono">{formatCurrency(f.amount)}</td>
                  <td><StageBadge stage={f.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card>
          <CardHeader title="Recent membership payments" />
          <table className="table-base">
            <thead><tr><th>Hub</th><th>Amount</th><th>Status</th><th>When</th></tr></thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id}>
                  <td className="font-medium">{p.hub.name}</td>
                  <td>{formatCurrency(p.amount)}</td>
                  <td><StageBadge stage={p.status} /></td>
                  <td className="text-xs">{relativeTime(p.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </Shell>
  );
}
