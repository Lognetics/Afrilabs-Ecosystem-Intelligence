import { Shell } from "@/components/layout/Shell";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { REGIONS } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function create(formData: FormData) {
  "use server";
  const name = String(formData.get("name") || "").trim();
  const code = String(formData.get("code") || "").trim().toUpperCase();
  const type = String(formData.get("type") || "INITIATIVE");
  const status = String(formData.get("status") || "DRAFT");
  const region = String(formData.get("region") || "");
  const budget = formData.get("budget") ? Number(formData.get("budget")) : null;
  const description = String(formData.get("description") || "").trim();
  if (!name || !code) return;

  const p = await prisma.program.create({ data: { name, code, type, status, region: region || null, budget, description: description || null } });
  await prisma.activity.create({ data: { type: "PROGRAM_LAUNCHED", title: `Program created: ${name}`, programId: p.id } });
  revalidatePath("/programs");
  redirect(`/programs/${p.id}`);
}

export default function NewProgram() {
  return (
    <Shell>
      <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/programs" className="hover:text-gray-900">Programs</Link>
        <span>/</span><span className="text-gray-900">New</span>
      </div>
      <Card className="max-w-3xl">
        <CardHeader title="New program" />
        <form action={create}>
          <CardBody className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Name"><Input name="name" required placeholder="e.g. Catalytic Africa" /></Field>
              <Field label="Code" hint="Short, unique identifier."><Input name="code" required placeholder="CATALYTIC" /></Field>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Type">
                <Select name="type" defaultValue="INITIATIVE">
                  {["ACCELERATOR","INITIATIVE","RESEARCH","ECOSYSTEM_PROJECT"].map(t => <option key={t}>{t}</option>)}
                </Select>
              </Field>
              <Field label="Status">
                <Select name="status" defaultValue="DRAFT">
                  {["DRAFT","ACTIVE","PAUSED","COMPLETED"].map(s => <option key={s}>{s}</option>)}
                </Select>
              </Field>
              <Field label="Region">
                <Select name="region" defaultValue="">
                  <option value="">Pan-African</option>
                  {REGIONS.map(r => <option key={r}>{r}</option>)}
                </Select>
              </Field>
            </div>
            <Field label="Budget (USD)"><Input type="number" name="budget" min="0" step="1000" /></Field>
            <Field label="Description"><Textarea name="description" /></Field>
          </CardBody>
          <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4">
            <Link href="/programs" className="btn-ghost">Cancel</Link>
            <Button type="submit">Create program</Button>
          </div>
        </form>
      </Card>
    </Shell>
  );
}
