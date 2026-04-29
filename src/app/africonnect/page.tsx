import { Shell } from "@/components/layout/Shell";
import { Card, CardBody, CardHeader, StatCard } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/Empty";
import { Badge } from "@/components/ui/Badge";
import { prisma } from "@/lib/prisma";
import { relativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AfriconnectPage() {
  const [synced, total, logs] = await Promise.all([
    prisma.hub.count({ where: { africonnectId: { not: null } } }),
    prisma.hub.count(),
    prisma.africonnectSyncLog.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
  ]);

  return (
    <Shell>
      <PageHeader
        title="Africonnect Integration"
        subtitle="Shared profiles, SSO and activity sync between Ecosystem OS and Africonnect."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Hubs synced" value={`${synced}/${total}`} hint={`${total ? Math.round(synced/total*100) : 0}% coverage`} accent="green" />
        <StatCard label="Endpoints" value="3" hint="/sync/hubs · /sync/programs · /sync/activities" accent="blue" />
        <StatCard label="Last sync" value={logs[0] ? relativeTime(logs[0].createdAt) : "Never"} accent="orange" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="API endpoints" subtitle="Pull these from the Africonnect side; require Authorization header." />
          <CardBody className="space-y-3 text-sm">
            {[
              ["GET", "/api/sync/hubs", "Returns all member hubs with shared profile fields."],
              ["GET", "/api/sync/programs", "Returns active programs and cohort hubs."],
              ["GET", "/api/sync/activities", "Returns recent ecosystem activity (paginated)."],
              ["POST","/api/sync/hubs", "Upsert a hub from Africonnect (matches on africonnectId)."],
            ].map(([m, p, d]) => (
              <div key={p} className="flex items-start gap-3 rounded-md border border-gray-100 bg-gray-50 p-3">
                <Badge tone={m === "GET" ? "green" : "orange"}>{m}</Badge>
                <div className="min-w-0">
                  <p className="font-mono text-xs text-gray-900">{p}</p>
                  <p className="text-xs text-gray-500">{d}</p>
                </div>
              </div>
            ))}
            <div className="rounded-md border border-amber-100 bg-amber-50 p-3 text-xs text-amber-800">
              Auth: <code>Authorization: Bearer $AFRICONNECT_API_KEY</code>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Sync history" />
          <table className="table-base">
            <thead><tr><th>When</th><th>Endpoint</th><th>Direction</th><th>Records</th><th>Status</th></tr></thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id}>
                  <td className="text-xs">{relativeTime(l.createdAt)}</td>
                  <td className="font-mono text-xs">{l.endpoint}</td>
                  <td><Badge tone={l.direction === "IN" ? "blue" : "purple"}>{l.direction}</Badge></td>
                  <td>{l.recordCount}</td>
                  <td><Badge tone={l.status === "OK" ? "green" : "red"}>{l.status}</Badge></td>
                </tr>
              ))}
              {logs.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-gray-500">No sync events yet.</td></tr>}
            </tbody>
          </table>
        </Card>
      </div>
    </Shell>
  );
}
