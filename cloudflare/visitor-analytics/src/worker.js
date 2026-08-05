import { DASHBOARD_HTML } from "./dashboard.js";

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
};

const BOT_PATTERN = /(?:bot|crawler|spider|slurp|headless|lighthouse|pagespeed|preview)/i;

export default {
  async fetch(request, env) {
    try {
      return await routeRequest(request, env);
    } catch (error) {
      console.error("visitor analytics request failed", error);
      return json({ ok: false, error: "Internal server error" }, 500);
    }
  },

  async scheduled(_controller, env, ctx) {
    const retentionDays = normalizeRetentionDays(env.RETENTION_DAYS);
    const cutoff = Math.floor(Date.now() / 1000) - retentionDays * 86400;
    ctx.waitUntil(
      env.DB.prepare("DELETE FROM visits WHERE visited_at < ?")
        .bind(cutoff)
        .run(),
    );
  },
};

async function routeRequest(request, env) {
  const url = new URL(request.url);

  if (request.method === "OPTIONS") {
    return handleOptions(request, env);
  }

  if (request.method === "GET" && url.pathname === "/health") {
    return json({ ok: true, service: "haoran-visitor-analytics" });
  }

  if (request.method === "POST" && url.pathname === "/collect") {
    return collectVisit(request, env);
  }

  if (request.method === "GET" && url.pathname === "/count") {
    const count = await getTotalPageviews(env.DB);
    return withCors(json({ count }), request, env);
  }

  if (request.method === "GET" && url.pathname === "/login") {
    if (await isAdminAuthorized(request, env)) {
      return Response.redirect(new URL("/analytics-dashboard", url), 302);
    }
    return loginPage(env);
  }

  if (request.method === "POST" && url.pathname === "/login") {
    return handleLogin(request, env);
  }

  if (request.method === "GET" && url.pathname === "/logout") {
    return new Response(null, {
      status: 303,
      headers: {
        location: new URL("/login", url).toString(),
        "set-cookie": "haoran_analytics_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0",
        "cache-control": "no-store",
      },
    });
  }

  if (request.method === "GET" && url.pathname === "/") {
    return Response.redirect(new URL("/analytics-dashboard", url), 302);
  }

  if (request.method === "GET" && url.pathname === "/dashboard") {
    return Response.redirect(new URL("/analytics-dashboard", url), 302);
  }

  if (request.method === "GET" && url.pathname === "/analytics-dashboard") {
    const denial = await requireAdmin(request, env, true);
    if (denial) return denial;

    return new Response(DASHBOARD_HTML, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
        "content-security-policy": "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; img-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
        "referrer-policy": "no-referrer",
        "x-content-type-options": "nosniff",
        "x-frame-options": "DENY",
      },
    });
  }

  if (request.method === "GET" && url.pathname === "/analytics-dashboard/api/summary") {
    const denial = await requireAdmin(request, env);
    if (denial) return denial;
    return getSummary(url, env);
  }

  if (request.method === "GET" && url.pathname === "/analytics-dashboard/api/visitors") {
    const denial = await requireAdmin(request, env);
    if (denial) return denial;
    return getVisitors(url, env);
  }

  return json({ ok: false, error: "Not found" }, 404);
}

