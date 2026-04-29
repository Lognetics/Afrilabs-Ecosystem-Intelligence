import { Shell } from "@/components/layout/Shell";
import { PageHeader } from "@/components/ui/Empty";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { prisma } from "@/lib/prisma";
import { relativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  return (
    <Shell>
      <PageHeader title="Audit & Compliance" subtitle="Immutable record of system events, financial actions and integrations." />
      <Card>
        <CardHeader title="Recent activity log" subtitle={`${logs.length} most recent events`} />
        <table className="table-base">
          <thead><tr><th>When</th><th>Actor</th><th>Action</th><th>Entity</th><th>Reference</th></tr></thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id}>
                <td className="text-xs text-gray-500">{relativeTime(l.createdAt)}</td>
                <td className="text-gray-700">{l.actorEmail ?? "system"}</td>
                <td><Badge tone={l.action === "DELETE" ? "red" : l.action === "CREATE" ? "green" : "blue"}>{l.action}</Badge></td>
                <td>{l.entity}</td>
                <td className="font-mono text-xs text-gray-500">{l.entityId ?? "—"}</td>
              </tr>
            ))}
            {logs.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-gray-500">No audit events recorded.</td></tr>}
          </tbody>
        </table>
      </Card>
    </Shell>
  );
}
