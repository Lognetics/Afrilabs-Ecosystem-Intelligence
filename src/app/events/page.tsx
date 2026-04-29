import { Shell } from "@/components/layout/Shell";
import { Card, CardBody, CardHeader, StatCard } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/Empty";
import { StageBadge } from "@/components/ui/Badge";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function create(formData: FormData) {
  "use server";
  const name = String(formData.get("name") || "").trim();
  const type = String(formData.get("type") || "PROGRAM_EVENT");
  const startDate = new Date(String(formData.get("startDate")));
  const programId = String(formData.get("programId") || "") || null;
  const location = String(formData.get("location") || "") || null;
  const country = String(formData.get("country") || "") || null;
  const description = String(formData.get("description") || "") || null;
  if (!name || isNaN(startDate.getTime())) return;
  const e = await prisma.event.create({
    data: { name, type, startDate, programId, location, country, description, status: "PLANNING" },
  });
  await prisma.activity.create({ data: { type: "EVENT_UPDATED", title: `Event created: ${name}`, eventId: e.id, programId } });
  revalidatePath("/events");
}

export default async function EventsPage() {
  const [events, programs] = await Promise.all([
    prisma.event.findMany({
      include: { program: true, _count: { select: { tasks: true, partners: true, hubs: true } } },
      orderBy: { startDate: "desc" },
    }),
    prisma.program.findMany({ orderBy: { name: "asc" } }),
  ]);

  const counts = {
    planning: events.filter(e=>e.status==="PLANNING").length,
    promo:    events.filter(e=>e.status==="PROMOTION").length,
    exec:     events.filter(e=>e.status==="EXECUTION").length,
    done:     events.filter(e=>e.status==="COMPLETED").length,
  };

  return (
    <Shell>
      <PageHeader title="Events & Activation" subtitle="AAG and program events from planning through post-event analysis." />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Planning"   value={counts.planning} accent="gray" />
        <StatCard label="Promotion"  value={counts.promo} accent="blue" />
        <StatCard label="Execution"  value={counts.exec} accent="orange" />
        <StatCard label="Completed"  value={counts.done} accent="green" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="All events" />
          <table className="table-base">
            <thead><tr><th>Event</th><th>Type</th><th>Status</th><th>Program</th><th>Date</th><th>Tasks</th><th>Attendance</th><th></th></tr></thead>
            <tbody>
              {events.map((e) => {
                const attRate = e.registered ? Math.round((e.attended / e.registered) * 100) : 0;
                return (
                  <tr key={e.id}>
                    <td>
                      <div className="font-medium text-gray-900">{e.name}</div>
                      <div className="text-xs text-gray-500">{e.location ?? e.country ?? "—"}</div>
                    </td>
                    <td>{e.type}</td>
                    <td><StageBadge stage={e.status} /></td>
                    <td>{e.program?.code ?? "—"}</td>
                    <td>{formatDate(e.startDate)}</td>
                    <td>{e._count.tasks}</td>
                    <td className="text-xs">{e.attended}/{e.registered} ({attRate}%)</td>
                    <td><Link href={`/events/${e.id}`} className="text-sm font-medium text-brand-700 hover:underline">Open</Link></td>
                  </tr>
                );
              })}
              {events.length === 0 && <tr><td colSpan={8} className="py-6 text-center text-gray-500">No events yet.</td></tr>}
            </tbody>
          </table>
        </Card>

        <Card>
          <CardHeader title="Create event" />
          <form action={create}>
            <CardBody className="space-y-3">
              <Field label="Name"><Input name="name" required placeholder="Africa Annual Gathering 2026" /></Field>
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Type">
                  <Select name="type" defaultValue="AAG">
                    {["AAG","PROGRAM_EVENT","WEBINAR","WORKSHOP"].map(t=><option key={t}>{t}</option>)}
                  </Select>
                </Field>
                <Field label="Start date"><Input type="date" name="startDate" required /></Field>
              </div>
              <Field label="Program (optional)">
                <Select name="programId" defaultValue="">
                  <option value="">— None —</option>
                  {programs.map(p=><option key={p.id} value={p.id}>{p.code} · {p.name}</option>)}
                </Select>
              </Field>
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Location"><Input name="location" placeholder="Lagos" /></Field>
                <Field label="Country"><Input name="country" placeholder="Nigeria" /></Field>
              </div>
              <Field label="Description"><Textarea name="description" /></Field>
            </CardBody>
            <div className="flex justify-end border-t border-gray-100 px-5 py-3"><Button type="submit">Create event</Button></div>
          </form>
        </Card>
      </div>
    </Shell>
  );
}
