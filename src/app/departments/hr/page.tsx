import { Shell } from "@/components/layout/Shell";
import { PageHeader } from "@/components/ui/Empty";
import { Card, CardHeader, StatCard } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { prisma } from "@/lib/prisma";
import { DEPARTMENTS } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HRPage() {
  const users = await prisma.user.findMany({ orderBy: { name: "asc" } });
  const byDept: Record<string, number> = {};
  users.forEach(u => { byDept[u.department ?? "—"] = (byDept[u.department ?? "—"] ?? 0) + 1; });
  return (
    <Shell>
      <PageHeader title="HR" subtitle="Staff, departments and roles."
        action={<Link href="/admin/users" className="btn-primary">Manage users</Link>} />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Active staff" value={users.filter(u=>u.isActive).length} accent="green" />
        <StatCard label="Total accounts" value={users.length} accent="blue" />
        <StatCard label="Departments" value={DEPARTMENTS.length} accent="orange" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Headcount by department" />
          <div className="p-5 space-y-2">
            {DEPARTMENTS.map(d => (
              <div key={d.code} className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-b-0 last:pb-0 text-sm">
                <span>{d.name}</span>
                <span className="font-semibold">{byDept[d.code] ?? 0}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="Roster" />
          <table className="table-base">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Status</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td className="font-medium">{u.name}</td>
                  <td className="text-xs">{u.email}</td>
                  <td><Badge tone="blue">{u.role}</Badge></td>
                  <td>{DEPARTMENTS.find(d=>d.code===u.department)?.name ?? "—"}</td>
                  <td><Badge tone={u.isActive?"green":"gray"}>{u.isActive?"Active":"Inactive"}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </Shell>
  );
}
