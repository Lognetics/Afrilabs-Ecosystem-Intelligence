import { Shell } from "@/components/layout/Shell";
import { PageHeader } from "@/components/ui/Empty";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { prisma } from "@/lib/prisma";
import { relativeTime } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

const TYPE_TONE: Record<string, "green"|"orange"|"blue"|"purple"|"gray"> = {
  PARTNERSHIP_CREATED: "green",
  PROGRAM_LAUNCHED: "orange",
  FUNDING_PLEDGED: "blue",
  HUB_PAID: "green",
  EVENT_UPDATED: "purple",
  NOTE: "gray",
};

export default async function CollaborationPage() {
  const [activities, threads] = await Promise.all([
    prisma.activity.findMany({
      include: { user: true, partnership: { include: { partner: true } }, program: true, event: true, hub: true },
      orderBy: { createdAt: "desc" },
      take: 60,
    }),
    prisma.message.findMany({
      include: { author: true, partnership: true, program: true, event: true },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
  ]);

  return (
    <Shell>
      <PageHeader title="Internal Collaboration" subtitle="A unified feed of every signal across departments." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Activity timeline" />
          <CardBody className="space-y-4">
            {activities.map((a) => {
              const link = a.partnershipId ? `/partnerships/${a.partnershipId}`
                : a.programId ? `/programs/${a.programId}`
                : a.eventId ? `/events/${a.eventId}`
                : a.hubId ? `/members/${a.hubId}` : "#";
              return (
                <div key={a.id} className="flex gap-3 border-b border-gray-100 pb-3 last:border-b-0">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">
                    {(a.user?.name ?? "S").slice(0,1)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={TYPE_TONE[a.type] ?? "gray"}>{a.type.replace(/_/g," ")}</Badge>
                      <p className="text-sm font-medium text-gray-900">{a.title}</p>
                    </div>
                    {a.body && <p className="mt-1 text-sm text-gray-600">{a.body}</p>}
                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                      <span>{relativeTime(a.createdAt)}</span>
                      {(a.partnership || a.program || a.event || a.hub) && (
                        <>
                          <span>·</span>
                          <Link href={link} className="text-brand-700 hover:underline">
                            {a.partnership?.partner.name ?? a.program?.name ?? a.event?.name ?? a.hub?.name}
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {activities.length === 0 && <p className="text-sm text-gray-500">No activity yet.</p>}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Recent threads" subtitle="Cross-team conversations." />
          <CardBody className="space-y-3">
            {threads.map((m) => {
              const target = m.partnershipId ? "/partnerships/" + m.partnershipId
                : m.programId ? "/programs/" + m.programId
                : m.eventId ? "/events/" + m.eventId : "#";
              return (
                <Link href={target} key={m.id} className="block rounded-md border border-gray-100 bg-gray-50 p-3 hover:bg-gray-100">
                  <p className="line-clamp-2 text-sm text-gray-800">{m.body}</p>
                  <p className="mt-1 text-xs text-gray-500">{m.author.name} · {relativeTime(m.createdAt)}</p>
                </Link>
              );
            })}
            {threads.length === 0 && <p className="text-sm text-gray-500">No messages yet.</p>}
          </CardBody>
        </Card>
      </div>
    </Shell>
  );
}
