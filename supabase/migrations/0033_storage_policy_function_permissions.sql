-- Allow authenticated storage RLS policies to resolve app helpers.
-- USAGE alone does not grant function execution or table access.
-- Privileged triggers remain explicitly revoked from authenticated callers.
grant usage on schema app to authenticated;
revoke all on function app.creator_links_quota_guard() from public,anon,authenticated;
revoke all on function app.guard_section_library_insert() from public,anon,authenticated;
revoke all on function app.record_site_page_publication() from public,anon,authenticated;
-- The upload authorization helper is callable by authenticated sessions only.
revoke all on function app.veyra_creator_image_upload_allowed(text) from public,anon,authenticated;
grant execute on function app.veyra_creator_image_upload_allowed(text) to authenticated;
