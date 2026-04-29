import { Shell } from "@/components/layout/Shell";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/Empty";
import { Badge } from "@/components/ui/Badge";
import { computeChurnRisk, computeHubPriorities, predictFundingSuccess, suggestPartnerProgramMatches } from "@/lib/intelligence";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function IntelligencePage() {
  const [priorities, churn, matches, funding] = await Promise.all([
    computeHubPriorities(10),
    computeChurnRisk(40),
    suggestPartnerProgramMatches(10),
    predictFundingSuccess(),
  ]);

  return (
    <Shell>
      <PageHeader
        title="Decision Intelligence"
        subtitle="Recommendations and risk signals across the ecosystem. Rule-based heuristics today — pluggable to ML/Claude API."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Hubs to prioritize" subtitle="Based on payment + tier + engagement." />
          <CardBody className="space-y-3">
            {priorities.map((h) => (
              <Link key={h.hubId} href={`/members/${h.hubId}`} className="flex items-center justify-between rounded-md border border-gray-100 bg-gray-50 p-3 hover:bg-gray-100">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">{h.hubName}</p>
                  <p className="line-clamp-1 text-xs text-gray-500">{h.signals.join(" · ")}</p>
                </div>
                <Badge tone="green">{h.score}</Badge>
              </Link>
            ))}
            {priorities.length === 0 && <p className="text-sm text-gray-500">No hubs yet.</p>}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Churn risk" subtitle="Hubs likely to lapse without intervention." />
          <CardBody className="space-y-3">
            {churn.map((h) => (
              <Link key={h.hubId} href={`/members/${h.hubId}`} className="flex items-center justify-between rounded-md border border-red-100 bg-red-50/50 p-3 hover:bg-red-50">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">{h.hubName}</p>
                  <p className="line-clamp-1 text-xs text-gray-500">{h.reasons.join(" · ")}</p>
                </div>
                <Badge tone="red">{h.risk}</Badge>
              </Link>
            ))}
            {churn.length === 0 && <p className="text-sm text-gray-500">No high-risk hubs detected.</p>}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Suggested partner ↔ program matches" />
          <CardBody className="space-y-3">
            {matches.map((m, i) => (
              <div key={i} className="rounded-md border border-gray-100 bg-gray-50 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{m.partnerName}</span>
                  <Badge tone="orange">{m.fitScore}% fit</Badge>
                </div>
                <p className="text-xs text-gray-600">→ {m.programName}</p>
                <p className="mt-1 text-xs text-gray-500">{m.rationale.join(" · ")}</p>
              </div>
            ))}
            {matches.length === 0 && <p className="text-sm text-gray-500">No suggestions — add more partners and active programs.</p>}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Funding success likelihood" />
          <CardBody className="space-y-3">
            {funding.map((f) => (
              <div key={f.fundingId} className="rounded-md border border-gray-100 bg-gray-50 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{f.name}</span>
                  <Badge tone={f.successLikelihood >= 70 ? "green" : f.successLikelihood >= 40 ? "yellow" : "red"}>
                    {f.successLikelihood}%
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-gray-500">{f.drivers.join(" · ")}</p>
              </div>
            ))}
            {funding.length === 0 && <p className="text-sm text-gray-500">No pledged or approved funding to score.</p>}
          </CardBody>
        </Card>
      </div>
    </Shell>
  );
}
