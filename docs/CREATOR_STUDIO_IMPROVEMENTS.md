# Creator Studio improvement pass

## What was implemented

This pass responds to feedback that the first builder relied on up/down lists, creator images could not be uploaded inside page workflows, and visible labels were too small.

### Direct-manipulation builder

- Drag an element from the left palette onto a standalone page at the desired block position on desktop.
- Tap a palette element to add on touch screens.
- Hold and drag a block's **Drag** handle on desktop or touch devices to reorder it directly in the page canvas.
- Select a block and edit its actual content in the inspector; use Undo/Redo and private drafts.
- Set alignment, width (full/medium/narrow), and background emphasis (plain/soft/accent) for standalone page elements.
- Homepage composer now also uses the direct-drag preview and palette drops, while retaining the existing stricter four-type homepage schema.
- Dragging moves **vertical flow blocks**; this is not yet a freely positioned desktop design surface. Nested grid layouts, arbitrary overlap, resize handles, typography per block, and complex CSS layout presets require a dedicated second-generation layout model and responsive constraints.

### Creator image library

- Route: `/dashboard/assets` (signed-in creator)
- Reusable image selector in the page inspector, plus an upload/choose control in Creator Profile.
- Photos are attached to the creator's UUID, with 5 MB per-file, restricted media types and owner-gated storage writes.
- A server-side 100-image storage object quota protects against unlimited uploading.
- **Important:** `veyra-images` is a PUBLIC retrieval bucket for website images. Image URLs can be opened by anyone even if the website page is still a private draft. Warn creators; never accept sensitive documents as "photos". Existing project-media remains a separate private signed-URL bucket.

### Link hub

- Route: `/dashboard/links`: authenticated authoring
- Public route: `/links/[handle]`
- Maximum 24 links per creator, with owner-only writes, safe HTTPS URLs, visible/hidden controls, inline editing, and ordering.
- A link hub remains hidden until the creator site is published. It inherits the creator's display name, bio and chosen profile picture.
- Public links open in a new tab with appropriate link rel attributes.

### Typography

- Reviewed CSS declarations below 11 pixels across the original major stylesheets and raised them to 11px minimum.
- Larger headings and normal paragraph sizes are preserved.

## Manual acceptance still required

- Signed-in mouse drag across blocks, touch pointer reorder, palette drag at first/middle/last position, keyboard move controls.
- Upload and view JPEG, PNG, WebP, GIF; reject invalid or oversized uploads.
- Try 100-image quota and cleanup in a disposable test creator account.
- Change avatar, then verify it in public profile, discovery and `/links/[handle]`.
- Create 2+ links, reorder, hide one, check public access as signed-out viewer. Confirm drafts and suspended accounts cannot publish links.
- Visually test 320px, 390px, 768px, 1440px layouts and accessibility at 200% browser zoom.
- Before inviting customers, finish production build, browser checks, error handling, privacy policy and abuse monitoring.

## Database

Required new migrations are `0030_creator_images_and_link_hub.sql`, `0031_page_visual_block_props.sql`, and `0032_creator_image_upload_quota.sql` (already applied to Veyra's dedicated Supabase staging project).

All database smoke tests under `tests/db/` use a rollback-only transaction; they must run against staging and not a populated production database.

Veyra — Imagine it. Build it. Own it. — Powered by Timzee Corp.
