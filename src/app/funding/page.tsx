import { Shell } from "@/components/layout/Shell";
import { Card, CardBody, CardHeader, StatCard } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/Empty";
import { StageBadge } from "@/components/ui/Badge";
import { Field, Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function create(formData: FormData) {
  "use server";
  const name = String(formData.get("name") || "").trim();
  const type = String(formData.get("type") || "GRANT");
  const amount = Number(formData.get("amount") || 0);
  const partnerId = String(formData.get("partnerId") || "") || null;
  const programId = String(formData.get("programId") || "") || null;
  const status = String(formData.get("status") || "PLEDGED");
  if (!name || !amount) return;
  const f = await prisma.fundingSource.create({ data: { name, type, amount, status, partnerId, programId } });
  await prisma.activity.create({
    data: { type: "FUNDING_PLEDGED", title: `${type} pledged: ${name}`, body: `${amount}`, programId },
  });
  revalidatePath("/funding");
}

export default async function FundingPage() {
  const [sources, partners, programs] = await Promise.all([
    prisma.fundingSource.findMany({ include: { partner: true, program: true }, orderBy: { createdAt: "desc" } }),
    prisma.partner.findMany({ orderBy: { name: "asc" } }),
    prisma.program.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totals = {
    pledged:   sources.filter(s => s.status === "PLEDGED").reduce((a,b)=>a+b.amount, 0),
    approved:  sources.filter(s => s.status === "APPROVED").reduce((a,b)=>a+b.amount, 0),
    disbursed: sources.filter(s => s.status === "DISBURSED").reduce((a,b)=>a+b.amount, 0),
    completed: sources.filter(s => s.status === "COMPLETED").reduce((a,b)=>a+b.amount, 0),
  };
  const total = sources.reduce((a,b)=>a+b.amount,0);

  // by region (via program region)
  const byRegion: Record<string, number> = {};
  for (const s of sources) {
    const r = s.program?.region ?? "Pan-African";
    byRegion[r] = (byRegion[r] ?? 0) + s.amount;
  }

  return (
    <Shell>
      <PageHeader title="Funding & Grants" subtitle="Investments, grants and sponsorships across the ecosystem." />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Pledged"   value={formatCurrency(totals.pledged)} accent="orange" />
        <StatCard label="Approved"  value={formatCurrency(totals.approved)} accent="blue" />
        <StatCard label="Disbursed" value={formatCurrency(totals.disbursed)} accent="green" />
        <StatCard label="Total"     value={formatCurrency(total)} hint={`${sources.length} sources`} accent="green" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Funding ledger" />
          <table className="table-base">
            <thead><tr><th>Source</th><th>Type</th><th>Partner</th><th>Program</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              {sources.map((s) => (
                <tr key={s.id}>
                  <td className="font-medium">{s.name}</td>
                  <td>{s.type}</td>
                  <td className="text-gray-600">{s.partner?.name ?? "—"}</td>
                  <td className="text-gray-600">{s.program?.code ?? "—"}</td>
                  <td className="font-mono">{formatCurrency(s.amount, s.currency)}</td>
                  <td><StageBadge stage={s.status} /></td>
                </tr>
              ))}
              {sources.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-gray-500">No funding records yet.</td></tr>}
            </tbody>
          </table>
        </Card>

        <Card>
          <CardHeader title="Add funding" />
          <form action={create}>
            <CardBody className="space-y-3">
              <Field label="Name"><Input name="name" required placeholder="e.g. Mastercard Foundation grant" /></Field>
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Type">
                  <Select name="type" defaultValue="GRANT">
                    {["GRANT","INVESTMENT","SPONSORSHIP"].map(t=><option key={t}>{t}</option>)}
                  </Select>
                </Field>
                <Field label="Status">
                  <Select name="status" defaultValue="PLEDGED">
                    {["PLEDGED","APPROVED","DISBURSED","COMPLETED"].map(t=><option key={t}>{t}</option>)}
                  </Select>
                </Field>
              </div>
              <Field label="Amount (USD)"><Input type="number" name="amount" min="0" step="1000" required /></Field>
              <Field label="Partner">
                <Select name="partnerId" defaultValue="">
                  <option value="">— None —</option>
                  {partners.map((p)=><option key={p.id} value={p.id}>{p.name}</option>)}
                </Select>
              </Field>
              <Field label="Program">
                <Select name="programId" defaultValue="">
                  <option value="">— None —</option>
                  {programs.map((p)=><option key={p.id} value={p.id}>{p.code} · {p.name}</option>)}
                </Select>
              </Field>
            </CardBody>
            <div className="flex justify-end border-t border-gray-100 px-5 py-3">
              <Button type="submit">Add funding</Button>
            </div>
          </form>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader title="Funding by region" />
          <CardBody>
            <div className="space-y-3">
              {Object.entries(byRegion).sort((a,b)=>b[1]-a[1]).map(([r, v]) => {
                const pct = total > 0 ? (v/total)*100 : 0;
                return (
                  <div key={r}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-medium text-gray-800">{r}</span>
                      <span className="text-gray-600">{formatCurrency(v)} <span className="text-gray-400">({pct.toFixed(0)}%)</span></span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100">
                      <div className="h-2 rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
              {Object.keys(byRegion).length === 0 && <p className="text-sm text-gray-500">No regional data yet.</p>}
            </div>
          </CardBody>
        </Card>
      </div>
    </Shell>
  );
}
