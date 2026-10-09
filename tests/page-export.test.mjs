import test from "node:test";
import assert from "node:assert/strict";
import { createPageBackup, PAGE_BACKUP_FORMAT } from "../src/platform/exports/page-export.ts";

const heading = [{ id: "h1", type: "heading", props: { text: "A live homepage" }, children: [] }];
const draft = {
  id: "page-1", title: "About", slug: "about",
  seo_description: "About our team", draft_blocks: heading,
  revision: 2, updated_at: "2026-10-09T12:00:00.000Z",
};
const published = {
  page_id: "page-1", title: "About", slug: "about",
  seo_description: "About our team", blocks: heading,
  revision: 1, published_at: "2026-10-09T11:00:00.000Z",
};

test("portable page backup includes both current draft and live snapshot", () => {
  const json = createPageBackup("timzeestudio", [draft], [published], "2026-10-09T13:00:00.000Z");
  const result = JSON.parse(json);
  assert.equal(result.format, PAGE_BACKUP_FORMAT);
  assert.equal(result.scope, "website_pages_only");
  assert.equal(result.pages.length, 1);
  assert.equal(result.publications[0].revision, 1);
  assert.equal(result.pages[0].revision, 2);
  assert.equal(result.creator_handle, "timzeestudio");
  assert.ok(!json.includes("service_role"));
});

test("empty websites can be backed up without inventing content", () => {
  const result = JSON.parse(createPageBackup("creator_x", [], []));
  assert.deepEqual(result.pages, []);
  assert.deepEqual(result.publications, []);
});

test("bad or incomplete page data fails closed", () => {
  assert.throws(() => createPageBackup("bad handle", [draft], []));
  assert.throws(() => createPageBackup("timzeestudio", [draft, draft], []));
  assert.throws(() => createPageBackup("timzeestudio", [{...draft,draft_blocks:[{...heading[0],type:"script"}]}], []));
  assert.throws(() => createPageBackup("timzeestudio", [draft], [{...published,page_id:"nonexistent"}]));
  assert.throws(() => createPageBackup("timzeestudio", [draft], [published,published]));
  assert.throws(() => createPageBackup("timzeestudio", [draft], [], "not-a-time"));
});
