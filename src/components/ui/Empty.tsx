export function Empty({ title = "Nothing here yet", hint, action }: { title?: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center">
      <p className="text-sm font-semibold text-gray-700">{title}</p>
      {hint && <p className="mt-1 text-sm text-gray-500">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
