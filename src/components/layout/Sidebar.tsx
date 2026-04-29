"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Handshake, Rocket, DollarSign, Users, Calendar, MessageSquare,
  Megaphone, Sparkles, Building2, Briefcase, Settings, Globe2, ShieldCheck
} from "lucide-react";

const NAV = [
  { group: "Operate", items: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/partnerships", label: "Partnerships", icon: Handshake },
    { href: "/programs", label: "Programs", icon: Rocket },
    { href: "/funding", label: "Funding", icon: DollarSign },
    { href: "/members", label: "Member Hubs", icon: Building2 },
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/jobs", label: "Jobs", icon: Briefcase },
  ]},
  { group: "Engage", items: [
    { href: "/collaboration", label: "Collaboration", icon: MessageSquare },
    { href: "/campaigns", label: "Campaigns", icon: Megaphone },
    { href: "/intelligence", label: "Intelligence", icon: Sparkles },
  ]},
  { group: "System", items: [
    { href: "/africonnect", label: "Africonnect", icon: Globe2 },
    { href: "/audit", label: "Audit Log", icon: ShieldCheck },
    { href: "/departments", label: "Departments", icon: Settings },
    { href: "/admin/users", label: "Users", icon: Users },
  ]},
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-64 shrink-0 border-r border-gray-200 bg-white lg:block">
      <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-5">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 font-black text-white">A</div>
        <div>
          <div className="text-sm font-semibold leading-tight">Afrilabs</div>
          <div className="text-xs text-gray-500">Ecosystem OS</div>
        </div>
      </div>
      <nav className="px-3 py-4">
        {NAV.map((g) => (
          <div key={g.group} className="mb-4">
            <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">{g.group}</p>
            {g.items.map((it) => {
              const Active = pathname === it.href || pathname?.startsWith(it.href + "/");
              const Icon = it.icon;
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition",
                    Active
                      ? "bg-brand-50 text-brand-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {it.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
