-- Harden publicly exposed Veyra database tables and trigger functions.
alter table public.verification_applications enable row level security;
alter table public.templates enable row level security;
alter table public.plans enable row level security;
alter table public.plan_entitlements enable row level security;
alter table public.features enable row level security;
alter table public.creator_subscriptions enable row level security;
alter table public.roles enable row level security;
alter table public.role_permissions enable row level security;
alter table public.permissions enable row level security;

create policy "public template catalog read" on public.templates
 for select to anon, authenticated using (active = true);
create policy "public features read" on public.features
 for select to anon, authenticated using (active = true);
create policy "public plans read" on public.plans
 for select to anon, authenticated using (active = true);
create policy "public plan entitlements read" on public.plan_entitlements
 for select to anon, authenticated using (exists(
 select 1 from public.plans p where p.id = plan_id and p.active = true
));
create policy "owner subscription read" on public.creator_subscriptions
 for select to authenticated using (app.current_user_owns_creator(creator_id));
create policy "owner verification application read" on public.verification_applications
 for select to authenticated using (app.current_user_owns_creator(creator_id));
create policy "owner verification application insert" on public.verification_applications
 for insert to authenticated with check (app.current_user_owns_creator(creator_id));

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.veyra_guard_site_page() from public, anon, authenticated;
revoke execute on function public.create_creator_account(text,text,text) from public, anon;
revoke execute on function public.is_public_creator(uuid) from public, anon, authenticated;
grant execute on function public.create_creator_account(text,text,text) to authenticated;
