# Deploy to GitHub + Vercel

This repo is git-initialized and committed locally. To get a live URL you need:
1. A GitHub account
2. A Vercel account (free)
3. A hosted Postgres (free — Neon recommended). **SQLite cannot run on Vercel** — its filesystem is ephemeral, so any write disappears between requests.

The whole flow takes about 8 minutes.

---

## Step 1 — Push to GitHub

### Option A: Web UI (no CLI needed)

1. Go to https://github.com/new
2. Repo name: `afrilabs-ecosystem-os` · keep it Private if you prefer · **don't** initialize with README/license/.gitignore
3. Create repository
4. GitHub now shows a "push an existing repository" block. Copy the two commands and run them in this folder:

```bash
git remote add origin https://github.com/<your-username>/afrilabs-ecosystem-os.git
git push -u origin main
```

If prompted for credentials, GitHub no longer accepts passwords here — use a [Personal Access Token](https://github.com/settings/tokens) (classic, scope: `repo`) as the password, or install [GitHub CLI](https://cli.github.com/) and run `gh auth login` first.

### Option B: With GitHub CLI

```bash
winget install GitHub.cli      # Windows
gh auth login
gh repo create afrilabs-ecosystem-os --private --source=. --remote=origin --push
```

---

## Step 2 — Provision Postgres (free — pick one)

### Neon (recommended, fastest)
1. https://console.neon.tech/signup → sign in with GitHub
2. Create project → name it `afrilabs`
3. Copy the **pooled** connection string. It looks like:
   ```
   postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
   ```

### Alternatives
- **Supabase**: project → Settings → Database → Connection String (Transaction mode)
- **Vercel Postgres**: from your Vercel dashboard → Storage → Create → Postgres (auto-injects env vars)

Save that URL — you'll paste it in Step 4.

---

## Step 3 — Switch the schema to Postgres

Before Vercel can build, swap the Prisma datasource. Two ways:

```bash
# Just copy the prepared file:
cp prisma/schema.postgres.prisma prisma/schema.prisma
```

Or edit `prisma/schema.prisma` manually — change:
```diff
- provider = "sqlite"
+ provider = "postgresql"
```

Commit and push:
```bash
git add prisma/schema.prisma
git commit -m "chore: switch to Postgres for production"
git push
```

---

## Step 4 — Deploy on Vercel

### Option A: Web UI (3 clicks)

1. Go to https://vercel.com/new
2. Sign in with GitHub → "Import" the `afrilabs-ecosystem-os` repo
3. **Framework preset**: Next.js (auto-detected)
4. **Build command**: leave default (`npm run build` runs `prisma generate && next build`)
5. **Environment variables** — add these three:

   | Name                | Value                                                  |
   |---------------------|--------------------------------------------------------|
   | `DATABASE_URL`      | (the Postgres URL from Step 2)                         |
   | `NEXTAUTH_SECRET`   | run `openssl rand -base64 32` and paste the output     |
   | `NEXTAUTH_URL`      | Leave blank for first deploy — fix in Step 5           |
   | `AFRICONNECT_API_KEY` | any random string for now                            |

6. Click **Deploy**. Wait ~90s.

### Option B: With Vercel CLI

```bash
npm i -g vercel
vercel login
vercel link
vercel env add DATABASE_URL          # paste the Postgres URL
vercel env add NEXTAUTH_SECRET       # paste a 32+ char random
vercel env add AFRICONNECT_API_KEY   # any value
vercel --prod
```

---

## Step 5 — Initialize the production database

The first build succeeds but the database is empty. Run **once**, against the production Postgres URL:

```bash
# from your local machine, with the production DATABASE_URL exported:
export DATABASE_URL="postgresql://...your-neon-url..."
npx prisma db push       # creates all tables
npm run db:seed          # inserts demo users, hubs, programs, etc.
```

After this, log in at `https://<your-app>.vercel.app/login` with `admin@afrilabs.test / admin1234`.

---

## Step 6 — Set NEXTAUTH_URL

Now that you have the Vercel URL:

1. Vercel → your project → Settings → Environment Variables
2. Add or edit `NEXTAUTH_URL` = `https://<your-app>.vercel.app`
3. Redeploy (Deployments → … → Redeploy)

This stops NextAuth from generating localhost callback URLs.

---

## You're live

Your URL will look like `https://afrilabs-ecosystem-os.vercel.app` (or whatever Vercel assigns — every subsequent push to `main` redeploys automatically).

---

## Troubleshooting

**"Module not found: Can't resolve '@prisma/client'"**
The build script runs `prisma generate` automatically. If it doesn't, set Vercel's build command to `prisma generate && next build`.

**"Environment variable not found: DATABASE_URL"**
Vercel env vars must be set for **Production** (and Preview if you want PR previews). Check the scope checkboxes when adding.

**Login works locally but not on Vercel**
You skipped Step 6. NextAuth needs `NEXTAUTH_URL` to match the deployed origin.

**Tables don't exist**
You skipped `prisma db push` in Step 5. The schema is defined but the production DB is still empty.

**Want to keep working locally with SQLite**
Don't commit the Postgres schema swap to your local working branch — keep `prisma/schema.prisma` as `sqlite` locally and only swap on a `production` branch you push to Vercel. Or use a small `.env` setup with two `.env.local` and `.env.production` files.
