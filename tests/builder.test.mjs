import test from "node:test";
import assert from "node:assert/strict";
import { createPageBlock, makeSectionKit, pageDocumentIsValid, safeSiteUrl, SECTION_KITS } from "../src/platform/builder/page-model.ts";

test("safe links allow internal routes and HTTPS, never script, protocol-relative, or insecure URLs", () => {
  for (const url of ["/", "/contact", "/pages/about", "https://example.com/path?q=1"])
    assert.equal(safeSiteUrl(url), true, url);
  for (const url of ["javascript:alert(1)", "//evil.example", "http://insecure.example", "data:text/html,evil", "/bad path"])
    assert.equal(safeSiteUrl(url), false, url);
});

test("blocks and section kits have unique IDs and pass structural validation", () => {
  const blocks = makeSectionKit(SECTION_KITS[0].blocks);
  assert.equal(pageDocumentIsValid(blocks), true);
  assert.equal(new Set(blocks.map(item => item.id)).size, blocks.length);
  assert.equal(createPageBlock("faq").type, "faq");
});

test("rejects invalid, excessive, duplicate, or nested blocks", () => {
  const first = createPageBlock("heading");
  assert.equal(pageDocumentIsValid(null), false);
  assert.equal(pageDocumentIsValid({}), false);
  assert.equal(pageDocumentIsValid(Array.from({length:81},()=>createPageBlock("divider"))), false);
  assert.equal(pageDocumentIsValid([first, {...first}]), false);
  assert.equal(pageDocumentIsValid([{...first,children:[createPageBlock("paragraph")]}]), false);
  assert.equal(pageDocumentIsValid([{...first,type:"custom_html"}]), false);
});

test("rejects dangerous props and oversized content", () => {
  const image = createPageBlock("image");
  assert.equal(pageDocumentIsValid([{...image,props:{...image.props,url:"javascript:alert(1)"}}]), false);
  assert.equal(pageDocumentIsValid([{...image,props:{...image.props,alt:"a".repeat(221)}}]), false);
  assert.equal(pageDocumentIsValid([{...createPageBlock("paragraph"),props:{text:"x".repeat(4001)}}]), false);
  assert.equal(pageDocumentIsValid([{...createPageBlock("paragraph"),props:{text:"safe",rawHtml:"<script>x</script>"}}]), false);
});

test("supports each permitted block type", () => {
  const all=["heading","paragraph","button","divider","image","quote","faq","spacer"].map(type=>createPageBlock(type));
  assert.equal(pageDocumentIsValid(all), true);
});
