# Haoran Visitor Analytics

Private visitor analytics for `https://haoran-l.github.io`, implemented with Cloudflare Workers and D1.

## Routes

- `POST /collect` records a deduplicated pageview.
- `GET /count` returns the public lifetime pageview count.
- `GET /login` serves the private login form and creates a 12-hour HttpOnly session.
- `GET /analytics-dashboard` serves the password-protected dashboard.
- `GET /analytics-dashboard/api/summary` and `GET /analytics-dashboard/api/visitors` provide private dashboard data.
- `GET /health` provides a basic health check.

Raw IP addresses are encrypted with AES-256-GCM before being stored. A scheduled cleanup deletes raw visit records after 90 days while the lifetime counter remains.

## Required secrets

- `IP_ENCRYPTION_KEY`: base64-encoded 32-byte random key.
- `VISITOR_HASH_SECRET`: random secret used for visitor deduplication hashes.
- `DASHBOARD_PASSWORD`: password for the dashboard; the username is `ADMIN_EMAIL`.

## Deployment outline

1. Create the D1 database and copy its ID into `wrangler.jsonc`.
2. Apply `schema.sql` to the remote database.
3. Add all three Worker secrets.
4. Deploy the Worker.
5. Put the deployed Worker URL into `assets/js/main.js` and publish the GitHub Pages site.

Do not commit either secret or exported visitor data.
