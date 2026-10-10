import test from "node:test";
import assert from "node:assert/strict";
import { exportSectionBundle, importSectionBundle } from "../src/platform/builder/section-bundle.ts";
import { createPageBlock, pageDocumentIsValid } from "../src/platform/builder/page-model.ts";

test("section bundle roundtrip creates independent unique IDs", () => {
 const source=[createPageBlock("heading"),createPageBlock("paragraph")];
 const exported=exportSectionBundle(source);
 let next=0;
 const imported=importSectionBundle(exported,()=>`fresh_${++next}`);
 assert.equal(pageDocumentIsValid(imported),true);
 assert.deepEqual(imported.map(b=>b.type),source.map(b=>b.type));
 assert.notEqual(imported[0].id,source[0].id);
 imported[0].props.text="changed";
 assert.notEqual(imported[0].props.text,source[0].props.text);
});

test("rejects invalid, empty or executable section formats",()=>{
 assert.throws(()=>importSectionBundle("not JSON",()=> "newid"));
 assert.throws(()=>importSectionBundle(JSON.stringify({format:"veyra.sections.v1",blocks:[]}),()=> "newid"));
 assert.throws(()=>importSectionBundle(JSON.stringify({format:"veyra.sections.v1",blocks:[{id:"x",type:"script",props:{text:"alert(1)"},children:[]}]}),()=> "newid"));
 assert.throws(()=>importSectionBundle(JSON.stringify({format:"veyra.sections.v1",blocks:[createPageBlock("heading")],extra:true}),()=> "newid"));
 assert.throws(()=>importSectionBundle(JSON.stringify({format:"veyra.sections.v1",blocks:[createPageBlock("heading")]}),()=> " "));
});