async function collectVisit(request, env) {
  if (!isAllowedOrigin(request, env)) {
    return json({ ok: false, error: "Origin not allowed" }, 403);
  }

  const userAgent = truncate(request.headers.get("user-agent") || "Unknown", 300);
  if (isLikelyBot(userAgent)) {
    const count = await getTotalPageviews(env.DB);
    return withCors(json({ ok: true, counted: false, count }, 202), request, env);
  }

  let payload;
  try {
    payload = JSON.parse(await request.text());
  } catch {
    return withCors(json({ ok: false, error: "Invalid JSON" }, 400), request, env);
  }

  const path = sanitizePath(payload?.path);
  if (!path) {
    return withCors(json({ ok: false, error: "Invalid path" }, 400), request, env);
  }

  const ip = request.headers.get("cf-connecting-ip");
  if (!ip) {
    return withCors(json({ ok: false, error: "Visitor IP unavailable" }, 503), request, env);
  }

  const now = Math.floor(Date.now() / 1000);
  const bucket = Math.floor(now / 1800);
  const visitorHash = await hmacHex(`${ip}|${userAgent}`, env.VISITOR_HASH_SECRET);
  const eventKey = await hmacHex(`${visitorHash}|${path}|${bucket}`, env.VISITOR_HASH_SECRET);
  const encryptedIp = await encryptIp(ip, env.IP_ENCRYPTION_KEY);
  const cf = request.cf || {};
  const country = truncate(cf.country || "XX", 8);
  const region = truncate(cf.region || "Unknown", 120);
  const city = truncate(cf.city || "Unknown", 120);
  const referrer = sanitizeReferrer(payload?.referrer, env.ALLOWED_ORIGIN);

  const insert = await env.DB.prepare(
    `INSERT OR IGNORE INTO visits
      (event_key, visited_at, ip_ciphertext, visitor_hash, country, region, city, path, referrer, user_agent)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(eventKey, now, encryptedIp, visitorHash, country, region, city, path, referrer, userAgent)
    .run();

  const counted = Number(insert.meta?.changes || 0) > 0;
  if (counted) {
    await env.DB.prepare(
      `INSERT INTO counters (key, value) VALUES ('total_pageviews', 1)
       ON CONFLICT(key) DO UPDATE SET value = value + 1`,
    ).run();
  }

  const count = await getTotalPageviews(env.DB);
  return withCors(json({ ok: true, counted, count }, counted ? 201 : 200), request, env);
}

async function getSummary(url, env) {
  const days = normalizeDays(url.searchParams.get("days"));
  const since = Math.floor(Date.now() / 1000) - days * 86400;

  const [total, pageviews, uniques, countries, daily, locations] = await Promise.all([
    getTotalPageviews(env.DB),
    env.DB.prepare("SELECT COUNT(*) AS value FROM visits WHERE visited_at >= ?").bind(since).first(),
    env.DB.prepare("SELECT COUNT(DISTINCT visitor_hash) AS value FROM visits WHERE visited_at >= ?").bind(since).first(),
    env.DB.prepare("SELECT COUNT(DISTINCT country) AS value FROM visits WHERE visited_at >= ? AND country != 'XX'").bind(since).first(),
    env.DB.prepare(
      `SELECT date(visited_at, 'unixepoch') AS day, COUNT(*) AS pageviews
       FROM visits WHERE visited_at >= ? GROUP BY day ORDER BY day`,
    ).bind(since).all(),
    env.DB.prepare(
      `SELECT country, city, COUNT(DISTINCT visitor_hash) AS visitors
       FROM visits WHERE visited_at >= ?
       GROUP BY country, city ORDER BY visitors DESC LIMIT 8`,
    ).bind(since).all(),
  ]);

  return json({
    days,
    totalPageviews: total,
    periodPageviews: numberValue(pageviews?.value),
    uniqueVisitors: numberValue(uniques?.value),
    countries: numberValue(countries?.value),
    daily: daily.results || [],
    locations: locations.results || [],
  });
}

async function getVisitors(url, env) {
  const days = normalizeDays(url.searchParams.get("days"));
  const limit = normalizeLimit(url.searchParams.get("limit"));
  const since = Math.floor(Date.now() / 1000) - days * 86400;
  const rows = await env.DB.prepare(
    `SELECT visited_at, ip_ciphertext, country, region, city, path, referrer, user_agent
     FROM visits WHERE visited_at >= ? ORDER BY visited_at DESC LIMIT ?`,
  ).bind(since, limit).all();

  const visitors = await Promise.all((rows.results || []).map(async (row) => ({
    visitedAt: row.visited_at,
    ip: await decryptIp(row.ip_ciphertext, env.IP_ENCRYPTION_KEY),
    country: row.country,
    region: row.region,
    city: row.city,
    path: row.path,
    referrer: row.referrer,
    userAgent: row.user_agent,
  })));

  return json({ days, visitors });
}

async function isAdminAuthorized(request, env) {
  const expected = String(env.ADMIN_EMAIL || "").trim().toLowerCase();
  const accessEmail = String(request.headers.get("cf-access-authenticated-user-email") || "").trim().toLowerCase();
  if (expected && accessEmail === expected) return true;

  const session = readCookie(request.headers.get("cookie"), "haoran_analytics_session");
  if (expected && session && await verifySessionToken(session, expected, env.DASHBOARD_PASSWORD)) return true;

  const credentials = parseBasicAuth(request.headers.get("authorization"));
  const validEmail = credentials && credentials.username.trim().toLowerCase() === expected;
  const validPassword = credentials && await secretsMatch(credentials.password, env.DASHBOARD_PASSWORD);
  return Boolean(expected && validEmail && validPassword);
}

async function requireAdmin(request, env, redirectToLogin = false) {
  if (await isAdminAuthorized(request, env)) return null;
  if (redirectToLogin) return Response.redirect(new URL("/login", request.url), 302);
  return json({ ok: false, error: "Authentication required" }, 401);
}

async function handleLogin(request, env) {
  const contentType = String(request.headers.get("content-type") || "").toLowerCase();
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (!contentType.startsWith("application/x-www-form-urlencoded") || contentLength > 4096) {
    return loginPage(env, "Invalid login request.", 400);
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return loginPage(env, "Invalid login request.", 400);
  }

  const expectedEmail = String(env.ADMIN_EMAIL || "").trim().toLowerCase();
  const email = String(form.get("email") || "").trim().toLowerCase();
  const password = String(form.get("password") || "");
  const valid = expectedEmail && email === expectedEmail && await secretsMatch(password, env.DASHBOARD_PASSWORD);
  if (!valid) return loginPage(env, "Email or password is incorrect.", 401);

  const token = await createSessionToken(expectedEmail, env.DASHBOARD_PASSWORD);
  return new Response(null, {
    status: 303,
    headers: {
      location: new URL("/analytics-dashboard", request.url).toString(),
      "set-cookie": `haoran_analytics_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=43200`,
      "cache-control": "no-store",
    },
  });
}

function loginPage(env, error = "", status = 200) {
  const email = escapeHtml(String(env.ADMIN_EMAIL || ""));
  const errorMarkup = error ? `<p class="error" role="alert">${escapeHtml(error)}</p>` : "";
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Visitor analytics login</title><style>
    :root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#080b12;color:#f7f8fb;font:15px/1.5 Inter,ui-sans-serif,system-ui,sans-serif}.card{width:min(92vw,420px);padding:32px;border:1px solid #242a38;border-radius:18px;background:#111620;box-shadow:0 24px 80px #0008}h1{margin:0 0 8px;font-size:25px}.muted{margin:0 0 24px;color:#9aa4b7}label{display:block;margin:16px 0 7px;font-weight:650}input{width:100%;padding:12px 13px;border:1px solid #343d50;border-radius:10px;background:#0a0e16;color:#fff;font:inherit}input[readonly]{color:#aab3c3}button{width:100%;margin-top:22px;padding:12px;border:0;border-radius:10px;background:#6d8cff;color:#071023;font:700 15px/1 inherit;cursor:pointer}.error{padding:10px 12px;border:1px solid #7a3340;border-radius:9px;background:#351820;color:#ffb8c2}.note{margin:18px 0 0;color:#788399;font-size:12px}</style></head><body><main class="card"><h1>Private visitor analytics</h1><p class="muted">Sign in to view full IP addresses and locations.</p>${errorMarkup}<form method="post" action="/login"><label for="email">Email</label><input id="email" name="email" type="email" value="${email}" readonly autocomplete="username"><label for="password">Dashboard password</label><input id="password" name="password" type="password" required autofocus autocomplete="current-password"><button type="submit">Sign in</button></form><p class="note">Your session expires after 12 hours.</p></main></body></html>`;
  return new Response(html, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
      "referrer-policy": "no-referrer",
      "x-content-type-options": "nosniff",
      "x-frame-options": "DENY",
    },
  });
}

