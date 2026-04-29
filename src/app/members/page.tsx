import { Shell } from "@/components/layout/Shell";
import { PageHeader } from "@/components/ui/Empty";
import { Card, CardBody, CardHeader, StatCard } from "@/components/ui/Card";
import { Badge, StageBadge } from "@/components/ui/Badge";
import { Field, Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";
import { REGIONS, formatCurrency } from "@/lib/utils";
import { getHubSegments } from "@/lib/segmentation";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function createHub(formData: FormData) {
  "use server";
  const name = String(formData.get("name") || "").trim();
  const country = String(formData.get("country") || "").trim();
  const region = String(formData.get("region") || REGIONS[1]);
  const sector = String(formData.get("sector") || "").trim() || null;
  const tier = String(formData.get("tier") || "STANDARD");
  if (!name || !country) return;
  const h = await prisma.hub.create({ data: { name, country, region, sector, membershipTier: tier } });
  await prisma.activity.create({ data: { type: "HUB_PAID", title: `Hub onboarded: ${name}`, hubId: h.id } });
  revalidatePath("/members");
}

export default async function MembersPage({ searchParams }: { searchParams: { region?: string; tier?: string; status?: string; q?: string } }) {
  const segments = await getHubSegments();
  const { region, tier, status, q } = searchParams;

  const where: any = {};
  if (region) where.region = region;
  if (tier) where.membershipTier = tier;
  if (status) where.status = status;
  if (q) where.name = { contains: q };

  const hubs = await prisma.hub.findMany({
    where, include: { payments: { orderBy: { periodEnd: "desc" }, take: 1 } },
    orderBy: { name: "asc" },
  });

  return (
    <Shell>
      <PageHeader
        title="Member Hubs"
        subtitle="Manage 500+ Afrilabs hubs as paying ecosystem members."
        action={<Link href="/campaigns/new" className="btn-outline">Send campaign</Link>}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total hubs" value={segments.all.length} accent="green" />
        <StatCard label="Paid" value={segments.paid.length} hint="Active subscriptions" accent="green" />
        <StatCard label="Pending" value={segments.pending.length} hint="Awaiting payment" accent="orange" />
        <StatCard label="Expired" value={segments.expired.length} hint="Need renewal" accent="red" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Hubs"
            action={
              <form className="flex gap-2">
                <input name="q" placeholder="Search…" className="input !py-1.5 text-xs" defaultValue={q} />
                <select name="region" defaultValue={region ?? ""} className="input !py-1.5 text-xs">
                  <option value="">All regions</option>
                  {REGIONS.map(r => <option key={r}>{r}</option>)}
                </select>
                <select name="tier" defaultValue={tier ?? ""} className="input !py-1.5 text-xs">
                  <option value="">All tiers</option>
                  {["STANDARD","PREMIUM","STRATEGIC"].map(t=><option key={t}>{t}</option>)}
                </select>
                <select name="status" defaultValue={status ?? ""} className="input !py-1.5 text-xs">
                  <option value="">Any status</option>
                  {["ACTIVE","PENDING","SUSPENDED","CHURNED"].map(s=><option key={s}>{s}</option>)}
                </select>
                <Button variant="outline" type="submit">Filter</Button>
              </form>
            }
          />
          <table className="table-base">
            <thead>
              <tr><th>Hub</th><th>Country</th><th>Region</th><th>Tier</th><th>Status</th><th>Last payment</th><th></th></tr>
            </thead>
            <tbody>
              {hubs.map((h) => {
                const last = h.payments[0];
                return (
                  <tr key={h.id}>
                    <td>
                      <div className="font-medium text-gray-900">{h.name}</div>
                      <div className="text-xs text-gray-500">{h.sector ?? "—"}</div>
                    </td>
                    <td>{h.country}</td>
                    <td className="text-gray-500">{h.region}</td>
                    <td><StageBadge stage={h.membershipTier} /></td>
                    <td><StageBadge stage={h.status} /></td>
                    <td className="text-xs text-gray-500">
                      {last ? <span><Badge tone={last.status === "PAID" ? "green" : last.status === "OVERDUE" ? "red" : "yellow"}>{last.status}</Badge> {formatCurrency(last.amount)}</span> : "—"}
                    </td>
                    <td><Link href={`/members/${h.id}`} className="text-sm font-medium text-brand-700 hover:underline">Open</Link></td>
                  </tr>
                );
              })}
              {hubs.length === 0 && <tr><td colSpan={7} className="py-6 text-center text-gray-500">No hubs match your filters.</td></tr>}
            </tbody>
          </table>
        </Card>

        <Card>
          <CardHeader title="Onboard a hub" subtitle="Add a new member organization." />
          <form action={createHub}>
            <CardBody className="space-y-3">
              <Field label="Hub name"><Input name="name" required placeholder="iSpace" /></Field>
              <Field label="Country"><Input name="country" required placeholder="Ghana" /></Field>
              <Field label="Region">
                <Select name="region" defaultValue="West Africa">
                  {REGIONS.map(r => <option key={r}>{r}</option>)}
                </Select>
              </Field>
              <Field label="Sector"><Input name="sector" placeholder="Tech / Agritech / Fintech" /></Field>
              <Field label="Membership tier">
                <Select name="tier" defaultValue="STANDARD">
                  {["STANDARD","PREMIUM","STRATEGIC"].map(t=><option key={t}>{t}</option>)}
                </Select>
              </Field>
            </CardBody>
            <div className="flex justify-end border-t border-gray-100 px-5 py-3">
              <Button type="submit">Onboard hub</Button>
            </div>
          </form>
        </Card>
      </div>
    </Shell>
  );
}
