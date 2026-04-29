import { spawnSync } from "node:child_process";

function run(cmd, args = [], opts = {}) {
  console.log(`\n$ ${cmd} ${args.join(" ")}`);
  const result = spawnSync(cmd, args, { stdio: "inherit", ...opts });
  if (result.status !== 0) {
    console.error(`\n❌ "${cmd} ${args.join(" ")}" exited with code ${result.status}`);
    process.exit(result.status ?? 1);
  }
}

console.log("──────────────────────────────────────────────");
console.log(" Afrilabs Ecosystem OS — Vercel build");
console.log(`  Node:            ${process.version}`);
console.log(`  DATABASE_URL:    ${process.env.DATABASE_URL ? "set" : "NOT SET"}`);
console.log(`  NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET ? "set" : "NOT SET"}`);
console.log(`  NEXTAUTH_URL:    ${process.env.NEXTAUTH_URL ?? "NOT SET"}`);
console.log("──────────────────────────────────────────────");

// Bump build memory headroom in case next build is OOM-ing
process.env.NODE_OPTIONS = `${process.env.NODE_OPTIONS ?? ""} --max-old-space-size=4096`.trim();

run("npx", ["prisma", "generate"]);

if (process.env.DATABASE_URL) {
  console.log("\n→ DATABASE_URL set — pushing schema to Postgres");
  const result = spawnSync("npx", ["prisma", "db", "push", "--skip-generate", "--accept-data-loss"], { stdio: "inherit" });
  if (result.status !== 0) {
    console.error("\n⚠️  prisma db push failed (continuing build).");
    console.error("   Hit POST /api/setup after deploy to retry schema + seed.");
  }
} else {
  console.log("\nℹ️  DATABASE_URL not set — skipping db push.");
}

console.log("\n→ Building Next.js app");
run("npx", ["next", "build"]);

console.log("\n✓ Build complete");
