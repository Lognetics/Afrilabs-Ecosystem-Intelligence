import { Shell } from "@/components/layout/Shell";
import { Card, CardBody, CardHeader, StatCard } from "@/components/ui/Card";
import { StageBadge } from "@/components/ui/Badge";
import { Field, Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, relativeTime } from "@/lib/utils";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function recordPayment(formData: FormData) {
  "use server";
  const hubId = String(formData.get("hubId"));
  const amount = Number(formData.get("amount") || 0);
  const status = String(formData.get("status") || "PAID");
  const periodMonths = Number(formData.get("months") || 12);
  const start = new Date();
  const end = new Date(start);
  end.setMonth(end.getMonth() + periodMonths);
  await prisma.hubPayment.create({
    data: {
      hubId, amount, status,
      periodStart: start, periodEnd: end,
      paidAt: status === "PAID" ? new Date() : null,
    },
  });
  await prisma.activity.create({ data: { type: "HUB_PAID", title: `Payment ${status}: ${formatCurrency(amount)}`, hubId } });
  revalidatePath(`/members/${hubId}`);
}

export default async function HubDetail({ params }: { params: { id: string } }) {
  const hub = await prisma.hub.findUnique({
    where: { id: params.id },
    include: {
      payments: { orderBy: { periodStart: "desc" } },
      programs: { include: { program: true } },
      events: { include: { event: true } },
      activities: { orderBy: { createdAt: "desc" }, take: 12 },
    },
  });
  if (!hub) notFound();

  const totalPaid = hub.payments.filter(p=>p.status==="PAID").reduce((a,b)=>a+b.amount,0);
  const overdue  = hub.payments.filter(p=>p.status==="OVERDUE").length;

  return (
    <Shell>
      <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/members" className="hover:text-gray-900">Member Hubs</Link>
        <span>/</span><span className="text-gray-900">{hub.name}</span>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{hub.name}</h1>
          <p className="mt-1 text-sm text-gray-500">{hub.city ? `${hub.city}, ${hub.country}` : hub.country} · {hub.region}</p>
        </div>
        <div className="flex items-center gap-2">
          <StageBadge stage={hub.membershipTier} />
          <StageBadge stage={hub.status} />
          <span className="text-sm text-gray-600">Engagement {hub.engagementScore}/100</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total paid" value={formatCurrency(totalPaid)} accent="green" />
        <StatCard label="Payments" value={hub.payments.length} accent="blue" />
        <StatCard label="Overdue" value={overdue} accent={overdue ? "red" : "gray"} />
        <StatCard label="Programs" value={hub.programs.length} accent="orange" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Payment history" />
          <table className="table-base">
            <thead><tr><th>Period</th><th>Amount</th><th>Status</th><th>Paid on</th><th>Reference</th></tr></thead>
            <tbody>
              {hub.payments.map((p) => (
                <tr key={p.id}>
                  <td>{formatDate(p.periodStart)} → {formatDate(p.periodEnd)}</td>
                  <td className="font-mono">{formatCurrency(p.amount, p.currency)}</td>
                  <td><StageBadge stage={p.status} /></td>
                  <td>{formatDate(p.paidAt)}</td>
                  <td className="text-xs text-gray-500">{p.reference ?? "—"}</td>
                </tr>
              ))}
              {hub.payments.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-gray-500">No payments yet.</td></tr>}
            </tbody>
          </table>
        </Card>

        <Card>
          <CardHeader title="Record a payment" />
          <form action={recordPayment}>
            <CardBody className="space-y-3">
              <input type="hidden" name="hubId" value={hub.id} />
              <Field label="Amount (USD)"><Input type="number" name="amount" min="0" step="50" required /></Field>
              <Field label="Status">
                <Select name="status" defaultValue="PAID">
                  {["PAID","PENDING","OVERDUE","EXPIRED","REFUNDED"].map(s=><option key={s}>{s}</option>)}
                </Select>
              </Field>
              <Field label="Period (months)">
                <Select name="months" defaultValue="12">
                  {[1,3,6,12,24].map(m=><option key={m}>{m}</option>)}
                </Select>
              </Field>
            </CardBody>
            <div className="flex justify-end border-t border-gray-100 px-5 py-3">
              <Button type="submit">Save payment</Button>
            </div>
          </form>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Programs" />
          <table className="table-base">
            <thead><tr><th>Program</th><th>Role</th><th>Status</th></tr></thead>
            <tbody>
              {hub.programs.map((l) => (
                <tr key={l.id}>
                  <td><Link href={`/programs/${l.program.id}`} className="font-medium text-brand-700 hover:underline">{l.program.code}</Link></td>
                  <td>{l.role ?? "—"}</td>
                  <td><StageBadge stage={l.program.status} /></td>
                </tr>
              ))}
              {hub.programs.length === 0 && <tr><td colSpan={3} className="py-6 text-center text-gray-500">No program participation.</td></tr>}
            </tbody>
          </table>
        </Card>

        <Card>
          <CardHeader title="Activity" />
          <CardBody className="space-y-3">
            {hub.activities.map((a) => (
              <div key={a.id} className="text-sm">
                <p className="font-medium text-gray-800">{a.title}</p>
                <p className="text-xs text-gray-500">{relativeTime(a.createdAt)}</p>
              </div>
            ))}
            {hub.activities.length === 0 && <p className="text-sm text-gray-500">No activity yet.</p>}
          </CardBody>
        </Card>
      </div>
    </Shell>
  );
}
