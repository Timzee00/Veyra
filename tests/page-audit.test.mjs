import test from "node:test";
import assert from "node:assert/strict";
import { auditPage } from "../src/platform/builder/page-audit.ts";
import { createPageBlock } from "../src/platform/builder/page-model.ts";

test("audit flags missing metadata, empty content and invalid documents", () => {
 const result=auditPage("","",[]);
 assert.ok(result.errors.some(issue=>issue.includes("title")));
 assert.ok(result.recommendations.some(issue=>issue.includes("content")));
 assert.ok(auditPage("Test","",[{bad:"block"}]).errors.some(issue=>issue.includes("unsupported")));
});

test("audit catches placeholder copy and missing button labels", () => {
 const heading=createPageBlock("heading");
 const button=createPageBlock("button");
 button.props.text="";
 const result=auditPage("Hello","Useful description goes here.",[heading,button]);
 assert.ok(result.errors.some(issue=>issue.includes("example heading")));
 assert.ok(result.errors.some(issue=>issue.includes("Label each button")));
});

test("audit recommends informative image descriptions and specific CTAs", () => {
 const image=createPageBlock("image"); image.props.url="https://example.com/image.jpg";image.props.alt="image";
 const button=createPageBlock("button");button.props.text="Click here";
 const result=auditPage("Gallery","A description that explains the website and what a visitor should find.",[image,button]);
 assert.ok(result.recommendations.some(issue=>issue.includes("image")));
 assert.ok(result.recommendations.some(issue=>issue.includes("button")));
});
