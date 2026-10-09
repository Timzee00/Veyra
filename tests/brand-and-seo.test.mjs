import test from "node:test";
import assert from "node:assert/strict";
import { resolveSiteOrigin, shouldAvoidIndexing } from "../src/platform/seo/site-config.ts";
import { VEYRA } from "../src/platform/brand/identity.ts";

test("brand identity uses the approved name, tagline and company", () => {
  assert.equal(VEYRA.wordmark, "VEYRA");
  assert.equal(VEYRA.tagline, "Imagine it. Build it. Own it.");
  assert.equal(VEYRA.philosophy, "Vision Evolved. Your Reach Amplified.");
  assert.equal(VEYRA.company, "Timzee Corp");
});

test("public origin chooses HTTPS and ignores malformed or credential URLs", () => {
  assert.equal(resolveSiteOrigin({ NEXT_PUBLIC_SITE_URL: "https://example.com/path?q=1" }), "https://example.com");
  assert.equal(resolveSiteOrigin({ NEXT_PUBLIC_APP_URL: "http://localhost:3000", URL: "https://veyra-staging.netlify.app" }), "https://veyra-staging.netlify.app");
  assert.equal(resolveSiteOrigin({ NEXT_PUBLIC_SITE_URL: "https://user:pass@example.com", URL: "https://staging.example.com" }), "https://staging.example.com");
  assert.equal(resolveSiteOrigin({ NEXT_PUBLIC_APP_URL: "http://localhost:3000" }), "http://localhost:3000");
});

test("staging indexing requires a deliberate opt in on a real URL", () => {
  assert.equal(shouldAvoidIndexing({ VEYRA_NOINDEX: "true", URL: "https://staging.example.com" }), true);
  assert.equal(shouldAvoidIndexing({ NEXT_PUBLIC_SITE_URL: "https://example.com" }), false);
  assert.equal(shouldAvoidIndexing({}), true);
});
