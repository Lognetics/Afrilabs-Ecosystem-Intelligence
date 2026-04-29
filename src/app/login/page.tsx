"use client";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@afrilabs.test");
  const [password, setPassword] = useState("admin1234");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) setError("Invalid credentials. Try the seeded users below.");
    else router.push("/dashboard");
  }

  const demoUsers = [
    ["admin@afrilabs.test", "admin1234", "Super Admin"],
    ["coo@afrilabs.test", "coo1234", "Office of COO"],
    ["partnerships@afrilabs.test", "p1234", "Partnerships Lead"],
    ["members@afrilabs.test", "m1234", "Member Services"],
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-950 to-brand-700">
      <div className="mx-auto flex min-h-screen max-w-md items-center px-6">
        <div className="w-full">
          <div className="mb-6 flex items-center gap-2 text-white">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent-500 font-black">A</div>
            <span className="text-lg font-semibold">Afrilabs Ecosystem OS</span>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-xl">
            <h1 className="text-xl font-bold text-gray-900">Sign in</h1>
            <p className="mt-1 text-sm text-gray-500">Access your departmental dashboard.</p>
            <form onSubmit={onSubmit} className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">Email</span>
                <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">Password</span>
                <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </label>
              {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
              <button className="btn-primary w-full" disabled={loading}>
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <div className="mt-6 rounded-md bg-gray-50 p-3">
              <p className="mb-2 text-xs font-semibold uppercase text-gray-500">Demo users</p>
              <ul className="space-y-1 text-xs text-gray-600">
                {demoUsers.map(([e, p, label]) => (
                  <li key={e} className="flex items-center justify-between">
                    <span>{label}</span>
                    <button
                      type="button"
                      className="font-mono text-brand-700 hover:underline"
                      onClick={() => { setEmail(e); setPassword(p); }}
                    >
                      {e}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
