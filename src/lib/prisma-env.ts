// Build-time guard. When Next.js compiles pages, it imports `@/lib/prisma`,
// which instantiates a PrismaClient. If DATABASE_URL is unset (e.g. first
// Vercel build before Postgres is attached), the client throws and the
// whole build dies. Provide a placeholder so instantiation succeeds; real
// queries fail at runtime, which is what we want.

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    "postgresql://placeholder:placeholder@localhost:5432/placeholder?schema=public";
}

export {};
