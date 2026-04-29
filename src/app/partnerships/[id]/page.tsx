import { Shell } from "@/components/layout/Shell";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { StageBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, Select, Textarea } from "@/components/ui/Input";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, relativeTime } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

const STAGES = ["PROSPECT","ENGAGED","NEGOTIATION","ACTIVE","DORMANT"] as const;

async function changeStage(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  const stage = String(formData.get("stage"));
  if (!STAGES.includes(stage as any)) return;
  await prisma.partnership.update({ where: { id }, data: { stage } });
  await prisma.activity.create({
    data: { type: "PARTNERSHIP_CREATED", title: `Stage changed to ${stage}`, partnershipId: id },
  });
  revalidatePath(`/partnerships/${id}`);
}

async function postMessage(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  const body = String(formData.get("body") || "").trim();
  if (!body) return;
  const author = await prisma.user.findFirst();
  if (!author) return;
  await prisma.message.create({ data: { partnershipId: id, authorId: author.id, body } });
  revalidatePath(`/partnerships/${id}`);
}

async function linkProgram(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  const programId = String(formData.get("programId"));
  const role = String(formData.get("role") || "DELIVERY_PARTNER");
  if (!programId) return;
  await prisma.partnershipProgram.create({ data: { partnershipId: id, programId, role } }).catch(()=>{});
  revalidatePath(`/partnerships/${id}`);
}

export default async function PartnershipDetail({ params }: { params: { id: string } }) {
  const p = await prisma.partnership.findUnique({
    where: { id: params.id },
    include: {
      partner: { include: { contacts: true } },
      owner: true,
      programLinks: { include: { program: true } },
      fundingLinks: { include: { fundingSource: true } },
      events: { include: { event: true } },
      messages: { include: { author: true }, orderBy: { createdAt: "desc" } },
      activities: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!p) notFound();
  const programs = await prisma.program.findMany({ orderBy: { name: "asc" } });

  return (
    <Shell>
      <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/partnerships" className="hover:text-gray-900">Partnerships</Link>
        <span>/</span><span className="text-gray-900">{p.title}</span>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{p.title}</h1>
          <p className="mt-1 text-sm text-gray-500">{p.partner.name} · {p.partner.type}</p>
        </div>
        <div className="flex items-center gap-2">
          <StageBadge stage={p.stage} />
          {p.value && <span className="text-sm font-semibold text-gray-700">{formatCurrency(p.value, p.currency)}</span>}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Pipeline" subtitle="Move this partnership through the lifecycle." />
            <CardBody>
              <form action={changeStage} className="flex items-end gap-3">
                <input type="hidden" name="id" value={p.id} />
                <Field label="Stage">
                  <Select name="stage" defaultValue={p.stage}>
                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </Select>
                </Field>
                <Button>Update</Button>
              </form>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Programs linked" subtitle="Programs this partnership powers."
              action={<form action={linkProgram} className="flex items-center gap-2">
                <input type="hidden" name="id" value={p.id} />
                <select name="programId" className="input !py-1.5 text-xs">
                  <option value="">+ link program</option>
                  {programs.map((pr) => <option key={pr.id} value={pr.id}>{pr.code}</option>)}
                </select>
                <select name="role" className="input !py-1.5 text-xs">
                  {["SPONSOR","DELIVERY_PARTNER","FUNDER","KNOWLEDGE_PARTNER"].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <Button variant="outline" type="submit">Add</Button>
              </form>}
            />
            <table className="table-base">
              <thead><tr><th>Program</th><th>Role</th><th>Status</th></tr></thead>
              <tbody>
                {p.programLinks.length === 0 && <tr><td colSpan={3} className="py-6 text-center text-gray-500">No programs linked yet.</td></tr>}
                {p.programLinks.map((l) => (
                  <tr key={l.id}>
                    <td><Link href={`/programs/${l.program.id}`} className="font-medium text-brand-700 hover:underline">{l.program.code} · {l.program.name}</Link></td>
                    <td>{l.role ?? "—"}</td>
                    <td><StageBadge stage={l.program.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card>
            <CardHeader title="Funding linked" subtitle="Grants, investments and sponsorships from this partnership." />
            <table className="table-base">
              <thead><tr><th>Source</th><th>Type</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                {p.fundingLinks.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-gray-500">No funding linked yet.</td></tr>}
                {p.fundingLinks.map((l) => (
                  <tr key={l.id}>
                    <td className="font-medium">{l.fundingSource.name}</td>
                    <td>{l.fundingSource.type}</td>
                    <td>{formatCurrency(l.fundingSource.amount, l.fundingSource.currency)}</td>
                    <td><StageBadge stage={l.fundingSource.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card>
            <CardHeader title="Internal thread" subtitle="Programs and Partnerships teams collaborating here." />
            <CardBody>
              <form action={postMessage} className="mb-4 flex gap-2">
                <input type="hidden" name="id" value={p.id} />
                <Textarea name="body" placeholder="Drop an update for the team…" />
                <Button>Post</Button>
              </form>
              <div className="space-y-3">
                {p.messages.map((m) => (
                  <div key={m.id} className="rounded-md border border-gray-100 bg-gray-50 p-3 text-sm">
                    <div className="mb-1 flex justify-between text-xs text-gray-500">
                      <span className="font-medium text-gray-700">{m.author.name}</span>
                      <span>{relativeTime(m.createdAt)}</span>
                    </div>
                    <p className="text-gray-800">{m.body}</p>
                  </div>
                ))}
                {p.messages.length === 0 && <p className="text-sm text-gray-500">No messages yet.</p>}
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Partner" />
            <CardBody className="space-y-2 text-sm">
              <div><span className="label-cap">Name</span><div className="font-medium">{p.partner.name}</div></div>
              <div><span className="label-cap">Type</span><div>{p.partner.type}</div></div>
              <div><span className="label-cap">Country</span><div>{p.partner.country ?? "—"}</div></div>
              <div><span className="label-cap">Region</span><div>{p.partner.region ?? "—"}</div></div>
              <div><span className="label-cap">Website</span><div>{p.partner.website ?? "—"}</div></div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Activity" />
            <CardBody className="space-y-3">
              {p.activities.slice(0, 12).map((a) => (
                <div key={a.id} className="text-sm">
                  <p className="font-medium text-gray-800">{a.title}</p>
                  <p className="text-xs text-gray-500">{relativeTime(a.createdAt)}</p>
                </div>
              ))}
              {p.activities.length === 0 && <p className="text-sm text-gray-500">No activity yet.</p>}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Details" />
            <CardBody className="space-y-2 text-sm">
              <div><span className="label-cap">Owner</span><div>{p.owner?.name ?? "Unassigned"}</div></div>
              <div><span className="label-cap">Source</span><div>{p.source ?? "—"}</div></div>
              <div><span className="label-cap">Started</span><div>{formatDate(p.startDate)}</div></div>
              <div><span className="label-cap">Notes</span><div className="whitespace-pre-wrap">{p.notes ?? "—"}</div></div>
            </CardBody>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
