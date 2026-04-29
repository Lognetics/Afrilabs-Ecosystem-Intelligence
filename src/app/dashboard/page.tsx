import { Shell } from "@/components/layout/Shell";
import { Card, CardBody, CardHeader, StatCard } from "@/components/ui/Card";
import { StageBadge } from "@/components/ui/Badge";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatNumber, relativeTime } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const [hubs, partnerships, programs, funding, recent, events, paid] = await Promise.all([
    prisma.hub.count(),
    prisma.partnership.findMany({ include: { partner: true }, orderBy: { updatedAt: "desc" }, take: 5 }),
    prisma.program.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.fundingSource.aggregate({ _sum: { amount: true } }),
    prisma.activity.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { user: true } }),
    prisma.event.findMany({ orderBy: { startDate: "desc" }, take: 5 }),
    prisma.hub.count({ where: { payments: { some: { status: "PAID" } } } }),
  ]);

  return (
    <Shell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Ecosystem overview</h1>
        <p className="mt-1 text-sm text-gray-500">A live snapshot of partnerships, programs, funding and member activity.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Member hubs" value={formatNumber(hubs)} hint={`${paid} paid · ${hubs - paid} other`} accent="green" />
        <StatCard label="Active programs" value={programs.length} hint="Last created" accent="orange" />
        <StatCard label="Total funding" value={formatCurrency(funding._sum.amount ?? 0)} hint="Pledged → disbursed" accent="blue" />
        <StatCard label="Live partnerships" value={partnerships.length} hint="In motion" accent="green" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Recent partnerships" subtitle="Latest pipeline activity"
            action={<Link href="/partnerships" className="text-sm text-brand-700 hover:underline">View all →</Link>} />
          <table className="table-base">
            <thead><tr><th>Partner</th><th>Title</th><th>Stage</th><th>Value</th></tr></thead>
            <tbody>
              {partnerships.map((p) => (
                <tr key={p.id}>
                  <td className="font-medium text-gray-900">{p.partner.name}</td>
                  <td>{p.title}</td>
                  <td><StageBadge stage={p.stage} /></td>
                  <td>{p.value ? formatCurrency(p.value, p.currency) : "—"}</td>
                </tr>
              ))}
              {partnerships.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-gray-500">No partnerships yet.</td></tr>}
            </tbody>
          </table>
        </Card>

        <Card>
          <CardHeader title="Activity feed" subtitle="Cross-department signals" />
          <CardBody className="space-y-4">
            {recent.map((a) => (
              <div key={a.id} className="flex gap-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">
                  {(a.user?.name ?? "S").slice(0,1)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">{a.title}</p>
                  {a.body && <p className="line-clamp-2 text-xs text-gray-500">{a.body}</p>}
                  <p className="text-[11px] text-gray-400">{relativeTime(a.createdAt)} · {a.type.replace(/_/g," ").toLowerCase()}</p>
                </div>
              </div>
            ))}
            {recent.length === 0 && <p className="text-sm text-gray-500">No activity yet — start a partnership or program.</p>}
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Programs" action={<Link href="/programs" className="text-sm text-brand-700 hover:underline">All programs →</Link>} />
          <table className="table-base">
            <thead><tr><th>Code</th><th>Name</th><th>Status</th><th>Region</th></tr></thead>
            <tbody>
              {programs.map((p) => (
                <tr key={p.id}>
                  <td className="font-mono text-xs">{p.code}</td>
                  <td className="font-medium text-gray-900">{p.name}</td>
                  <td><StageBadge stage={p.status} /></td>
                  <td className="text-gray-500">{p.region ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card>
          <CardHeader title="Upcoming & recent events" action={<Link href="/events" className="text-sm text-brand-700 hover:underline">Events →</Link>} />
          <table className="table-base">
            <thead><tr><th>Event</th><th>Status</th><th>Location</th><th>Date</th></tr></thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id}>
                  <td className="font-medium text-gray-900">{e.name}</td>
                  <td><StageBadge stage={e.status} /></td>
                  <td className="text-gray-500">{e.city ? `${e.city}, ${e.country}` : e.country ?? "—"}</td>
                  <td className="text-gray-500">{new Date(e.startDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </Shell>
  );
}
