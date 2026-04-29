import { execSync } from "node:child_process";

function run(cmd, opts = {}) {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { stdio: "inherit", ...opts });
}

console.log("──────────────────────────────────────────────");
console.log(" Afrilabs Ecosystem OS — Vercel build");
console.log("──────────────────────────────────────────────");

run("npx prisma generate");

if (process.env.DATABASE_URL) {
  console.log("\n✓ DATABASE_URL is set — pushing schema to Postgres");
  try {
    run("npx prisma db push --skip-generate --accept-data-loss");
  } catch (err) {
    console.error("\n⚠️  prisma db push failed — continuing build anyway.");
    console.error("   Hit POST /api/setup after deploy to retry schema + seed.");
    console.error("   ", err?.message ?? err);
  }
} else {
  console.log("\nℹ️  DATABASE_URL not set — skipping db push.");
  console.log("    Attach Postgres in Vercel → Storage tab, then redeploy.");
}

run("npx next build");
