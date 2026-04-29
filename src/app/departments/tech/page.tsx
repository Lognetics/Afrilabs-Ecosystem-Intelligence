import { Shell } from "@/components/layout/Shell";
import { Card, CardBody, CardHeader, StatCard } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/Empty";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { relativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TechPage() {
  const [users, syncs, audit, errors] = await Promise.all([
    prisma.user.count(),
    prisma.africonnectSyncLog.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.auditLog.count(),
    prisma.africonnectSyncLog.count({ where: { status: "ERROR" } }),
  ]);
  return (
    <Shell>
      <PageHeader title="Tech Department" subtitle="System logs, integrations, platform health." />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Active users" value={users} accent="green" />
        <StatCard label="Audit events" value={audit} accent="blue" />
        <StatCard label="Sync runs (last 10)" value={syncs.length} accent="orange" />
        <StatCard label="Sync errors" value={errors} accent={errors ? "red" : "gray"} />
      </div>
      <div className="mt-6 grid gap-6">
        <Card>
          <CardHeader title="Africonnect sync log" />
          <table className="table-base">
            <thead><tr><th>When</th><th>Endpoint</th><th>Direction</th><th>Records</th><th>Status</th></tr></thead>
            <tbody>
              {syncs.map((s) => (
                <tr key={s.id}>
                  <td>{relativeTime(s.createdAt)}</td>
                  <td className="font-mono text-xs">{s.endpoint}</td>
                  <td><Badge tone={s.direction==="IN"?"blue":"purple"}>{s.direction}</Badge></td>
                  <td>{s.recordCount}</td>
                  <td><Badge tone={s.status==="OK"?"green":"red"}>{s.status}</Badge></td>
                </tr>
              ))}
              {syncs.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-gray-500">No sync runs.</td></tr>}
            </tbody>
          </table>
        </Card>
      </div>
    </Shell>
  );
}
