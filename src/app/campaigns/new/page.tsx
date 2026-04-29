import { Shell } from "@/components/layout/Shell";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { REGIONS } from "@/lib/utils";
import { getHubSegments } from "@/lib/segmentation";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function build(formData: FormData) {
  "use server";
  const name = String(formData.get("name") || "").trim();
  const channel = String(formData.get("channel") || "EMAIL");
  const audience = String(formData.get("audience") || "ALL_HUBS");
  const subject = String(formData.get("subject") || "") || null;
  const body = String(formData.get("body") || "").trim();
  const status = String(formData.get("status") || "DRAFT");
  if (!name || !body) return;

  const segments = await getHubSegments();
  let recipients = 0;
  if (audience === "ALL_HUBS") recipients = segments.all.length;
  else if (audience === "PAID_HUBS") recipients = segments.paid.length;
  else if (audience.startsWith("REGION:")) recipients = segments.all.filter(h=>h.region === audience.slice(7)).length;
  else if (audience.startsWith("TIER:")) recipients = segments.all.filter(h=>h.membershipTier === audience.slice(5)).length;

  const campaign = await prisma.campaign.create({
    data: {
      name, channel, audience, subject, body, status,
      recipients,
      sentAt: status === "SENT" ? new Date() : null,
    },
  });
  revalidatePath("/campaigns");
  redirect(`/campaigns?created=${campaign.id}`);
}

export default function NewCampaign() {
  return (
    <Shell>
      <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/campaigns" className="hover:text-gray-900">Campaigns</Link>
        <span>/</span><span className="text-gray-900">New</span>
      </div>
      <Card className="max-w-3xl">
        <CardHeader title="Build a campaign" subtitle="Target hubs by status, tier or region." />
        <form action={build}>
          <CardBody className="space-y-4">
            <Field label="Campaign name"><Input name="name" required placeholder="AAG 2026 — registration open" /></Field>

            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Channel">
                <Select name="channel" defaultValue="EMAIL">
                  {["EMAIL","IN_APP","AFRICONNECT"].map(c=><option key={c}>{c}</option>)}
                </Select>
              </Field>
              <Field label="Audience">
                <Select name="audience" defaultValue="ALL_HUBS">
                  <option value="ALL_HUBS">All hubs</option>
                  <option value="PAID_HUBS">Paid hubs only</option>
                  <optgroup label="By region">
                    {REGIONS.map(r=><option key={r} value={`REGION:${r}`}>{r}</option>)}
                  </optgroup>
                  <optgroup label="By tier">
                    {["STANDARD","PREMIUM","STRATEGIC"].map(t=><option key={t} value={`TIER:${t}`}>{t}</option>)}
                  </optgroup>
                </Select>
              </Field>
            </div>

            <Field label="Subject (email)"><Input name="subject" placeholder="Subject line…" /></Field>
            <Field label="Body"><Textarea name="body" required placeholder="Hi {{hub_name}}, …" className="min-h-[160px]" /></Field>
            <Field label="Save as">
              <Select name="status" defaultValue="DRAFT">
                <option value="DRAFT">Draft</option>
                <option value="SCHEDULED">Schedule</option>
                <option value="SENT">Send now</option>
              </Select>
            </Field>
          </CardBody>
          <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4">
            <Link href="/campaigns" className="btn-ghost">Cancel</Link>
            <Button type="submit">Save campaign</Button>
          </div>
        </form>
      </Card>
    </Shell>
  );
}
