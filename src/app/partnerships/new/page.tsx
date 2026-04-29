import { Shell } from "@/components/layout/Shell";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function create(formData: FormData) {
  "use server";
  const partnerId = String(formData.get("partnerId") || "");
  const title = String(formData.get("title") || "").trim();
  const stage = String(formData.get("stage") || "PROSPECT");
  const value = formData.get("value") ? Number(formData.get("value")) : null;
  const programId = String(formData.get("programId") || "");
  const notes = String(formData.get("notes") || "").trim();
  const newPartnerName = String(formData.get("newPartnerName") || "").trim();
  const newPartnerType = String(formData.get("newPartnerType") || "CORPORATE");

  let pid = partnerId;
  if (!pid && newPartnerName) {
    const p = await prisma.partner.create({ data: { name: newPartnerName, type: newPartnerType } });
    pid = p.id;
  }
  if (!pid || !title) return;

  const partnership = await prisma.partnership.create({
    data: { partnerId: pid, title, stage, value, notes: notes || null },
  });
  if (programId) {
    await prisma.partnershipProgram.create({ data: { partnershipId: partnership.id, programId } });
  }
  await prisma.activity.create({
    data: {
      type: "PARTNERSHIP_CREATED",
      title: `Partnership created: ${title}`,
      body: `Stage: ${stage}`,
      partnershipId: partnership.id,
      programId: programId || null,
    },
  });
  revalidatePath("/partnerships");
  revalidatePath("/dashboard");
  redirect(`/partnerships/${partnership.id}`);
}

export default async function NewPartnership() {
  const [partners, programs] = await Promise.all([
    prisma.partner.findMany({ orderBy: { name: "asc" } }),
    prisma.program.findMany({ where: { status: "ACTIVE" }, orderBy: { name: "asc" } }),
  ]);

  return (
    <Shell>
      <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/partnerships" className="hover:text-gray-900">Partnerships</Link>
        <span>/</span><span className="text-gray-900">New</span>
      </div>

      <Card className="max-w-3xl">
        <CardHeader title="New partnership" subtitle="Add an existing partner or create a new one." />
        <form action={create}>
          <CardBody className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Existing partner" hint="Pick one, or create a new partner below.">
                <Select name="partnerId" defaultValue="">
                  <option value="">— Create new —</option>
                  {partners.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.type})</option>)}
                </Select>
              </Field>
              <Field label="Stage">
                <Select name="stage" defaultValue="PROSPECT">
                  {["PROSPECT","ENGAGED","NEGOTIATION","ACTIVE","DORMANT"].map(s => <option key={s} value={s}>{s}</option>)}
                </Select>
              </Field>
            </div>

            <details className="rounded-md border border-gray-200 p-3">
              <summary className="cursor-pointer text-sm font-medium text-gray-700">Or create a new partner</summary>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <Field label="New partner name"><Input name="newPartnerName" placeholder="e.g. Mastercard Foundation" /></Field>
                <Field label="Type">
                  <Select name="newPartnerType" defaultValue="CORPORATE">
                    {["INVESTOR","DONOR","CORPORATE","GOVERNMENT","NGO","FOUNDATION"].map(t => <option key={t} value={t}>{t}</option>)}
                  </Select>
                </Field>
              </div>
            </details>

            <Field label="Title" hint="What is this engagement about?">
              <Input name="title" required placeholder="e.g. AAG 2026 Lead Sponsorship" />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Estimated value (USD)"><Input type="number" name="value" min="0" step="1000" /></Field>
              <Field label="Link to program (optional)">
                <Select name="programId" defaultValue="">
                  <option value="">— None —</option>
                  {programs.map((p) => <option key={p.id} value={p.id}>{p.code} · {p.name}</option>)}
                </Select>
              </Field>
            </div>

            <Field label="Notes"><Textarea name="notes" placeholder="Context, next steps…" /></Field>
          </CardBody>
          <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-4">
            <Link href="/partnerships" className="btn-ghost">Cancel</Link>
            <Button type="submit">Create partnership</Button>
          </div>
        </form>
      </Card>
    </Shell>
  );
}
