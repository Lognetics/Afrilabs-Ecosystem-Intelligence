import { Shell } from "@/components/layout/Shell";
import { PageHeader } from "@/components/ui/Empty";
import { Card, CardHeader, StatCard } from "@/components/ui/Card";
import { StageBadge } from "@/components/ui/Badge";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ProgramsDeptPage() {
  const programs = await prisma.program.findMany({
    include: { _count: { select: { partners: true, fundingSources: true, startups: true, hubs: true } } },
    orderBy: { status: "asc" },
  });
  const counts = {
    active: programs.filter(p=>p.status==="ACTIVE").length,
    draft:  programs.filter(p=>p.status==="DRAFT").length,
    done:   programs.filter(p=>p.status==="COMPLETED").length,
  };
  return (
    <Shell>
      <PageHeader title="Programs Department" subtitle="Manage initiatives and align with partnerships." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Active" value={counts.active} accent="green" />
        <StatCard label="Draft" value={counts.draft} accent="gray" />
        <StatCard label="Completed" value={counts.done} accent="purple" />
      </div>
      <div className="mt-6">
        <Card>
          <CardHeader title="All programs" action={<Link href="/programs/new" className="btn-primary !py-1.5 text-xs">+ New</Link>} />
          <table className="table-base">
            <thead><tr><th>Code</th><th>Name</th><th>Status</th><th>Partners</th><th>Funding sources</th><th>Hubs</th><th>Budget</th></tr></thead>
            <tbody>
              {programs.map((p) => (
                <tr key={p.id}>
                  <td className="font-mono text-xs">{p.code}</td>
                  <td><Link href={`/programs/${p.id}`} className="font-medium text-brand-700 hover:underline">{p.name}</Link></td>
                  <td><StageBadge stage={p.status} /></td>
                  <td>{p._count.partners}</td>
                  <td>{p._count.fundingSources}</td>
                  <td>{p._count.hubs}</td>
                  <td>{p.budget ? formatCurrency(p.budget) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </Shell>
  );
}
