import { cn } from "@/lib/utils";

const TONES: Record<string, string> = {
  green:  "bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-200",
  orange: "bg-accent-50 text-accent-700 ring-1 ring-inset ring-accent-200",
  blue:   "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
  red:    "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
  yellow: "bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-200",
  gray:   "bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-200",
  purple: "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200",
};

export function Badge({ children, tone = "gray" }: { children: React.ReactNode; tone?: keyof typeof TONES }) {
  return <span className={cn("badge", TONES[tone])}>{children}</span>;
}

export function StageBadge({ stage }: { stage: string }) {
  const map: Record<string, keyof typeof TONES> = {
    PROSPECT: "gray", ENGAGED: "blue", NEGOTIATION: "yellow", ACTIVE: "green", DORMANT: "gray",
    DRAFT: "gray", PAUSED: "yellow", COMPLETED: "purple",
    PLEDGED: "yellow", APPROVED: "blue", DISBURSED: "green",
    PAID: "green", PENDING: "yellow", OVERDUE: "red", EXPIRED: "red", REFUNDED: "gray",
    PLANNING: "gray", PROMOTION: "blue", EXECUTION: "orange", POST_EVENT: "purple",
    TODO: "gray", IN_PROGRESS: "blue", BLOCKED: "red", DONE: "green",
    STANDARD: "gray", PREMIUM: "blue", STRATEGIC: "purple",
  };
  return <Badge tone={map[stage] ?? "gray"}>{stage.replace(/_/g, " ")}</Badge>;
}
