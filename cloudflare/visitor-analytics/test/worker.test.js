import assert from "node:assert/strict";
import test from "node:test";
import {
  default as worker,
  isLikelyBot,
  normalizeDays,
  normalizeLimit,
  normalizeRetentionDays,
  sanitizePath,
  sanitizeReferrer,
} from "../src/worker.js";

const authEnv = {
  ADMIN_EMAIL: "haoran.leighton.liu@outlook.com",
  DASHBOARD_PASSWORD: "test-only-password",
};

test("normalizes dashboard date ranges", () => {
  assert.equal(normalizeDays("7"), 7);
  assert.equal(normalizeDays("90"), 90);
  assert.equal(normalizeDays("365"), 30);
});

test("bounds visitor list limits", () => {
  assert.equal(normalizeLimit("0"), 1);
  assert.equal(normalizeLimit("500"), 100);
  assert.equal(normalizeLimit("garbage"), 50);
});

test("bounds retention days", () => {
  assert.equal(normalizeRetentionDays("2"), 7);
  assert.equal(normalizeRetentionDays("90"), 90);
  assert.equal(normalizeRetentionDays("999"), 365);
});

test("accepts safe paths and rejects invalid values", () => {
  assert.equal(sanitizePath("/cv.html?from=home"), "/cv.html?from=home");
  assert.equal(sanitizePath("https://example.com"), null);
  assert.equal(sanitizePath(null), null);
});

test("keeps same-site referrer paths and reduces external referrers to origins", () => {
  const origin = "https://haoran-l.github.io";
  assert.equal(sanitizeReferrer("https://haoran-l.github.io/cv.html?q=1", origin), "/cv.html?q=1");
  assert.equal(sanitizeReferrer("https://www.google.com/search?q=haoran", origin), "https://www.google.com");
  assert.equal(sanitizeReferrer("not a url", origin), "");
});

test("identifies common automated user agents", () => {
  assert.equal(isLikelyBot("Mozilla/5.0 Chrome/140 Safari/537.36"), false);
  assert.equal(isLikelyBot("Googlebot/2.1"), true);
  assert.equal(isLikelyBot("HeadlessChrome/140"), true);
});

test("creates an HttpOnly dashboard session after a valid login", async () => {
  const body = new URLSearchParams({
    email: authEnv.ADMIN_EMAIL,
    password: authEnv.DASHBOARD_PASSWORD,
  });
  const response = await worker.fetch(new Request("https://analytics.example/login", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  }), authEnv);

  assert.equal(response.status, 303);
  assert.match(response.headers.get("set-cookie"), /^haoran_analytics_session=.+; Path=\/; HttpOnly; Secure; SameSite=Strict;/);
});

test("rejects an incorrect dashboard password", async () => {
  const body = new URLSearchParams({
    email: authEnv.ADMIN_EMAIL,
    password: "incorrect",
  });
  const response = await worker.fetch(new Request("https://analytics.example/login", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  }), authEnv);

  assert.equal(response.status, 401);
  assert.equal(response.headers.has("set-cookie"), false);
});
