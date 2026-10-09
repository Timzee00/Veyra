/**
 * Veyra's initial no-code block palette.
 * Presets are data, never arbitrary executable HTML, CSS, or JavaScript.
 */
export const BLOCK_CATEGORIES = ["Essentials","Media","Conversion","Business","Content"] as const;
export type BlockCategory = typeof BLOCK_CATEGORIES[number];
export type BlockType =
 | "section" | "heading" | "paragraph" | "button" | "image" | "divider" | "quote" | "spacer"
 | "gallery" | "video" | "contact_form" | "newsletter_form"
 | "service_list" | "testimonials" | "faq" | "pricing" | "map"
 | "article_list" | "project_list";
export type BlockDefinition = {
 type:BlockType; category:BlockCategory; label:string; description:string;
 allowedFor:readonly ("portfolio"|"business"|"blog"|"store"|"organization")[];
 premium:boolean; requiresIntegration?:string;
};
const ALL=["portfolio","business","blog","store","organization"] as const;
export const BLOCK_LIBRARY:readonly BlockDefinition[]=[
 {type:"section",category:"Essentials",label:"Section",description:"Arrange content into a responsive section",allowedFor:ALL,premium:false},
 {type:"heading",category:"Essentials",label:"Heading",description:"Page titles and structured headings",allowedFor:ALL,premium:false},
 {type:"paragraph",category:"Essentials",label:"Text",description:"Rich text and descriptions",allowedFor:ALL,premium:false},
 {type:"button",category:"Essentials",label:"Button",description:"Call-to-action linking to a page or URL",allowedFor:ALL,premium:false},
 {type:"divider",category:"Essentials",label:"Divider",description:"Separate sections cleanly",allowedFor:ALL,premium:false},
 {type:"spacer",category:"Essentials",label:"Spacer",description:"Control vertical breathing room between elements",allowedFor:ALL,premium:false},
 {type:"image",category:"Media",label:"Image",description:"Optimized image and accessible description",allowedFor:ALL,premium:false},
 {type:"gallery",category:"Media",label:"Gallery",description:"Responsive image galleries",allowedFor:ALL,premium:false},
 {type:"video",category:"Media",label:"Video",description:"Responsive video with poster fallback",allowedFor:ALL,premium:false},
 {type:"contact_form",category:"Conversion",label:"Contact form",description:"Capture enquiries with anti-spam and storage",allowedFor:ALL,premium:false,requiresIntegration:"forms"},
 {type:"newsletter_form",category:"Conversion",label:"Newsletter",description:"Consent-based mailing list signup",allowedFor:ALL,premium:true,requiresIntegration:"email"},
 {type:"service_list",category:"Business",label:"Services",description:"List editable real services and prices",allowedFor:["business","portfolio","organization"],premium:false},
 {type:"testimonials",category:"Business",label:"Testimonials",description:"Show approved customer quotes",allowedFor:["business","portfolio","store","organization"],premium:false},
 {type:"pricing",category:"Business",label:"Pricing",description:"Present clearly labelled offerings",allowedFor:["business","portfolio","store"],premium:false},
 {type:"map",category:"Business",label:"Location",description:"Display an address and opening information",allowedFor:["business","organization","store"],premium:false,requiresIntegration:"maps"},
 {type:"faq",category:"Content",label:"FAQ",description:"Answers to common customer questions",allowedFor:ALL,premium:false},
 {type:"quote",category:"Content",label:"Quote",description:"A genuine quotation or testimonial",allowedFor:ALL,premium:false},
 {type:"article_list",category:"Content",label:"Articles",description:"Publish content collection cards",allowedFor:["blog","business","organization","portfolio"],premium:false,requiresIntegration:"cms"},
 {type:"project_list",category:"Content",label:"Projects",description:"Showcase published portfolio work",allowedFor:["portfolio","business"],premium:false,requiresIntegration:"projects"}
];
export function listBlocks(siteType:BlockDefinition["allowedFor"][number], enabledIntegrations:readonly string[]=[]){
 return BLOCK_LIBRARY.map(b=>({...b,available:b.allowedFor.includes(siteType)&&(!b.requiresIntegration||enabledIntegrations.includes(b.requiresIntegration))}));
}
export type BuilderNode = {
 id:string; type:BlockType; props:Record<string,string|number|boolean|null>;
 children:BuilderNode[];
};
export function validateBuilderTree(nodes:unknown,maxNodes=180):nodes is BuilderNode[] {
 let seen=0;const ids=new Set<string>();
 const visit=(input:unknown,depth:number):boolean=>{
  if(!input||typeof input!=="object"||Array.isArray(input)||depth>8)return false;
  const node=input as Record<string,unknown>;
  if(typeof node.id!=="string"||!/^[-_a-zA-Z0-9]{1,80}$/.test(node.id)||ids.has(node.id))return false;
  ids.add(node.id);seen++;if(seen>maxNodes)return false;
  if(!BLOCK_LIBRARY.some(b=>b.type===node.type))return false;
  if(!node.props||typeof node.props!=="object"||Array.isArray(node.props))return false;
  const entries=Object.entries(node.props);if(entries.length>32)return false;
  if(entries.some(([key,val])=>!/^[-_a-zA-Z0-9]{1,48}$/.test(key)||!["string","boolean","number"].includes(typeof val)&&val!==null||typeof val==="string"&&val.length>5000))return false;
  if(!Array.isArray(node.children)||node.children.length>40)return false;
  return node.children.every(child=>visit(child,depth+1));
 };
 return Array.isArray(nodes)&&nodes.length<=40&&nodes.every(node=>visit(node,0));
}
