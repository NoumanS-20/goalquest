# GoalQuest — Operational Runbook

This is the operational reference for running GoalQuest in production.
Update it whenever a procedure changes — outdated runbooks are worse than
no runbook at all.

---

## 1. Deployment

### First-time setup

1. **Create a Neon Postgres database**
   - https://neon.tech → New Project
   - Copy the **pooled** connection string → `DATABASE_URL`
   - Copy the **direct** connection string → `DIRECT_URL`

2. **Switch Prisma to Postgres**
   ```bash
   npm run db:use-postgres
   npm run db:generate
   npm run db:migrate:deploy
   ```

3. **Import the repo into Vercel**
   - Framework auto-detected as Next.js
   - Build command: `npm run build` (default)
   - Add the env vars from `.env.example` (Settings → Environment Variables)
   - **Required:** `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SITE_URL`, `CRON_SECRET`
   - **Recommended:** `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`

4. **Deploy.** Vercel auto-deploys from the `production` branch.

### Cron jobs

`vercel.json` declares an hourly cron that hits `/api/escalations/run`.
Vercel passes the `CRON_SECRET` automatically. To trigger manually:

```bash
curl -X POST -H "Authorization: Bearer $CRON_SECRET" \
  https://goalquest.app/api/escalations/run
```

### Rolling back

Vercel keeps every deployment indefinitely. To roll back:

1. Vercel dashboard → Deployments → click the last good deploy → "Promote to Production"
2. If the bad deploy ran a Prisma migration, you'll need to also revert
   the migration manually (see Database section below)

---

## 2. Database

### Backups

Neon does automatic point-in-time restore (7 days on the free tier,
longer on paid plans). For belt-and-suspenders, schedule a nightly
logical dump:

```bash
# Manual dump (run from anywhere)
pg_dump "$DATABASE_URL" --no-owner --no-acl > goalquest-$(date +%Y%m%d).sql
```

### Restore

```bash
# Restore the entire DB from a dump
psql "$DIRECT_URL" < goalquest-20260517.sql
```

To restore via Neon PITR: dashboard → Branches → Restore to a point in time.

### Migrations

```bash
# Local — generates a new migration after schema changes
npm run db:migrate

# Production — applies committed migrations
npm run db:migrate:deploy
```

**Never edit a migration file after it's been applied to production.**
Always create a new one.

---

## 3. Incidents

### Quick triage

1. **Check `/api/health`** — returns 200/json with checks if alive
   ```bash
   curl https://goalquest.app/api/health
   ```
2. **Check Vercel deployments** — was a bad deploy just shipped?
3. **Check Sentry** — new error spike?
4. **Check Neon** — DB load, slow queries, recent restarts?

### Common issues

#### Logins are failing
- Check rate limit (Upstash dashboard or memory bucket)
- Check session table not full / corrupted: `SELECT count(*) FROM "Session"`
- If `argon2` errors, ensure `serverExternalPackages` is set in `next.config.ts`

#### 500s on /dashboard
- Almost always database connection: check `DATABASE_URL`
- Connection pool exhausted? Use the **pooled** Neon URL, not direct
- Run `/api/health` to confirm

#### CSRF blocking legit requests
- Verify the request includes `Origin` matching the deployed host
- For server-to-server calls, use `Authorization: Bearer $CRON_SECRET`
- If a third-party integration needs cross-origin: add an exemption in
  `src/proxy.ts` (and review carefully)

---

## 4. Security

### Rotating secrets

1. **`CRON_SECRET`** — update in Vercel env, redeploy. Old secret is invalid immediately.
2. **`NEXTAUTH_SECRET`** — will sign out all SSO users. Schedule a window.
3. **`DATABASE_URL`** — rotate via Neon dashboard. Update Vercel env. Redeploy.
4. **Sentry / Upstash / Resend keys** — rotate in their dashboards, update Vercel.

### Reviewing audit logs

```sql
-- Recent admin actions
SELECT al.*, u.name as actor
FROM "AuditLog" al
JOIN "User" u ON u.id = al."actorId"
WHERE u.role = 'ADMIN'
ORDER BY al."createdAt" DESC
LIMIT 50;

-- All edits to a specific goal
SELECT * FROM "AuditLog"
WHERE "goalId" = '<goal-id>'
ORDER BY "createdAt" ASC;
```

### Responding to a security report

1. Acknowledge within 24h to security@goalquest.app
2. Assess severity (CVSS or similar)
3. Patch on a private branch
4. Coordinate disclosure timing with the reporter
5. Add a regression test
6. Publish post-mortem in `/security/advisories/`

---

## 5. Observability

| What | Where |
|---|---|
| Errors | Sentry dashboard |
| Logs (JSON) | Vercel function logs / log drain |
| Uptime | Better Stack (or chosen monitor) |
| Performance | Vercel Speed Insights |
| Health | `/api/health` |
| Build status | GitHub Actions |

### Key dashboards to bookmark

- Vercel project → Observability tab
- Sentry → Issues + Performance
- Neon → Monitoring → Connections, Slow queries
- Upstash → Metrics

---

## 6. Common operations

### Create a new admin user

```sql
-- Replace placeholders; ensure argon2id hash is generated separately
INSERT INTO "User" (id, email, name, password, role, "createdAt", "updatedAt")
VALUES (
  'usr_' || substr(md5(random()::text), 0, 25),
  'admin@example.com',
  'Admin Name',
  '$argon2id$...',  -- generate with: node -e "require('@node-rs/argon2').hash('pw').then(console.log)"
  'ADMIN',
  now(),
  now()
);
```

### Force-end all sessions

```sql
DELETE FROM "Session";
```

### Promote a goal cycle to active

```sql
UPDATE "Cycle" SET "isActive" = false;
UPDATE "Cycle" SET "isActive" = true WHERE id = '<cycle-id>';
```

---

## 7. Useful commands

```bash
# Fresh local install
npm install
npm run db:use-sqlite
npx prisma migrate dev --name init
npm run db:seed
npm run dev

# Run tests
npm test

# Typecheck
npm run typecheck

# Production build
npm run build

# Switch DB drivers
npm run db:use-sqlite     # local dev
npm run db:use-postgres   # production
```
