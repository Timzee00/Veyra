# Veyra Builder 2.0 — implementation architecture

Research: Wix Studio responsive breakpoints, on-canvas grid/flex editing and motion; Webflow reusable GSAP interactions; Shopify section/block hierarchy, dynamic sources and app blocks.

## Product principles
- Beginner mode: guided tasks, preset sections, plain-language settings, safe responsive defaults, launch checklist.
- Advanced mode: layers, style inspector, breakpoints, reusable components, collections, interactions and site-wide tokens.
- Store every website independently from its starter template; changing templates never deletes content.
- Agency mode: workspaces and per-site collaborator permissions, owner approval and clean handoff.
- Editor previews private drafts only. Public runtime consumes separately approved published snapshot.
- Accessibility, performance and reduced motion are product features, not optional afterthoughts.

## Content model (versioned JSON AST, validated on server)
Site = {id,owner_workspace_id,type,theme_tokens,pages,domains,publication}.
Page = {id,slug,title,seo,visibility,root_section_ids}.
Node = {id,type,children,props,styles,breakpoint_overrides,interactions,bindings,hidden}.
Node types first: section,container,grid,stack,text,heading,image,button,gallery,video,form,divider,spacer,card.
Later: testimonials,faq,booking,products,collections,blog,staff,map,embed,licensed third-party app slot.

All node types are allowlisted; type-specific JSON schemas bound maximum nesting, node count, asset bytes, colors, URLs and style property sets. No arbitrary HTML or script execution in public site rendering or AI output.

## Editor modules
- Top: site switcher, page selector, viewport controls, undo/redo, save indicator, preview, publish.
- Left: Pages, Add, Layers, Assets, CMS, Components.
- Canvas: selectable elements, keyboard support, reorder/move handles, snapping, guides, drop targets, context menu.
- Right inspector: content, layout, spacing, typography, color, backgrounds, effects, accessibility, interactions, responsive overrides.
- Mobile authoring: component-list-first editing instead of trying to replicate a tiny desktop IDE.
- Section library grouped by intent (portfolio, business, store, healthcare informational, blog), never feature-invalid blocks.
- Keyboard: escape selection, undo/redo, move section, navigation and accessible labels.
- Draft autosave debounce with optimistic concurrency, offline conflict warning, revision history and restore.

## Responsive behavior
- Auto layout based on CSS grid/flex and constraints (min/max, wrap, gap, clamp).
- Inheritance: base desktop -> tablet -> mobile, with explicit overrides; a content edit applies across breakpoints.
- Preview real page width, not device chrome simulation alone.
- Detect overflow, minimum tap targets, contrast and visible focus.

## Motion engine
- Trigger: load, enter viewport, hover, click, scroll progress.
- Presets: fade, rise, scale, reveal, marquee and subtle parallax.
- Per-node duration/easing/delay caps, animation budget, no motion for essential information.
- respect prefers-reduced-motion and avoid layout-shifting transform/opacity where possible.
- Block external JS, third-party embed execution in editor by default.

## Publishing pipeline
- Draft revisions -> server validation -> screenshot/SEO/accessibility diagnostics -> publish request -> immutable version -> CDN invalidate -> public runtime -> rollback.
- Verify ownership, quotas, paid entitlements and collaborators on server and RLS.
- Upfront warnings for broken links, missing media, forms without destinations, mobile overflow and domains without HTTPS.
- Webhook/provider operations async with idempotent job queue, retries and status tracking.
- Domain configuration is paid and gated server-side with ownership checks and HTTPS verification; keep free site URL.

## Typed dynamic sources
- CMS collections and repeaters, bounded queries, cursor pagination, per-site permissions.
- Integrations are capability-sandboxed; store secrets server-side, never in node JSON.
- E-commerce and clinical workflows require separately tested product modules; a generic site template must not claim operational features.

## AI Architect (paid)
- User prompt -> structured plan -> feature feasibility labeling -> estimated credit consumption -> owner approval -> safe draft nodes.
- AI only chooses from supported allowlisted nodes / property schemas; no autonomous production publish or billing changes.
- Versioned proposals, audit logs, preflight validations, clear errors and rollback.

## Performance and reliability
- CDN static published snapshots where appropriate, asset transform/cache, lazy media, thumbnails and image metadata.
- Limits by site and plan; isolates tenants through DB RLS and service authorization.
- Load tests with 1M-site dataset and realistic public visits / editing concurrency before any scale claims.
- Local tests do not require GitHub Actions: npm lint/typecheck/build, database migration staging, Cypress/Playwright tests, axe and Lighthouse.

## Rollout
1. Schema and renderer for section AST + initial page editor.
2. Canvas selection, block editing, reorder, responsive preview, undo/redo.
3. Revision-safe persistence, publish/rollback.
4. Theme tokens, breakpoint overrides and section library.
5. CMS and dynamic components, interaction engine.
6. Agency workspaces, verified paid domains, paid AI plan-to-draft, specialist modules.

## Definition of done
Create a multi-page portfolio and local-business website using only visual tools on desktop/mobile; each survives reload, preview, publish, rollback and template swap; authorized collaborators cannot cross tenants; public pages pass performance, accessibility, security and browser tests.

Veyra — Powered by Timzee Corp.
