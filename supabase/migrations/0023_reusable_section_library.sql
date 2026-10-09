-- Owner-private reusable content kits for Veyra Studio.
-- Kit content is passive, validated JSON, never executable HTML or JavaScript.
-- Depends on 0019_multi_page_builder.sql.
create table public.site_section_library (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creator_accounts(id) on delete cascade,
  name text not null,
  blocks jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_section_name_length check (length(btrim(name)) between 1 and 80),
  constraint site_section_valid_blocks check (
    public.veyra_valid_page_blocks(blocks)
    and jsonb_array_length(blocks) between 1 and 80
    and pg_column_size(blocks) <= 200000
  )
);
create index site_section_library_creator_idx
  on public.site_section_library (creator_id, updated_at desc, id);

alter table public.site_section_library enable row level security;

create policy "kit owner reads" on public.site_section_library
  for select to authenticated
  using ((select auth.uid()) is not null and app.current_user_owns_creator(creator_id));

create policy "kit owner creates" on public.site_section_library
  for insert to authenticated
  with check ((select auth.uid()) is not null and app.current_user_owns_creator(creator_id));

create policy "kit owner deletes" on public.site_section_library
  for delete to authenticated
  using ((select auth.uid()) is not null and app.current_user_owns_creator(creator_id));

-- Serialize new kits on the owning account so parallel tabs cannot evade quota.
create or replace function app.guard_section_library_insert()
returns trigger language plpgsql security definer set search_path = '' as $$
declare kit_count integer;
begin
  if auth.uid() is null or not app.current_user_owns_creator(new.creator_id) then
    raise exception 'Not authorized to create a section kit' using errcode = '42501';
  end if;
  perform 1 from public.creator_accounts
    where id = new.creator_id for update;
  select count(*) into kit_count from public.site_section_library
    where creator_id = new.creator_id;
  if kit_count >= 24 then
    raise exception 'Maximum 24 saved section kits per website' using errcode = '23514';
  end if;
  return new;
end;
$$;
revoke all on function app.guard_section_library_insert() from public, anon, authenticated;

create trigger site_section_library_quota
  before insert on public.site_section_library
  for each row execute function app.guard_section_library_insert();

revoke all on public.site_section_library from anon, authenticated;
grant select, insert, delete on public.site_section_library to authenticated;
