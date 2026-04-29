import { Shell } from "@/components/layout/Shell";
import { PageHeader } from "@/components/ui/Empty";
import { Card, CardBody, CardHeader, StatCard } from "@/components/ui/Card";
import { StageBadge } from "@/components/ui/Badge";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function EventsDeptPage() {
  const events = await prisma.event.findMany({ include: { _count: { select: { tasks: true } } }, orderBy: { startDate: "desc" } });
  const tasks = await prisma.task.groupBy({ by: ["status"], _count: true });
  const get = (s: string) => tasks.find(t=>t.status===s)?._count ?? 0;
  return (
    <Shell>
      <PageHeader title="Events (AAG)" subtitle="Lifecycle of every ecosystem event." />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Tasks: TODO" value={get("TODO")} accent="gray" />
        <StatCard label="In progress" value={get("IN_PROGRESS")} accent="blue" />
        <StatCard label="Blocked" value={get("BLOCKED")} accent="red" />
        <StatCard label="Done" value={get("DONE")} accent="green" />
      </div>
      <div className="mt-6">
        <Card>
          <CardHeader title="Events" action={<Link href="/events" className="btn-outline !py-1.5 text-xs">All events</Link>} />
          <table className="table-base">
            <thead><tr><th>Event</th><th>Type</th><th>Status</th><th>Tasks</th><th>Attendance</th><th>Date</th></tr></thead>
            <tbody>
              {events.map((e) => {
                const rate = e.registered ? Math.round((e.attended/e.registered)*100) : 0;
                return (
                  <tr key={e.id}>
                    <td><Link href={`/events/${e.id}`} className="font-medium text-brand-700 hover:underline">{e.name}</Link></td>
                    <td>{e.type}</td>
                    <td><StageBadge stage={e.status} /></td>
                    <td>{e._count.tasks}</td>
                    <td className="text-xs">{e.attended}/{e.registered} ({rate}%)</td>
                    <td>{formatDate(e.startDate)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>
    </Shell>
  );
}
