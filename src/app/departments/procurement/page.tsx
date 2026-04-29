import { Shell } from "@/components/layout/Shell";
import { PageHeader } from "@/components/ui/Empty";
import { Card, CardBody, CardHeader, StatCard } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Field, Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function addBooking(formData: FormData) {
  "use server";
  const type = String(formData.get("type") || "HOTEL");
  const vendor = String(formData.get("vendor") || "") || null;
  const reference = String(formData.get("reference") || "") || null;
  const cost = formData.get("cost") ? Number(formData.get("cost")) : null;
  const status = String(formData.get("status") || "REQUESTED");
  const startDate = formData.get("startDate") ? new Date(String(formData.get("startDate"))) : null;
  await prisma.booking.create({ data: { type, vendor, reference, cost, status, startDate } });
  revalidatePath("/departments/procurement");
}

export default async function ProcurementPage() {
  const bookings = await prisma.booking.findMany({ orderBy: { createdAt: "desc" } });
  const totals = {
    spend: bookings.reduce((a,b) => a + (b.cost ?? 0), 0),
    confirmed: bookings.filter(b=>b.status==="CONFIRMED").length,
    requested: bookings.filter(b=>b.status==="REQUESTED").length,
  };
  return (
    <Shell>
      <PageHeader title="Procurement & Operations" subtitle="Bookings, vendors and logistics." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total spend" value={formatCurrency(totals.spend)} accent="blue" />
        <StatCard label="Confirmed" value={totals.confirmed} accent="green" />
        <StatCard label="Requested" value={totals.requested} accent="orange" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Bookings" />
          <table className="table-base">
            <thead><tr><th>Type</th><th>Vendor</th><th>Reference</th><th>Cost</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id}>
                  <td><Badge tone="blue">{b.type}</Badge></td>
                  <td>{b.vendor ?? "—"}</td>
                  <td className="font-mono text-xs">{b.reference ?? "—"}</td>
                  <td>{b.cost ? formatCurrency(b.cost, b.currency) : "—"}</td>
                  <td><Badge tone={b.status==="CONFIRMED"?"green":b.status==="CANCELLED"?"red":"yellow"}>{b.status}</Badge></td>
                  <td>{formatDate(b.startDate)}</td>
                </tr>
              ))}
              {bookings.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-gray-500">No bookings yet.</td></tr>}
            </tbody>
          </table>
        </Card>
        <Card>
          <CardHeader title="New booking" />
          <form action={addBooking}>
            <CardBody className="space-y-3">
              <Field label="Type">
                <Select name="type" defaultValue="HOTEL">
                  {["HOTEL","FLIGHT","VENUE","TRANSPORT"].map(t=><option key={t}>{t}</option>)}
                </Select>
              </Field>
              <Field label="Vendor"><Input name="vendor" placeholder="e.g. Radisson Blu" /></Field>
              <Field label="Reference"><Input name="reference" placeholder="PNR / confirmation #" /></Field>
              <Field label="Cost (USD)"><Input type="number" name="cost" /></Field>
              <Field label="Status">
                <Select name="status" defaultValue="REQUESTED">
                  {["REQUESTED","CONFIRMED","CANCELLED"].map(s=><option key={s}>{s}</option>)}
                </Select>
              </Field>
              <Field label="Date"><Input type="date" name="startDate" /></Field>
            </CardBody>
            <div className="flex justify-end border-t border-gray-100 px-5 py-3"><Button type="submit">Add</Button></div>
          </form>
        </Card>
      </div>
    </Shell>
  );
}
