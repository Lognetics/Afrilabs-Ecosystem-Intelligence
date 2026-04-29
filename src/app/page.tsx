import Link from "next/link";

export default function MarketingHome() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-800 to-brand-600 text-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent-500 font-black">A</div>
          <span className="text-lg font-semibold">Afrilabs Ecosystem OS</span>
        </div>
        <Link href="/login" className="rounded-md bg-white/10 px-4 py-2 text-sm font-medium ring-1 ring-white/20 hover:bg-white/20">
          Sign in
        </Link>
      </header>

      <section className="mx-auto max-w-7xl px-6 pt-12 pb-24 lg:pt-20">
        <p className="inline-block rounded-full bg-accent-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-200">
          Africa's Innovation Command Center
        </p>
        <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
          One operating system for the Afrilabs ecosystem.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-brand-100">
          Connect partnerships, programs, funding, events and 500+ member hubs across Africa.
          Internal collaboration, payment tracking, ecosystem intelligence — in one platform.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/login" className="rounded-lg bg-accent-500 px-5 py-3 text-sm font-semibold text-white hover:bg-accent-600">
            Open the platform
          </Link>
          <Link href="/dashboard" className="rounded-lg bg-white/10 px-5 py-3 text-sm font-semibold ring-1 ring-white/20 hover:bg-white/20">
            View dashboard
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            ["500+", "Member hubs"],
            ["52", "African countries"],
            ["12", "Departmental modules"],
            ["1M+", "Data points"],
          ].map(([n, l]) => (
            <div key={l} className="rounded-xl bg-white/5 p-5 ring-1 ring-white/10">
              <p className="text-3xl font-bold">{n}</p>
              <p className="mt-1 text-sm text-brand-100">{l}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-white/10 bg-brand-950/50 py-16">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 md:grid-cols-3">
          {[
            ["Partnerships Intelligence", "Source, manage and activate every contact across the partnership lifecycle."],
            ["Member Services", "Onboard hubs, track payments, segment by region and tier, automate renewals."],
            ["Funding Flow", "Grants, investments, sponsorships — pledged to disbursed in one ledger."],
            ["Programs OS", "Accelerators, initiatives and ecosystem projects, linked to partners and outcomes."],
            ["Events & Activation", "AAG and program events from planning through post-event analysis."],
            ["Africonnect Integration", "Shared profiles, SSO and activity sync across the ecosystem."],
          ].map(([t, d]) => (
            <div key={t} className="rounded-xl bg-white/5 p-6 ring-1 ring-white/10">
              <h3 className="text-base font-semibold">{t}</h3>
              <p className="mt-2 text-sm text-brand-100">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-sm text-brand-200">
        © {new Date().getFullYear()} Afrilabs · Ecosystem OS
      </footer>
    </main>
  );
}
