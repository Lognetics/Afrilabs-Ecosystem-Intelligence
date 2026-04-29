import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("card", className)} {...rest} />;
}

export function CardHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4">
      <div>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function CardBody({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("card-pad", className)} {...rest} />;
}

export function StatCard({ label, value, hint, accent }: {
  label: string; value: string | number; hint?: string; accent?: "green" | "orange" | "blue" | "red" | "gray";
}) {
  const accentMap = {
    green: "text-brand-700 bg-brand-50",
    orange: "text-accent-700 bg-accent-50",
    blue: "text-blue-700 bg-blue-50",
    red: "text-red-700 bg-red-50",
    gray: "text-gray-700 bg-gray-50",
  };
  return (
    <div className="card card-pad">
      <div className="flex items-start justify-between">
        <div>
          <p className="label-cap">{label}</p>
          <p className="stat-num mt-1">{value}</p>
          {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
        </div>
        <span className={cn("badge", accentMap[accent ?? "green"])}>{label.slice(0,1)}</span>
      </div>
    </div>
  );
}
