import { Shell } from "@/components/layout/Shell";
import { PageHeader } from "@/components/ui/Empty";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Field, Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";
import { formatDate, relativeTime } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function postJob(formData: FormData) {
  "use server";
  const title = String(formData.get("title") || "").trim();
  const organization = String(formData.get("organization") || "").trim();
  const type = String(formData.get("type") || "FULL_TIME");
  const location = String(formData.get("location") || "") || null;
  const sector = String(formData.get("sector") || "") || null;
  const link = String(formData.get("link") || "") || null;
  if (!title || !organization) return;
  await prisma.job.create({ data: { title, organization, type, location, sector, link } });
  revalidatePath("/jobs");
}

export default async function JobsPage() {
  const jobs = await prisma.job.findMany({ orderBy: { postedAt: "desc" } });
  return (
    <Shell>
      <PageHeader title="Jobs board" subtitle="Roles across the ecosystem — hubs, startups, partners." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Open roles" />
          <table className="table-base">
            <thead><tr><th>Title</th><th>Organization</th><th>Type</th><th>Location</th><th>Sector</th><th>Posted</th></tr></thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j.id}>
                  <td className="font-medium">
                    {j.link ? <a href={j.link} target="_blank" rel="noreferrer" className="text-brand-700 hover:underline">{j.title}</a> : j.title}
                  </td>
                  <td>{j.organization}</td>
                  <td><Badge tone="blue">{j.type}</Badge></td>
                  <td>{j.location ?? "Remote"}</td>
                  <td>{j.sector ?? "—"}</td>
                  <td className="text-xs text-gray-500">{relativeTime(j.postedAt)}</td>
                </tr>
              ))}
              {jobs.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-gray-500">No jobs posted.</td></tr>}
            </tbody>
          </table>
        </Card>

        <Card>
          <CardHeader title="Post a job" />
          <form action={postJob}>
            <CardBody className="space-y-3">
              <Field label="Title"><Input name="title" required /></Field>
              <Field label="Organization"><Input name="organization" required /></Field>
              <Field label="Type">
                <Select name="type" defaultValue="FULL_TIME">
                  {["FULL_TIME","PART_TIME","CONTRACT","INTERNSHIP"].map(t=><option key={t}>{t}</option>)}
                </Select>
              </Field>
              <Field label="Location"><Input name="location" placeholder="Lagos / Remote" /></Field>
              <Field label="Sector"><Input name="sector" /></Field>
              <Field label="Apply link"><Input name="link" type="url" /></Field>
            </CardBody>
            <div className="flex justify-end border-t border-gray-100 px-5 py-3"><Button type="submit">Post</Button></div>
          </form>
        </Card>
      </div>
    </Shell>
  );
}