function parseBasicAuth(value) {
  const match = /^Basic\s+(.+)$/i.exec(String(value || ""));
  if (!match) return null;
  try {
    const decoded = atob(match[1]);
    const separator = decoded.indexOf(":");
    if (separator < 1) return null;
    return { username: decoded.slice(0, separator), password: decoded.slice(separator + 1) };
  } catch {
    return null;
  }
}

async function secretsMatch(actual, expected) {
  if (!actual || !expected) return false;
  const encoder = new TextEncoder();
  const [actualHash, expectedHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(String(actual))),
    crypto.subtle.digest("SHA-256", encoder.encode(String(expected))),
  ]);
  const left = new Uint8Array(actualHash);
  const right = new Uint8Array(expectedHash);
  let difference = left.length ^ right.length;
  for (let index = 0; index < left.length; index += 1) difference |= left[index] ^ right[index];
  return difference === 0;
}

async function createSessionToken(email, secret) {
  const payload = toBase64Url(new TextEncoder().encode(JSON.stringify({
    email,
    expires: Math.floor(Date.now() / 1000) + 43200,
  })));
  const signature = await signSessionPayload(payload, secret);
  return `${payload}.${signature}`;
}

async function verifySessionToken(token, expectedEmail, secret) {
  try {
    const [payload, signature, extra] = String(token).split(".");
    if (!payload || !signature || extra || !secret) return false;
    const key = await importSessionKey(secret, ["verify"]);
    const validSignature = await crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64Url(signature),
      new TextEncoder().encode(payload),
    );
    if (!validSignature) return false;
    const data = JSON.parse(new TextDecoder().decode(fromBase64Url(payload)));
    return data.email === expectedEmail && Number(data.expires) > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

async function signSessionPayload(payload, secret) {
  const key = await importSessionKey(secret, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return toBase64Url(new Uint8Array(signature));
}

function importSessionKey(secret, usages) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(String(secret || "")),
    { name: "HMAC", hash: "SHA-256" },
    false,
    usages,
  );
}

