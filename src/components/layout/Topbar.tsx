"use client";
import { signOut, useSession } from "next-auth/react";
import { Bell, Search, LogOut } from "lucide-react";

export function Topbar() {
  const { data } = useSession();
  const user = data?.user;
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 px-6 backdrop-blur">
      <div className="flex flex-1 items-center gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Search partners, programs, hubs…"
            className="w-full rounded-md border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm placeholder-gray-400 focus:border-brand-500 focus:bg-white focus:outline-none"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="rounded-md p-2 text-gray-500 hover:bg-gray-100" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-3 border-l border-gray-200 pl-3">
          <div className="text-right leading-tight">
            <div className="text-sm font-medium text-gray-900">{user?.name ?? "Guest"}</div>
            <div className="text-xs text-gray-500">{(user as any)?.role ?? "—"}</div>
          </div>
          <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-xs font-semibold text-white">
            {(user?.name ?? "?").slice(0, 1).toUpperCase()}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
