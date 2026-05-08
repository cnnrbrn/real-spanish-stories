# VPS migration plan — Real Spanish Stories

Self-contained brief, suitable for a fresh conversation.

## Context

- Monorepo: Turborepo + pnpm. Apps: `apps/api` (NestJS, port 3001), `apps/web` (TanStack Start, port 3000), `apps/admin-api` (NestJS, port 3002), `apps/admin-web` (TanStack Start, port 3003). Shared package: `packages/shared`.
- Current prod deploys via [.github/workflows/deploy.yml](.github/workflows/deploy.yml) which pushes a Docker image to AWS Lightsail **container service**. Only the public API is currently deployed there. Web is on `realspanishstories.com` (separate hosting). Admin apps not deployed yet.
- Auth: Better Auth in the API; web uses `better-auth/react`. Cookies are session-based (`SameSite=Lax`), which means they require **same-site** between web and api or login breaks in prod.
- Email via Resend, OpenAI for translation, S3 for media. Postgres database (likely Lightsail managed — keep it).
- Google OAuth set up in Google Cloud Console with redirect URIs already including the prod API URL. Update when API URL changes.

## Why move to a VPS

- Need to host four apps now (`api`, `web`, `admin-api`, `admin-web`) plus future sites.
- One VPS with a reverse proxy is cheaper and simpler than four containers.
- Same-origin reverse proxy fixes the cross-origin cookie issue that currently breaks auth in prod.

## Target architecture

Single Lightsail Linux instance running:

- **Caddy** as reverse proxy plus auto-TLS via Let's Encrypt
- **Docker Compose** running each app as a container (or Node + systemd if preferred)
- Public web served from `realspanishstories.com`, public API at `realspanishstories.com/v1/*` (same origin — no CORS, no cookie issues)
- Admin apps on subdomains: `admin.realspanishstories.com` (web), `admin-api.realspanishstories.com` (api)

Caddyfile shape:

```
realspanishstories.com {
    reverse_proxy /v1/* localhost:3001
    reverse_proxy localhost:3000
}
admin.realspanishstories.com {
    reverse_proxy localhost:3003
}
admin-api.realspanishstories.com {
    reverse_proxy localhost:3002
}
```

## Migration steps (in order)

1. **Provision Lightsail Linux instance** (Ubuntu 24.04 LTS, 2 GB RAM minimum, static IP).
2. **Install Docker, Docker Compose, Caddy** on the instance.
3. **Build production Docker images** for each app. The api already has a Dockerfile at [apps/api/Dockerfile](apps/api/Dockerfile); add equivalents for web, admin-api, admin-web.
4. **Write `docker-compose.yml`** at the monorepo root that runs the four apps, binds them to localhost ports, and passes env vars via `env_file: .env.production`.
5. **Write the `Caddyfile`** as above. Caddy reads from `/etc/caddy/Caddyfile`.
6. **DNS**: point `realspanishstories.com` apex and the subdomains at the VPS static IP. Wait for propagation.
7. **First deploy manually**: SSH in, clone repo, copy `.env.production`, `docker compose up -d`, `systemctl restart caddy`. Smoke-test all four URLs.
8. **Update Google OAuth redirect URI** in Google Console to `https://realspanishstories.com/v1/auth/callback/google` (now same origin).
9. **Update env vars** for prod:
   - Web: `VITE_API_URL` becomes the same origin (`/v1/`), or remove and use relative paths.
   - API: `CORS_ORIGIN` becomes `https://realspanishstories.com`. With same-origin, you can also remove `enableCors` entirely from [apps/api/src/main.ts](apps/api/src/main.ts).
   - Update or delete `BETTER_AUTH_URL` to reflect the new prod API URL.
10. **Replace deploy pipeline**: rewrite [.github/workflows/deploy.yml](.github/workflows/deploy.yml) to SSH into the VPS and run `docker compose pull && docker compose up -d`. Use `appleboy/ssh-action`. Add `SSH_HOST`, `SSH_KEY`, `SSH_USER` as GitHub secrets.
11. **Set up GitHub Container Registry** (or Docker Hub) and push images there from CI; the VPS pulls from the same registry.
12. **Decommission Lightsail container service** once everything's stable on the VPS.

## Auth-specific changes once same-origin

After the migration, edit [apps/api/src/main.ts](apps/api/src/main.ts):

- Remove `app.enableCors({ ... })` — same-origin requests don't need CORS.

In [apps/api/src/auth/auth.module.ts](apps/api/src/auth/auth.module.ts):

- `trustedOrigins` becomes a single value (the apex domain).
- No need for `crossSubDomainCookies` since web and api share an origin.

In [apps/web/src/lib/auth-client.ts](apps/web/src/lib/auth-client.ts):

- `baseURL` can become relative (web and api share the host).

In the web fetch wrapper [apps/web/src/lib/api.ts](apps/web/src/lib/api.ts):

- `credentials: 'include'` is still fine — harmless in same-origin too.

## What does NOT change

- Better Auth configuration (`emailAndPassword`, `socialProviders`, `rateLimit`, hooks) is identical.
- The user/account/session schema, drizzle migrations.
- Frontend auth flows (login/signup/forgot-password modals, route guards, account linking).
- Email templates and Resend integration.

## Risks worth flagging

- DNS propagation cutover means some users may have a window of stale DNS hitting the old container service. Plan a maintenance window or do a soft cutover with a redirect.
- The first Caddyfile typo can lock out HTTPS — keep the SSH session open while testing.
- Database connection: if Postgres is Lightsail-managed, the VPS needs network access to it. Confirm peering / security groups before cutting over.
- Health checks: replace the existing public-endpoint health check in the Lightsail deploy with a Caddy-aware equivalent, or rely on `docker compose` restart-on-failure plus an external uptime monitor (e.g. UptimeRobot) hitting `realspanishstories.com/v1/`.

## Estimated effort

For someone familiar with Docker and Caddy:

- **2–3 hours**: provision VPS, install Docker and Caddy, write docker-compose.yml plus Caddyfile, deploy manually, prove same-origin auth works.
- **1–2 hours**: rewrite the GitHub Actions deploy to SSH-based, push images to GHCR, smoke-test, switch DNS, decommission old containers.

Half a day to a day total. Add buffer for unexpected issues (DNS quirks, Postgres networking, a Dockerfile that doesn't build cleanly).
