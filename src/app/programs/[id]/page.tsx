import { Shell } from "@/components/layout/Shell";
import { Card, CardBody, CardHeader, StatCard } from "@/components/ui/Card";
import { StageBadge } from "@/components/ui/Badge";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, relativeTime } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";
import { suggestPartnerProgramMatches } from "@/lib/intelligence";

export const dynamic = "force-dynamic";

export default async function ProgramDetail({ params }: { params: { id: string } }) {
  const p = await prisma.program.findUnique({
    where: { id: params.id },
    include: {
      lead: true,
      partners: { include: { partnership: { include: { partner: true } } } },
      fundingSources: { include: { partner: true } },
      events: true,
      startups: { include: { startup: true } },
      hubs: { include: { hub: true } },
      activities: { orderBy: { createdAt: "desc" }, take: 15 },
      metrics: { orderBy: { recordedAt: "desc" } },
    },
  });
  if (!p) notFound();

  const totalFunding = p.fundingSources.reduce((s, f) => s + f.amount, 0);
  const matches = (await suggestPartnerProgramMatches(50)).filter((m) => m.programId === p.id).slice(0, 5);

  return (
    <Shell>
      <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/programs" className="hover:text-gray-900">Programs</Link>
        <span>/</span><span className="font-mono">{p.code}</span>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{p.name}</h1>
          <p className="mt-1 text-sm text-gray-500">{p.description ?? "—"}</p>
        </div>
        <StageBadge stage={p.status} />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Partners" value={p.partners.length} accent="green" />
        <StatCard label="Funding" value={formatCurrency(totalFunding)} accent="blue" />
        <StatCard label="Startups" value={p.startups.length} accent="orange" />
        <StatCard label="Member hubs" value={p.hubs.length} accent="green" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Partnerships" subtitle="Powering this program." />
          <table className="table-base">
            <thead><tr><th>Partner</th><th>Role</th><th>Stage</th><th>Value</th></tr></thead>
            <tbody>
              {p.partners.map((l) => (
                <tr key={l.id}>
                  <td>
                    <Link href={`/partnerships/${l.partnership.id}`} className="font-medium text-brand-700 hover:underline">
                      {l.partnership.partner.name}
                    </Link>
                  </td>
                  <td>{l.role ?? "—"}</td>
                  <td><StageBadge stage={l.partnership.stage} /></td>
                  <td>{l.partnership.value ? formatCurrency(l.partnership.value) : "—"}</td>
                </tr>
              ))}
              {p.partners.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-gray-500">No partnerships linked yet.</td></tr>}
            </tbody>
          </table>
        </Card>

        <Card>
          <CardHeader title="Partnership feed" subtitle="Suggested partners (rule-based AI)." />
          <CardBody className="space-y-3">
            {matches.length === 0 && <p className="text-sm text-gray-500">No high-fit partner suggestions yet.</p>}
            {matches.map((m) => (
              <div key={m.partnerId} className="rounded-md border border-gray-100 bg-gray-50 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{m.partnerName}</span>
                  <span className="text-xs font-semibold text-brand-700">{m.fitScore}% fit</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">{m.rationale.join(" · ")}</p>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Funding sources" />
          <table className="table-base">
            <thead><tr><th>Source</th><th>Type</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              {p.fundingSources.map((f) => (
                <tr key={f.id}>
                  <td className="font-medium">{f.name}</td>
                  <td>{f.type}</td>
                  <td>{formatCurrency(f.amount, f.currency)}</td>
                  <td><StageBadge stage={f.status} /></td>
                </tr>
              ))}
              {p.fundingSources.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-gray-500">No funding linked.</td></tr>}
            </tbody>
          </table>
        </Card>

        <Card>
          <CardHeader title="Events" />
          <table className="table-base">
            <thead><tr><th>Event</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {p.events.map((e) => (
                <tr key={e.id}>
                  <td className="font-medium">{e.name}</td>
                  <td><StageBadge stage={e.status} /></td>
                  <td>{formatDate(e.startDate)}</td>
                </tr>
              ))}
              {p.events.length === 0 && <tr><td colSpan={3} className="py-6 text-center text-gray-500">No events linked.</td></tr>}
            </tbody>
          </table>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Cohort & hubs" />
          <table className="table-base">
            <thead><tr><th>Hub</th><th>Country</th><th>Role</th></tr></thead>
            <tbody>
              {p.hubs.map((h) => (
                <tr key={h.id}><td className="font-medium">{h.hub.name}</td><td>{h.hub.country}</td><td>{h.role ?? "—"}</td></tr>
              ))}
              {p.hubs.length === 0 && <tr><td colSpan={3} className="py-6 text-center text-gray-500">No hubs in cohort.</td></tr>}
            </tbody>
          </table>
        </Card>

        <Card>
          <CardHeader title="Activity" />
          <CardBody className="space-y-3">
            {p.activities.map((a) => (
              <div key={a.id} className="text-sm">
                <p className="font-medium text-gray-800">{a.title}</p>
                <p className="text-xs text-gray-500">{relativeTime(a.createdAt)}</p>
              </div>
            ))}
            {p.activities.length === 0 && <p className="text-sm text-gray-500">No activity yet.</p>}
          </CardBody>
        </Card>
      </div>
    </Shell>
  );
}
