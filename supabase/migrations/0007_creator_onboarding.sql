-- Creator onboarding and first-party authenticated access.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(coalesce(new.email, 'creator'), '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.creator_accounts enable row level security;
alter table public.creator_sites enable row level security;
alter table public.creator_memberships enable row level security;

create policy "Users can read their profile"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

create policy "Users can update their profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "Owners can read creator accounts"
  on public.creator_accounts for select
  to authenticated
  using (owner_user_id = auth.uid());

create policy "Owners can create creator accounts"
  on public.creator_accounts for insert
  to authenticated
  with check (owner_user_id = auth.uid());

create policy "Owners can update creator accounts"
  on public.creator_accounts for update
  to authenticated
  using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

create policy "Members can read memberships"
  on public.creator_memberships for select
  to authenticated
  using (user_id = auth.uid());

create policy "Owners can create their membership"
  on public.creator_memberships for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Owners can read their sites"
  on public.creator_sites for select
  to authenticated
  using (
    exists (
      select 1 from public.creator_accounts c
      where c.id = creator_id and c.owner_user_id = auth.uid()
    )
  );

create policy "Owners can create their sites"
  on public.creator_sites for insert
  to authenticated
  with check (
    exists (
      select 1 from public.creator_accounts c
      where c.id = creator_id and c.owner_user_id = auth.uid()
    )
  );

create policy "Owners can update their sites"
  on public.creator_sites for update
  to authenticated
  using (
    exists (
      select 1 from public.creator_accounts c
      where c.id = creator_id and c.owner_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.creator_accounts c
      where c.id = creator_id and c.owner_user_id = auth.uid()
    )
  );

create or replace function public.create_creator_account(
  p_handle text,
  p_display_name text,
  p_bio text default null
)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  creator_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if p_handle !~ '^[a-z0-9][a-z0-9_-]{2,31}$' then
    raise exception 'Invalid handle';
  end if;

  insert into public.creator_accounts (owner_user_id, handle, display_name, bio)
  values (auth.uid(), lower(trim(p_handle)), trim(p_display_name), nullif(trim(p_bio), ''))
  returning id into creator_id;

  insert into public.creator_memberships (creator_id, user_id, role_id)
  values (creator_id, auth.uid(), 'creator_owner');

  insert into public.creator_sites (creator_id, title)
  values (creator_id, trim(p_display_name));

  return creator_id;
end;
$$;

revoke all on function public.create_creator_account(text, text, text) from public;
grant execute on function public.create_creator_account(text, text, text) to authenticated;