function readCookie(header, name) {
  for (const part of String(header || "").split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return value.join("=");
  }
  return "";
}

function toBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value) {
  const base64 = String(value).replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

function handleOptions(request, env) {
  if (!isAllowedOrigin(request, env)) {
    return new Response(null, { status: 403 });
  }
  return withCors(new Response(null, { status: 204 }), request, env);
}

function isAllowedOrigin(request, env) {
  return request.headers.get("origin") === String(env.ALLOWED_ORIGIN || "").replace(/\/$/, "");
}

function withCors(response, request, env) {
  if (!isAllowedOrigin(request, env)) return response;
  const headers = new Headers(response.headers);
  headers.set("access-control-allow-origin", request.headers.get("origin"));
  headers.set("access-control-allow-methods", "GET, POST, OPTIONS");
  headers.set("access-control-allow-headers", "content-type");
  headers.set("access-control-max-age", "86400");
  headers.set("vary", "Origin");
  return new Response(response.body, { status: response.status, headers });
}

async function getTotalPageviews(db) {
  const row = await db.prepare("SELECT value FROM counters WHERE key = 'total_pageviews'").first();
  return numberValue(row?.value);
}

function json(value, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: JSON_HEADERS });
}

export function normalizeDays(value) {
  const parsed = Number(value);
  return [7, 30, 90].includes(parsed) ? parsed : 30;
}

export function normalizeLimit(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return 50;
  return Math.min(100, Math.max(1, parsed));
}

export function normalizeRetentionDays(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return 90;
  return Math.min(365, Math.max(7, parsed));
}

export function sanitizePath(value) {
  if (typeof value !== "string" || !value.startsWith("/")) return null;
  return truncate(value.replace(/[\u0000-\u001f\u007f]/g, ""), 512);
}

export function sanitizeReferrer(value, allowedOrigin) {
  if (typeof value !== "string" || !value) return "";
  try {
    const url = new URL(value);
    const allowedHost = new URL(allowedOrigin).host;
    if (url.host === allowedHost) return truncate(`${url.pathname}${url.search}`, 512);
    return truncate(url.origin, 200);
  } catch {
    return "";
  }
}

export function isLikelyBot(userAgent) {
  return !userAgent || BOT_PATTERN.test(userAgent);
}

function truncate(value, maxLength) {
  return String(value || "").slice(0, maxLength);
}

function numberValue(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

async function hmacHex(value, secret) {
  if (!secret) throw new Error("VISITOR_HASH_SECRET is not configured");
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function encryptIp(ip, encodedKey) {
  const key = await importEncryptionKey(encodedKey, ["encrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(ip),
  );
  return `${toBase64(iv)}.${toBase64(new Uint8Array(ciphertext))}`;
}

async function decryptIp(value, encodedKey) {
  const [ivText, ciphertextText] = String(value || "").split(".");
  if (!ivText || !ciphertextText) return "Unavailable";
  const key = await importEncryptionKey(encodedKey, ["decrypt"]);
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromBase64(ivText) },
    key,
    fromBase64(ciphertextText),
  );
  return new TextDecoder().decode(plaintext);
}

async function importEncryptionKey(encodedKey, usages) {
  if (!encodedKey) throw new Error("IP_ENCRYPTION_KEY is not configured");
  const bytes = fromBase64(encodedKey);
  if (bytes.byteLength !== 32) throw new Error("IP_ENCRYPTION_KEY must contain 32 bytes");
  return crypto.subtle.importKey("raw", bytes, "AES-GCM", false, usages);
}

function toBase64(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value) {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}
