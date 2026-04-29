import { Shell } from "@/components/layout/Shell";
import { PageHeader } from "@/components/ui/Empty";
import { Card } from "@/components/ui/Card";
import { DEPARTMENTS } from "@/lib/utils";
import Link from "next/link";

const SUMMARIES: Record<string, string> = {
  COO: "Global system overview and performance dashboards.",
  ED: "Strategic insights and ecosystem growth analytics.",
  TECH: "System logs, integrations and platform health.",
  PROGRAMS: "Program dashboards and partner alignment.",
  PARTNERSHIPS: "Contact sourcing pipeline and deal/funding tracking.",
  EVENTS: "Event lifecycle dashboards (AAG and program events).",
  MEMBERS: "Hub management, payment tracking and communications.",
  PROCUREMENT: "Bookings, hotels, travel and logistics.",
  COMMS: "Email campaigns, announcements and media tracking.",
  FINANCE: "Payment records, funding inflows, financial reports.",
  AUDIT: "Activity logs and financial audit trails.",
  HR: "Staff management and role assignments.",
};

export default function DepartmentsIndex() {
  return (
    <Shell>
      <PageHeader title="Departments" subtitle="Role-based dashboards across the organization." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {DEPARTMENTS.map((d) => (
          <Card key={d.code}>
            <Link href={`/departments/${d.code.toLowerCase()}`} className="block p-5 hover:bg-gray-50">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{d.code}</p>
              <h3 className="mt-1 text-base font-semibold text-gray-900">{d.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{SUMMARIES[d.code]}</p>
            </Link>
          </Card>
        ))}
      </div>
    </Shell>
  );
}
