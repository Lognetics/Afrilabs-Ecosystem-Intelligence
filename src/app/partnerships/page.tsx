import { Shell } from "@/components/layout/Shell";
import { PageHeader } from "@/components/ui/Empty";
import { Card } from "@/components/ui/Card";
import { StageBadge } from "@/components/ui/Badge";
import { prisma } from "@/lib/prisma";
import { formatCurrency, relativeTime } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STAGES = ["PROSPECT", "ENGAGED", "NEGOTIATION", "ACTIVE", "DORMANT"] as const;

export default async function PartnershipsPage({ searchParams }: { searchParams: { stage?: string; q?: string } }) {
  const where: any = {};
  if (searchParams.stage && STAGES.includes(searchParams.stage as any)) where.stage = searchParams.stage;
  if (searchParams.q) where.OR = [{ title: { contains: searchParams.q } }, { partner: { name: { contains: searchParams.q } } }];

  const [partnerships, counts] = await Promise.all([
    prisma.partnership.findMany({
      where, include: { partner: true, owner: true, programLinks: { include: { program: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.partnership.groupBy({ by: ["stage"], _count: true }),
  ]);

  const countMap = Object.fromEntries(counts.map((c) => [c.stage, c._count]));

  return (
    <Shell>
      <PageHeader
        title="Partnerships"
        subtitle="Pipeline of investors, donors, corporates and government partners."
        action={<Link href="/partnerships/new" className="btn-primary">+ New partnership</Link>}
      />

      <div className="mb-5 flex flex-wrap gap-2">
        <Link href="/partnerships" className="chip hover:bg-gray-100">All ({partnerships.length})</Link>
        {STAGES.map((s) => (
          <Link key={s} href={`/partnerships?stage=${s}`} className="chip hover:bg-gray-100">
            {s.replace(/_/g, " ")} ({countMap[s] ?? 0})
          </Link>
        ))}
      </div>

      <Card>
        <table className="table-base">
          <thead>
            <tr>
              <th>Partner</th><th>Title</th><th>Stage</th><th>Value</th>
              <th>Linked programs</th><th>Owner</th><th>Updated</th><th></th>
            </tr>
          </thead>
          <tbody>
            {partnerships.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="font-medium text-gray-900">{p.partner.name}</div>
                  <div className="text-xs text-gray-500">{p.partner.type} · {p.partner.country ?? "—"}</div>
                </td>
                <td>{p.title}</td>
                <td><StageBadge stage={p.stage} /></td>
                <td>{p.value ? formatCurrency(p.value, p.currency) : "—"}</td>
                <td className="text-gray-600">
                  {p.programLinks.length === 0 ? <span className="text-gray-400">—</span> :
                    p.programLinks.map((l) => l.program.code).join(", ")}
                </td>
                <td className="text-gray-600">{p.owner?.name ?? "—"}</td>
                <td className="text-xs text-gray-500">{relativeTime(p.updatedAt)}</td>
                <td><Link href={`/partnerships/${p.id}`} className="text-sm font-medium text-brand-700 hover:underline">Open</Link></td>
              </tr>
            ))}
            {partnerships.length === 0 && (
              <tr><td colSpan={8} className="py-10 text-center text-gray-500">No partnerships match your filter.</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </Shell>
  );
}
