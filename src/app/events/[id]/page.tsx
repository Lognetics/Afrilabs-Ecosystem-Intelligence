import { Shell } from "@/components/layout/Shell";
import { Card, CardBody, CardHeader, StatCard } from "@/components/ui/Card";
import { StageBadge } from "@/components/ui/Badge";
import { Field, Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";
import { formatDate, relativeTime, DEPARTMENTS } from "@/lib/utils";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATUSES = ["PLANNING","PROMOTION","EXECUTION","POST_EVENT","COMPLETED"] as const;

async function moveStatus(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  if (!STATUSES.includes(status as any)) return;
  await prisma.event.update({ where: { id }, data: { status } });
  await prisma.activity.create({ data: { type: "EVENT_UPDATED", title: `Event moved to ${status}`, eventId: id } });
  revalidatePath(`/events/${id}`);
}

async function addTask(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  const title = String(formData.get("title") || "").trim();
  const department = String(formData.get("department") || "");
  const priority = String(formData.get("priority") || "MEDIUM");
  if (!title) return;
  await prisma.task.create({ data: { title, eventId: id, department, priority, status: "TODO" } });
  revalidatePath(`/events/${id}`);
}

async function toggleTask(formData: FormData) {
  "use server";
  const taskId = String(formData.get("taskId"));
  const eventId = String(formData.get("eventId"));
  const t = await prisma.task.findUnique({ where: { id: taskId } });
  if (!t) return;
  const next = t.status === "DONE" ? "TODO" : "DONE";
  await prisma.task.update({ where: { id: taskId }, data: { status: next, completedAt: next === "DONE" ? new Date() : null } });
  revalidatePath(`/events/${eventId}`);
}

export default async function EventDetail({ params }: { params: { id: string } }) {
  const e = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      program: true,
      tasks: { orderBy: { createdAt: "asc" } },
      partners: { include: { partnership: { include: { partner: true } } } },
      hubs: { include: { hub: true } },
      activities: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  if (!e) notFound();

  const completionRate = e.tasks.length ? Math.round((e.tasks.filter(t=>t.status==="DONE").length / e.tasks.length) * 100) : 0;
  const attendanceRate = e.registered ? Math.round((e.attended / e.registered) * 100) : 0;

  return (
    <Shell>
      <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/events" className="hover:text-gray-900">Events</Link>
        <span>/</span><span className="text-gray-900">{e.name}</span>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{e.name}</h1>
          <p className="mt-1 text-sm text-gray-500">{e.type} · {e.location ?? e.country ?? "—"} · {formatDate(e.startDate)}</p>
        </div>
        <StageBadge stage={e.status} />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Tasks" value={`${e.tasks.filter(t=>t.status==="DONE").length}/${e.tasks.length}`} hint={`${completionRate}% complete`} accent="green" />
        <StatCard label="Partners" value={e.partners.length} accent="orange" />
        <StatCard label="Hubs" value={e.hubs.length} accent="blue" />
        <StatCard label="Attendance" value={`${e.attended}/${e.registered}`} hint={`${attendanceRate}%`} accent="green" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Tasks" subtitle="Cross-departmental delivery checklist." />
          <CardBody className="border-b border-gray-100">
            <form action={addTask} className="grid grid-cols-12 gap-2">
              <input type="hidden" name="id" value={e.id} />
              <input name="title" placeholder="Task title…" required className="input col-span-5" />
              <select name="department" defaultValue="EVENTS" className="input col-span-3">
                {DEPARTMENTS.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
              </select>
              <select name="priority" defaultValue="MEDIUM" className="input col-span-2">
                {["LOW","MEDIUM","HIGH","CRITICAL"].map(p => <option key={p}>{p}</option>)}
              </select>
              <Button className="col-span-2" type="submit">Add</Button>
            </form>
          </CardBody>
          <table className="table-base">
            <thead><tr><th></th><th>Task</th><th>Department</th><th>Priority</th><th>Status</th></tr></thead>
            <tbody>
              {e.tasks.map((t) => (
                <tr key={t.id}>
                  <td>
                    <form action={toggleTask}>
                      <input type="hidden" name="taskId" value={t.id} />
                      <input type="hidden" name="eventId" value={e.id} />
                      <button className="h-4 w-4 rounded border border-gray-300" aria-label="toggle" style={t.status==="DONE"?{background:"#3d9462",borderColor:"#3d9462"}:{}} />
                    </form>
                  </td>
                  <td className={t.status==="DONE" ? "line-through text-gray-400" : ""}>{t.title}</td>
                  <td className="text-xs">{DEPARTMENTS.find(d=>d.code===t.department)?.name ?? t.department}</td>
                  <td><StageBadge stage={t.priority} /></td>
                  <td><StageBadge stage={t.status} /></td>
                </tr>
              ))}
              {e.tasks.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-gray-500">No tasks yet.</td></tr>}
            </tbody>
          </table>
        </Card>

        <Card>
          <CardHeader title="Lifecycle" subtitle="Move event through the pipeline." />
          <CardBody>
            <form action={moveStatus} className="flex items-end gap-2">
              <input type="hidden" name="id" value={e.id} />
              <Field label="Status">
                <Select name="status" defaultValue={e.status}>
                  {STATUSES.map(s=><option key={s}>{s}</option>)}
                </Select>
              </Field>
              <Button type="submit">Move</Button>
            </form>
          </CardBody>

          <CardHeader title="Linked partners" />
          <CardBody>
            {e.partners.length === 0 && <p className="text-sm text-gray-500">No partners linked.</p>}
            <ul className="space-y-2 text-sm">
              {e.partners.map((p) => (
                <li key={p.id} className="flex items-center justify-between">
                  <Link href={`/partnerships/${p.partnership.id}`} className="font-medium text-brand-700 hover:underline">
                    {p.partnership.partner.name}
                  </Link>
                  <span className="text-xs text-gray-500">{p.role ?? "—"}</span>
                </li>
              ))}
            </ul>
          </CardBody>

          <CardHeader title="Activity" />
          <CardBody className="space-y-2">
            {e.activities.map((a) => (
              <div key={a.id} className="text-xs">
                <p className="font-medium text-gray-800">{a.title}</p>
                <p className="text-gray-500">{relativeTime(a.createdAt)}</p>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </Shell>
  );
}
