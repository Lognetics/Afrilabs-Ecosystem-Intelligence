import { Shell } from "@/components/layout/Shell";
import { PageHeader } from "@/components/ui/Empty";
import { Card } from "@/components/ui/Card";
import { StageBadge } from "@/components/ui/Badge";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ProgramsPage() {
  const programs = await prisma.program.findMany({
    include: {
      _count: { select: { partners: true, fundingSources: true, events: true, startups: true, hubs: true } },
      lead: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <Shell>
      <PageHeader
        title="Programs"
        subtitle="Accelerators, initiatives, research and ecosystem projects."
        action={<Link href="/programs/new" className="btn-primary">+ New program</Link>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {programs.map((p) => (
          <Card key={p.id} className="hover:shadow-md transition">
            <Link href={`/programs/${p.id}`} className="block p-5">
              <div className="mb-2 flex items-start justify-between gap-2">
                <span className="font-mono text-xs text-gray-500">{p.code}</span>
                <StageBadge stage={p.status} />
              </div>
              <h3 className="text-base font-semibold text-gray-900">{p.name}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-gray-500">{p.description ?? "—"}</p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div><div className="text-lg font-bold text-gray-900">{p._count.partners}</div><div className="text-[10px] uppercase text-gray-500">Partners</div></div>
                <div><div className="text-lg font-bold text-gray-900">{p._count.startups}</div><div className="text-[10px] uppercase text-gray-500">Startups</div></div>
                <div><div className="text-lg font-bold text-gray-900">{p._count.hubs}</div><div className="text-[10px] uppercase text-gray-500">Hubs</div></div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                <span>{p.region ?? "Pan-African"}</span>
                <span>{p.budget ? formatCurrency(p.budget) : "—"}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                <span>Lead: {p.lead?.name ?? "Unassigned"}</span>
                <span>{formatDate(p.startDate)}</span>
              </div>
            </Link>
          </Card>
        ))}
        {programs.length === 0 && (
          <Card className="col-span-full p-10 text-center text-gray-500">No programs yet.</Card>
        )}
      </div>
    </Shell>
  );
}
