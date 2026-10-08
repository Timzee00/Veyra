# Veyra Builder release gates (manual, no GitHub Actions billing)

## Status
Draft PR only. The multi-page builder is **not** production-approved. Code commits do not imply database migrations ran or any site was deployed.

## Check out and validate
From a developer machine with Node.js 22+ and the repository checked out on `feature/creator-experience-scale-foundation`:

```bash
npm ci
npm run test:builder
npm run typecheck
npm run lint
npm run build
```

Do not merge if any command fails. Keep provider keys only in deployment environment variables. Don't commit `.env` files.

## Database staging
Provision or identify a dedicated **Veyra staging** Supabase database (not an unrelated Timzee Corp or Blog database).
Apply schema migrations in the repository's intended sequence, then verify `0017_site_design_drafts.sql`, `0018_page_builder_content.sql`, and `0019_multi_page_builder.sql` on staging.

### Required security scenarios
1. Owner A can create and edit their own private page.
2. Owner B cannot read, edit, delete, publish, or unpublish A's page.
3. Anonymous visitor cannot read `site_pages.draft_blocks` or any unpublished content.
4. Anonymous visitor can read a published page only when its creator is active and its Veyra site is published.
5. A user cannot change a page's `creator_id`.
6. Concurrent inserts cannot exceed 20 pages; test two simultaneous requests at the limit.
7. Publishing with stale `expected_revision` fails, leaving live content intact.
8. Publishing placeholder-only, blank, invalid URL or malformed JSON content fails server-side.
9. Changing page slug doesn't leak unpublished content or redirect incorrectly; verify duplicate slug errors.
10. Unpublishing makes the public URL unavailable while the owner still has access to the draft.

Run Supabase security/performance advisors and inspect the exposed API grants and RLS policies. Re-evaluate the legacy page composer and old visibility policies before release.

## Browser and usability
- Create homepage and two internal pages, preview widths, edit links, FAQs, quotes, images.
- Reorder with drag and keyboard-accessible arrows; duplicate and undo/redo.
- Open a live page from a public website; confirm link navigation, SEO metadata and accurate footer.
- Confirm changes remain private until explicit publish, including after page refresh.
- Test tab navigation, visible focus, screen readers, contrast, responsive text and reduced motion.
- Test signing out and signing back in, poor network, simultaneous editing and error recovery.
- Verify analytics and page-health checks don't fabricate data.
- Check a realistic image-heavy site for performance and layout shift on slow mobile networks.

## Release sequencing
1. Ensure build and unit test pass.
2. Apply migrations to a dedicated staging environment and run owner/public RLS tests.
3. Deploy **preview**, not production; inspect logs and validate pages and mobile journeys.
4. Resolve accessibility/security/performance failures.
5. Merge reviewed PR, apply production migrations in a controlled maintenance window, verify and monitor.
6. Record deployment commit and rollback steps.

## Not currently delivered
Standalone online-store operations, medical patient data handling, working custom-domain integration, subscriptions/payment entitlements, paid AI site generation, agency team permissions, email marketing, full CMS, advanced animation timeline, complete 1-million-site load testing. They remain separately gated development milestones.

Veyra — Powered by Timzee Corp.
