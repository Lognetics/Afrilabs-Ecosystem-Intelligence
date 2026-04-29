// Rule-based heuristics for the "decision intelligence" layer.
// Swap these for ML / Claude API calls when ready — interfaces are stable.

import { prisma } from "./prisma";

export interface HubPriorityScore {
  hubId: string;
  hubName: string;
  score: number; // 0-100, higher = prioritize
  signals: string[];
}

export async function computeHubPriorities(limit = 20): Promise<HubPriorityScore[]> {
  const hubs = await prisma.hub.findMany({ include: { payments: true } });
  const now = Date.now();
  const scored = hubs.map((h) => {
    const signals: string[] = [];
    let score = h.engagementScore;
    const paid = h.payments.filter((p) => p.status === "PAID");
    const overdue = h.payments.filter((p) => p.status === "OVERDUE" || p.status === "EXPIRED");
    if (paid.length > 0) { score += 15; signals.push("active subscription"); }
    if (h.membershipTier === "PREMIUM") { score += 10; signals.push("premium tier"); }
    if (h.membershipTier === "STRATEGIC") { score += 20; signals.push("strategic tier"); }
    if (overdue.length > 0) { score -= 25; signals.push(`${overdue.length} overdue payment(s)`); }
    const lastPaid = paid.sort((a,b)=>(b.paidAt?.getTime()??0)-(a.paidAt?.getTime()??0))[0];
    if (lastPaid?.paidAt) {
      const months = (now - lastPaid.paidAt.getTime()) / (1000*60*60*24*30);
      if (months < 3) { score += 10; signals.push("recent payment"); }
    }
    return { hubId: h.id, hubName: h.name, score: Math.max(0, Math.min(100, score)), signals };
  });
  return scored.sort((a,b)=>b.score-a.score).slice(0, limit);
}

export interface ChurnRisk {
  hubId: string;
  hubName: string;
  risk: number; // 0-100, higher = more likely to churn
  reasons: string[];
}

export async function computeChurnRisk(threshold = 50): Promise<ChurnRisk[]> {
  const hubs = await prisma.hub.findMany({ include: { payments: true } });
  const now = Date.now();
  const result: ChurnRisk[] = [];
  for (const h of hubs) {
    let risk = 0;
    const reasons: string[] = [];
    if (h.engagementScore < 40) { risk += 30; reasons.push("low engagement score"); }
    const overdue = h.payments.filter((p) => p.status === "OVERDUE" || p.status === "EXPIRED");
    if (overdue.length > 0) { risk += 25 * Math.min(2, overdue.length); reasons.push(`${overdue.length} overdue payment(s)`); }
    const paid = h.payments.filter((p) => p.status === "PAID" && p.paidAt);
    const last = paid.sort((a,b)=>(b.paidAt!.getTime())-(a.paidAt!.getTime()))[0];
    if (!last) { risk += 20; reasons.push("no payments on record"); }
    else {
      const months = (now - last.paidAt!.getTime())/(1000*60*60*24*30);
      if (months > 12) { risk += 25; reasons.push(`>12 months since last payment`); }
      else if (months > 6) { risk += 10; reasons.push(`>6 months since last payment`); }
    }
    if (h.status === "SUSPENDED") { risk += 15; reasons.push("status: suspended"); }
    if (risk >= threshold) result.push({ hubId: h.id, hubName: h.name, risk: Math.min(100, risk), reasons });
  }
  return result.sort((a,b)=>b.risk-a.risk);
}

export interface PartnerProgramMatch {
  partnerId: string;
  partnerName: string;
  programId: string;
  programName: string;
  fitScore: number; // 0-100
  rationale: string[];
}

export async function suggestPartnerProgramMatches(limit = 15): Promise<PartnerProgramMatch[]> {
  const partners = await prisma.partner.findMany();
  const programs = await prisma.program.findMany({ where: { status: "ACTIVE" } });
  const matches: PartnerProgramMatch[] = [];
  for (const p of partners) {
    for (const prog of programs) {
      let fit = 30;
      const rationale: string[] = [];
      if (p.region && prog.region && p.region === prog.region) { fit += 30; rationale.push("region match"); }
      if (p.sector && prog.name.toLowerCase().includes((p.sector||"").toLowerCase())) { fit += 20; rationale.push("sector keyword match"); }
      if (p.type === "INVESTOR" && prog.type === "ACCELERATOR") { fit += 25; rationale.push("investor ↔ accelerator"); }
      if (p.type === "DONOR" && prog.type === "INITIATIVE") { fit += 20; rationale.push("donor ↔ initiative"); }
      if (p.type === "CORPORATE" && prog.type === "ECOSYSTEM_PROJECT") { fit += 15; rationale.push("corporate ↔ ecosystem project"); }
      if (fit >= 55) matches.push({ partnerId: p.id, partnerName: p.name, programId: prog.id, programName: prog.name, fitScore: Math.min(100, fit), rationale });
    }
  }
  return matches.sort((a,b)=>b.fitScore-a.fitScore).slice(0, limit);
}

export interface FundingPrediction {
  fundingId: string;
  name: string;
  successLikelihood: number; // 0-100
  drivers: string[];
}

export async function predictFundingSuccess(): Promise<FundingPrediction[]> {
  const sources = await prisma.fundingSource.findMany({ where: { status: { in: ["PLEDGED", "APPROVED"] } }, include: { partner: true, program: true } });
  return sources.map((f) => {
    let likelihood = 50;
    const drivers: string[] = [];
    if (f.status === "APPROVED") { likelihood += 30; drivers.push("already approved"); }
    if (f.partner && (f.partner.type === "GOVERNMENT" || f.partner.type === "FOUNDATION")) { likelihood -= 5; drivers.push(`${f.partner.type} typical delay`); }
    if (f.partner?.type === "INVESTOR") { likelihood += 10; drivers.push("investor partner"); }
    if (f.amount > 1_000_000) { likelihood -= 10; drivers.push("large amount → longer cycle"); }
    if (f.amount < 100_000) { likelihood += 10; drivers.push("small ticket"); }
    if (f.program && f.program.status === "ACTIVE") { likelihood += 5; drivers.push("linked to active program"); }
    return { fundingId: f.id, name: f.name, successLikelihood: Math.max(0, Math.min(100, likelihood)), drivers };
  }).sort((a,b)=>b.successLikelihood-a.successLikelihood);
}
