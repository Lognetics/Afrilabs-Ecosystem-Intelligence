import { NextResponse } from "next/server";
import { computeChurnRisk, computeHubPriorities, predictFundingSuccess, suggestPartnerProgramMatches } from "@/lib/intelligence";

export async function GET() {
  const [priorities, churn, matches, funding] = await Promise.all([
    computeHubPriorities(20),
    computeChurnRisk(40),
    suggestPartnerProgramMatches(15),
    predictFundingSuccess(),
  ]);
  return NextResponse.json({ priorities, churn, matches, funding });
}
