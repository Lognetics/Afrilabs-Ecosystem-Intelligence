import { prisma } from "./prisma";

export async function getHubSegments() {
  const hubs = await prisma.hub.findMany({ include: { payments: true } });
  const now = new Date();

  const isPaid = (h: typeof hubs[number]) =>
    h.payments.some(p => p.status === "PAID" && p.periodEnd > now);
  const isPending = (h: typeof hubs[number]) =>
    h.payments.some(p => p.status === "PENDING") && !isPaid(h);
  const isExpired = (h: typeof hubs[number]) =>
    !isPaid(h) && h.payments.some(p => p.status === "EXPIRED" || (p.status === "PAID" && p.periodEnd <= now));

  return {
    paid: hubs.filter(isPaid),
    pending: hubs.filter(isPending),
    expired: hubs.filter(isExpired),
    all: hubs,
  };
}

export function audienceLabel(audience: string) {
  if (audience === "ALL_HUBS") return "All hubs";
  if (audience === "PAID_HUBS") return "Paid hubs only";
  if (audience.startsWith("REGION:")) return `Region: ${audience.slice(7)}`;
  if (audience.startsWith("TIER:")) return `Tier: ${audience.slice(5)}`;
  return audience;
}
