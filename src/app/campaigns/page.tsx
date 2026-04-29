import { Shell } from "@/components/layout/Shell";
import { PageHeader } from "@/components/ui/Empty";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { prisma } from "@/lib/prisma";
import { audienceLabel } from "@/lib/segmentation";
import { formatDate, relativeTime } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const campaigns = await prisma.campaign.findMany({ include: { createdBy: true }, orderBy: { createdAt: "desc" } });
  return (
    <Shell>
      <PageHeader
        title="Campaigns & Ad Engine"
        subtitle="Broadcast opportunities to all hubs, paid members, regions or sectors."
        action={<Link href="/campaigns/new" className="btn-primary">+ New campaign</Link>}
      />

      <Card>
        <CardHeader title="All campaigns" />
        <table className="table-base">
          <thead><tr><th>Name</th><th>Channel</th><th>Audience</th><th>Status</th><th>Recipients</th><th>Engagement</th><th>Created</th></tr></thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.id}>
                <td>
                  <div className="font-medium text-gray-900">{c.name}</div>
                  {c.subject && <div className="text-xs text-gray-500">{c.subject}</div>}
                </td>
                <td><Badge tone="blue">{c.channel}</Badge></td>
                <td className="text-xs">{audienceLabel(c.audience)}</td>
                <td>
                  <Badge tone={c.status === "SENT" ? "green" : c.status === "SCHEDULED" ? "yellow" : "gray"}>{c.status}</Badge>
                </td>
                <td>{c.recipients}</td>
                <td className="text-xs text-gray-600">{c.opens} opens · {c.clicks} clicks</td>
                <td className="text-xs text-gray-500">{relativeTime(c.createdAt)}</td>
              </tr>
            ))}
            {campaigns.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-gray-500">No campaigns yet.</td></tr>}
          </tbody>
        </table>
      </Card>
    </Shell>
  );
}
