import { Shell } from "@/components/layout/Shell";
import { PageHeader } from "@/components/ui/Empty";
import { Card, CardHeader, StatCard } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { prisma } from "@/lib/prisma";
import { audienceLabel } from "@/lib/segmentation";
import { relativeTime } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CommsPage() {
  const campaigns = await prisma.campaign.findMany({ orderBy: { createdAt: "desc" }, take: 30 });
  const sent = campaigns.filter(c=>c.status==="SENT");
  const reach = sent.reduce((a,b)=>a+b.recipients, 0);
  const opens = sent.reduce((a,b)=>a+b.opens, 0);
  const openRate = reach ? Math.round((opens/reach)*100) : 0;
  return (
    <Shell>
      <PageHeader title="Communications / PR" subtitle="Campaigns, announcements and media."
        action={<Link href="/campaigns/new" className="btn-primary">+ New campaign</Link>} />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total reach" value={reach} accent="blue" />
        <StatCard label="Sent campaigns" value={sent.length} accent="green" />
        <StatCard label="Open rate" value={`${openRate}%`} accent="orange" />
      </div>
      <div className="mt-6">
        <Card>
          <CardHeader title="Recent campaigns" />
          <table className="table-base">
            <thead><tr><th>Name</th><th>Channel</th><th>Audience</th><th>Status</th><th>Reach</th><th>Created</th></tr></thead>
            <tbody>
              {campaigns.map(c => (
                <tr key={c.id}>
                  <td className="font-medium">{c.name}</td>
                  <td><Badge tone="blue">{c.channel}</Badge></td>
                  <td className="text-xs">{audienceLabel(c.audience)}</td>
                  <td><Badge tone={c.status==="SENT"?"green":c.status==="SCHEDULED"?"yellow":"gray"}>{c.status}</Badge></td>
                  <td>{c.recipients}</td>
                  <td className="text-xs text-gray-500">{relativeTime(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </Shell>
  );
}
