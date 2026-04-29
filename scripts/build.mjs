import { execSync } from "node:child_process";

function run(cmd) {
  console.log(`\n$ ${cmd}`);
  try {
    execSync(cmd, { stdio: "inherit" });
  } catch (err) {
    console.error(`\n❌ Command failed: ${cmd}`);
    console.error(`   exit status: ${err.status ?? "unknown"}`);
    throw err;
  }
}

console.log("──────────────────────────────────────────────");
console.log(" Afrilabs Ecosystem OS — Vercel build");
console.log(`  Node:           ${process.version}`);
console.log(`  DATABASE_URL:   ${process.env.DATABASE_URL ? "set" : "NOT SET"}`);
console.log(`  NEXTAUTH_SECRET:${process.env.NEXTAUTH_SECRET ? "set" : "NOT SET"}`);
console.log("──────────────────────────────────────────────");

run("npx prisma generate");

if (process.env.DATABASE_URL) {
  console.log("\n→ Pushing schema to Postgres");
  try {
    run("npx prisma db push --skip-generate --accept-data-loss");
  } catch (err) {
    console.error("\n⚠️  prisma db push failed — continuing build anyway.");
    console.error("   Hit POST /api/setup after deploy to retry.");
  }
} else {
  console.log("\nℹ️  DATABASE_URL not set — skipping db push.");
}

run("npx next build");
console.log("\n✓ Build complete");
