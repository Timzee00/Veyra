import test from "node:test";
import assert from "node:assert/strict";
import { safeInternalRedirect } from "../src/platform/auth/redirect.ts";

test("login callbacks preserve genuine application destinations", () => {
  assert.equal(safeInternalRedirect("/dashboard"), "/dashboard");
  assert.equal(safeInternalRedirect("/dashboard/pages?tab=drafts"), "/dashboard/pages?tab=drafts");
  assert.equal(safeInternalRedirect("/reset-password"), "/reset-password");
  assert.equal(safeInternalRedirect("/dashboard#latest"), "/dashboard#latest");
});

test("login callback rejects external redirects, control characters and backslashes", () => {
  for (const candidate of [
    null, undefined, "", "https://example.com", "javascript:alert(1)",
    "//evil.example", "///evil.example", "/\\evil.example",
    "/\n/evil.example", "/\r/evil.example", "/\u0000",
  ]) {
    assert.equal(safeInternalRedirect(candidate), "/dashboard", String(candidate));
  }
});

test("redirects cannot change the origin of the real application", () => {
  for (const candidate of [
    "/dashboard?next=https://evil.example",
    "/%2F%2Fevil.example",
    "/dashboard%3Fcontinue=%2F%2Fevil.example",
  ]) {
    const path = safeInternalRedirect(candidate);
    const parsed = new URL(path, "https://veyra.example");
    assert.equal(parsed.origin, "https://veyra.example");
  }
});
