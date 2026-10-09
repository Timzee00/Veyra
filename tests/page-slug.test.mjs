import test from "node:test";
import assert from "node:assert/strict";
import { makeUniquePageSlug, pageSlugIsValid } from "../src/platform/builder/page-slug.ts";

test("page-slug generator handles numeric, accented and non-Latin titles", () => {
 for (const title of ["2026 Pricing", "Éléphant résumé", "服務項目", "123", "###"]) {
  const slug=makeUniquePageSlug(title, "abc12345");
  assert.ok(pageSlugIsValid(slug), `${title} => ${slug}`);
  assert.ok(slug.endsWith("-abc12345"));
 }
 assert.match(makeUniquePageSlug("2026 Services","def56789"),/^page-2026-services-/);
});

test("safe slugs enforce the database length, reserved names and initial letter", () => {
 for (const invalid of ["", "4services", "pages", "post", "api", "project", "opengraph-image", "About", "spaces here", "x".repeat(64)]) {
  assert.equal(pageSlugIsValid(invalid), false, invalid);
 }
 for (const valid of ["about", "contact", "services-2026", "page-3"]) assert.equal(pageSlugIsValid(valid),true);
 const long=makeUniquePageSlug("a".repeat(200),"12345678");
 assert.ok(long.length<=63);
 assert.throws(()=>makeUniquePageSlug("Hello","!!!"));
});

test("generated addresses are distinct for different random suffixes", () => {
 assert.notEqual(makeUniquePageSlug("Services","a1b2c3d4"),makeUniquePageSlug("Services","d4c3b2a1"));
});
