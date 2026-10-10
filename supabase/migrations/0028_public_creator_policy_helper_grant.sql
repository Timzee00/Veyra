-- The active/published creator status helper is used INSIDE public-facing
-- RLS policies. Those policies require callers to have EXECUTE privilege.
-- Its return value is only whether a creator has an active published site.
grant execute on function public.is_public_creator(uuid) to anon, authenticated;
